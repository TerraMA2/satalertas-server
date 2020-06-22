
module.exports = function(workspace, dataStore, view, title, tableOwner, tableName, isPrimary) {
  return {
      name: `${view}`,
      title: `${title}`,
      workspace: `${workspace}`,
      sql: isPrimary ?
        ` SELECT main_table.*
          FROM public.${tableName} AS main_table
          WHERE main_table.de_car_validado_sema_numero_do1 IN (
                  SELECT tableWhere.de_car_validado_sema_numero_do1 AS subtitle
                  FROM public.${tableName} AS tableWhere
                  GROUP BY tableWhere.de_car_validado_sema_numero_do1 HAVING count(1) BETWEEN %min% AND %max%) ` :
        ` SELECT main_table.*
          FROM public.${tableName} AS main_table
          WHERE main_table.${tableOwner}_de_car_validado_sema_numero_do1 IN (
                  SELECT tableWhere.${tableOwner}_de_car_validado_sema_numero_do1 AS subtitle
                  FROM public.${tableName} AS tableWhere
                  GROUP BY tableWhere.${tableOwner}_de_car_validado_sema_numero_do1 HAVING count(1) BETWEEN %min% AND %max%)`,
      keyColumn: `monitored_id`,
      geometry: {
        name:`intersection_geom`,
        type: `Geometry`,
        srid: 4326
      },
      dataStore: `${dataStore}`,
      addParameter: true
    }
};
