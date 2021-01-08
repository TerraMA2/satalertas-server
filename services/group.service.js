const models = require('../models')
const Group = models.group_management
const Project = models.project
const RelGroupView = models.rel_group_view
const View = models.views
const logger = require('../utils/logger');
const Filter = require('../utils/filter/filter.utils')
const QUERY_TYPES_SELECT = { type: "SELECT" }

module.exports = GroupService = {
  async getAll() {
    try {
      const groups = await Group.findAll();
      for(const group of groups) {
        group.dataValues.project = await Project.findByPk(group.idProject);
        const where = {
          where: {
            id_group: group.id
          }
        };
        group.dataValues.relViews = await RelGroupView.findAll(where)
        for(const relViews of group.dataValues.relViews){
          const id = relViews.idView;
          const views = await View.findAll();
          relViews.dataValues.view = await View.findByPk(id);
        }
      }
      return await groups;
    } catch (e) {
      const msgErr = `In unit group.service, method getAll:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getById(id) {
    try {
      const where = {
        where: {
          id: id
        }
      };

      return await Group.findAll(where);

    } catch (e) {
      const msgErr = `In unit car.service, method getByCpf:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  }
};
