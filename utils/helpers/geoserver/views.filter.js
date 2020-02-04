
module.exports = function(workspaceAlertas, dataStore, cod_view, tableOwner, tableName, isPrimary) {
  return {
    biome: {
      name: `${cod_view}_biome_sql`,
      title: `${cod_view}_biome_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.gid  FROM public.${tableName} AS main_table
        ,public.de_biomas_mt secondary_table  WHERE ST_Intersects(intersection_geom, secondary_table.geom)
      `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: 4326
      },
      dataStore: dataStore
    },
    city: {
      name: `${cod_view}_city_sql`,
      title: `${cod_view}_city_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.geocodigo, secondary_table.gid, secondary_table.comarca,
               secondary_table.municipio , secondary_table.nm_meso, secondary_table.nm_micro  
        FROM public.${tableName} AS main_table ,public.de_municipios_sema AS secondary_table  
        WHERE ST_Intersects(intersection_geom, secondary_table.geom)
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
      name: `${cod_view}_uc_sql`,
      title: `${cod_view}_uc_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.gid
        FROM public.${tableName} AS main_table, public.de_unidade_cons_sema AS secondary_table
        WHERE ST_Intersects(intersection_geom,   secondary_table.geom)
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
      name: `${cod_view}_ti_sql`,
      title: `${cod_view}_ti_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.gid
        FROM public.${tableName} AS main_table ,public.de_terra_indigena_sema AS secondary_table
        WHERE ST_Intersects(intersection_geom, secondary_table.geom)
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
      name: `${cod_view}_projus_sql`,
      title: `${cod_view}_projus_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.gid
        FROM public.${tableName} AS main_table ,public.de_projus_bacias_sema AS secondary_table  
        WHERE ST_Intersects(intersection_geom, secondary_table.geom)
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
