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
        const id = groupView.id_view;
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
        const id = groupView.id_view;
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
      // const listIdViews = await RelGroupView.findAll({ where: {id_group: idGroup}, attributes: ['id_view'] }).then();

      // verificar se está trazendo objeto , se estiver corrigir para lista de inteiros.

      // const where = {
      //   where: {
      //     id: {[Op.not]: { [Op.in]: listIdViews} }
      //   },
      //   attribute: ['name', 'id_view']
      // };

      const listViews = await View.findAll();
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
    console.log(groupViewModify);
    await RelGroupView.destroy({where: {id_group: groupViewModify.id_group}}).then(result => result);
    
    
    //const groupView = await RelGroupView.findByPk(groupViewModify.id);
    
    //RelGroupView.bulkCreate(groupViewModify);
    //groupView.idGroup = groupViewModify.id_group;
    //groupView.idView = groupViewModify.idView;

    //await groupView.save();
    //return groupView.dataValues;
  },
  async delete(id) {
    await RelGroupView.delete(id);
  }
};
