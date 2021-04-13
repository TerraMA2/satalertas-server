const   models = require('../models');
        View = models.views;
        Filter = require("../utils/filter/filter.utils");
        QUERY_TYPES_SELECT = { type: "SELECT" };

// ==== Analysis Totals =========================================
getSqlAnalysisTotals = async function(params) {
  const alerts = params.specificParameters && params.specificParameters !== 'null' ?
    JSON.parse(params.specificParameters) : [];

  let sql = '';
  if (alerts.length > 0) {
    for (let alert of alerts) {
      sql += sql.trim() === '' ? '' : ' UNION ALL ';

      if (alert.idview && alert.idview > 0 && alert.idview !== 'null') {
        const table = {
          name: alert.tableName,
          alias: 'main_table'
        };
        const collumns = await Filter.getColumns(alert, '', table.alias);
        const filter = await Filter.getFilter(View, table, params, alert, collumns);
        const value1 = alert.codgroup === 'BURNED' ?
          ` COALESCE( ( SELECT ROW_NUMBER() OVER(ORDER BY ${collumns.column1} ASC) AS Row
               FROM public.${table.name} AS ${table.alias}
               ${filter.secondaryTables}
               ${filter.sqlWhere}
               GROUP BY ${collumns.column1}
               ${filter.sqlHaving}
               ORDER BY Row DESC
               LIMIT 1
            ), 00.00) AS value1 ` :
          `  COALESCE(COUNT(1), 00.00) AS value1 `;
        const sqlWhere =
          filter.sqlHaving ?
            ` ${filter.sqlWhere} 
                AND ${table.alias}.${collumns.column1} IN
                ( SELECT tableWhere.${collumns.column1} AS subtitle
                  FROM public.${table.name} AS tableWhere
                  GROUP BY tableWhere.${collumns.column1}
              ${filter.sqlHaving}) ` :
            filter.sqlWhere;

        const value2 = alert.codgroup === 'BURNED' ?
          ` ( SELECT coalesce(sum(1), 0.00) as num_focos FROM public.${table.name} AS ${table.alias} ${filter.secondaryTables} ${sqlWhere} ) AS value2 ` :
          ` COALESCE(SUM(${collumns.columnArea}), 0.00) AS value2 `;

        const sqlFrom = alert.codgroup === 'BURNED' ?
          ` ` :
          ` FROM public.${table.name} AS ${table.alias} ${filter.secondaryTables} ${filter.sqlWhere} `;

        sql +=
          ` SELECT 
                  '${alert.idview}' AS idview,
                  '${alert.cod}' AS cod,
                  '${alert.codgroup}' AS codgroup,
                  '${alert.label}' AS label,
                  ${value1},
                  ${value2},
                  ${alert.selected} AS selected,
                  ${alert.activearea} AS activearea,
                  false AS activealert,
                  null AS alertsgraphics 
             ${sqlFrom}`;
      } else {
        sql +=
          ` SELECT 
                    '${alert.idview}' AS idview,
                    '${alert.cod}' AS cod,
                    '${alert.codgroup}' AS codgroup,
                    '${alert.label}' AS label,
                    0.00 AS value1,
                    00.00 AS value2 ,
                    ${alert.selected} AS selected,
                    ${alert.activearea} AS activearea,
                    false AS activealert,
                    null AS alertsgraphics `;
      }
    }
  }
  return sql;
}
// --------------------------------------------------------------

