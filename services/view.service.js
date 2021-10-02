const models = require('../models');
const {sequelize} = models;
const {QueryTypes} = sequelize;
const config = require(__dirname + '/../config/config.json')
const VIEWS = require(__dirname + '/../utils/helpers/views/view');
const layerType = require('../enum/layer-type');

setFilter = (groupViews, viewData) => {
    const view_default = `${ viewData.workspace }:${ viewData.view }`;
    return VIEWS[viewData.groupCode] && VIEWS[viewData.groupCode].filter ? VIEWS[viewData.groupCode].filter(
            view_default,
            `${ config.project }_${ config.geoserver.workspace }`,
            viewData.cod,
            groupViews[viewData.groupCode].tableOwner,
            viewData.is_primary,
        )
        : {};
};

getLegend = (data_view) => {
    return {
        title: data_view.cod,
        url: `${ config.geoserver.legendUrl }${ data_view.workspace }:${ data_view.view }`,
    };
};

getLayerData = (data_view) => {
    return {
        url: `${ config.geoserver.baseUrl }/wms`,
        layers: `${ data_view.workspace }:${ data_view.view }`,
        transparent: true,
        time: 'P1Y/PRESENT',
    };
};

getViewObject = (groupViews, viewData) => {
    return {
        groupCode: viewData.groupCode,
        cod: viewData.cod,
        label: viewData.name_view,
        description: viewData.description,
        shortLabel:
            VIEWS[viewData.groupCode] &&
            VIEWS[viewData.groupCode][viewData.cod] &&
            VIEWS[viewData.groupCode][viewData.cod].shortLabel
                ? VIEWS[viewData.groupCode][viewData.cod].shortLabel
                : viewData.name_view,
        value: viewData.view_id,
        tableOwner: groupViews[viewData.groupCode].tableOwner,
        tableName: viewData.tableName,
        carRegisterColumn:
            VIEWS[viewData.groupCode] &&
            VIEWS[viewData.groupCode][viewData.cod] &&
            VIEWS[viewData.groupCode][viewData.cod].carRegisterColumn
                ? !viewData.isPrimary
                    ? `${ groupViews[viewData.groupCode].tableOwner }_${
                        VIEWS[viewData.groupCode][viewData.cod].carRegisterColumn
                    }`
                    : VIEWS[viewData.groupCode][viewData.cod].carRegisterColumn
                : null,
        type: viewData.type,
        workspace: viewData.workspace,
        view: viewData.view,
        dataStore: viewData.datastore ? viewData.datastore : '',
        isPrivate: viewData.type === 'analysis',
        isChild:
            VIEWS[viewData.groupCode] &&
            VIEWS[viewData.groupCode][viewData.cod] &&
            VIEWS[viewData.groupCode][viewData.cod].isChild
                ? VIEWS[viewData.groupCode][viewData.cod].isChild
                : false,
        isHidden:
            VIEWS[viewData.groupCode] &&
            VIEWS[viewData.groupCode][viewData.cod] &&
            VIEWS[viewData.groupCode][viewData.cod].isHidden
                ? VIEWS[viewData.groupCode][viewData.cod].isHidden
                : false,
        isPrimary: viewData.isPrimary,
        isDisabled: viewData.is_disable,
        filter: viewData.type === 'analysis' ? setFilter(groupViews, viewData) : null,
        layerData: getLayerData(viewData),
        legend: getLegend(viewData),
        tools: [
            {
                icon: 'fas fa-info',
                name: 'description',
                title: 'description',
            },
            {
                icon: 'fas fa-save',
                name: 'export',
                title: 'export',
            },
            {
                icon: 'fas fa-adjust',
                name: 'opacity',
                title: 'opacity',
            },
            // Do not replace or delete, it will be implemented later.
            // {
            //     icon: "fas fa-expand-alt",
            //     name: "extent",
            //     title: "Extent"
            // },
            // {
            //   icon: "fas fa-calendar-alt",
            //   name: "calendar",
            //   title: "Filtrar por intervalo de data"
            // },
            // {
            //   icon: "fas fa-sliders-h",
            //   name: "slider",
            //   title: "Filtrar por data"
            // }
        ]
    };
};

