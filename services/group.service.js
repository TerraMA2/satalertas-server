const models = require('../models')
const Group = models.groups
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
      let where = {};

      const group = await Group.findByPk(id);
      group.dataValues.project = await Project.findByPk(group.idProject);
      where = {
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
      return group;

    } catch (e) {
      const msgErr = `In unit car.service, method getByCpf:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async add(newGroup) {
    const group = new Group({
      name: newGroup.name,
      idProject: newGroup.idProject,
      code: newGroup.code
    })
    return await Group.create(group.dataValues).then(group => group.dataValues);
  },
  async update(groupModify) {
    const group = await Group.findByPk(groupModify.id);

    group.name = groupModify.name;
    group.idProject = groupModify.idProject;
    group.code = groupModify.code;

    await group.save();
    return group.dataValues;
  }
};
