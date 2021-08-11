const models = require('../models');
const { View } = models;
const Filter = require("../utils/filter/filter.utils");
const ViewService = require("../services/view.service");
const QUERY_TYPES_SELECT = { type: "SELECT" };
const LayerTypeName = require('../enum/layerTypeName');

getSqlAnalysisTotals = async function(params) {
  const analysisList = params.specificParameters && params.specificParameters !== 'null' ? JSON.parse(params.specificParameters) : [];

  let sql = '';
  if (analysisList.length > 0) {
    for (let analysis of analysisList) {
      sql += sql.trim() === '' ? '' : ' UNION ALL ';

      if (analysis.idview && analysis.idview > 0 && analysis.idview !== 'null') {
        const table = {
          name: analysis.tableName,
          alias: 'main_table'
        };
        const columns = await Filter.getColumns(analysis, '', table.alias);
        const filter = await Filter.getFilter(View, table, params, analysis, columns);
        const alert = analysis.codgroup === 'BURNED' ?
          ` COALESCE( ( SELECT ROW_NUMBER() OVER(ORDER BY ${columns.column1} ASC) AS Row
               FROM public.${table.name} AS ${table.alias}
               ${filter.secondaryTables}
               ${filter.sqlWhere}
               GROUP BY ${columns.column1}
               ${filter.sqlHaving}
               ORDER BY Row DESC
               LIMIT 1
            ), 00.00) AS alert ` :
          `  COALESCE(COUNT(1), 00.00) AS alert `;
        const sqlWhere =
          filter.sqlHaving ?
            ` ${filter.sqlWhere} 
                AND ${table.alias}.${columns.column1} IN
                ( SELECT tableWhere.${columns.column1} AS subtitle
                  FROM public.${table.name} AS tableWhere
                  GROUP BY tableWhere.${columns.column1}
              ${filter.sqlHaving}) ` :
              filter.sqlWhere;

        const area = analysis.codgroup === 'BURNED' ?
          ` ( SELECT coalesce(sum(1), 0.00) as num_focos FROM public.${table.name} AS ${table.alias} ${filter.secondaryTables} ${sqlWhere} ) AS area ` :
          ` COALESCE(SUM(${columns.columnArea}), 0.00) AS area `;

        const sqlFrom = analysis.codgroup === 'BURNED' ?
          ` ` :
          ` FROM public.${table.name} AS ${table.alias} ${filter.secondaryTables} ${filter.sqlWhere} `;

        sql +=
          ` SELECT ${alert},
                   ${area}
                   ${sqlFrom}`;
      } else {
        sql +=
          ` SELECT 0.00 AS alert,
                   00.00 AS area `;
      }
    }
  }
  return sql;
}

