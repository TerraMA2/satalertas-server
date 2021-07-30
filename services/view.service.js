const models = require('../models');
const { View, RegisteredView } = models;
const env = process.env.NODE_ENV || 'development';
const Result = require(__dirname + '/../utils/result');
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[
  env
];
const VIEWS = require(__dirname + '/../utils/helpers/views/view');

const QUERY_TYPES_SELECT = { type: 'SELECT' };

getSql = async function (params) {
  const view =
    params.specificParameters && params.specificParameters !== 'null'
      ? JSON.parse(params.specificParameters)
      : [];

  let sql = '';
  if (view.id && view.id > 0 && view.id !== 'null') {
    const table = {
      name: view.tableName,
      alias: 'main_table',
    };
    const collumns = await Filter.getColumns(view, '', table.alias);
    const filter = await Filter.getFilter(View, table, params, view, collumns);

    const columnGid =
      view.codgroup === 'CAR' ? 'gid' : 'de_car_validado_sema_gid';

    filter.sqlWhere = params.selectedGids
      ? filter.sqlWhere
        ? ` ${filter.sqlWhere} AND ${columnGid} in (${params.selectedGids}) `
        : ` WHERE ${columnGid} in (${params.selectedGids}) `
      : filter.sqlWhere;

    const sqlWhere = filter.sqlHaving
      ? `${filter.sqlWhere} 
            AND ${table.alias}.${collumns.column1} IN
            ( SELECT tableWhere.${collumns.column1} AS subtitle
            FROM public.${table.name} AS tableWhere
            GROUP BY tableWhere.${collumns.column1}
            ${filter.sqlHaving}) `
      : filter.sqlWhere;

    sql = ` SELECT * FROM public.${table.name} AS ${table.alias} ${filter.secondaryTables} ${sqlWhere} `;
  }

  return sql;
};

setFilter = function (groupViews, data_view) {
  const view_default = `${data_view.workspace}:${data_view.view}`;
  return VIEWS[data_view.cod_group] && VIEWS[data_view.cod_group].filter
    ? VIEWS[data_view.cod_group].filter(
        view_default,
        confGeoServer.workspace,
        data_view.cod,
        groupViews[data_view.cod_group].tableOwner,
        data_view.is_primary,
      )
    : {};
};

setLegend = function (data_view) {
  return {
    title: data_view.cod,
    url: `${confGeoServer.legendUrl}${data_view.workspace}:${data_view.view}`,
  };
};

setlayerData = function (data_view) {
  return {
    url: `${confGeoServer.baseHost}/wms`,
    layers: `${data_view.workspace}:${data_view.view}`,
    transparent: true,
    format: 'image/png',
    version: '1.1.0',
    time: 'P1Y/PRESENT',
  };
};

setViews = function (groupViews, data_view) {
  return {
    codgroup: data_view.cod_group,
    cod: data_view.cod,
    label: data_view.name_view,
    description: data_view.description,
    shortLabel:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].shortLabel
        ? VIEWS[data_view.cod_group][data_view.cod].shortLabel
        : data_view.name_view,
    value: data_view.view_id,
    tableOwner: groupViews[data_view.cod_group].tableOwner,
    tableName: data_view.table_name,
    carRegisterColumn:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].carRegisterColumn
        ? !data_view.is_primary
          ? `${groupViews[data_view.cod_group].tableOwner}_${
              VIEWS[data_view.cod_group][data_view.cod].carRegisterColumn
            }`
          : VIEWS[data_view.cod_group][data_view.cod].carRegisterColumn
        : null,
    type: data_view.type,
    workspace: data_view.workspace,
    view: data_view.view,
    dataStore: data_view.datastore ? data_view.datastore : '',
    isPrivate: data_view.type === 'analysis',
    isChild:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].isChild
        ? VIEWS[data_view.cod_group][data_view.cod].isChild
        : false,
    isHidden:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].isHidden
        ? VIEWS[data_view.cod_group][data_view.cod].isHidden
        : false,
    isPrimary: data_view.is_primary,
    isDisabled: data_view.is_disable,
    filter:
      data_view.type === 'analysis' ? setFilter(groupViews, data_view) : null,
    layerData: setlayerData(data_view),
    legend: setLegend(data_view),
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
      // {
      //     icon: "fas fa-expand-alt",
      //     name: "extent",
      //     title: "Extent"
      // },
      // { //Do not replace or delete, it will be implemented later.
      //   icon: "fas fa-calendar-alt",
      //   name: "calendar",
      //   title: "Filtrar por intervalo de data"
      // },
      // {
      //   icon: "fas fa-sliders-h",
      //   name: "slider",
      //   title: "Filtrar por data"
      // }
    ],
  };
};