getGroupViews = async () => {
    const sql = `
        SELECT
               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN 'STATIC'
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN 'DYNAMIC'
                   WHEN view.source_type = ${ layerType.ALERT } THEN 'ALERT'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN 'DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN 'PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN 'BURNED'
                   WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN 'BURNED_AREA'
               END) AS cod,

               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN 'Dados estáticos'
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN 'Dados dinâmicos'
                   WHEN view.source_type = ${ layerType.ALERT } THEN 'Alertas'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN 'Análise DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN 'Análise PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN 'Análise FOCOS'
                   WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN 'Análise área queimada'
               END) AS label,

               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN true
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN true
                   WHEN view.source_type = ${ layerType.ALERT } THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
               END) AS parent,

               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN false
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN false
                   WHEN view.source_type = ${ layerType.ALERT } THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                         (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
               END) AS view_graph,

               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN false
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN false
                   WHEN view.source_type = ${ layerType.ALERT } THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN false
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN false
               END) AS active_area,

               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN false
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN false
                   WHEN view.source_type = ${ layerType.ALERT } THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
               END) AS is_private,
               null AS children

        FROM terrama2.views AS view
        WHERE view.active = true
        GROUP BY cod, label, parent, view_graph, active_area, is_private `;
    const options = {
        type: QueryTypes.SELECT,
        fieldMap: {
            view_graph: 'viewGraph',
            active_area: 'activeArea',
            is_private: 'isPrivate'
        }
    }
    const groupViewsData = await sequelize.query(sql, options);
    const groupViews = {};
    groupViewsData.forEach(groupView => groupViews[groupView.cod] = groupView);
    return groupViews;
}

getViews = async () => {
    const sql = `SELECT
               view.id AS view_id,
               TRIM(view.name) AS name_view,
               view.description AS description,
               (CASE
                   WHEN view.source_type = ${ layerType.STATIC } THEN 'STATIC'
                   WHEN view.source_type = ${ layerType.DYNAMIC } THEN 'DYNAMIC'
                   WHEN view.source_type = ${ layerType.ALERT } THEN 'ALERT'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN 'DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN 'PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN 'BURNED'
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN 'BURNED_AREA'
                   ELSE UPPER(REPLACE(translate(REPLACE(TRIM(view.name), '  ', ' '),
                                         'áàâãäåaaaÁÂÃÄÅAAAÀéèêëeeeeeEEEÉEEÈìíîïìiiiÌÍÎÏÌIIIóôõöoooòÒÓÔÕÖOOOùúûüuuuuÙÚÛÜUUUUçÇñÑýÝ',
                                         'aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY'
                                          ),  ' ','_'))
               END) AS cod_group,
               (UPPER(REPLACE(REPLACE(REPLACE(translate(TRIM(view.name),
                                         '  áàâãäåaaaÁÂÃÄÅAAAÀéèêëeeeeeEEEÉEEÈìíîïìiiiÌÍÎÏÌIIIóôõöoooòÒÓÔÕÖOOOùúûüuuuuÙÚÛÜUUUUçÇñÑýÝ',
                                         ' aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY'
                                          ),  ' ','_'), '__', '_'), '-', '_'))
               ) AS cod,
               (CASE
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X DETER')  IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X PRODES') IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X FOCOS')  IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X AREA Q') IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN true
                   ELSE false
               END) AS is_primary,
               (CASE
                    WHEN view.source_type = 3 THEN concat(TRIM(dsf.value), '_', ana.id)
                    ELSE dsf.value
                END )
                   AS table_name,
               (CASE
                    WHEN view.source_type = ${ layerType.STATIC } THEN 'static'
                    WHEN view.source_type = ${ layerType.DYNAMIC } THEN 'dynamic'
                    WHEN view.source_type = ${ layerType.ANALYSIS } THEN 'analysis'
                    WHEN view.source_type = ${ layerType.ALERT } THEN 'alert'
               END )
                   AS type,
               (CASE
                   WHEN r_view.workspace is null THEN CONCAT('terrama2_', view.id)
                   ELSE r_view.workspace
               END ) AS workspace,
               concat('view', view.id) AS view,
               (view.source_type = ${ layerType.STATIC }) AS is_static,
               (view.source_type = ${ layerType.DYNAMIC }) AS is_dynamic,
               (view.source_type = ${ layerType.ANALYSIS }) AS is_analysis,
               (r_view.workspace is null) AS is_disable
        FROM terrama2.data_series AS ds
        INNER JOIN terrama2.data_set_formats AS dsf    ON ds.id           = dsf.data_set_id
        INNER JOIN terrama2.views            AS view   ON ds.id           = view.data_series_id
        LEFT JOIN  terrama2.registered_views AS r_view ON view.id         = r_view.view_id
        LEFT JOIN  terrama2.analysis         AS ana    ON dsf.data_set_id = ana.dataset_output
        WHERE dsf.key = 'table_name'
          AND view.active = true
        ORDER BY type, cod_group, name_view
      `;

    const options = {
        type: QueryTypes.SELECT,
        fieldMap: {
            cod_group: 'groupCode',
            is_primary: 'isPrimary',
            table_name: 'tableName'
        }
    }
    return await sequelize.query(sql, options);
}