function setAnalysisChart(analysis, chart1, chart2) {
  return {
    cod: analysis.cod,
    codGroup: analysis.codgroup,
    label: analysis.label,
    active: analysis.isPrimary,
    isEmpty: chart1.labels.length === 0 || chart2.labels.length === 0,
    charts: [{
      data: chart1,
      options: {
        title: {
          display: true,
          text: analysis.codgroup,
          fontSize: 16
        },
        legend: {
          position: 'bottom'
        }
      }
    },
      {
        data: chart2,
        options: {
          title: {
            display: true,
            text: analysis.codgroup,
            fontSize: 16
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
  }
}
async function setChart(chartData, value, subtitle, label) {
  let labels = [];
  let data = [];
  let backgroundColor = [];
  let hoverBackgroundColor = [];

  chartData.forEach(chart => {
    labels.push(chart[`${subtitle}`]);
    const chartValue = chart[`${value}`];
    data.push(chartValue);
    backgroundColor.push('#591111');
    hoverBackgroundColor.push('#874847');
  });

  return {
    labels: labels,
    datasets: [{
      label,
      data: data,
      backgroundColor: backgroundColor,
      hoverBackgroundColor: hoverBackgroundColor
    }]
  };
}
async function getAnalysisChartSql(analysis, params) {
  let sql1 = '';
  let sql2 = '';

  const value = 'value';
  const subtitle = 'subtitle';

  if (analysis.idview && analysis.idview > 0 && analysis.idview !== 'null') {

    const table = {
      name: analysis.tableName,
      alias: 'main_table',
      owner: analysis.tableOwner
    };
    const columns = await Filter.getColumns(analysis, table.owner, table.alias);

    const limit = params.limit && params.limit !== 'null' && params.limit > 0 ?
      params.limit :
      10;


    const columnsFor1 =
      `   (CASE
              WHEN ${columns.column1} IS NULL THEN ${columns.column5}
              ELSE ${columns.column1}
           END)   AS ${subtitle},
          COALESCE(SUM(${columns.column3})) AS ${value} `;

    const columnsFor2 = analysis.codgroup && (analysis.codgroup === 'BURNED_AREA') ?
      `   (CASE
                WHEN ${columns.column2} IS NULL THEN ${columns.column5}
                ELSE ${columns.column2}
            END)   AS ${subtitle},
          COALESCE(SUM(${columns.column3})) AS ${value} ` :
        `   ${columns.column2} AS ${subtitle},
          COALESCE(SUM(${columns.column3})) AS ${value} `
    ;

    const sqlFrom = ` FROM public.${table.name} AS ${table.alias}`;

    const filter = await Filter.getFilter(View, table, params, analysis, columns);

    const sqlGroupBy1 = ` GROUP BY ${subtitle} `;
    const sqlGroupBy2 = ` GROUP BY ${analysis.codgroup && (analysis.codgroup === 'BURNED_AREA') ? subtitle : columns.column2}  `;
    const sqlOrderBy = ` ORDER BY ${value} DESC `;
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
          0.00 AS ${value} 
        `;
    sql2 +=
      ` SELECT 
          ' --- ' AS ${subtitle},
          0.00 AS ${value}
        `;
  }
  return {sql1, sql2, value, subtitle};
}
// function generate_color() {
//   const hexadecimal = '0123456789ABCDEF';
//   let color = '#';
//
//   for (let i = 0; i < 6; i++) {
//     color += hexadecimal[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }
// --------------------------------------------------------------
module.exports = dashboardService = {
  async getAnalysis(params) {
    let sidebarLayers = await ViewService.getSidebarLayers();
    sidebarLayers = sidebarLayers.data;
    if (!sidebarLayers) {
      return null;
    }
    let analysisList = sidebarLayers
        .filter(layerGroup => layerGroup.view_graph)
        .map((layerGroup) => {
          const children = layerGroup.children;
          const primaryLayer = children.find((layer) => layer.isPrimary && layer.type === LayerTypeName["3"]);
          const analysisCharts = children.map(layer => {
            return {
              idview: layer.value,
              cod: layer.cod,
              codgroup: layer.codgroup,
              label: layer.label,
              activearea: true,
              isPrimary: layer.isPrimary,
              isAnalysis: layer.type === LayerTypeName['3'],
              tableOwner: layer.tableOwner,
              tableName: layer.tableName
            }
          });
          return {
            idview: primaryLayer.value,
            cod: primaryLayer.cod,
            codgroup: layerGroup.cod,
            label: layerGroup.label,
            alert: 0,
            area: 0,
            selected: layerGroup.cod === 'DETER',
            activearea: layerGroup.cod === 'DETER',
            activealert: false,
            analysischarts: analysisCharts,
            isAnalysis: true,
            isPrimary: true,
            tableOwner: primaryLayer.tableOwner,
            tableName: primaryLayer.tableName
          };
    });
    params.specificParameters = JSON.stringify(analysisList);
    const sqlTotals = await getSqlAnalysisTotals(params);
    const result = await View.sequelize.query(sqlTotals, QUERY_TYPES_SELECT);
    analysisList = analysisList.map((analysis, index) => {
      analysis.alert = result[index].alert;
      analysis.area = result[index].area;
      return analysis;
    });
    return analysisList;
  },
  async getAnalysisCharts(params) {
    const analysisList = params.specificParameters && params.specificParameters !== 'null' ? JSON.parse(params.specificParameters) : [];
    const result = [];
    if (analysisList.length > 0) {
      let count = 0;
      for (let analysis of analysisList) {
        const labelChart1 = analysis.codGroup === 'BURNED' ? 'Quantidade de alertas de focos por CAR' : 'Área (ha) de alertas por CAR';
        const labelChart2 = analysis.codGroup === 'BURNED' ? 'Quantidade de alertas de focos por Bioma' : 'Área (ha) de alertas por classe';
        const sql = await getAnalysisChartSql(analysis, params);
        let resultAux = await View.sequelize.query(sql.sql1, QUERY_TYPES_SELECT);
        const chart1 = await setChart(resultAux, sql.value, sql.subtitle, labelChart1);
        resultAux = await View.sequelize.query(sql.sql2, QUERY_TYPES_SELECT);
        const chart2 = await setChart(resultAux, sql.value, sql.subtitle, labelChart2);
        result.push(setAnalysisChart(analysis, chart1, chart2));
        count++;
      }
    }
    return result;
  },
};