orderView = async function (groupViews) {
  const layers = [
    'DETER',
    'PRODES',
    'BURNED',
    'BURNED_AREA',
    'STATIC',
    'DYNAMIC',
  ];

  let child = [];
  let owner = [];
  let other = [];

  layers.forEach((layer) => {
    child =
      groupViews[layer] &&
      groupViews[layer].children &&
      groupViews[layer].children.child
        ? groupViews[layer].children.child.sort(function (a, b) {
            return (
              +(
                a.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase() >
                b.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
              ) ||
              +(
                a.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase() ===
                b.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
              ) - 1
            );
          })
        : [];
    owner =
      groupViews[layer] &&
      groupViews[layer].children &&
      groupViews[layer].children.owner
        ? groupViews[layer].children.owner.sort(function (a, b) {
            return (
              +(
                a.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase() >
                b.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
              ) ||
              +(
                a.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase() ===
                b.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
              ) - 1
            );
          })
        : [];
    other =
      groupViews[layer] &&
      groupViews[layer].children &&
      groupViews[layer].children.other
        ? groupViews[layer].children.other.sort(function (a, b) {
            return (
              +(
                a.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase() >
                b.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
              ) ||
              +(
                a.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase() ===
                b.shortLabel
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
              ) - 1
            );
          })
        : [];

    owner.forEach((p) => {
      if (groupViews[layer] && groupViews[layer].children) {
        groupViews[layer].children.push(p);
      }
    });
    child.forEach((p) => {
      if (groupViews[layer] && groupViews[layer].children) {
        groupViews[layer].children.push(p);
      }
    });
    other.forEach((p) => {
      if (groupViews[layer] && groupViews[layer].children) {
        groupViews[layer].children.push(p);
      }
    });
  });

  return groupViews;
};

setResultSidebarConfig = async function (groupViews) {
  const viewsJSON = [];

  if (groupViews.DETER) {
    viewsJSON.push(groupViews.DETER);
  }
  if (groupViews.PRODES) {
    viewsJSON.push(groupViews.PRODES);
  }
  if (groupViews.BURNED) {
    viewsJSON.push(groupViews.BURNED);
  }
  if (groupViews.BURNED_AREA) {
    viewsJSON.push(groupViews.BURNED_AREA);
  }
  if (groupViews.STATIC) {
    viewsJSON.push(groupViews.STATIC);
  }
  if (groupViews.DYNAMIC) {
    viewsJSON.push(groupViews.DYNAMIC);
  }
  return viewsJSON;
};