setGroupViewsChildren = async (views, groupViews, asMap = true) => {
    views.forEach(view => {
        if (!groupViews[view.groupCode].children) {
            groupViews[view.groupCode].children = [];
        }
        if (view.isPrimary) {
            groupViews[view.groupCode].tableOwner = view.tableName;
        }
    });

    if (asMap) {
        views.forEach(view => groupViews[view.groupCode].children[view.cod] = view);
    } else {
        views.forEach(view => groupViews[view.groupCode].children.push(getViewObject(groupViews, view)));
    }
    return groupViews;
}

sortViews = async (groupViews) => {
    const groupCodes = [
        'DETER',
        'PRODES',
        'BURNED',
        'BURNED_AREA',
        'STATIC',
        'DYNAMIC',
    ];
    return groupCodes.map(groupCode => {
        const children = groupViews[groupCode].children;
        const primary = children.filter(child => child.isPrimary);
        const child = children.filter(child => child.isChild).sort((firstView, secondView) => {
            return (
                +(
                    firstView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase() >
                    secondView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                ) ||
                +(
                    firstView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase() ===
                    secondView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                ) - 1
            );
        });
        const other = children.filter(child => !child.isChild && !child.isPrimary).sort((firstView, secondView) => {
            return (
                +(
                    firstView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase() >
                    secondView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                ) ||
                +(
                    firstView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase() ===
                    secondView.shortLabel
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase()
                ) - 1
            );
        });
        groupViews[groupCode].children = [...primary, ...child, ...other];
        return groupViews[groupCode];
    })
}

module.exports.getSidebarLayers = async (childrenAsMap = false) => {
    let groupViews = await getGroupViews();
    const views = await getViews();
    groupViews = await setGroupViewsChildren(views, groupViews, childrenAsMap);
    if (!childrenAsMap) {
        groupViews = await sortViews(groupViews);
    }
    return groupViews;
}

module.exports.getReportLayers = async () => {
    const sql = `
      SELECT
              (CASE
                    WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X DETER') IS NOT NULL) THEN 2
                    WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X PRODES') IS NOT NULL) THEN 3
                    WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X FOCOS') IS NOT NULL) THEN 4
                    WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X AREA_Q') IS NOT NULL) THEN 5
                    WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN 1
              END)                   AS seq,
              TRIM(view.name)        AS label,
              view.id                AS value,
              'report'               AS type,
              'qtd_alertas'          AS count_alias,
              'area_alertas'         AS sum_alias,
              (CASE
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN 'area'
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X FOCOS') IS NOT NULL) THEN 'qtd_alertas'
                  ELSE 'area_alertas'
              END)                   AS sort_field,
              (CASE
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN 'property'
                  ELSE 'main_table'
              END)                   AS table_alias,
              (CASE
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN 'area'
                  ELSE 'calculated_area_ha'
              END)                   AS sum_field,
              (CASE
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN false
                  ELSE true
              END)                   AS sum,
              (CASE
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN false
                  ELSE true
              END)                   AS count,
              (CASE
                  WHEN view.source_type = 1 THEN 'CAR'
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN 'DETER'
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN 'PRODES'
                  WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN 'BURNED'
                  WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                        (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL)) THEN 'BURNED_AREA'
              END)                    AS cod_group,
              (CASE
                  WHEN view.source_type = 3 THEN concat(TRIM(dsf.value), '_', ana.id)
                  ELSE dsf.value
                 END)
                                      AS table_name,
              (view.source_type = 3)  AS is_dynamic
      FROM terrama2.data_series AS ds
               INNER JOIN terrama2.data_set_formats AS dsf ON ds.id = dsf.data_set_id
               INNER JOIN terrama2.views AS view ON ds.id = view.data_series_id
               LEFT JOIN terrama2.registered_views AS r_view ON view.id = r_view.view_id
               LEFT JOIN terrama2.analysis AS ana ON dsf.data_set_id = ana.dataset_output
      WHERE dsf.key = 'table_name'
        AND (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X DETER') IS NOT NULL
          OR SUBSTRING(UPPER(TRIM(view.name)), 'CAR X PRODES') IS NOT NULL
          OR SUBSTRING(UPPER(TRIM(view.name)), 'CAR X FOCOS') IS NOT NULL
          OR SUBSTRING(UPPER(TRIM(view.name)), 'CAR X AREA_Q') IS NOT NULL
          OR SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL)
      ORDER BY seq
    `;

    const options = {
        type: QueryTypes.SELECT,
        fieldMap: {cod_group: 'groupCode'}
    };
    return await sequelize.query(sql, options);
}
