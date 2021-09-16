const Sequelize = require('sequelize');
const {
    View,
    RelGroupView,
    RegisteredView,
    DataSetFormat,
    Group,
    DataSet,
    sequelize,
} = require('../models');
const Tools = require('../utils/tool.utils');
const {Op} = Sequelize;
const {
    layerData,
    setLegend,
    setFilter,
} = require('../utils/helpers/geoserver/assemblyLayer');
const infoColumnsService = require('./info-columns.service');
const layerTypeName = require('../enum/layer-type-name');
const BadRequestError = require('../errors/bad-request.error');
const {QueryTypes} = require("sequelize");

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

setTableName = (data) => {
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

getModelFields = async (model) => {
    return await model.describe();
}

removeNullProperties = (data) => {
    const filteredData = Object.entries(data).filter(([_, val]) => val);
    return Object.fromEntries(filteredData);
}

getTableName = async (viewId) => {
    let sql = `SELECT
  (CASE
    WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
    ELSE dsf.value
    END), vw.id AS view_id
    FROM terrama2.views AS vw
    INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
    INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
    LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
    WHERE vw.id = $viewId AND dsf.key = 'table_name';`;
    const options = {
        type: QueryTypes.SELECT,
        fieldMap: {value: 'tableName', view_id: 'viewId'},
        bind: {viewId},
        plain: true
    };
    const result = await sequelize.query(sql, options);
    return result.tableName;
}

// use at routes?
module.exports.get = async () => {
    const modelFields = Object.keys(await getModelFields(RelGroupView));
    const groupViews = await RelGroupView.findAll({
        attributes: modelFields
    });
    for (const groupView of groupViews) {
        const id = groupView.viewId;
        groupView.dataValues.view = await View.findByPk(id);
    }
    return groupViews;
}

module.exports.getByGroupId = async (groupId) => {
    if (!groupId) {
        throw new BadRequestError('Group not found.')
    }
    let viewsGroup = [];
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
            const filteredResponse = removeNullProperties(response.toJSON());
            layer['type'] = layerTypeName[filteredResponse['sourceType']]
            Object.assign(layer, filteredResponse);
        });
        layer.tableName = await getTableName(viewId)
        const filteredGroupView = removeNullProperties(groupView);
        Object.assign(layer, filteredGroupView);
        if (viewId) {
            layer['tableInfocolumns'] = await infoColumnsService.getInfocolumnsByViewId(
                viewId,
            ).then((response) => response.tableInfocolumns);
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
                layer.tableOwner = layer.tableName;
            }
            const gp = {
                workspace,
                groupView,
            };
            layer.filter = setFilter(gp, layer);
        }
        viewsGroup.push(layer);
    }
    if (viewsGroup.length > 2) {
        viewsGroup.forEach((view) => {
            const {isPrimary, subLayers} = view;
            if (isPrimary && subLayers) {
                const sbLayers = [];
                subLayers.forEach((layerId) => {
                    sbLayers.push(viewsGroup.find((lyr) => lyr.id === layerId));
                });
                if (sbLayers.length > 0) {
                    view.subLayers = sbLayers;
                }
            }
        });
    }
    return viewsGroup.filter((child) => !child.isSublayer);
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
    return await View.findAll(option).then((views) => {
        views.forEach((vw) => {
            setTableName(vw);
        });
        return views.map((view) => view.toJSON());
    });
}

module.exports.add = async (newGroupView) => {
    const groupView = new RelGroupView({
        groupId: newGroupView.groupId,
        viewId: newGroupView.viewId,
    });
    return await RelGroupView.create(groupView.dataValues).then((groupView) => groupView.dataValues);
}

module.exports.update = async (groupViewModify) => {
    const {layers, groupId, groupOwner} = groupViewModify;
    if (!groupId) {
        throw new BadRequestError('Group not found');
    }
    return await RelGroupView.destroy({where: {groupId}}).then(async () => {
        const newLayers = layers.map((layer) => ({
            group_id: layer.groupId,
            view_id: layer.viewId,
            ...layer
        }));
        await RelGroupView.bulkCreate(newLayers);
    });
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
    return await this.getByGroupId(groupId);
}

module.exports.deleteGroupView = async (id) => {
    return await RelGroupView.delete(id)
}
