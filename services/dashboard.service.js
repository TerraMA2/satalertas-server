const {QueryTypes} = require('sequelize');
const models = require('../models');
const {View, sequelize} = models;
const Filter = require("../utils/filter/filter.utils");
const QUERY_TYPES_SELECT = {type: QueryTypes.SELECT};
const ViewService = require("../services/view.service");
const LayerTypeName = require('../enum/layer-type-name');
const InternalServerError = require('../errors/internal-server.error');
const BadRequestError = require('../errors/bad-request.error');

module.exports.getSqlAnalysisTotals = async (params) => {
    const analysisList = JSON.parse(params.specificParameters);
    if (!analysisList) {
        throw new BadRequestError('Missing specificParameters');
    }

    let sql = '';
    for (let analysis of analysisList) {
        sql += sql.trim() === '' ? '' : ' UNION ALL ';

        if (analysis.idview && analysis.idview > 0 && analysis.idview !== 'null') {
            const table = {
                name: analysis.tableName,
                alias: 'main_table'
            };
            const columns = await Filter.getColumns(analysis, '', table.alias);
            const filter = await Filter.getFilter(View, table, params, analysis, columns);
            const alert = analysis.groupCode === 'BURNED' ?
                ` COALESCE( ( SELECT ROW_NUMBER() OVER(ORDER BY ${ columns.column1 } ASC) AS Row
               FROM public.${ table.name } AS ${ table.alias }
               ${ filter.secondaryTables }
               ${ filter.sqlWhere }
               GROUP BY ${ columns.column1 }
               ${ filter.sqlHaving }
               ORDER BY Row DESC
               LIMIT 1
            ), 00.00) AS alert ` :
                `  COALESCE(COUNT(1), 00.00) AS alert `;
            const sqlWhere =
                filter.sqlHaving ?
                    ` ${ filter.sqlWhere } 
                AND ${ table.alias }.${ columns.column1 } IN
                ( SELECT tableWhere.${ columns.column1 } AS subtitle
                  FROM public.${ table.name } AS tableWhere
                  GROUP BY tableWhere.${ columns.column1 }
              ${ filter.sqlHaving }) ` :
                    filter.sqlWhere;

            const area = analysis.groupCode === 'BURNED' ?
                ` ( SELECT coalesce(sum(1), 0.00) as num_focos FROM public.${ table.name } AS ${ table.alias } ${ filter.secondaryTables } ${ sqlWhere } ) AS area ` :
                ` COALESCE(SUM(${ columns.columnArea }), 0.00) AS area `;

            const sqlFrom = analysis.groupCode === 'BURNED' ?
                ` ` :
                ` FROM public.${ table.name } AS ${ table.alias } ${ filter.secondaryTables } ${ filter.sqlWhere } `;

            sql +=
                ` SELECT ${ alert },
                   ${ area }
                   ${ sqlFrom }`;
        } else {
            sql +=
                ` SELECT 0.00 AS alert,
                   00.00 AS area `;
        }
    }
    return sql;
}