// ==== Charts - details ========================================
function setAlertGraphic(alert, graphic1, graphic2) {
  return {
    cod: alert.cod,
    codGroup: alert.codgroup,
    label: alert.label,
    active: alert.isPrimary,
    isEmpty: graphic1.labels.length === 0 || graphic2.labels.length === 0,
    graphics: [{
      data: graphic1,
      options: {
        title: {
          display: true,
          text: alert.codgroup,
          fontSize: 16
        },
        legend: {
          position: 'bottom'
        }
      }
    },
      {
        data: graphic2,
        options: {
          title: {
            display: true,
            text: alert.codgroup,
            fontSize: 16
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
  }
}
async function setGraphic(resultAux, value1, subtitle) {
  let labels = [];
  let data = [];
  let backgroundColor = [];
  let hoverBackgroundColor = [];

  resultAux.forEach(value => {
    labels.push(value[`${subtitle}`]);
    data.push(value[`${value1}`]);
    backgroundColor.push(generate_color());
    hoverBackgroundColor.push(generate_color());
  });

  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: backgroundColor,
      hoverBackgroundColor: hoverBackgroundColor
    }]
  };
}
async function getSqlDetailsAnalysisTotals(alert, params) {
  let sql1 = '';
  let sql2 = '';

  const value1 = 'value';
  const subtitle = 'subtitle';

  if (alert.idview && alert.idview > 0 && alert.idview !== 'null') {

    const table = {
      name: alert.tableName,
      alias: 'main_table',
      owner: alert.tableOwner
    };

    const columns = await Filter.getColumns(alert, table.owner, table.alias);

    const limit = params.limit && params.limit !== 'null' && params.limit > 0 ?
      params.limit :
      10;


    const columnsFor1 =
      `   (CASE
              WHEN ${columns.column1} IS NULL THEN ${columns.column5}
              ELSE ${columns.column1}
           END)   AS ${subtitle},
          COALESCE(SUM(${columns.column3})) AS ${value1} `;

    const columnsFor2 = alert.codgroup && (alert.codgroup === 'BURNED_AREA') ?
      `   (CASE
                WHEN ${columns.column2} IS NULL THEN ${columns.column5}
                ELSE ${columns.column2}
            END)   AS ${subtitle},
          COALESCE(SUM(${columns.column3})) AS ${value1} ` :
        `   ${columns.column2} AS ${subtitle},
          COALESCE(SUM(${columns.column3})) AS ${value1} `
    ;

    const sqlFrom = ` FROM public.${table.name} AS ${table.alias}`;

    const filter = await Filter.getFilter(View, table, params, alert, columns);

    const sqlGroupBy1 = ` GROUP BY ${subtitle} `;
    const sqlGroupBy2 = ` GROUP BY ${alert.codgroup && (alert.codgroup === 'BURNED_AREA') ? subtitle : columns.column2}  `;
    const sqlOrderBy = ` ORDER BY ${value1} DESC `;
    const sqlLimit = ` LIMIT ${limit} `;

    sql1 +=
      ` SELECT ${columnsFor1} ${sqlFrom} ${filter.secondaryTables}
          ${filter.sqlWhere}
          ${sqlGroupBy1}
          ${filter.sqlHaving}
          ${sqlOrderBy}
          ${sqlLimit}
        `;
    sql2 +=
      ` SELECT ${columnsFor2} ${sqlFrom} ${filter.secondaryTables} 
          ${filter.sqlWhere} 
          ${sqlGroupBy2} 
          ${filter.sqlHaving} 
          ${sqlOrderBy} 
          ${sqlLimit} 
        `;
  } else {
    sql1 +=
      ` SELECT 
          ' --- ' AS ${subtitle},
          0.00 AS ${value1} 
        `;
    sql2 +=
      ` SELECT 
          ' --- ' AS ${subtitle},
          0.00 AS ${value1}
        `;
  }
  return {sql1, sql2, value1, subtitle};
}
function generate_color() {
  const hexadecimal = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += hexadecimal[Math.floor(Math.random() * 16)];
  }
  return color;
}
// --------------------------------------------------------------
module.exports = dashboardService = {
  async getAnalysisTotals(params) {
    const sqlTotals = await getSqlAnalysisTotals(params);
    const result = await View.sequelize.query(sqlTotals, QUERY_TYPES_SELECT);
    result[0].activearea = true;

    return result;
  },
  async getDetailsAnalysisTotals(params) {
    const alerts = params.specificParameters && params.specificParameters !== 'null' ?
      JSON.parse(params.specificParameters) : [];
    const result = [];
    if (alerts.length > 0) {
      for (let alert of alerts) {
        const sql = await getSqlDetailsAnalysisTotals(alert, params);
        let resultAux =  await View.sequelize.query(sql.sql1, QUERY_TYPES_SELECT);
        const graphic1 = await setGraphic(resultAux, sql.value1, sql.subtitle);
        resultAux = await View.sequelize.query(sql.sql2, QUERY_TYPES_SELECT);
        const graphic2 = await setGraphic(resultAux, sql.value1, sql.subtitle);
        result.push(setAlertGraphic(alert, graphic1, graphic2));
      }
    }
    return result;
  },
};
