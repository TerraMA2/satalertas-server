const models = require('../models')
const RelGroupView = models.rel_group_view
const View = models.views
const { msgError } = require('../utils/messageError');
const Sequelize = require('sequelize');
const { Op, QueryTypes } = Sequelize;


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
  if (relationships.length() = 0) {
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
    // const msgErr = `In unit group-view.service, method getAll:${e}`;
    // logger.error(msgErr);
    throw new Error(msgError('group-view.service', 'getAll', e));
  }
};
async function getByIdGroup(idGroup) {
  try {
    const modelFields = Object.keys(await getModelFields(RelGroupView))
    const where = {
      where: {
        'id_group': idGroup
      },
      order: [['id', 'ASC']]
    };

    const groupViews = await RelGroupView.findAll({
      ...where,
      attributes: modelFields
    })
    for (const groupView of groupViews) {
      const id = groupView.id_view;
      groupView.dataValues.view = await View.findByPk(id);
    }
    return groupViews;
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
    // const msgErr = `In unit GroupService.service, method getNotBelongingToTheGroup:${e}`;
    // logger.error(msgErr);
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
    const {layers, id_group} = groupViewModify
    const removeRel = await RelGroupView.findAll({where: {id_group: id_group}});
    await removeRel || removeRel.destroy();
    const ddd =  await RelGroupView.bulkCreate(layers);
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
