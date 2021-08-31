const config = require(__dirname + '/../../../config/config.json');

module.exports = function(layer, cityTable, carTable, spotlightTable) {
  const workspaceAlertas = config.workspace;
  const dataStore = config.datastore;
  const {cod, tableOwner, tableName, isPrimary, workspace, view } = layer;
  return [
    {
      name: `${cod}_city_sql`,
      title: `${cod}_city_sql`,
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
        srid: config.sridTerraMa
        },
      dataStore: `${dataStore}`,
      addParameter: true,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_uc_sql`,
      title: `${cod}_uc_sql`,
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
        srid: config.sridTerraMa
      },
      dataStore: `${dataStore}`,
      addParameter: true,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_ti_sql`,
      title: `${cod}_ti_sql`,
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
        srid: config.sridTerraMa
      },
      dataStore: `${dataStore}`,
      addParameter: true,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_sql`,
      title: `${cod}_sql`,
      workspace: `${workspaceAlertas}`,
      sql:
        `WITH group_result AS (
          SELECT COUNT(1) AS num_car_focos,
                cf.${carTable}_gid,
                cf.${spotlightTable}_bioma
          FROM public.${tableName} AS cf
          WHERE cf.execution_date BETWEEN %date1% AND %date2%
          GROUP BY cf.${carTable}_gid,
                  cf.${spotlightTable}_bioma
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
          FROM ${carTable} AS c,
              group_result,
              public.${cityTable} AS mun
          WHERE group_result.${carTable}_gid = c.gid
            AND c.geocodigo = mun.geocodigo
        `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: config.sridTerraMa
      },
      dataStore: `${dataStore}`,
      addParameter: true,
      view_workspace: workspace,
      view
    }
  ]
};
