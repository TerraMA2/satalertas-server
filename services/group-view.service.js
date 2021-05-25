const models = require('../models')
const RelGroupView = models.rel_group_view
const View = models.views
const logger = require('../utils/logger');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


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
  // for 


}

module.exports = GroupService = {
  async getAll() {
    try {
      getModelFields(RelGroupView);
      console.log("getAll")
      const groupViews = await RelGroupView.findAll()
      console.log(groupViews);
      for (const groupView of groupViews) {
        const id = groupView.id_view;
        groupView.dataValues.view = await View.findByPk(id);
      }
      return await groupViews;
    } catch (e) {
      const msgErr = `In unit group-view.service, method getAll:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getByIdGroup(idGroup) {
    try {
      const where = {
        where: {
          'id_group': idGroup
        }
      };

      const groupViews = await RelGroupView.findAll(where)
      // const teste = await models.Group.findByPk(idGroup, {include: 'relGroupView'})
      for (const groupView of groupViews) {
        const id = groupView.id_view;
        groupView.dataValues.view = await View.findByPk(id);
      }
      return groupViews;
    } catch (e) {
      const msgErr = `In unit group-view.service, method getByIdGroup:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getNotBelongingToTheGroup(idGroup) {
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
      const msgErr = `In unit GroupService.service, method getNotBelongingToTheGroup:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async add(newGroupView) {
    const groupView = new RelGroupView({
      idGroup: newGroupView.idGroup,
      idView: newGroupView.idView
    })
    return await RelGroupView.create(groupView.dataValues).then(groupView => groupView.dataValues);
  },
  async update(groupViewModify) {
    const {layers, id_group} = groupViewModify
    const removeRel = await RelGroupView.findAll({where: {id_group: id_group}});
    await removeRel || removeRel.destroy();
    const ddd =  await RelGroupView.bulkCreate(layers);
  },
  async delete(id) {
    await RelGroupView.delete(id);
  }
};