module.exports.getAnalysisChart = (analysis, chart1, chart2) => {
    return {
        cod: analysis.cod,
        groupCode: analysis.groupCode,
        label: analysis.label,
        active: analysis.isPrimary,
        isEmpty: chart1.labels.length === 0 || chart2.labels.length === 0,
        charts: [
            {
                data: chart1,
                options: {
                    title: {
                        display: true,
                        text: analysis.groupCode,
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
                        text: analysis.groupCode,
                        fontSize: 16
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    }
}

module.exports.getChart = async (chartData, value, subtitle, label) => {
    let labels = [];
    let data = [];
    let backgroundColor = [];
    let hoverBackgroundColor = [];

    if (!chartData) {
        return null;
    }

    chartData.forEach(chart => {
        labels.push(chart[`${ subtitle }`]);
        const chartValue = chart[`${ value }`];
        data.push(chartValue);
        backgroundColor.push('#5D131C');
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

module.exports.getAnalysisChartSql = async (analysis, params) => {
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

        const limit = params.limit && params.limit !== 'null' && params.limit > 0 ? params.limit : 10;

        const columnsFor1 =
            `   (CASE
              WHEN ${ columns.column1 } IS NULL THEN ${ columns.column5 }
              ELSE ${ columns.column1 }
           END)   AS ${ subtitle },
          COALESCE(SUM(${ columns.column3 })) AS ${ value } `;

        const columnsFor2 = analysis.groupCode && (analysis.groupCode === 'BURNED_AREA') ?
            `   (CASE
                WHEN ${ columns.column2 } IS NULL THEN ${ columns.column5 }
                ELSE ${ columns.column2 }
            END)   AS ${ subtitle },
          COALESCE(SUM(${ columns.column3 })) AS ${ value } ` :
            `   ${ columns.column2 } AS ${ subtitle },
          COALESCE(SUM(${ columns.column3 })) AS ${ value } `;

        const sqlFrom = ` FROM public.${ table.name } AS ${ table.alias }`;

        const filter = await Filter.getFilter(View, table, params, analysis, columns);

        const sqlGroupBy1 = ` GROUP BY ${ subtitle } `;
        const sqlGroupBy2 = ` GROUP BY ${ analysis.groupCode && (analysis.groupCode === 'BURNED_AREA') ? subtitle : columns.column2 }  `;
        const sqlOrderBy = ` ORDER BY ${ value } DESC `;
        const sqlLimit = ` LIMIT ${ limit } `;

        sql1 +=
            ` SELECT ${ columnsFor1 } ${ sqlFrom } ${ filter.secondaryTables }
          ${ filter.sqlWhere }
          ${ sqlGroupBy1 }
          ${ filter.sqlHaving }
          ${ sqlOrderBy }
          ${ sqlLimit }`;
        sql2 +=
            ` SELECT ${ columnsFor2 } ${ sqlFrom } ${ filter.secondaryTables } 
          ${ filter.sqlWhere } 
          ${ sqlGroupBy2 } 
          ${ filter.sqlHaving } 
          ${ sqlOrderBy } 
          ${ sqlLimit }`;
    } else {
        sql1 +=
            ` SELECT 
          ' --- ' AS ${ subtitle },
          0.00 AS ${ value }`;
        sql2 +=
            ` SELECT 
          ' --- ' AS ${ subtitle },
          0.00 AS ${ value }`;
    }
    return {sql1, sql2, value, subtitle};
}

module.exports.getAnalysis = async (params) => {
    let sidebarLayers = await ViewService.getSidebarLayers();
    if (!sidebarLayers) {
        throw new InternalServerError('Layers not found');
    }
    let analysisList = sidebarLayers
        .filter(layerGroup => layerGroup['viewGraph'])
        .map(layerGroup => {
            const children = layerGroup.children;
            const primaryLayer = children.find((layer) => layer.isPrimary && layer.type === LayerTypeName["3"]);
            const analysisCharts = children.map(layer => {
                return {
                    idview: layer.value,
                    cod: layer.cod,
                    groupCode: layer.groupCode,
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
                groupCode: layerGroup.cod,
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
    const sqlTotals = await this.getSqlAnalysisTotals(params);
    if (!sqlTotals) {
        throw new InternalServerError("Couldn't calculate totals");
    }
    const analysisTotals = await sequelize.query(sqlTotals, QUERY_TYPES_SELECT);
    analysisTotals[0].activearea = true;
    return analysisList.map((analysis, index) => {
        const {alert, area} = analysisTotals[index];
        analysis.alert = alert;
        analysis.area = area;
        return analysis;
    });
}

module.exports.getAnalysisCharts = async (params) => {
    const analysisList = JSON.parse(params.specificParameters);
    if (!analysisList) {
        throw new BadRequestError('Missing specificParameters');
    }
    const analysisCharts = [];
    for (const analysis of analysisList) {
        const labelChart1 = analysis.groupCode === 'BURNED' ? 'Quantidade de alertas de focos por CAR' : 'Área (ha) de alertas por CAR';
        const labelChart2 = analysis.groupCode === 'BURNED' ? 'Quantidade de alertas de focos por Bioma' : 'Área (ha) de alertas por classe';
        const sql = await this.getAnalysisChartSql(analysis, params);
        let resultAux = await sequelize.query(sql.sql1, QUERY_TYPES_SELECT);
        const chart1 = await this.getChart(resultAux, sql.value, sql.subtitle, labelChart1);
        resultAux = await sequelize.query(sql.sql2, QUERY_TYPES_SELECT);
        const chart2 = await this.getChart(resultAux, sql.value, sql.subtitle, labelChart2);
        analysisCharts.push(this.getAnalysisChart(analysis, chart1, chart2));
    }
    return analysisCharts;
}
