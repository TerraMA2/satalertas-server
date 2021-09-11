const Sequelize = require('sequelize');
const {
    View,
    RelGroupView,
    RegisteredView,
    DataSetFormat,
    Group,
    DataSet,
} = require('../models');
const Tools = require('../utils/tool');
const {Op} = Sequelize;
const {
    layerData,
    setLegend,
    setFilter,
} = require('../utils/helpers/geoserver/assemblyLayer');
const {response} = require("../utils/response");
const BadRequestError = require('../errors/bad-request.error');

const viewTableName = {
    model: DataSet,
    as: 'dataSet',
    attributes: ['id'],
    include: {
        model: DataSetFormat,
        as: 'dataSetFormat',
        where: {key: {[Op.eq]: 'table_name'}},
        attributes: [['value', 'tableName']]
    }
};

module.exports.setTableName = (data) => {
    const {
        dataSet: {
            dataSetFormat: [
                {
                    dataValues: {tableName},
                },
            ],
        },
    } = data;
    if (tableName) {
        data.dataValues['tableName'] = tableName;
        delete data.dataValues['dataSet'];
    }
}

module.exports.getModelFields = async (model) => {
    return await model.describe();
}

module.exports.removeNullProperties = (data) => {
    const filteredData = Object.entries(data).filter(([_, val]) => val);
    return Object.fromEntries(filteredData);
}

// use at routes?
module.exports.get = async () => {
    const modelFields = Object.keys(await this.getModelFields(RelGroupView));
    const groupViews = await RelGroupView.findAll({
        attributes: modelFields,
    });
    for (const groupView of groupViews) {
        const id = groupView.viewId;
        groupView.dataValues.view = await View.findByPk(id);
    }
    return response(200, groupViews);
}

module.exports.getByGroupId = async (groupId) => {
    let viewsGroup = [];
    if (groupId) {
        const {code: groupCode} = await Group.findByPk(groupId, {raw: true});
        const where = {
            where: {
                groupId,
            },
            order: [['id', 'ASC']],
        };

        const groupViews = await RelGroupView.findAll({
            ...where,
            attributes: {exclude: ['group_id', 'view_id']},
            raw: true,
        });
        for (const groupView of groupViews) {
            const {viewId} = groupView;
            let layer = {
                groupCode,
                tools: Tools
            };
            const options = {
                attributes: {exclude: ['id', 'project_id', 'data_series_id']},
                include: [viewTableName],
            };

            await View.findByPk(viewId, options).then((response) => {
                this.setTableName(response);
                const filteredResponse = this.removeNullProperties(response.toJSON());
                Object.assign(layer, filteredResponse);
            });

            const filteredGroupView = this.removeNullProperties(groupView);
            Object.assign(layer, filteredGroupView);
            if (viewId) {
                const viewName = `view${ viewId }`;
                layer.viewName = viewName;
                const registeredData = await RegisteredView.findOne({
                    where: {
                        view_id: viewId,
                    },
                    raw: true,
                });
                const {workspace} = registeredData;
                const layerDataOptions = {geoservice: 'wms'};
                layer.layerData = layerData(
                    `${ workspace }:${ viewName }`,
                    layerDataOptions,
                );
                layer.legend = setLegend(layer.name, workspace, viewName);
                if (!layer['shortName']) {
                    layer.shortName = layer.name;
                }
                if (layer.isPrimary) {
                    const layerFilterOptions = {groupCode, viewName};
                    const tableOwner = layer.tableName;
                    layer.tableOwner = tableOwner;
                    const gp = {
                        workspace,
                        tableOwner,
                    };
                    layer.filter = setFilter(gp, layerFilterOptions);
                }
            }
            viewsGroup.push(layer);
        }
    }
    if (viewsGroup.length > 2) {
        viewsGroup.forEach((view) => {
            const {isPrimary, subLayers} = view;
            if (isPrimary && subLayers) {
                const sbLayers = [];
                subLayers.forEach((layerId) => {
                    sbLayers.push(viewsGroup.find((lyr) => lyr.id == layerId));
                });
                if (sbLayers.length > 0) {
                    view.subLayers = sbLayers;
                }
            }
        });
    }
    return response(200, viewsGroup.filter((child) => !child.isSublayer));
}

module.exports.getAvailableLayers = async (groupId) => {
    if (!groupId) {
        throw new BadRequestError('Group not found');
    }
    const viewIds = await RelGroupView.findAll({
        where: {groupId},
        attributes: ['viewId']
    }).then((list) =>
        list.filter(({viewId}) => viewId).map(({viewId}) => viewId),
    );

    const option = {
        where: {
            id: {[Op.notIn]: viewIds}
        },
        include: [viewTableName]
    };
    const allViews = await View.findAll(option).then((views) => {
        views.forEach((vw) => {
            this.setTableName(vw);
        });
        return views.map((view) => view.toJSON());
    });
    return response(200, allViews);
}

module.exports.add = async (newGroupView) => {
    const groupView = new RelGroupView({
        groupId: newGroupView.groupId,
        viewId: newGroupView.viewId,
    });
    const result = await RelGroupView.create(groupView.dataValues).then((groupView) => groupView.dataValues);
    return response(200, result);
}

module.exports.update = async (groupViewModify) => {
    const {layers, groupId, groupOwner} = groupViewModify;
    if (!groupId) {
        throw new BadRequestError('Group not found');
    }
    const result = await RelGroupView.destroy({where: {groupId}}).then(async () => {
        const newLayers = layers.map((layer) => ({
            group_id: layer.groupId,
            view_id: layer.viewId,
            ...layer
        }));
        await RelGroupView.bulkCreate(newLayers);
    });
    return response(200, result);
}

module.exports.updateAdvanced = async (groupViewModify) => {
    const {editions, groupId} = groupViewModify;
    for (const edition of editions) {
        const {id, ...el} = edition;
        const where = {id};
        const newLayerData = {...el};
        if (edition.hasOwnProperty('subLayers') && edition.subLayers) {
            newLayerData.subLayers = Array.from(new Set(edition.subLayers.map(({id}) => id)));
        }
        await RelGroupView.update(newLayerData, {where});
    }
    const group = await this.getByGroupId(groupId);
    return response(200, group);
}

module.exports.deleteGroupView = async (id) => {
    const data = await RelGroupView.delete(id)
    return response(200, data);
}
