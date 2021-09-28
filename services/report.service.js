const FiringCharts = require('../charts/firing-chart');
const { Report, sequelize } = require('../models');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const config = require(__dirname + '/../config/config.json');
const satVegService = require('../services/sat-veg.service');
const moment = require('moment');
const DocDefinitions = require(__dirname +
  '/../utils/helpers/report/doc-definition.js');
const { QueryTypes } = require('sequelize');
const BadRequestError = require('../errors/bad-request.error');
const viewService = require('../services/view.service');
const Layer = require('../utils/layer.utils');
const REPORTTYPE = require('../enum/report-types');
const ProdesChart = require('../charts/prodes-chart');
const geoserverService = require('./geoServer.service');
const carService = require('./car.service');
const gsLayers = require('../enum/geoserver-layers');

getFilterClassSearch = (sql, filter, view, tableOwner) => {
  const classSearch = filter && filter.classSearch ? filter.classSearch : null;
  if (
    classSearch &&
    classSearch.radioValue === 'SELECTION' &&
    classSearch.analyzes.length > 0
  ) {
    classSearch.analyzes.forEach((analyze) => {
      if (analyze.valueOption && analyze.type && view.groupCode === 'DETER') {
        const columnName = view.is_primary
          ? `dd_deter_inpe_classname`
          : `${tableOwner}_dd_deter_inpe_classname`;
        sql += ` AND ${columnName} like '%${analyze.valueOption.name}%' `;
      }
    });
  }
  return sql;
};
getAnalysisYear = (data, period, variable) => {
  const analysisYears = [];
  for (let year = period['startYear']; year <= period['endYear']; year++) {
    analysisYears.push({
      date: year,
      [`${variable}`]: data.find((analise) => analise.date === year)
        ? data.find((analise) => analise.date === year)[variable]
        : '0.0000',
    });
  }
  return analysisYears;
};
setReportFormat = async (
  reportData,
  views,
  type,
  carColumn,
  carColumnSema,
  date,
  filter,
) => {
  const resultReportData = {};

  resultReportData['bbox'] = Layer.setBoundingBox(reportData.bbox);

  reportData.bbox = resultReportData.bbox;

  resultReportData['property'] = reportData;

  reportData['stateBBox'] = Layer.setBoundingBox(reportData.stateBBox);
  carColumnSema = 'rid';

  reportData['planetBBox'] = Layer.setBoundingBox(reportData.planetBBox);

  await this['reportFormat' + type.charAt(0).toUpperCase() + type.slice(1)](
    reportData,
    views,
    resultReportData,
    carColumn,
    carColumnSema,
    date,
    filter,
  );

  return resultReportData;
};
getImageObject = (image, fit, margin, alignment) => {
  if (
    image &&
    image[0] &&
    !image[0].includes('data:application/vnd.ogc.se_xml')
  ) {
    return {
      image: image,
      fit: fit,
      margin: margin,
      alignment: alignment,
    };
  } else {
    return {
      text: 'Imagem não encontrada.',
      alignment: 'center',
      color: '#ff0000',
      fontSize: 9,
      italics: true,
      margin: [30, 60, 30, 60],
    };
  }
};
setDeterData = async (
  type,
  views,
  propertyData,
  dateSql,
  columnCarEstadual,
  columnCalculatedAreaHa,
  columnExecutionDate,
  carRegister,
  filter,
) => {
  if (propertyData && views.DETER && type === 'deter') {
    // --- Total area of Deter period ----------------------------------------------------------------------------------
    const sqlDeterAreaPastDeforestation = `   
            SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area 
            FROM public.${views.DETER.children.CAR_X_DETER.tableName} 
            WHERE ${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_X_DETER,
      views.DETER.tableOwner,
    )} `;
    const resultDeterAreaPastDeforestation = await sequelize.query(
      sqlDeterAreaPastDeforestation,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );
    propertyData['areaPastDeforestation'] =
      resultDeterAreaPastDeforestation['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Deforestation alerts and areas ------------------------------------------------------------------------------
    const sqlDeforestationAlerts = `
      SELECT 
            carxdeter.${views.DETER.children.CAR_X_DETER.tableName}_id AS id,
            SUBSTRING(ST_EXTENT(carxdeter.intersection_geom)::TEXT, 5, length(ST_EXTENT(carxdeter.intersection_geom)::TEXT) - 5) AS bbox,
            COALESCE(calculated_area_ha, 4) AS area,
            TO_CHAR(carxdeter.execution_date, 'dd/mm/yyyy') AS date,
            TO_CHAR(carxdeter.execution_date, 'yyyy') AS year,
            TRIM(carxdeter.dd_deter_inpe_sensor) AS sensor,
            TRIM(TO_CHAR(CAST(REPLACE(REPLACE(carxdeter.dd_deter_inpe_path_row, '/', ''), '_', '') AS DECIMAL), '999_999')) AS path_row,
            TRIM(TO_CHAR(carxdeter.execution_date, 'ddmmyyyy')) AS date_code,
            ( CASE WHEN carxdeter.dd_deter_inpe_satellite = 'Cbers4' THEN 'CBERS-4'
                   ELSE UPPER(TRIM(carxdeter.dd_deter_inpe_satellite)) END) AS sat
      FROM public.${
        views.DETER.children.CAR_X_DETER.tableName
      } AS carxdeter, public.${views.STATIC.children.BIOMAS.tableName} bio
      WHERE ${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_X_DETER,
      views.DETER.tableOwner,
    )}
            AND st_intersects(bio.geom, carxdeter.intersection_geom)
      GROUP BY a_cardeter_31_id, bio.gid `;

    propertyData['deforestationAlerts'] = await sequelize.query(
      sqlDeforestationAlerts,
      { type: QueryTypes.SELECT },
    );
    // -----------------------------------------------------------------------------------------------------------------

    // ---- Values of table --------------------------------------------------------------------------------------------
    const sqlCrossings = `
      SELECT 'app' AS relationship, 'APP' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
      FROM public.${views.DETER.children.CAR_DETER_X_APP.tableName} WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_APP,
      views.DETER.tableOwner,
    )}      
      UNION ALL
        SELECT 'legalReserve' AS relationship, 'ARL' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${
          views.DETER.children.CAR_DETER_X_RESERVA.tableName
        } WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_RESERVA,
      views.DETER.tableOwner,
    )}
      UNION ALL
        SELECT 'indigenousLand' AS relationship, 'TI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_TI.tableName} WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_TI,
      views.DETER.tableOwner,
    )}
      UNION ALL
        SELECT 'exploration' AS relationship, 'AUTEX' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${
          views.DETER.children.CAR_DETER_X_EXPLORA.tableName
        } WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_EXPLORA,
      views.DETER.tableOwner,
    )}
      UNION ALL
        SELECT 'deforestation' AS relationship, 'AD' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${
          views.DETER.children.CAR_DETER_X_DESMATE.tableName
        } WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_DESMATE,
      views.DETER.tableOwner,
    )}
      UNION ALL
        SELECT 'embargoedArea' AS relationship, 'Área embargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_EMB.tableName} WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_EMB,
      views.DETER.tableOwner,
    )}
      UNION ALL
        SELECT 'landArea' AS relationship, 'Área desembargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${
          views.DETER.children.CAR_DETER_X_DESEMB.tableName
        } WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_DESEMB,
      views.DETER.tableOwner,
    )}
      UNION ALL
        SELECT 'ucUs' AS relationship, 'UC – US' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_UC.tableName} 
        WHERE ${
          views.DETER.tableOwner
        }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_UC,
      views.DETER.tableOwner,
    )}  AND de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
      UNION ALL
        SELECT 'ucPi' AS relationship, 'UC – PI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_UC.tableName} 
        WHERE ${
          views.DETER.tableOwner
        }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_UC,
      views.DETER.tableOwner,
    )} AND de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
      UNION ALL
        SELECT 'burnAuthorization' AS relationship, 'AQC' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${
          views.DETER.children.CAR_DETER_X_QUEIMA.tableName
        } WHERE ${
      views.DETER.tableOwner
    }_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(
      dateSql,
      filter,
      views.DETER.children.CAR_DETER_X_QUEIMA,
      views.DETER.tableOwner,
    )}
    `;

    const resCrossings = await sequelize.query(sqlCrossings, {
      type: QueryTypes.SELECT,
    });
    let deterSumArea = 0;
    resCrossings.forEach((crossing) => {
      if (!propertyData['tableData']) {
        propertyData['tableData'] = [];
      }
      propertyData['tableData'].push({
        affectedArea: crossing['affected_area'],
        pastDeforestation: crossing['area'],
      });

      deterSumArea += parseFloat(crossing['area']) ? parseFloat(crossing['area']) : 0.0;
    });

    if (!propertyData['foundDeter']) {
      propertyData['foundDeter'] = {};
    }
    propertyData['foundDeter'] = !!deterSumArea;
    // -----------------------------------------------------------------------------------------------------------------
  }

  return propertyData;
};
setProdesData = async (
  type,
  views,
  propertyData,
  dateSql,
  columnCarEstadual,
  columnCalculatedAreaHa,
  columnExecutionDate,
  carRegister,
) => {
  if (propertyData && views.PRODES && type === 'prodes') {
    // --- Prodes area grouped by year ---------------------------------------------------------------------------------
    const sqlProdesYear = `SELECT
        extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
        ROUND(COALESCE(SUM(CAST(cp.${columnCalculatedAreaHa}  AS DECIMAL)), 0), 4) AS area
      FROM public.${views.PRODES.children.CAR_X_PRODES.tableName} AS cp
      WHERE cp.${columnCarEstadual} = '${carRegister}'
        ${dateSql}
      GROUP BY date
      ORDER BY date `;
    propertyData['analyzesYear'] = await sequelize.query(sqlProdesYear, {
      type: QueryTypes.SELECT,
    });
    // -----------------------------------------------------------------------------------------------------------------

    // --- Radam View vegetation of area grouped by physiognomy --------------------------------------------------------
    const sqlVegRadam = ` SELECT gid, numero_do1, numero_do2, fisionomia, ROUND(CAST(area_ha_ AS DECIMAL), 4) AS area_ha_, ROUND(CAST(area_ha_car_vegradam AS DECIMAL), 4) AS area_ha_car_vegradam FROM car_x_vegradam WHERE gid = ${carRegister} `;
    propertyData['vegRadam'] = await sequelize.query(sqlVegRadam, {
      type: QueryTypes.SELECT,
    });
    // -----------------------------------------------------------------------------------------------------------------

    // --- Fisionomia of prodes radam ----------------------------------------------------------------------------------
    const sqlFisionomiaPRODESSum = `
      SELECT
             fisionomia AS class,
             SUM(ST_Area(ST_Intersection(car_prodes.intersection_geom, radam.geom)::geography) / 10000.0) AS area
      FROM public.${views.PRODES.children.CAR_X_PRODES.tableName} AS car_prodes, public.${views.STATIC.children.VEGETACAO_RADAM_BR.tableName} AS radam
      WHERE car_prodes.de_car_validado_sema_gid = '${carRegister}' ${dateSql}
       AND ST_Intersects(car_prodes.intersection_geom, radam.geom)
      GROUP BY radam.fisionomia`;

    propertyData['prodesRadam'] = await sequelize.query(
      sqlFisionomiaPRODESSum,
      { type: QueryTypes.SELECT },
    );
    // -----------------------------------------------------------------------------------------------------------------

    // --- Total area of prodes ----------------------------------------------------------------------------------------
    const sqlProdesTotalArea = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
      FROM public.${views.PRODES.children.CAR_X_PRODES.tableName}
      WHERE ${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const resultProdesTotalArea = await sequelize.query(sqlProdesTotalArea, {
      type: QueryTypes.SELECT,
      plain: true,
    });
    propertyData['prodesTotalArea'] = resultProdesTotalArea['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Total area of prodes period ----------------------------------------------------------------------------------------
    const sqlProdesAreaPastDeforestation = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.tableName} where ${columnCarEstadual} = '${carRegister}' ${dateSql} `;
    const resultProdesAreaPastDeforestation = await sequelize.query(
      sqlProdesAreaPastDeforestation,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );
    propertyData['areaPastDeforestation'] =
      resultProdesAreaPastDeforestation['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Total area of UsoCon ----------------------------------------------------------------------------------------
    const sqlUsoConArea = `SELECT ROUND(COALESCE(SUM(CAST(area_ha_car_usocon AS DECIMAL)), 0), 4) AS area FROM public.${views.STATIC.children.CAR_X_USOCON.tableName} where gid_car = '${carRegister}'`;
    const resultUsoConArea = await sequelize.query(sqlUsoConArea, {
      type: QueryTypes.SELECT,
      plain: true,
    });
    propertyData['areaUsoCon'] = resultUsoConArea['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Prodes area by period ---------------------------------------------------------------------------------------
    const sqlProdesArea = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.tableName} where ${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const resultProdesArea = await sequelize.query(sqlProdesArea, {
      type: QueryTypes.SELECT,
      plain: true,
    });
    propertyData['prodesArea'] = resultProdesArea['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // ---- Values of table --------------------------------------------------------------------------------------------
    const sqlCrossings = ` SELECT 'indigenousLand' AS relationship, 'TI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'legalReserve' AS relationship, 'ARL' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'app' AS relationship, 'APP' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'exploration' AS relationship, 'AUTEX' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EXPLORA.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'deforestation' AS relationship, 'AD' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESMATE.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL 
        SELECT 'restrictedUse' AS relationship, 'AUR' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USO_RESTRITO.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'embargoedArea' AS relationship, 'Área embargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EMB.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'landArea' AS relationship, 'Área desembargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESEMB.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'burnAuthorization' AS relationship, 'AQC' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_QUEIMA.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'ucUs' AS relationship, 'UC – US' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} and de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
        UNION ALL 
        SELECT 'ucPi' AS relationship, 'UC – PI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.tableName} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} and de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
      `;
    // -----------------------------------------------------------------------------------------------------------------

    // ----- Area of Deforestation History -----------------------------------------------------------------------------
    const sqlDeforestationHistory = ` SELECT
                            extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
                            ROUND(COALESCE(SUM(CAST(cp.${columnCalculatedAreaHa}  AS DECIMAL)), 0),4) AS area
            FROM public.${views.PRODES.children.CAR_X_PRODES.tableName} cp
            WHERE cp.${columnCarEstadual} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
    const deforestationHistory = await sequelize.query(
      sqlDeforestationHistory,
      { type: QueryTypes.SELECT },
    );

    // propertyData['period']  = await sequelize.query(  ` SELECT  (MAX(prodes.ano) - 11) AS start_year, MAX(prodes.ano) AS end_year  FROM ${views.DYNAMIC.children.PRODES.tableName} AS prodes ` , {type: QueryTypes.SELECT});
    propertyData['period'] = await sequelize.query(
      ` SELECT  2006 AS start_year, MAX(prodes.ano) AS end_year  FROM ${views.DYNAMIC.children.PRODES.tableName} AS prodes `,
      { type: QueryTypes.SELECT },
    );

    propertyData['deforestationHistory'] = getAnalysisYear(
      deforestationHistory,
      {
        startYear: propertyData['period'][0]['start_year'],
        endYear: propertyData['period'][0]['end_year'],
      },
      'area',
    );
    // ---------------------------------------------------------------------------------------------------------------

    const resCrossings = await sequelize.query(sqlCrossings, {
      type: QueryTypes.SELECT,
    });
    let prodesSumArea = 0;
    resCrossings.forEach((crossing) => {
      if (!propertyData['tableData']) {
        propertyData['tableData'] = [];
      }
      propertyData['tableData'].push({
        affectedArea: crossing['affected_area'],
        pastDeforestation: crossing['area'],
      });

      prodesSumArea += parseFloat(crossing['area'])
        ? parseFloat(crossing['area'])
        : 0.0;
    });

    if (!propertyData['foundProdes']) {
      propertyData['foundProdes'] = {};
    }
    propertyData['foundProdes'] = !!prodesSumArea;

    let radamProdes = 0;
    let radamText = '';
    if (propertyData['prodesRadam'] && propertyData['prodesRadam'].length > 0) {
      for (const radam of propertyData['prodesRadam']) {
        const area = radam['area'];
        const cls = radam['class'];
        if (cls) {
          radamText +=
            radamText === '' ? `${cls}: ${area}` : `\n ${cls}: ${area}`;
          radamProdes += area;
        }
      }
    }

    propertyData['tableVegRadam'] = {
      affectedArea: 'Vegetação RADAM BR',
      pastDeforestation: radamText,
    };
  }

  return propertyData;
};
setBurnedData = async (
  type,
  views,
  propertyData,
  dateSql,
  columnCarEstadual,
  columnCarEstadualSemas,
  columnExecutionDate,
  carRegister,
  filter,
) => {
  if (propertyData && views.BURNED && type === 'queimada') {
    // ---  Firing Authorization ---------------------------------------------------------------------------------------
    const sqlFiringAuth = `
        SELECT 
                aut.titulo_nu1,
                TO_CHAR(aut.data_apro1, 'DD/MM/YYYY') AS data_apro, TO_CHAR(aut.data_venc1, 'DD/MM/YYYY') AS data_venc,
                SUM(ROUND((COALESCE(aut.area__m2_,0) / 10000), 4)) AS area_ha
        FROM public.${views.STATIC.children.AUTORIZACAO_QUEIMA.tableName} AS aut
        JOIN public.${views.STATIC.children.CAR_VALIDADO.tableName} AS car ON st_contains(car.geom, aut.geom)
        WHERE   car.${columnCarEstadualSemas} = ${carRegister}
            AND '${filter.date[0]}' <= aut.data_apro1
            AND '${filter.date[1]}' >= data_venc1
            GROUP BY aut.titulo_nu1, aut.data_apro1, aut.data_venc1
    `;
    propertyData['firingAuth'] = await sequelize.query(sqlFiringAuth, {
      type: QueryTypes.SELECT,
    });
    // -----------------------------------------------------------------------------------------------------------------

    // ---  Firing Authorization ---------------------------------------------------------------------------------------
    const sqlBurnCount = `
        SELECT  COUNT(1) AS total_focus
        FROM public.${views.BURNED.children.CAR_X_FOCOS.tableName} car_focos
        WHERE   car_focos.${columnCarEstadual} = ${carRegister}
            AND car_focos.${columnExecutionDate} BETWEEN '${filter.date[0]}' AND '${filter.date[1]}'
    `;
    propertyData['burnCount'] = await sequelize.query(sqlBurnCount, {
      type: QueryTypes.SELECT,
      plain: true,
    });
    // -----------------------------------------------------------------------------------------------------------------

    // ---  historyFireSpot ---------------------------------------------------------------------------------------
    const sqlHistoryFireSpot = `
            SELECT  COUNT(1) AS total_focus,
                    0 AS authorized_focus,
                    0 AS  unauthorized_focus,
                    COUNT(1) filter(where to_char(car_focos.execution_date, 'MMDD') between '0715' and '0915') as prohibitive_period, -- Contando focos no periodo proibitivo
                    (EXTRACT(YEAR FROM car_focos.execution_date))::INT AS month_year_occurrence
            FROM public.${views.BURNED.children.CAR_X_FOCOS.tableName} car_focos
            WHERE car_focos.${columnCarEstadual} = ${carRegister}
                AND car_focos.${columnExecutionDate} BETWEEN '2008-01-01T00:00:00.000Z' AND '${filter.date[1]}'
            GROUP BY month_year_occurrence
            ORDER BY month_year_occurrence
        `;
    propertyData['historyFireSpot'] = await sequelize.query(
      sqlHistoryFireSpot,
      { type: QueryTypes.SELECT },
    );
    // -----------------------------------------------------------------------------------------------------------------
  }

  return propertyData;
};
setBurnedAreaData = async (
  type,
  views,
  propertyData,
  dateSql,
  columnCarEstadual,
  columnCalculatedAreaHa,
  columnCarEstadualSemas,
  columnExecutionDate,
  carRegister,
) => {
  if (propertyData && views.BURNED_AREA && type === 'queimada') {
    const sqlBurnedAreas = `
      SELECT
        ROUND(COALESCE(SUM(CAST(areaq.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS burnedAreas,
        extract('YEAR' FROM areaq.${columnExecutionDate}) AS date
      FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.tableName} AS areaq
      INNER JOIN public.${views.STATIC.children.CAR_VALIDADO.tableName} AS car on
      areaq.${columnCarEstadual} = car.${columnCarEstadualSemas} AND
      car.${columnCarEstadualSemas} = '${carRegister}'
      group by date
    `;

    const burnedAreas = await sequelize.query(sqlBurnedAreas, {
      type: QueryTypes.SELECT,
    });

    const sqlBurnedAreasYear = `
      SELECT
        extract(year from date_trunc('year', areaq.${columnExecutionDate})) AS date,
        ROUND(COALESCE(SUM(CAST(areaq.${columnCalculatedAreaHa}  AS DECIMAL)), 0), 4) AS burnedAreas
      FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.tableName} AS areaq
      WHERE areaq.${columnCarEstadual} = '${carRegister}'
      GROUP BY date
      ORDER BY date`;

    const burnedAreasYear = await sequelize.query(sqlBurnedAreasYear, {
      type: QueryTypes.SELECT,
    });
    const sqlAPPBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_APP.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReserveBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_RESERVA.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlIndigenousLandBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_TI.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlExploraBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EXPLORA.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlDesmateBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESMATE.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlEmbargoedAreaBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EMB.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLandAreaBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESEMB.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlRestrictUseBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_USO_RESTRITO.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlBurnAuthorizationBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_QUEIMA.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    // const sqlFisionomiaBURNEDAREASum = `SELECT de_veg_radambr_fisionomia AS class, sum(CAST(${columnCalculatedAreaHa}  AS DECIMAL)) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_VEG_RADAM.tableName} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

    const restrictUseBURNEDAREASum = await sequelize.query(
      sqlRestrictUseBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const burnAuthorizationBURNEDAREASum = await sequelize.query(
      sqlBurnAuthorizationBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    // const resultFisionomiaBURNEDAREASum = await sequelize.query(sqlFisionomiaBURNEDAREASum, {type: QueryTypes.SELECT});
    // const fisionomiaBURNEDAREASum = resultFisionomiaBURNEDAREASum;

    const aPPBURNEDAREASum = await sequelize.query(sqlAPPBURNEDAREASum, {
      type: QueryTypes.SELECT,
      plain: true,
    });

    const legalReserveBURNEDAREASum = await sequelize.query(
      sqlLegalReserveBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const indigenousLandBURNEDAREASum = await sequelize.query(
      sqlIndigenousLandBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const explorationBURNEDAREASum = await sequelize.query(
      sqlExploraBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const deforestationBURNEDAREASum = await sequelize.query(
      sqlDesmateBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const embargoedAreaBURNEDAREASum = await sequelize.query(
      sqlEmbargoedAreaBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    const landAreaBURNEDAREASum = await sequelize.query(
      sqlLandAreaBURNEDAREASum,
      {
        type: QueryTypes.SELECT,
        plain: true,
      },
    );

    propertyData['burnedAreas'] = burnedAreas;
    propertyData['burnedAreasYear'] = burnedAreasYear;

    let burnedAreaSum = 0;

    burnedAreaSum += aPPBURNEDAREASum['area'] ? aPPBURNEDAREASum['area'] : 0;
    burnedAreaSum += legalReserveBURNEDAREASum['area']
      ? legalReserveBURNEDAREASum['area']
      : 0;
    burnedAreaSum += indigenousLandBURNEDAREASum['area']
      ? indigenousLandBURNEDAREASum['area']
      : 0;
    burnedAreaSum += deforestationBURNEDAREASum['area']
      ? deforestationBURNEDAREASum['area']
      : 0;
    burnedAreaSum += embargoedAreaBURNEDAREASum['area']
      ? embargoedAreaBURNEDAREASum['area']
      : 0;
    burnedAreaSum += landAreaBURNEDAREASum['area']
      ? landAreaBURNEDAREASum['area']
      : 0;

    if (!propertyData['tableData']) {
      propertyData['tableData'] = {};
    }
    propertyData['tableData']['affectedArea'] = 'APP';
    propertyData['tableData']['burnAreas'] = parseFloat(
      aPPBURNEDAREASum['area'] || 0,
    );

    if (!propertyData['prodesLegalReserve']) {
      propertyData['prodesLegalReserve'] = {};
    }
    propertyData['prodesLegalReserve']['affectedArea'] = 'ARL';
    propertyData['prodesLegalReserve']['burnAreas'] = parseFloat(
      legalReserveBURNEDAREASum['area'] || 0,
    );

    if (!propertyData['prodesRestrictedUse']) {
      propertyData['prodesRestrictedUse'] = {};
    }
    propertyData['prodesRestrictedUse']['affectedArea'] = 'AUR';
    propertyData['prodesRestrictedUse']['burnAreas'] = parseFloat(
      restrictUseBURNEDAREASum['area'] || 0,
    );

    if (!propertyData['prodesIndigenousLand']) {
      propertyData['prodesIndigenousLand'] = {};
    }
    propertyData['prodesIndigenousLand']['affectedArea'] = 'TI';
    propertyData['prodesIndigenousLand']['burnAreas'] = parseFloat(
      indigenousLandBURNEDAREASum['area'],
    );

    if (!propertyData['prodesExploration']) {
      propertyData['prodesExploration'] = {};
    }
    propertyData['prodesExploration']['affectedArea'] = 'AUTEX';
    propertyData['prodesExploration']['burnAreas'] = parseFloat(
      explorationBURNEDAREASum['area'],
    );

    if (!propertyData['prodesDeforestation']) {
      propertyData['prodesDeforestation'] = {};
    }
    propertyData['prodesDeforestation']['affectedArea'] = 'AD';
    propertyData['prodesDeforestation']['burnAreas'] = parseFloat(
      deforestationBURNEDAREASum['area'],
    );

    if (!propertyData['prodesEmbargoedArea']) {
      propertyData['prodesEmbargoedArea'] = {};
    }
    propertyData['prodesEmbargoedArea']['affectedArea'] = 'Área embargada';
    propertyData['prodesEmbargoedArea']['burnAreas'] = parseFloat(
      embargoedAreaBURNEDAREASum['area'],
    );

    if (!propertyData['prodesLandArea']) {
      propertyData['prodesLandArea'] = {};
    }
    propertyData['prodesLandArea']['affectedArea'] = 'Área desembargada';
    propertyData['prodesLandArea']['burnAreas'] = parseFloat(
      landAreaBURNEDAREASum['area'],
    );

    if (!propertyData['prodesBurnAuthorization']) {
      propertyData['prodesBurnAuthorization'] = {};
    }
    propertyData['prodesBurnAuthorization']['affectedArea'] = 'AQ';
    propertyData['prodesBurnAuthorization']['burnAreas'] = parseFloat(
      burnAuthorizationBURNEDAREASum['area'],
    );

    if (!propertyData['foundFireSpot']) {
      propertyData['foundFireSpot'] = !!burnedAreaSum;
    }
  }

  return propertyData;
};
getContextChartNdvi = async (chartImages, startDate, endDate) => {
  if (!chartImages || chartImages === []) {
    return [];
  }
  const ndviContext = [
    { text: '', pageBreak: 'after' },
    {
      columns: [
        {
          text: `Os gráficos a seguir representam os NDVIs dos 5 (cinco) maiores polígonos de desmatamento do PRODES no imóvel no período de ${startDate} a ${endDate}.`,
          margin: [30, 20, 30, 5],
          style: 'body',
        },
      ],
    },
  ];
  chartImages.forEach((chartImage) => {
    ndviContext.push(
      {
        margin: [30, 0, 30, 0],
        alignment: 'center',
        columns: [chartImage.geoserverImage],
      },
      {
        margin: [30, 0, 30, 0],
        alignment: 'center',
        columns: [chartImage.ndviChartImage],
      },
      { text: '', pageBreak: 'after' },
    );
  });
  return ndviContext;
};
getDeforestationHistoryAndChartNdviContext = async (
  docDefinitionContent,
  reportData,
) => {
  moment.locale('pt-br');
  const startDate = moment(reportData.date[0]).format('L');
  const endDate = moment(reportData.date[1]).format('L');
  const chartAndImages = [...reportData.deforestationHistoryContext]
  const paragraphIndex = docDefinitionContent.findIndex(
    (paragraph) => paragraph.hasOwnProperty('text') && paragraph.text === 'NDVIGraphs',
  );
  const ndviContext = await getContextChartNdvi(
    reportData['chartImages'],
    startDate,
    endDate,
  );
  ndviContext.forEach((ndvi) => chartAndImages.push(ndvi))
  docDefinitionContent.splice(paragraphIndex, 1, chartAndImages)
  return docDefinitionContent;
};

getContentForDeforestionAlertsContext = async (
  docDefinitionContent,
  deforestationAlertsContext,
) => {
  const content = [];

  for (let j = 0; j < docDefinitionContent.length; j++) {
    if (j === 65) {
      deforestationAlertsContext.forEach((deforestationAlerts) => {
        content.push(deforestationAlerts);
      });
    }

    content.push(docDefinitionContent[j]);
  }

  return content;
};
getConclusion = async (conclusionText) => {
  const conclusionParagraphs = conclusionText
    ? conclusionText.split('\n')
    : ['XXXXXXXXXXXXX.'];
  const conclusion = [];

  for (const paragraph in conclusionParagraphs) {
    const paragraphObj = {
      text: conclusionParagraphs[paragraph],
      margin: [30, 0, 30, 5],
      style: 'bodyIndentFirst',
    };
    conclusion.push(paragraphObj);
  }
  return conclusion;
};
getContentConclusion = async (docDefinitionContent, conclusionText) => {
  const conclusion = await getConclusion(conclusionText);
  const conclusionIdx =
    docDefinitionContent.findIndex(
      ({ text }) => text && text.includes('CONCLUSÃO'),
    ) + 1;

  docDefinitionContent.splice(conclusionIdx, 0, conclusion);

  return docDefinitionContent;
};
setDocDefinitions = async (reportData, docDefinition) => {
  docDefinition.content = await getContentConclusion(
    docDefinition.content,
    reportData.property.comments,
  );
  if (reportData.type === 'prodes') {
    docDefinition.content = await getDeforestationHistoryAndChartNdviContext(
      docDefinition.content,
      reportData,
    );
  }
  if (reportData.type === 'deter') {
    docDefinition.content = await getContentForDeforestionAlertsContext(
      docDefinition.content,
      reportData.deforestationAlertsContext,
    );
  }
  return docDefinition;
};
setImages = async (reportData) => {
  if (!reportData['images']) {
    reportData.images = {};
  }
  reportData['images']['headerImage0'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/mpmt-small.png',
        'base64',
      )}`,
    ],
    [320, 50],
    [60, 25, 0, 20],
    'left',
  );
  reportData['images']['headerImage1'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/logo-satelites-alerta-horizontal.png',
        'base64',
      )}`,
    ],
    [320, 50],
    [0, 25, 0, 0],
    'left',
  );
  reportData['images']['headerImage2'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/inpe.png',
        'base64',
      )}`,
    ],
    [320, 50],
    [0, 25, 70, 20],
    'right',
  );
  reportData['images']['chartImage1'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/satveg_grafico_fig2.png',
        'base64',
      )}`,
    ],
    [480, 400],
    [0, 3],
    'center',
  );
  reportData['images']['chartImage2'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/satveg_grafico_fig3.png',
        'base64',
      )}`,
    ],
    [480, 400],
    [3, 3],
    'center',
  );
  reportData['images']['chartImage3'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/satveg_grafico_fig4.png',
        'base64',
      )}`,
    ],
    [480, 400],
    [3, 3],
    'center',
  );
  reportData['images']['partnerImage1'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/mpmt-small.png',
        'base64',
      )}`,
    ],
    [180, 50],
    [30, 0, 0, 0],
    'left',
  );
  reportData['images']['partnerImage2'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/pjedaou-large.png',
        'base64',
      )}`,
    ],
    [100, 50],
    [30, 0, 0, 0],
    'center',
  );
  reportData['images']['partnerImage3'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/caex.png',
        'base64',
      )}`,
    ],
    [80, 50],
    [30, 0, 25, 0],
    'right',
  );
  reportData['images']['partnerImage4'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/inpe.png',
        'base64',
      )}`,
    ],
    [130, 60],
    [80, 30, 0, 0],
    'left',
  );
  reportData['images']['partnerImage5'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/dpi.png',
        'base64',
      )}`,
    ],
    [100, 60],
    [95, 30, 0, 0],
    'center',
  );
  reportData['images']['partnerImage6'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/terrama2-large.png',
        'base64',
      )}`,
    ],
    [100, 60],
    [0, 30, 30, 0],
    'right',
  );
  reportData['images']['partnerImage7'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/mt.png',
        'base64',
      )}`,
    ],
    [100, 60],
    [80, 30, 0, 0],
    'left',
  );
  reportData['images']['partnerImage8'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/sema.png',
        'base64',
      )}`,
    ],
    [100, 60],
    [130, 25, 0, 0],
    'center',
  );
  reportData['images']['partnerImage9'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/logo-patria-amada-brasil-horizontal.png',
        'base64',
      )}`,
    ],
    [100, 60],
    [0, 30, 25, 0],
    'center',
  );
  reportData['images']['partnerImage10'] = getImageObject(
    [
      `data:image/png;base64,${fs.readFileSync(
        'assets/img/logos/Brasao_BPMA.png',
        'base64',
      )}`,
    ],
    [80, 60],
    [20, 20, 20, 0],
    'right',
  );
};

firingChartsReport = async (reportData) => {
  reportData.chartsImages['firstFiringChart'] = {
    image: await FiringCharts.historyFireSpot(
      reportData.property.historyFireSpot,
    ).toDataUrl(),
    fit: [450, 450],
    alignment: 'center',
  };
  reportData.chartsImages['secondFiringChart'] = {
    image: await FiringCharts.chartBase64(reportData.property.gid),
    fit: [450, 200],
    alignment: 'center',
  };
};
prodesChartsReport = async (options, idx) => {
  const image = await ProdesChart.chartBase64(options);
  return {
    alignment: 'center',
    fit: [500, 500],
    margin: [10, 0],
    image,
  };
};

setCharts = async (reportData) => {
  if (!reportData.chartsImages) {
    reportData.chartsImages = {};
  }
  const charts = reportData.chartsImages;
  if (charts && reportData.type === REPORTTYPE.FIRING) {
    await firingChartsReport(reportData);
  }
  if (charts && reportData.type === REPORTTYPE.PRODES) {
    const { property, date } = reportData;
    const points = await getPointsAlerts(property.gid, date, REPORTTYPE.PRODES);
    let idx = 0;
    for (const point of points) {
      const { options, url } = point;
      const chart = await prodesChartsReport(options, idx);
      reportData.chartImages.push({
        ndviChartImage: chart,
        geoserverImage: getImageObject(url, [200, 200], [10, 70], 'center'),
      });
      idx++;
    }
  }
};
saveReport = async (docName, newNumber, reportData, path) => {
    const report = new Report({
        name: docName.trim(),
        code: parseInt(newNumber),
        carCode: reportData['property'].stateRegister
            ? reportData['property'].stateRegister.trim()
            : reportData['property'].federalregister,
        carGid: reportData['property'].gid,
        path: path.trim(),
        type: reportData['type'].trim(),
    });
    return await Report.create(report.dataValues).then((report) => report.dataValues);
}

getDocDefinitions = async (reportData) => {
    const code = reportData['code']
        ? reportData['code'].code
        : `XXXXX/${ reportData['currentYear'] }`;
    const title =
        reportData['type'] === 'deter'
            ? `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº ${ code }`
            : reportData['type'] === 'prodes'
                ? `RELATÓRIO TÉCNICO SOBRE DE DESMATAMENTO Nº ${ code }`
                : reportData['type'] === 'queimada'
                    ? `RELATÓRIO DE FOCOS DE CALOR Nº ${ code }`
                    : `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº XXXXX/${ reportData['currentYear'] }`;

    await setImages(reportData);
    await setCharts(reportData);

    const headerDocument = [
        reportData.images.headerImage0,
        reportData.images.headerImage1,
        reportData.images.headerImage2,
    ];

    const docDefinitions = DocDefinitions[reportData['type']](
        headerDocument,
        reportData,
        title,
    );

    return {
        docDefinitions: await setDocDefinitions(reportData, docDefinitions),
        headerDocument: headerDocument,
    }
}
module.exports.reportFormatProdes = async (
    reportData,
    views,
    resultReportData,
    carColumn,
    carColumnSema,
    date,
    filter = null,
) => {
    const layers = [
        `${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        `${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }`,
    ];
    const filters = `cql_filter=${ carColumnSema }=${ resultReportData.property.gid };${ carColumn }=${ resultReportData.property.gid }`;
    resultReportData.vectorViews = {layers, filters};

    resultReportData['urlGsImage'] = await geoserverService.getMapImage({
        "bbox": `${ reportData['stateBBox'] }`,
        "cql_filter": `geocodigo<>'';municipio='${ resultReportData.property.city.replace("'", "''") }';numero_do1='${ resultReportData.property.stateRegister }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.MUNICIPIOS.workspace }:${ views.STATIC.children.MUNICIPIOS.view },${ views.STATIC.children.MUNICIPIOS.workspace }:${ views.STATIC.children.MUNICIPIOS.view },${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": "",
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });
    resultReportData['prodesStartYear'] = resultReportData.property['period'][0]['start_year'];
    resultReportData['prodesTableData'] = reportData.analyzesYear;
    resultReportData['prodesTableData'].push({
        date: 'Total',
        area: resultReportData.property.prodesTotalArea,
    });

    resultReportData['urlGsImage1'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage2'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ carColumn }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }`,
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_yellow_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,terrama2_119:${ views.DYNAMIC.children.PRODES.view }_color_style`,
        "time": `${ resultReportData.property['period'][0]['start_year'] }/${ resultReportData.property['period'][0]['end_year'] }`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsLegend'] = await geoserverService.getLegendImage({
        "format": "image/png",
        "height": "30",
        "layer": `${ views.STATIC.children.CAR_VALIDADO.workspace }:CAR_VALIDADO_X_CAR_PRODES_X_USOCON`,
        "version": "1.0.0",
        "width": "30",
        "legend_options": "forceLabels:on;forceTitles:off;layout:vertical;columns:2;fontSize:16"
    });

    resultReportData['urlGsImage3'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.bbox.replace(/\\s /g,'',) }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${resultReportData.property.gid}';gid_car='${ resultReportData.property.gid }';${ carColumn }='${resultReportData.property.gid}'`,
        "format": "image/png",
        "height": `${config.geoserver.imgHeight}`,
        "layers": `${views.STATIC.children.CAR_VALIDADO.workspace}:MosaicSpot2008,${ views.STATIC.children.CAR_VALIDADO.workspace }:${views.STATIC.children.CAR_VALIDADO.view},${ views.STATIC.children.CAR_X_USOCON.workspace }:${views.STATIC.children.CAR_X_USOCON.view},${ views.PRODES.children.CAR_X_PRODES.workspace }:${views.PRODES.children.CAR_X_PRODES.view}`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style`,
        "time": "P1Y/2019",
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage4'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.bbox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ carColumn }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `terrama2_35:LANDSAT_8_2018,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "time": "P1Y/2018",
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage5'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.bbox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ carColumn }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `terrama2_35:SENTINEL_2_2019,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "time": "P1Y/2019",
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage6'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ carColumn }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }`,
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });
    resultReportData['urlGsDeforestationHistory'] = `${ config.geoserver.baseUrl }/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:#{image}#,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }&styles=,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style&bbox=${ resultReportData.property.bbox }&width=${ config.geoserver.imgWidth }&height=${ config.geoserver.imgHeight }&time=P1Y/#{year}#&cql_filter=RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ carColumn }='${ resultReportData.property.gid }'&srs=EPSG:${ config.geoserver.defaultSRID }&format=image/png`;
    resultReportData['urlGsDeforestationHistory1'] = `${ config.geoserver.baseUrl }/wms?service=WMS&version=1.1.0&request=GetMap&layers=${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }&styles=${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style&bbox=${ resultReportData.property.bbox }&width=${ config.geoserver.imgWidth }&height=${ config.geoserver.imgHeight }&time=P1Y/#{year}#&cql_filter=${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ carColumn }='${ resultReportData.property.gid }'&srs=EPSG:${ config.geoserver.defaultSRID }&format=image/png`;
}
module.exports.reportFormatDeter = async (
    reportData,
    views,
    resultReportData,
    carColumn,
    carColumnSema,
    date,
    filter = null,
) => {
    const cql_filter_deter = `${ carColumn }='${ resultReportData.property.gid }' ${ getFilterClassSearch(
        '',
        filter,
        views.DETER.children.CAR_X_DETER,
        views.DETER.tableOwner,
    ) }`;
    const layers = [
        `${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        `${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
    ];
    const filters = `cql_filter=${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ cql_filter_deter }`;
    resultReportData.vectorViews = {layers, filters};

    resultReportData['urlGsImage'] = await geoserverService.getMapImage({
        "bbox": `${ reportData['stateBBox'] }`,
        "cql_filter": `geocodigo<>'';municipio='${ resultReportData.property.city }';numero_do1='${ resultReportData.property.stateRegister }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.MUNICIPIOS.workspace }:${ views.STATIC.children.MUNICIPIOS.view },${ views.STATIC.children.MUNICIPIOS.workspace }:${ views.STATIC.children.MUNICIPIOS.view },${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": "",
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage1'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage3'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.bbox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ cql_filter_deter }`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:MosaicSpot2008,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "time": `${ date[0] }/${ date[1] }`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage4'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.bbox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ cql_filter_deter }`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `terrama2_35:LANDSAT_8_2018,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "time": `${ date[0] }/${ date[1] }`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage5'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.bbox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ cql_filter_deter }`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `terrama2_35:SENTINEL_2_2019,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
        "srs": `EPSG:${ config.geoserver.defaultSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "time": `${ date[0] }/${ date[1] }`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage6'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ cql_filter_deter }`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
        "time": `${ date[0] }/${ date[1] }`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    if (
        resultReportData.property['deflorestationAlerts'] &&
        resultReportData.property['deflorestationAlerts'].length > 0
    ) {
        const deforestationAlerts = resultReportData.property['deflorestationAlerts'];
        for (const alert of deforestationAlerts) {
            alert.bbox = Layer.setBoundingBox(alert.bbox);
            const bboxDeter = alert.bbox.split(',');
            const yearBefore = alert.year - 1;

            const view = yearBefore < 2013 ? 'LANDSAT_5_' : yearBefore < 2017 ? 'LANDSAT_8_' : 'SENTINEL_2_';

            alert['urlGsImageBefore'] = await geoserverService.getMapImage({
                "bbox": `${ alert.bbox }`,
                "cql_filter": `RED_BAND>0;${ views.DETER.children.CAR_X_DETER.tableName }_id='${ alert.id }'`,
                "format": "image/png",
                "height": `${ config.geoserver.imgHeight }`,
                "layers": `terrama2_35:${ view }${ yearBefore },${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
                "srs": `EPSG:${ config.geoserver.defaultSRID }`,
                "styles": `,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
                "time": `P1Y/${ alert.year }`,
                "version": "1.1.0",
                "width": `${ config.geoserver.imgWidth }`
            });

            alert['urlGsImageCurrent'] = await geoserverService.getMapImageDETER({
                "srs": `EPSG:${ config.geoserver.defaultSRID }`,
                "format": "image/png",
                "height": "336",
                "layers": `${ alert.sat }_${ alert.sensor }_${ alert.path_row }_${ alert.date_code }`,
                "width": "336",
                "bbox": `${ bboxDeter[1].trim() },${ bboxDeter[0].trim() },${ bboxDeter[3].trim() },${ bboxDeter[2].trim() }`,
                "transparent": "true",
                "version": "1.3.0"
            }, false);

            alert['urlGsImagePlanetCurrentAndCar'] = await geoserverService.getMapImage({
                "bbox": `${ resultReportData.property.planetBBox }`,
                "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }';gid_car='${ resultReportData.property.gid }';${ views.DETER.children.CAR_X_DETER.tableName }_id='${ alert.id }'`,
                "format": "image/png",
                "height": `${ config.geoserver.imgHeight }`,
                "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.STATIC.children.CAR_X_USOCON.workspace }:${ views.STATIC.children.CAR_X_USOCON.view },${ views.DETER.children.CAR_X_DETER.workspace }:${ views.DETER.children.CAR_X_DETER.view }`,
                "srs": `EPSG:${ config.geoserver.planetSRID }`,
                "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ views.PRODES.children.CAR_X_PRODES.workspace }:${ views.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
                "time": `P1Y/${ alert.year }`,
                "version": "1.1.0",
                "width": `${ config.geoserver.imgWidth }`
            });
        }
    }
}
module.exports.reportFormatQueimada = async (
    reportData,
    views,
    resultReportData,
    carColumn,
    carColumnSema,
    date,
    filter = null
) => {
    const layers = [
        `${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        `${ views.BURNED.children.CAR_X_FOCOS.workspace }:${ views.BURNED.children.CAR_X_FOCOS.view }`,
    ];
    const filters = `cql_filter=${ carColumnSema }=${ resultReportData.property.gid };${ carColumn }=${ resultReportData.property.gid }`;
    resultReportData.vectorViews = {layers, filters};
    resultReportData['urlGsImage'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }='${ resultReportData.property.gid }'`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }`,
        "request": "GetMap",
        "service": "WMS",
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });

    resultReportData['urlGsImage1'] = await geoserverService.getMapImage({
        "bbox": `${ resultReportData.property.planetBBox }`,
        "cql_filter": `RED_BAND>0;${ carColumnSema }=${ resultReportData.property.gid };${ carColumn }=${ resultReportData.property.gid }`,
        "format": "image/png",
        "height": `${ config.geoserver.imgHeight }`,
        "layers": `${ views.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view },${ views.BURNED.children.CAR_X_FOCOS.workspace }:${ views.BURNED.children.CAR_X_FOCOS.view }`,
        "request": "GetMap",
        "service": "WMS",
        "srs": `EPSG:${ config.geoserver.planetSRID }`,
        "styles": `,${ views.STATIC.children.CAR_VALIDADO.workspace }:${ views.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ views.BURNED.children.CAR_X_FOCOS.workspace }:${ views.BURNED.children.CAR_X_FOCOS.view }_style`,
        "time": `${ date[0] }/${ date[1] }`,
        "version": "1.1.0",
        "width": `${ config.geoserver.imgWidth }`
    });
}
module.exports.get = async (id) => {
  if (id) {
    const report = await Report.findByPk(id);
    report.dataValues.base64 = fs.readFileSync(
      `${report.path}/${report.name}`,
      'base64',
    );
    return report;
  } else {
    const reports = await Report.findAll();
    return reports.map((report) => {
      report.dataValues.base64 = fs.readFileSync(
        `${report.path}/${report.name}`,
        'base64',
      );
      return report;
    });
  }
};
module.exports.generateNumber = async (type) => {
  const sql = ` SELECT '${type.trim()}' AS type,
               EXTRACT(YEAR FROM CURRENT_TIMESTAMP) AS year,
               LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0') AS newnumber,
               CONCAT(
                    LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0'),
                    '/',
                    EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
               ) AS code
        FROM alertas.reports AS rep
        WHERE rep.type = '${type.trim()}'
          AND rep.created_at BETWEEN
            CAST(concat(EXTRACT(YEAR FROM CURRENT_TIMESTAMP),\'-01-01 00:00:00\') AS timestamp) AND CURRENT_TIMESTAMP`;

  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      newnumber: 'newNumber',
    },
    plain: true,
  });
};
module.exports.getReportsByCARCod = async (carCode) => {
  const confWhere = { where: { carGid: carCode.trim() } };
  return await Report.findAll(confWhere);
};
module.exports.generatePdf = async (reportData) => {
  if (!reportData) {
    throw new BadRequestError('Report not found');
  }
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf',
    },
  };

  const pathDoc = `documentos/`;

  const code = await this.generateNumber(reportData.type.trim());
  const docName = `${
    code.newNumber
  }_${code.year.toString()}_${code.type.trim()}.pdf`;

  const printer = new PdfPrinter(fonts);
  const document = await getDocDefinitions(reportData);
  const pdfDoc = printer.createPdfKitDocument(document.docDefinitions);
  pdfDoc.pipe(await fs.createWriteStream(`${pathDoc}/${docName}`));
  pdfDoc.end();

  reportData['code'] = code;
  const report = await saveReport(
    docName,
    reportData['code'].newNumber,
    reportData,
    pathDoc,
  );
  report['document'] = document;
  return report;
};
module.exports.getReportCarData = async (carRegister, date, type, filter) => {
  if (!carRegister || !date || !filter || !type) {
    throw new BadRequestError('Error occurred while getting the report');
  }
  filter = JSON.parse(filter);

  const [dateFrom, dateTo] = date;

  const groupViews = await viewService.getSidebarLayers(true);

  const columnCarEstadualSemas = 'numero_do1';
  const columnCarFederalSemas = 'numero_do2';
  const columnAreaHaCar = 'area_ha_';
  const columnCalculatedAreaHa = 'calculated_area_ha';
  const columnExecutionDate = 'execution_date';

  const columnCarSemas = 'gid';
  const columnCar = `de_car_validado_sema_gid`;

  const tableName = groupViews.STATIC.children.CAR_VALIDADO.tableName;

  const propertyData = await carService.getCarData(
    tableName,
    groupViews.STATIC.children.MUNICIPIOS.tableName,
    columnCarEstadualSemas,
    columnCarFederalSemas,
    columnAreaHaCar,
    carRegister,
  );

  const dateSql = ` and ${columnExecutionDate}::date >= '${dateFrom}' AND ${columnExecutionDate}::date <= '${dateTo}'`;

  if (filter) {
    filter['date'] = date;
  } else {
    filter = { date: date };
  }
  await setDeterData(
    type,
    groupViews,
    propertyData,
    dateSql,
    columnCar,
    columnCalculatedAreaHa,
    columnExecutionDate,
    carRegister,
    filter,
  );
  await setProdesData(
    type,
    groupViews,
    propertyData,
    dateSql,
    columnCar,
    columnCalculatedAreaHa,
    columnExecutionDate,
    carRegister,
  );
  await setBurnedData(
    type,
    groupViews,
    propertyData,
    dateSql,
    columnCar,
    columnCarSemas,
    columnExecutionDate,
    carRegister,
    filter,
  );

  return await setReportFormat(
    propertyData,
    groupViews,
    type,
    columnCar,
    columnCarSemas,
    date,
    filter,
  );
};
getPointsAlerts = async (carRegister, date, type) => {
  const { planetSRID } = config.geoserver;
  const groupViews = await viewService.getSidebarLayers(true);

  const carColumn = 'gid';
  const carColumnSemas = 'de_car_validado_sema_gid';

  const groupType = {
    prodes: 'CAR_X_PRODES',
    deter: 'CAR_X_DETER',
    queimada: '',
  };

  const sql = `
        SELECT CAST(main_table.monitored_id AS integer),
               main_table.a_carprodes_1_id,
               ST_Y(ST_Centroid(main_table.intersection_geom)) AS "lat",
               ST_X(ST_Centroid(main_table.intersection_geom)) AS "long",
               extract(year from date_trunc('year', main_table.execution_date)) AS startYear,
               main_table.execution_date
        FROM public.${
          groupViews[type.toUpperCase()].children[groupType[type]].tableName
        } AS main_table
        WHERE main_table.${carColumnSemas} = '${carRegister}'
          AND main_table.execution_date BETWEEN '${date[0]}' AND '${date[1]}'
        ORDER BY main_table.calculated_area_ha DESC
        LIMIT 5
    `;

  const sqlBbox = `SELECT
        substring(ST_EXTENT(ST_Transform(geom, ${planetSRID}))::TEXT, 5, length(ST_EXTENT(ST_Transform(geom, ${planetSRID}))::TEXT) - 5) AS bbox
      FROM de_car_validado_sema
      WHERE ${carColumn} = ${carRegister}
      GROUP BY gid`;
  const bboxOptions = {
    type: QueryTypes.SELECT,
    plain: true,
  };

  const carBbox = await sequelize.query(sqlBbox, bboxOptions);
  const points = await sequelize.query(sql, { type: QueryTypes.SELECT });

  let bbox = Layer.setBoundingBox(carBbox.bbox);

  const currentYear = new Date().getFullYear();
  for (const point of points) {
    const gsConfig = {
      bbox: `${bbox}`,
      cql_filter: `RED_BAND>0;
        rid='${carRegister}';
        gid_car='${carRegister}';
        ${
          groupViews[type.toUpperCase()].children[groupType[type]].tableName
        }_id=${point.a_carprodes_1_id}`,
      format: 'image/png',
      height: config.geoserver.imgHeight,
      layers: `${gsLayers.image.PLANET_LATEST},${
        groupViews.STATIC.children.CAR_VALIDADO.workspace
      }:${groupViews.STATIC.children.CAR_VALIDADO.view},${
        groupViews.STATIC.children.CAR_X_USOCON.workspace
      }:${groupViews.STATIC.children.CAR_X_USOCON.view},${
        groupViews[type.toUpperCase()].children[groupType[type]].workspace
      }:${groupViews[type.toUpperCase()].children[groupType[type]].view}`,
      srs: `EPSG:${planetSRID}`,
      styles: `,${groupViews.STATIC.children.CAR_VALIDADO.workspace}:${
        groupViews.STATIC.children.CAR_VALIDADO.view
      }_yellow_style,${groupViews.STATIC.children.CAR_VALIDADO.workspace}:${
        groupViews.STATIC.children.CAR_X_USOCON.view
      }_hatched_style,${
        groupViews[type.toUpperCase()].children[groupType[type]].workspace
      }:${
        groupViews[type.toUpperCase()].children[groupType[type]].view
      }_red_style`,
      time: `${point.startyear}/${currentYear}`,
      version: '1.1.0',
      width: config.geoserver.imgWidth,
    };
    point['url'] = await geoserverService.getMapImage(gsConfig);

    point['options'] = await satVegService
      .get({ long: point.long, lat: point.lat }, 'ndvi', 3, 'wav', '', 'aqua')
      .then(({ data }) => {
        const { listaDatas, listaSerie } = data;
        return ProdesChart.getChartOptions(listaDatas, listaSerie);
      });
  }
  return points;
};
module.exports.getPointsAlerts = getPointsAlerts;

module.exports.createPdf = async (reportData) => {
  return await getDocDefinitions(reportData);
};
