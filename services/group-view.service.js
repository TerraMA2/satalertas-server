const Sequelize = require('sequelize');
const {
  View,
  RelGroupView,
  DataSetFormat,
  Group,
  DataSet,
  sequelize,
} = require('../models');
const {Op} = Sequelize;
const layerService = require('./layer.service');
const BadRequestError = require('../errors/bad-request.error');
const {QueryTypes} = require('sequelize');

const viewTableName = {
  model: DataSet,
  as: 'dataSet',
  attributes: ['id'],
  include: {
    model: DataSetFormat,
    as: 'dataSetFormat',
    where: {key: {[Op.eq]: 'table_name'}},
    attributes: [['value', 'tableName']],
  },
};

module.exports.setTableName = (data) => {
  const {
    dataSet: {
      dataSetFormat: [
        {
          dataValues: {tableName},
        },
      ],
    },
  } = data;
  if (tableName) {
    data.dataValues['tableName'] = tableName;
    delete data.dataValues['dataSet'];
  }
};

module.exports.getModelFields = async (model) => {
  return await model.describe();
};

module.exports.removeNullProperties = (data) => {
  const filteredData = Object.entries(data).filter(([_, val]) => val);
  return Object.fromEntries(filteredData);
};

// use at routes?
module.exports.get = async () => {
  const modelFields = Object.keys(await this.getModelFields(RelGroupView));
  const groupViews = await RelGroupView.findAll({
    attributes: modelFields,
  });
  for (const groupView of groupViews) {
    const id = groupView.viewId;
    groupView.dataValues.view = await View.findByPk(id);
  }
  return groupViews;
};

module.exports.getTableName = async (viewId) => {
  let sql = `SELECT
  (CASE
    WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
    ELSE dsf.value
    END), vw.id AS view_id
    FROM terrama2.views AS vw
    INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
    INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
    LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
    WHERE vw.id = $viewId AND dsf.key = 'table_name';`;
  const options = {
    type: QueryTypes.SELECT,
    fieldMap: {value: 'tableName', view_id: 'viewId'},
    bind: {viewId},
    plain: true,
  };
  const result = await sequelize.query(sql, options);
  return result.tableName;
};
module.exports.getByGroupId = async (params) => {
  const {groupId, listSublayers = false} = params;
  let viewsGroup = [];
  if (groupId) {
    const {code: groupCode} = await Group.findByPk(groupId, {raw: true});
    const where = {
      where: {
        groupId,
      },
      order: [['id', 'ASC']],
    };

    const groupViews = await RelGroupView.findAll({
      ...where,
      attributes: {exclude: ['group_id', 'view_id']},
      raw: true,
    });
    for (const groupView of groupViews) {
      await layerService.getLayerById({groupView, groupCode})
      .then(response => {
        viewsGroup.push(response);
      })
    }
  }
  if (viewsGroup.length > 2) {
    viewsGroup.forEach((view) => {
      const {isPrimary, subLayers} = view;
      if (isPrimary && subLayers) {
        const sbLayers = [];
        subLayers.forEach((layerId) => {
          sbLayers.push(viewsGroup.find((lyr) => lyr.id === layerId));
        });
        if (sbLayers.length > 0) {
          view.subLayers = sbLayers;
        }
      }
    });
  }
  if (listSublayers) {
    return viewsGroup
  }
  return viewsGroup.filter((child) => !child.isSublayer);
};

module.exports.getAvailableLayers = async (groupId) => {
  if (!groupId) {
    throw new BadRequestError('Group not found');
  }
  const viewIds = await RelGroupView.findAll({
    where: {groupId},
    attributes: ['viewId'],
  }).then((list) =>
      list.filter(({viewId}) => viewId).map(({viewId}) => viewId),
  );

  const option = {
    where: {
      id: {[Op.notIn]: viewIds},
    },
    include: [viewTableName],
  };
  return await View.findAll(option).then((views) => {
    views.forEach((vw) => {
      this.setTableName(vw);
    });
    return views.map((view) => view.toJSON());
  });
};

module.exports.add = async (newGroupView) => {
  const groupView = new RelGroupView({
    groupId: newGroupView.groupId,
    viewId: newGroupView.viewId,
  });
  return await RelGroupView.create(groupView.dataValues).then(
      (groupView) => groupView.dataValues,
  );
};

module.exports.update = async (groupViewModify) => {
  const {layers, groupId} = groupViewModify;
  if (!groupId) {
    throw new BadRequestError('Group not found');
  }
  return await RelGroupView.destroy({where: {groupId}}).then(async () => {
    const newLayers = layers.map((layer) => ({
      groupId: layer.groupId,
      viewId: layer.viewId,
      ...layer,
    }));
    await RelGroupView.bulkCreate(layers);
  });
};

module.exports.updateAdvanced = async (groupViewModify) => {
  const {editions, groupId} = groupViewModify;
  for (const edition of editions) {
    const {id, ...el} = edition;
    const where = {id};
    const newLayerData = {...el};
    if (edition.hasOwnProperty('subLayers') && edition.subLayers) {
      newLayerData.subLayers = Array.from(
          new Set(edition.subLayers.map(({id}) => id)),
      );
    }
    await RelGroupView.update(newLayerData, {where});
  }
  return await this.getByGroupId({groupId});
};

module.exports.deleteGroupView = async (id) => {
  return await RelGroupView.delete(id);
};