getGroupViews = async function () {
  const sqlGroupViews = `
        SELECT  
               (CASE
                   WHEN view.source_type = 1 THEN 'STATIC'
                   WHEN view.source_type = 2 THEN 'DYNAMIC'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN 'DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN 'PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN 'BURNED'
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL))    THEN 'BURNED_AREA'
               END)   AS cod,
        
               (CASE
                   WHEN view.source_type = 1 THEN 'Dados estáticos'
                   WHEN view.source_type = 2 THEN 'Dados dinâmicos'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN 'Análise DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN 'Análise PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN 'Análise FOCOS'
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL))    THEN 'Análise área queimada'
               END)   AS label,
        
               (CASE
                   WHEN view.source_type = 1 THEN true
                   WHEN view.source_type = 2 THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
               END)   AS parent,
        
               (CASE
                   WHEN view.source_type = 1 THEN false
                   WHEN view.source_type = 2 THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
               END)   AS view_graph,
        
               (CASE
                   WHEN view.source_type = 1 THEN false
                   WHEN view.source_type = 2 THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN false
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN false
               END)   AS active_area,
        
               (CASE
                   WHEN view.source_type = 1 THEN false
                   WHEN view.source_type = 2 THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
               END)   AS is_private,
               null AS children
        
        FROM terrama2.views AS view
        WHERE view.active = true
        GROUP BY cod, label, parent, view_graph, active_area, is_private `;
  try {
    const dataset_group_views = await RegisteredView.sequelize.query(
      sqlGroupViews,
      QUERY_TYPES_SELECT,
    );

    let groupViews = {};
    dataset_group_views.forEach((group) => {
      if (group.cod) {
        groupViews[group.cod] = group;
        groupViews[group.cod].isPrivate = group.is_private;
      }
    });
    return await getViews(groupViews);
  } catch (e) {
    throw e;
  }
};

getViews = async function (groupViews) {
  const sqlViews = ` SELECT
               view.id AS view_id,
               TRIM(view.name) AS name_view,
               view.description AS description,
               (CASE
                   WHEN view.source_type = 1 THEN 'STATIC'
                   WHEN view.source_type = 2 THEN 'DYNAMIC'
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
               END)   AS is_primary,
               (CASE
                    WHEN view.source_type = 3 THEN concat(TRIM(dsf.value), '_', ana.id)
                    ELSE dsf.value
                END )
                   AS table_name,
               (CASE
                    WHEN view.source_type = 1 THEN 'static'
                    WHEN view.source_type = 2 THEN 'dynamic'
                    WHEN view.source_type = 3 THEN 'analysis'
               END )
                   AS type,
               (CASE
                   WHEN r_view.workspace is null THEN CONCAT('terrama2_', view.id)
                   ELSE r_view.workspace
               END ) AS workspace,
               concat('view', view.id) AS view,
               (view.source_type = 1) AS is_static,
               (view.source_type = 2) AS is_dynamic,
               (view.source_type = 3) AS is_analysis,
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

  try {
    const dataset_views = await RegisteredView.sequelize.query(
      sqlViews,
      QUERY_TYPES_SELECT,
    );
    dataset_views.forEach((dataView) => {
      if (dataView.is_primary) {
        groupViews[dataView.cod_group].tableOwner = `${dataView.table_name}`;
      }
    });

    dataset_views.forEach((dataView) => {
      if (!groupViews[dataView.cod_group].children) {
        groupViews[dataView.cod_group].children = [];
      }

      const view = setViews(groupViews, dataView);

      const groupBy = view.isPrimary
        ? 'owner'
        : view.isChild
        ? 'child'
        : 'other';

      if (!groupViews[dataView.cod_group].children[groupBy]) {
        groupViews[dataView.cod_group].children[groupBy] = [];
      }

      groupViews[dataView.cod_group].children[groupBy].push(view);
    });

    return groupViews;
  } catch (e) {
    throw e;
  }
};

module.exports = FileReport = {
  async getReportLayers() {
    const sqlReportLayers = `
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

    try {
      return Result.ok(
        await RegisteredView.sequelize.query(
          sqlReportLayers,
          QUERY_TYPES_SELECT,
        ),
      );
    } catch (e) {
      return Result.err(e);
    }
  },

  async getSidebarConfigDynamic() {
    try {
      const groupViews = await orderView(await getGroupViews());
      return Result.ok(await setResultSidebarConfig(groupViews));
    } catch (e) {
      return Result.err(e);
    }
  },

  async fetchGroupOfOrderedLayers() {
    try {
      return await orderView(await getGroupViews());
    } catch (e) {
      return Result.err(e);
    }
  },

  async getSqlExport(params) {
    try {
      return await getSql(params);
    } catch (e) {
      return Result.err(e);
    }
  },
};
