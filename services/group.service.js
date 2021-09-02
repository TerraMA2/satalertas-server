const models = require('../models')
const {View, Project, Group, RelGroupView} = models;
const logger = require('../utils/logger');

module.exports = GroupService = {
    async getAll() {
        try {
            return await Group.findAll({raw: true});
        } catch (e) {
            const msgErr = `In unit group.service, method getAll:${ e }`;
            logger.error(msgErr);
            throw new Error(msgErr);
        }
    },
    async getCodGroups() {
        return [
            {id: 1, cod_group: 'STATIC', label: 'Dado Estático'},
            {id: 2, cod_group: 'DYNAMIC', label: 'Dado Dinâmico'},
            {id: 3, cod_group: 'ANALYSIS', label: 'Análise'},
            {id: 4, cod_group: 'ALERT', label: 'Alerta'},
            {id: 5, cod_group: 'BURNED', label: 'Análise FOCOS'},
            {id: 6, cod_group: 'BURNED_AREA', label: 'Análise Área Queimada'},
            {id: 7, cod_group: 'DETER', label: 'Análise Deter'},
            {id: 8, cod_group: 'PRODES', label: 'Análise Prodes'},
        ];
    },
    async getById(id) {
        // Melhorar usando o include das relações
        try {
            let where = {};

            const group = await Group.findByPk(id).then((result) => result);
            Group.findByPk(id, {
                include: "relGroupView",
                raw: true
            }).then(data =>
                console.log('Resposta do Group.findByPk: ', data))

            group.dataValues.project = await Project.findByPk(group.idProject);
            where = {
                where: {
                    groupId: group.id,
                },
                // raw: true
            };
            const relViews = await RelGroupView.findAll(where)
            // console.log('relViews:', relViews)
            group.dataValues.relViews = await relViews

            for (const relViews of group.dataValues.relViews) {
                const id = relViews.idView;
                relViews.dataValues.view = await View.findByPk(id);
            }
            return group;

        } catch (e) {
            const msgErr = `In unit group.service, method getById:${ e }`;
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
            active_area: newGroup.activeArea
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
    },

    async deleteGroup(groupId) {
        const group = await Group.findByPk(groupId);
        return await group.destroy().then(result => result);
    }
};
