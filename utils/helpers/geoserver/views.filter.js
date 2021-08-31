const config = require(__dirname + '/../../../config/config.json');

module.exports = function(layer) {
  const workspaceAlertas = config.geoserver.workspace;
  const dataStore = config.geoserver.datastore;
  const {cod, tableName, workspace, view } = layer;
  return [
    {
      name: `${cod}_biome_sql`,
      title: `${cod}_biome_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.gid  FROM public.${tableName} AS main_table
        ,public.de_biomas_mt secondary_table WHERE ST_Intersects(intersection_geom, secondary_table.geom)
      `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: -1
      },
      dataStore: dataStore,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_city_sql`,
      title: `${cod}_city_sql`,
      workspace: `${workspaceAlertas}`,
      sql: `
        SELECT main_table.*, secondary_table.geocodigo, secondary_table.gid, secondary_table.comarca,
               secondary_table.municipio , secondary_table.nm_meso, secondary_table.nm_micro, 
               secondary_table.nm_rgi, secondary_table.nm_rgint, secondary_table.pjbh  
        FROM public.${tableName} AS main_table ,public.de_municipios_sema AS secondary_table  
        WHERE ST_Intersects(intersection_geom, secondary_table.geom)
      `,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: -1
        },
      dataStore: `${dataStore}`,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_uc_sql`,
      title: `${cod}_uc_sql`,
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
        srid: -1
      },
      dataStore: `${dataStore}`,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_ti_sql`,
      title: `${cod}_ti_sql`,
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
        srid: -1
      },
      dataStore: `${dataStore}`,
      view_workspace: workspace,
      view
    },
    {
      name: `${cod}_projus_sql`,
      title: `${cod}_projus_sql`,
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
        srid: -1
      },
      dataStore: `${dataStore}`,
      view_workspace: workspace,
      view
    }
  ]
};
