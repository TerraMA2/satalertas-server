const models = require('../models');
const { View, RelGroupView, RegisteredView } = models;
const { msgError } = require('../utils/messageError');
const Sequelize = require('sequelize');
const { Op, QueryTypes } = Sequelize;
const { layerData, setLegend, setFilter } = require('../utils/helpers/geoserver/assemblyLayer');
const Group = models.Group;


async function getModelFields(model) {
  const fields = await model.describe();
  return fields;
}

function adjustGroupData(group, relationships = []) {
  const groupData = {
    id: group.id,
    code: group.code,
    name: group.name,
  }
  if (relationships.length() == 0) {
    return groupData
  }

};
// use at routes?
async function getAll() {
  try {
    const modelFields = Object.keys(await getModelFields(RelGroupView));
    const groupViews = await RelGroupView.findAll({
      attributes: modelFields
    });
    for (const groupView of groupViews) {
      const id = groupView.id_view;
      groupView.dataValues.view = await View.findByPk(id);
    }
    return await groupViews;
  } catch (e) {
    throw new Error(msgError('group-view.service', 'getAll', e));
  }
};

async function getByIdGroup(idGroup) {
  try {
    const viewsGroup = []
    const attributes = Object.keys(await getModelFields(RelGroupView))
    if (idGroup) {
      const where = {
        where: {
          'id_group': idGroup
        },
        order: [['id', 'ASC']]
      };
      
      const groupViews = await RelGroupView.findAll({
        ...where,
        attributes
      })
      for (const groupView of groupViews) {
        const { id_view } = groupView;
        const layer = {};
        attributes.forEach(attribute => layer[attribute] = null);
        const viewData = await View.findByPk(id_view,
          {
            attributes: { exclude: ['id'] },
            raw: true,
          })
        .then(response => {
          Object.entries(response)
          .forEach(([column, value]) => {
            if (!['data_series_id'].includes(column))
            layer[column] = value
          })
          return response;
        });
  
        Object.entries(groupView.dataValues)
        .filter(([_, val]) => val)
        .forEach(([column, value]) => {
            layer[column] = value
          })
          if(id_view) {
          const sqlTableName = `SELECT dsf.value
          FROM terrama2.views AS vw
          INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
          INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
          WHERE vw.id = $id_view AND dsf.key = 'table_name'`;
          await models.sequelize.query(sqlTableName,{
            bind: {id_view},
            type: QueryTypes.SELECT,
          }).then(response => layer.tableName = response[0].value)
          const groupData = await Group.findByPk(idGroup, { raw:true })
          const viewName = `view${id_view}`;
          layer.viewName = viewName;
          const registeredData = await RegisteredView.findOne({
            where: {
              'view_id': id_view
            },
            raw: true,
          })
          const { workspace } = registeredData;
          const layerDataOptions = {geoservice:'wms'}
          layer.layerData = layerData(`${workspace}:${viewName}`, layerDataOptions );
          layer.legend = setLegend(layer.name, workspace, viewName);
          const layerFilterOptions = {cod_group: groupData.code, viewName}
          layer.filter = setFilter({ workspace }, layerFilterOptions);
        }
        viewsGroup.push(layer);
      }
    }
    return viewsGroup;
  } catch (e) {
    throw new Error(msgError('group-view.service', 'getByIdGroup', e));
  }
};

async function getNotBelongingToTheGroup(idGroup) {
  try {
    const idViews = await RelGroupView.findAll({ where: {id_group: idGroup}, attributes: ['id_view'] })
      .then(list => list.filter(({ id_view}) => id_view).map(({ id_view }) => id_view));

    const option = {
      where: {
        id: {[Op.notIn]: idViews }
      }
    };

    const listViews = await View.findAll(option);
    return listViews;
  } catch (e) {
    throw new Error(msgError('group-view.service', 'getNotBelonginToTheGroup', e));
  }
};

async function add(newGroupView) {
  try {
    const groupView = new RelGroupView({
      idGroup: newGroupView.idGroup,
      idView: newGroupView.idView
    })
    return await RelGroupView.create(groupView.dataValues).then(groupView => groupView.dataValues);
    
  } catch (e) {
    throw new Error(msgError('group-view.service', 'add', e))
  }
};

async function update(groupViewModify) {
  try {
    const { layers, id_group } = groupViewModify;
    if (id_group) {
      await RelGroupView.destroy({where: { id_group }})
      .then(() => RelGroupView.bulkCreate(layers));
    }
  } catch (e) {
    throw new Error(msgError('group-view.service', 'update', e))
  }
};

async function updateAdvanced(groupViewModify) {
  try {
    const { editions, id_group } = groupViewModify
    for (const edition of editions) {
      let updateSql = `UPDATE ${RelGroupView.getTableName().schema}.${RelGroupView.tableName}\nSET\n`;
      // Map only sub_layer ID
      if (edition.sub_layers) {
        edition.sub_layers = edition.sub_layers.map(item => item.id);
      }
      const bind = {id_group};
      let setSQL = [];
      Object.keys(edition)
      .forEach(field => {
        bind[field] = edition[field];
        if (field != 'id') {
          setSQL.push(`\t${field} = $${field}`)
        }
      });
      updateSql += setSQL.join(',\n');
      updateSql += '\nWHERE id = $id AND id_group = $id_group;'
      models.sequelize.query(
        updateSql, {
          bind,
          type: QueryTypes.UPDATE,
        }
      )        
    }
    return await getByIdGroup(id_group);
  } catch (e) {
    throw new Error(msgError('group-view.service', 'updateAdvanced', e))
  }
};

async function deleteGroupView(id) {
  try {
    await RelGroupView.delete(id);
  } catch (e) {
    throw new Error(msgError('group-view.service', 'delete', e))
  }
};


module.exports = GroupService = {
  getAll,
  getByIdGroup,
  getNotBelongingToTheGroup,
  add,
  update,
  updateAdvanced,
  delete: deleteGroupView  
};
    //       'show': true,
