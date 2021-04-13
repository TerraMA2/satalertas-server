const env = process.env.NODE_ENV || 'development';
const confGeoServer = require('../../../geoserver-conf/config.json')[env];
ViewUtil = require("../../view.utils")

module.exports = async function(workspaceAlertas, dataStore, cod_view, tableOwner, tableName, isPrimary) {
  const views = await ViewUtil.getGrouped();
  return {
    city: {
      name: `${cod_view}_city_sql`,
      title: `${cod_view}_city_sql`,
      workspace: `${workspaceAlertas}`,
      sql: isPrimary ?
        `
          SELECT main_table.*, secondary_table.geocodigo , secondary_table.gid , secondary_table.comarca ,
                secondary_table.municipio, secondary_table.nm_meso, secondary_table.nm_micro
          FROM public.${tableName} AS main_table, public.de_municipios_sema AS secondary_table
          WHERE main_table.dd_focos_inpe_id_2 = CAST(secondary_table.geocodigo AS INTEGER)
            AND main_table.de_car_validado_sema_numero_do1 IN (
                 SELECT tableWhere.de_car_validado_sema_numero_do1 AS subtitle
                 FROM public.${tableName} AS tableWhere
                 GROUP BY tableWhere.de_car_validado_sema_numero_do1 HAVING count(1) BETWEEN %min% AND %max%)  
        ` : `
          SELECT main_table.*, secondary_table.geocodigo , secondary_table.gid , secondary_table.comarca ,
                secondary_table.municipio, secondary_table.nm_meso, secondary_table.nm_micro
          FROM public.${tableName} AS main_table, public.de_municipios_sema AS secondary_table
          WHERE main_table.${tableOwner}_dd_focos_inpe_id_2 = CAST(secondary_table.geocodigo AS INTEGER)
            AND main_table.${tableOwner}_de_car_validado_sema_numero_do1 IN (
                 SELECT tableWhere.${tableOwner}_de_car_validado_sema_numero_do1 AS subtitle
                 FROM public.${tableName} AS tableWhere
                 GROUP BY tableWhere.${tableOwner}_de_car_validado_sema_numero_do1 HAVING count(1) BETWEEN %min% AND %max%)  
        `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: confGeoServer.sridTerraMa
        },
      dataStore: `${dataStore}`,
      addParameter: true
    },
    uc: {
      name: `${cod_view}_uc_sql`,
      title: `${cod_view}_uc_sql`,
      workspace: `${workspaceAlertas}`,
      sql: isPrimary ?
        `
          SELECT main_table.*, secondary_table.gid  
          FROM public.${tableName}  AS main_table ,public.de_unidade_cons_sema AS secondary_table
          WHERE ST_Intersects(intersection_geom, secondary_table.geom)  
            AND  main_table.de_car_validado_sema_numero_do1 IN (
               SELECT tableWhere.de_car_validado_sema_numero_do1 AS subtitle 
               FROM public.${tableName}  AS tableWhere 
               GROUP BY tableWhere.de_car_validado_sema_numero_do1
               HAVING count(1) BETWEEN %min% AND %max%) 
        ` : `
          SELECT main_table.*, secondary_table.gid 
          FROM public.${tableName} AS main_table ,public.de_unidade_cons_sema AS secondary_table
          WHERE ST_Intersects(intersection_geom, secondary_table.geom) 
            AND  main_table.${tableOwner}_de_car_validado_sema_numero_do1 IN (
              SELECT tableWhere.${tableOwner}_de_car_validado_sema_numero_do1 AS subtitle
              FROM public.${tableName} AS tableWhere
              GROUP BY tableWhere.${tableOwner}_de_car_validado_sema_numero_do1
              HAVING count(1) BETWEEN %min% AND %max%) 
        `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: confGeoServer.sridTerraMa
      },
      dataStore: `${dataStore}`,
      addParameter: true
    },
    ti: {
      name: `${cod_view}_ti_sql`,
      title: `${cod_view}_ti_sql`,
      workspace: `${workspaceAlertas}`,
      sql: isPrimary ?
        `
          SELECT main_table.*, secondary_table.gid  
          FROM public.${tableName}  AS main_table ,public.de_terra_indigena_sema AS secondary_table
          WHERE ST_Intersects(intersection_geom, secondary_table.geom)  
            AND  main_table.de_car_validado_sema_numero_do1 IN (
               SELECT tableWhere.de_car_validado_sema_numero_do1 AS subtitle 
               FROM public.${tableName}  AS tableWhere 
               GROUP BY tableWhere.de_car_validado_sema_numero_do1
               HAVING count(1) BETWEEN %min% AND %max%) 
        ` : `
          SELECT main_table.*, secondary_table.gid 
          FROM public.${tableName} AS main_table ,public.de_terra_indigena_sema AS secondary_table
          WHERE ST_Intersects(intersection_geom, secondary_table.geom) 
            AND  main_table.${tableOwner}_de_car_validado_sema_numero_do1 IN (
              SELECT tableWhere.${tableOwner}_de_car_validado_sema_numero_do1 AS subtitle
              FROM public.${tableName} AS tableWhere
              GROUP BY tableWhere.${tableOwner}_de_car_validado_sema_numero_do1
              HAVING count(1) BETWEEN %min% AND %max%) 
        `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: confGeoServer.sridTerraMa
      },
      dataStore: `${dataStore}`,
      addParameter: true
    },
    default: {
      name: `${cod_view}_sql`,
      title: `${cod_view}_sql`,
      workspace: `${workspaceAlertas}`,
      sql: 
        `WITH group_result AS (
          SELECT COUNT(1) AS num_car_focos,
                cf.${views.STATIC.children.CAR_VALIDADO.table_name}_gid,
                cf.${views.DYNAMIC.children.FOCOS_QUEIMADAS.table_name}_bioma
          FROM public.${tableName} AS cf
          WHERE cf.execution_date BETWEEN %date1% AND %date2%
          GROUP BY cf.${views.STATIC.children.CAR_VALIDADO.table_name}_gid,
                  cf.${views.DYNAMIC.children.FOCOS_QUEIMADAS.table_name}_bioma
        )
        SELECT group_result.*,
              c.area_ha_,
              mun.geocodigo,
              mun.comarca,
              mun.nm_meso,
              mun.nm_micro,
              mun.nm_rgi,
              mun.nm_rgint,
              MUN.pjbh,
              c.geom
          FROM ${views.STATIC.children.CAR_VALIDADO.table_name} AS c,
              group_result,
              public.${views.STATIC.children.MUNICIPIOS.table_name} AS mun
          WHERE group_result.${views.STATIC.children.CAR_VALIDADO.table_name}_gid = c.gid
            AND c.geocodigo = mun.geocodigo
        `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: confGeoServer.sridTerraMa
      },
      dataStore: `${dataStore}`,
      addParameter: true
    }
  }
};
