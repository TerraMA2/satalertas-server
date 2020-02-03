
module.exports = function(workspaceAlertas, dataStore, cod_view, tableOwner, tableName, isPrimary) {
  return {
    city: {
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
        srid: 4326
        },
      dataStore: `${dataStore}`
    },
    uc: {
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
        srid: 4326
      },
      dataStore: `${dataStore}`
    },
    ti: {
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
        srid: 4326
      },
      dataStore: `${dataStore}`
    },
    projus: {
      title: `${cod_view}_projus_sql`,
      workspace: `${workspaceAlertas}`,
      sql: isPrimary ?
        `
          SELECT main_table.*, secondary_table.gid  
          FROM public.${tableName}  AS main_table ,public.de_projus_bacias_sema AS secondary_table
          WHERE ST_Intersects(intersection_geom, secondary_table.geom)  
            AND  main_table.de_car_validado_sema_numero_do1 IN (
               SELECT tableWhere.de_car_validado_sema_numero_do1 AS subtitle 
               FROM public.${tableName}  AS tableWhere 
               GROUP BY tableWhere.de_car_validado_sema_numero_do1
               HAVING count(1) BETWEEN %min% AND %max%) 
        ` : `
          SELECT main_table.*, secondary_table.gid 
          FROM public.${tableName} AS main_table ,public.de_projus_bacias_sema AS secondary_table
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
        srid: 4326
      },
      dataStore: `${dataStore}`
    }
  }
};
