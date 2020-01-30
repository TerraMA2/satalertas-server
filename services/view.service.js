const models = require('../models')
const View = models.views
const RegisteredView = models.registered_views
const env = process.env.NODE_ENV || 'development'
const Result = require(__dirname + '/../utils/result')
const confDb = require(__dirname + '/../config/config.json')[env]
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env]
const GROUP_VIEWS  = require('../utils/helpers/group-view')
const VIEWS = require(__dirname + '/../utils/helpers/views/view')
const confView = require(__dirname + '/../config/conf-view.json')

const QUERY_TYPES_SELECT = { type: 'SELECT' };

setFilter = function(groupViews, data_view) {
  return {
    default: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].default &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].default.view ?
          VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].default.view : `${data_view.workspace}:${data_view.view}`
    },
    biome: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome.view ?
          VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_biome_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome.field}` ?
          VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome.field : `gid`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome.value ?
          VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].biome.value : `gid`
    },
    region: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region.view ?
          VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_city_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].region.field : `comarca`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].region.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].region.value : `name`
    },
    mesoregion: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_city_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion.field : `nm_meso`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].mesoregion.value : `name`
    },
    microregion: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].microregion &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].microregion.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].microregion.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_city_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].microregion &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].microregion.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].microregion.field : `nm_micro`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].microregion &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].microregion.value}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].microregion.value : `name`
    },
    city: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].city &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].city.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].city.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_city_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].city &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].city.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].city.field : `gid`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].city &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].city.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].city.value : `gid`
    },
    uc: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].uc &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].uc.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].uc.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_uc_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].uc &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].uc.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].uc.field : `gid`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].uc &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].uc.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].uc.value : `gid`
    },
    ti: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].ti &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].ti.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].ti.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_ti_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].ti &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].ti.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].ti.field : `gid`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].ti &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].ti.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].ti.value : `gid`
    },
    car: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].car &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].car.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].car.view : `${data_view.workspace}:${data_view.view}`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].car &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].car.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].car.field : `de_car_validado_sema_area_ha_`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].car &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].car.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].car.value :  ``
    },
    projus: {
      view:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].projus &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].projus.view ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].projus.view : `${confGeoServer.workspace}:${data_view.cod.toLowerCase()}_projus_sql`,
      field:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].projus &&
        `${groupViews[data_view.cod_group].tableOwner}${VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].projus.field}` ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].projus.field : `gid`,
      value:
        VIEWS[data_view.cod_group] &&
        VIEWS[data_view.cod_group][data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod] &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].projus &&
        VIEWS[data_view.cod_group][data_view.cod].filter[data_view.cod].projus.value ?
          [data_view.cod_group][data_view.cod].filter[data_view.cod].projus.value : `gid`
    }
  }
}

setLegend = function(data_view) {
  return {
    title: data_view.cod,
    url: `${confGeoServer.legendUrl}${data_view.workspace}:${data_view.view}`
  }
}

setlayerData = function(data_view) {
  return {
      url: `${confGeoServer.baseHost}/wms`,
      layers: `${data_view.workspace}:${data_view.view}`,
      transparent: true,
      format: 'image/png',
      version: '1.1.0',
      time: 'P1Y/PRESENT'
  }
};

setViews = function(groupViews, data_view) {
  return {
    codgroup: data_view.cod_group,
    cod: data_view.cod,
    label: data_view.name_view,
    shortLabel:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].shortLabel ?
        VIEWS[data_view.cod_group][data_view.cod].shortLabel : data_view.cod,
    value: data_view.view_id,
    tableOwner: groupViews[data_view.cod_group].tableOwner,
    tableName: data_view.table_name,
    carRegisterColumn:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].carRegisterColumn ?
        !data_view.is_primary ?
          `${groupViews[data_view.cod_group].tableOwner}_${VIEWS[data_view.cod_group][data_view.cod].carRegisterColumn}`:

          VIEWS[data_view.cod_group][data_view.cod].carRegisterColumn : null,
    type: data_view.type,
    isPrivate: data_view.type === 'analysis',
    isChild:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].isChild ?
        VIEWS[data_view.cod_group][data_view.cod].isChild : false,
    isHidden:
      VIEWS[data_view.cod_group] &&
      VIEWS[data_view.cod_group][data_view.cod] &&
      VIEWS[data_view.cod_group][data_view.cod].isHidden ?
        VIEWS[data_view.cod_group][data_view.cod].isHidden : false,
    isPrimary: data_view.is_primary,
    isDisabled: data_view.is_disable,
    filter: data_view.type === 'analysis'? setFilter(groupViews, data_view) : null,
    layerData: setlayerData(data_view),
    legend: setLegend(data_view)
  }
}

orderView = function(groupViews) {
  const viewsJSON = []
  const layers = ['DETER', 'PRODES', 'BURNED', 'BURNED_AREA', 'STATIC', 'DYNAMIC'];

  let child  = [];
  let owner = [];
  let other = [];

  layers.forEach( layer => {
    child = groupViews[layer].children && groupViews[layer].children.child ? groupViews[layer].children.child.sort(function (a, b) {
      return +(a.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() > b.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) || +(a.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === b.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) - 1;
    }) : [];
    owner = groupViews[layer].children && groupViews[layer].children.owner  ? groupViews[layer].children.owner.sort(function (a, b) {
      return +(a.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() > b.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) || +(a.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === b.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) - 1;
    }) : [];
    other = groupViews[layer].children && groupViews[layer].children.other  ? groupViews[layer].children.other.sort(function (a, b) {
      return +(a.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() > b.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) || +(a.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === b.shortLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) - 1;
    }) : [];

    owner.forEach(p => {
      groupViews[layer].children.push(p);
    });
    child.forEach(p => {
      groupViews[layer].children.push(p);
    });
    other.forEach(p => {
      groupViews[layer].children.push(p);
    });
  });

  viewsJSON.push(groupViews.DETER)
  viewsJSON.push(groupViews.PRODES)
  viewsJSON.push(groupViews.BURNED)
  viewsJSON.push(groupViews.BURNED_AREA)
  viewsJSON.push(groupViews.STATIC)
  viewsJSON.push(groupViews.DYNAMIC)
  return viewsJSON;
};

module.exports = FileReport = {
  async getSidebarConfigDynamic() {
    const sqlViews =
      ` SELECT
               view.id AS view_id,
               TRIM(view.name) AS name_view,
               (CASE
                   WHEN view.source_type = 1 THEN 'STATIC'
                   WHEN view.source_type = 2 THEN 'DYNAMIC'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN 'DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN 'PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN 'BURNED'
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL))    THEN 'BURNED_AREA'
                   ELSE UPPER(REPLACE(translate(REPLACE(TRIM(view.name), '  ', ' '),
                                         'áàâãäåaaaÁÂÃÄÅAAAÀéèêëeeeeeEEEÉEEÈìíîïìiiiÌÍÎÏÌIIIóôõöoooòÒÓÔÕÖOOOùúûüuuuuÙÚÛÜUUUUçÇñÑýÝ',
                                         'aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY'
                                          ),  ' ','_'))
               END)   AS cod_group,
               (UPPER(REPLACE(REPLACE(REPLACE(translate(TRIM(view.name),
                                         '  áàâãäåaaaÁÂÃÄÅAAAÀéèêëeeeeeEEEÉEEÈìíîïìiiiÌÍÎÏÌIIIóôõöoooòÒÓÔÕÖOOOùúûüuuuuÙÚÛÜUUUUçÇñÑýÝ',
                                         ' aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY'
                                          ),  ' ','_'), '__', '_'), '-', '_'))
               ) AS cod,
               (CASE
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X DETER')  IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X PRODES') IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X FOCOS')  IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X AREA_Q') IS NOT NULL) THEN true
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
        ORDER BY type, cod_group, name_view
      `;

    const sqlGroupViews =
      `
        SELECT  
               (CASE
                   WHEN view.source_type = 1 THEN 'STATIC'
                   WHEN view.source_type = 2 THEN 'DYNAMIC'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN 'DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN 'PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN 'BURNED'
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL))    THEN 'BURNED_AREA'
               END)   AS cod,
        
               (CASE
                   WHEN view.source_type = 1 THEN 'Dados estáticos'
                   WHEN view.source_type = 2 THEN 'Dados dinâmicos'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN 'Análise DETER'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN 'Análise PRODES'
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN 'Análise FOCOS'
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL))    THEN 'Análise área queimada'
               END)   AS label,
        
               (CASE
                   WHEN view.source_type = 1 THEN true
                   WHEN view.source_type = 2 THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL)) THEN true
               END)   AS parent,
        
               (CASE
                   WHEN view.source_type = 1 THEN false
                   WHEN view.source_type = 2 THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL)) THEN true
               END)   AS view_graph,
        
               (CASE
                   WHEN view.source_type = 1 THEN false
                   WHEN view.source_type = 2 THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN false
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL)) THEN false
               END)   AS active_area,
        
               (CASE
                   WHEN view.source_type = 1 THEN false
                   WHEN view.source_type = 2 THEN false
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER')    IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES')   IS NOT NULL) THEN true
                   WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS')    IS NOT NULL) THEN true
                   WHEN ( (SUBSTRING(UPPER(TRIM(view.name)), 'AQ')     IS NOT NULL) OR
                          (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL)) THEN true
               END)   AS isPrivate,
               null AS children
        
        FROM terrama2.views AS view
        GROUP BY cod, label, parent, view_graph, active_area, isPrivate;
      `;
    try {

      const dataset_group_views = await RegisteredView.sequelize.query(sqlGroupViews, QUERY_TYPES_SELECT);
      let groupViews = {};
      dataset_group_views.forEach( group => {
        groupViews[group.cod] = group;
      });

      const dataset_views = await RegisteredView.sequelize.query(sqlViews, QUERY_TYPES_SELECT);

      dataset_views.forEach(dataView => {
        if(dataView.is_primary) {
          groupViews[dataView.cod_group].tableOwner = `${dataView.table_name}`;
        }
      });
      dataset_views.forEach(dataView => {
        if (!groupViews[dataView.cod_group].children) { groupViews[dataView.cod_group].children = [] };

        const view = setViews(groupViews, dataView);

        const groupBy = view.isPrimary ? 'owner' : view.isChild ? 'child' : 'other';

        if (!groupViews[dataView.cod_group].children[groupBy]) { groupViews[dataView.cod_group].children[groupBy] = [] };

        groupViews[dataView.cod_group].children[groupBy].push(view);
      });

      const viewsJSON = orderView(groupViews);

      return Result.ok(viewsJSON)
    } catch (e) {
      return Result.err(e);
    }
  }
}
