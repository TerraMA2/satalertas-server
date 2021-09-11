const models = require('../models');
const {response} = require("../utils/response");
const {View, Project, Group, RelGroupView} = models;

module.exports.get = async () => {
    const groups = await Group.findAll({raw: true});
    return response(200, groups);
}

module.exports.getCodGroups = async () => {
    return [
        {id: 1, groupCode: 'STATIC', label: 'Dado Estático'},
        {id: 2, groupCode: 'DYNAMIC', label: 'Dado Dinâmico'},
        {id: 3, groupCode: 'ANALYSIS', label: 'Análise'},
        {id: 4, groupCode: 'ALERT', label: 'Alerta'},
        {id: 5, groupCode: 'BURNED', label: 'Análise FOCOS'},
        {id: 6, groupCode: 'BURNED_AREA', label: 'Análise Área Queimada'},
        {id: 7, groupCode: 'DETER', label: 'Análise Deter'},
        {id: 8, groupCode: 'PRODES', label: 'Análise Prodes'},
    ];
}

module.exports.getById = async (id) => {
    // Melhorar usando o include das relações
    let where;

    const group = await Group.findByPk(id).then((result) => result);

    group.dataValues.project = await Project.findByPk(group.idProject);
    where = {
        where: {
            groupId: group.id,
        },
    };
    group.dataValues.relViews = await RelGroupView.findAll(where);

    for (const relViews of group.dataValues.relViews) {
        const id = relViews.idView;
        relViews.dataValues.view = await View.findByPk(id);
    }
    return response(200, group);
}

module.exports.add = async (newGroup) => {
    const group = new Group({
        name: newGroup.name,
        idProject: newGroup.idProject,
        code: newGroup.code,
        dashboard: newGroup.dashboard,
        active_area: newGroup.activeArea,
    });
    const data = await Group.create(group.dataValues).then((group) => group.dataValues);
    return response(200, data);
}

module.exports.update = async (groupModify) => {
    const {id, ...el} = groupModify;
    const where = {id}
    await Group.update(el, {where});
    const group = await Group.findByPk(id, {raw: true});
    return response(200, group);
}

module.exports.deleteGroup = async (groupId) => {
    const group = await Group.findByPk(groupId);
    const result = await group.destroy().then((result) => result);
    return response(200, result);
}
