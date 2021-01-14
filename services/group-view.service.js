const models = require('../models')
const RelGroupView = models.rel_group_view
const View = models.views
const logger = require('../utils/logger');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = GroupService = {
  async getAll() {
    try {
      const groupViews = await RelGroupView.findAll()
      for (const groupView of groupViews) {
        const id = groupView.idView;
        groupView.dataValues.view = await View.findByPk(id);
      }
      return await groupViews;
    } catch (e) {
      const msgErr = `In unit group.service, method getAll:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getByIdGroup(idGroup) {
    try {
      const where = {
        where: {
          id_group: idGroup
        }
      };

      const groupViews = await RelGroupView.findAll(where)
      for (const groupView of groupViews) {
        const id = groupView.idView;
        groupView.dataValues.view = await View.findByPk(id);
      }
      return groupViews;
    } catch (e) {
      const msgErr = `In unit car.service, method getByCpf:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getNotBelongingToTheGroup(idGroup) {
    try {
      const where = {
        where: {
          id_group: {[Op.ne]: idGroup}
        }
      };
      
      const groupViews = await RelGroupView.findAll(where)
      for (const groupView of groupViews) {
        const id = groupView.idView;
        groupView.dataValues.view = await View.findByPk(id);
      }
      return groupViews;
    } catch (e) {
      const msgErr = `In unit car.service, method getByCpf:${e}`;
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
    const groupView = await RelGroupView.findByPk(groupViewModify.id);

    groupView.idGroup = groupModify.idGroup;
    groupView.idView = groupModify.idView;

    await groupView.save();
    return groupView.dataValues;
  },
  async update(groupViewModify) {
    const groupView = await RelGroupView.findByPk(groupViewModify.id);

    groupView.idGroup = groupViewModify.idGroup;
    groupView.idView = groupViewModify.idView;

    await groupView.save();
    return groupView.dataValues;
  },
  async delete(id) {
    await RelGroupView.delete(id);
  }
};
