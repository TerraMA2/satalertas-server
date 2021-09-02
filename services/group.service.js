const models = require('../models');
const { View, Project, Group, RelGroupView } = models;
const logger = require('../utils/logger');
const { msgError } = require('../utils/messageError');
const { getByGroupId } = require('./group-view.service');

module.exports = GroupService = {
  async getAll() {
    try {
      return await Group.findAll({ raw: true });
    } catch (e) {
      const msgErr = `In unit group.service, method getAll:${e}`;
      throw new Error(msgError(__dirname, 'getAll', e));
    }
  },
  async getCodGroups() {
    return [
      { id: 1, groupCode: 'STATIC', label: 'Dado Estático' },
      { id: 2, groupCode: 'DYNAMIC', label: 'Dado Dinâmico' },
      { id: 3, groupCode: 'ANALYSIS', label: 'Análise' },
      { id: 4, groupCode: 'ALERT', label: 'Alerta' },
      { id: 5, groupCode: 'BURNED', label: 'Análise FOCOS' },
      { id: 6, groupCode: 'BURNED_AREA', label: 'Análise Área Queimada' },
      { id: 7, groupCode: 'DETER', label: 'Análise Deter' },
      { id: 8, groupCode: 'PRODES', label: 'Análise Prodes' },
    ];
  },
  async getById(id) {
    // Melhorar usando o include das relações
    try {
      let where = {};

      const group = await Group.findByPk(id).then((result) => result);

      group.dataValues.project = await Project.findByPk(group.idProject);
      where = {
        where: {
          groupId: group.id,
        },
      };
      const relViews = await RelGroupView.findAll(where);
      group.dataValues.relViews = await relViews;

      for (const relViews of group.dataValues.relViews) {
        const id = relViews.idView;
        relViews.dataValues.view = await View.findByPk(id);
      }
      return group;
    } catch (e) {
      const msgErr = `In unit group.service, method getById:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async add(newGroup) {
    const group = new Group({
      name: newGroup.name,
      idProject: newGroup.idProject,
      code: newGroup.code,
      dashboard: newGroup.dashboard,
      active_area: newGroup.activeArea,
    });
    return await Group.create(group.dataValues).then(
      (group) => group.dataValues,
    );
  },
  async update(groupModify) {
    try {
      const { id, ...el } = groupModify;
      const where = { id }
      await Group.update(el, { where });
      return await await Group.findByPk(id, {raw: true});
    } catch (e) {
      throw new Error(msgError(__dirname, 'update', e));
    }
  },

  async deleteGroup(groupId) {
    const group = await Group.findByPk(groupId);
    return await group.destroy().then((result) => result);
  },
};
