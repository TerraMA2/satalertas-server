const Sequelize = require('sequelize');
const {
  View,
  RelGroupView,
  RegisteredView,
  Group,
  sequelize,
} = require('../models');
const { msgError } = require('../utils/messageError');
const { Op, QueryTypes } = Sequelize;
const {
  layerData,
  setLegend,
  setFilter,
} = require('../utils/helpers/geoserver/assemblyLayer');

async function getModelFields(model) {
  return await model.describe();
}

function removeNullProperties(data) {
  const filteredData = Object.entries(data).filter(([_, val]) => val);
  return Object.fromEntries(filteredData);
}
// use at routes?
async function getAll() {
  try {
    const modelFields = Object.keys(await getModelFields(RelGroupView));
    const groupViews = await RelGroupView.findAll({
      attributes: modelFields,
    });
    for (const groupView of groupViews) {
      const id = groupView.viewId;
      groupView.dataValues.view = await View.findByPk(id);
    }
    return await groupViews;
  } catch (e) {
    throw new Error(msgError('group-view.service', 'getAll', e));
  }
}

async function getByGroupId(groupId) {
  try {
    const viewsGroup = [];
    if (groupId) {
      const where = {
        where: {
          groupId,
        },
        order: [['id', 'ASC']],
      };

      const groupViews = await RelGroupView.findAll({
        ...where,
        attributes: { exclude: ['group_id', 'view_id'] },
        raw: true,
      });
      for (const groupView of groupViews) {
        const { viewId } = groupView;
        let layer = {};
        await View.findByPk(viewId, {
          attributes: { exclude: ['id', 'project_id', 'data_series_id'] },
          raw: true,
        }).then((response) => {
          const filteredResponse = removeNullProperties(response);
          Object.assign(layer, filteredResponse);
        });
        const filteredGroupView = removeNullProperties(groupView);
        Object.assign(layer, filteredGroupView);
        if (viewId) {
          const sqlTableName = `SELECT dsf.value
          FROM terrama2.views AS vw
          INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
          INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
          WHERE vw.id = $viewId AND dsf.key = 'table_name'`;
          await sequelize
            .query(sqlTableName, {
              bind: { viewId },
              type: QueryTypes.SELECT,
            })
            .then((response) => (layer.tableName = response[0].value));
          const viewName = `view${viewId}`;
          layer.viewName = viewName;
          const registeredData = await RegisteredView.findOne({
            where: {
              id: viewId,
            },
            raw: true,
          });
          const { workspace } = registeredData;
          const layerDataOptions = { geoservice: 'wms' };
          layer.layerData = layerData(
            `${workspace}:${viewName}`,
            layerDataOptions,
          );
          layer.legend = setLegend(layer.name, workspace, viewName);
          const groupData = await Group.findByPk(groupId, { raw: true });
          const layerFilterOptions = { codGroup: groupData.code, viewName };
          layer.filter = setFilter({ workspace }, layerFilterOptions);
        }
        viewsGroup.push(layer);
      }
    }
    if (viewsGroup.length > 2) {
      viewsGroup.forEach((view) => {
        const { isPrimary, subLayers } = view;
        if (isPrimary && subLayers) {
          const sbLayers = [];
          subLayers.forEach((layerId) => {
            sbLayers.push(viewsGroup.find((lyr) => lyr.id == layerId));
          });
          if (sbLayers.length > 0) {
            view.subLayers = sbLayers;
          }
        }
      });
    }
    return viewsGroup;
  } catch (e) {
    throw new Error(msgError('group-view.service', 'getByGroupId', e));
  }
}

async function getAvailableLayers(groupId) {
  try {
    const viewIds = await RelGroupView.findAll({
      where: { groupId },
      attributes: ['viewId'],
    }).then((list) =>
      list.filter(({ viewId }) => viewId).map(({ viewId }) => viewId),
    );

    const option = {
      where: {
        id: { [Op.notIn]: viewIds },
      },
    };

    return await View.findAll(option);
  } catch (e) {
    throw new Error(msgError('group-view.service', 'getAvailableLayers', e));
  }
}

async function add(newGroupView) {
  try {
    const groupView = new RelGroupView({
      groupId: newGroupView.groupId,
      viewId: newGroupView.viewId,
    });
    return await RelGroupView.create(groupView.dataValues).then(
      (groupView) => groupView.dataValues,
    );
  } catch (e) {
    throw new Error(msgError('group-view.service', 'add', e));
  }
}

async function update(groupViewModify) {
  try {
    const { layers, groupId } = groupViewModify;
    if (groupId) {
      await RelGroupView.destroy({ where: { groupId } }).then(async () => {
        const newLayers = layers.map((layer) => ({
          group_id: layer.groupId,
          view_id: layer.viewId,
          ...layer,
        }));
        await RelGroupView.bulkCreate(newLayers);
      });
    }
  } catch (e) {
    throw new Error(msgError('group-view.service', 'update', e));
  }
}

async function updateAdvanced(groupViewModify) {
  try {
    const { editions, groupId } = groupViewModify;
    editions.forEach(async (element) => {
      const { id, ...el } = element;
      const where = { id };
      const newLayerData = { ...el };
      if (element.hasOwnProperty('subLayers') && element.subLayers) {
        newLayerData.subLayers = Array.from(
          new Set(element.subLayers.map(({ id }) => id)),
        );
      }
      await RelGroupView.update(newLayerData, { where });
    });
    return await getByGroupId(groupId);
  } catch (e) {
    throw new Error(msgError('group-view.service', 'updateAdvanced', e));
  }
}

async function deleteGroupView(id) {
  try {
    await RelGroupView.delete(id);
  } catch (e) {
    throw new Error(msgError('group-view.service', 'delete', e));
  }
}

module.exports = GroupService = {
  getAll,
  getByGroupId,
  getAvailableLayers,
  add,
  update,
  updateAdvanced,
  delete: deleteGroupView,
};
