
const Result = require("../utils/result");
  models = require('../models');
  Report = models.reports;
  env = process.env.NODE_ENV || 'development';
  confDb = require(__dirname + '/../config/config.json')[env];
  PdfPrinter = require('pdfmake');
  fs = require('fs');
  env = process.env.NODE_ENV || 'development';
  confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
  ViewUtil = require("../utils/view.utils");

const QUERY_TYPES_SELECT = { type: "SELECT" };

setReportFormat = async function(reportData, views, type) {
  const resultReportData = {};

  const prodesYear = reportData.prodesYear;

  resultReportData['prodesStartYear'] = prodesYear && prodesYear.length > 0 ? prodesYear[0]['date'] : '2007';

  const bboxArray = reportData.bbox.split(',');

  resultReportData['bbox'] = bboxArray[0].split(' ').join(',') + ',' + bboxArray[1].split(' ').join(',');

  reportData.bbox = resultReportData.bbox;

  resultReportData['property'] = reportData;

  const app = reportData.tableData;
  const legalReserve = reportData.prodesLegalReserve;
  const restrictedUse = reportData.prodesRestrictedUse;
  const conservationUnit = reportData.prodesConservationUnit;
  const indigenousLand = reportData.prodesIndigenousLand;
  const consolidatedUse = reportData.prodesConsolidatedUse;
  const exploration = reportData.prodesExploration;
  const deforestation = reportData.prodesDeforestation;
  const embargoedArea = reportData.prodesEmbargoedArea;
  const landArea = reportData.prodesLandArea;
  const burnAuthorization = reportData.prodesBurnAuthorization;
  const radamClasses = reportData.prodesRadam;

  let radamProdes = 0;
  let radamText = '';
  for (const radam of radamClasses) {
    const area = radam['area'];
    const cls = radam['class'];
    if (cls !== null) {
      radamText += `
              ${cls}: ${area}
          `;
      radamProdes += area;
    }
  }


  const totalRecentDeforestation = type === 'deter' ?
    (app['recentDeforestation'] ? app['recentDeforestation'] : 0) +
    (legalReserve['recentDeforestation'] ? legalReserve['recentDeforestation'] : 0) +
    (conservationUnit['recentDeforestation'] ? conservationUnit['recentDeforestation'] : 0) +
    (indigenousLand['recentDeforestation'] ? indigenousLand['recentDeforestation'] : 0) +
    (consolidatedUse['recentDeforestation'] ? consolidatedUse['recentDeforestation'] : 0) +
    (exploration['recentDeforestation'] ? exploration['recentDeforestation'] : 0) +
    (deforestation['recentDeforestation'] ? deforestation['recentDeforestation'] : 0) +
    (embargoedArea['recentDeforestation'] ? embargoedArea['recentDeforestation'] : 0) +
    (restrictedUse['recentDeforestation'] ? restrictedUse['recentDeforestation'] : 0) +
    (landArea['recentDeforestation'] ? landArea['recentDeforestation'] : 0) +
    (burnAuthorization['recentDeforestation'] ? burnAuthorization['recentDeforestation'] : 0) : 0;

  const totalPastDeforestation = type === 'prodes' ?
    app['pastDeforestation'] +
    legalReserve['pastDeforestation'] +
    conservationUnit['pastDeforestation'] +
    indigenousLand['pastDeforestation'] +
    consolidatedUse['pastDeforestation'] +
    exploration['pastDeforestation'] +
    deforestation['pastDeforestation'] +
    embargoedArea['pastDeforestation'] +
    restrictedUse['pastDeforestation'] +
    landArea['pastDeforestation'] +
    burnAuthorization['pastDeforestation'] +
    radamProdes : 0;

  const totalBurnlights =  type === 'queimada' ?
    app['burnlights'] +
    legalReserve['burnlights'] +
    conservationUnit['burnlights'] +
    indigenousLand['burnlights'] +
    consolidatedUse['burnlights'] +
    exploration['burnlights'] +
    deforestation['burnlights'] +
    embargoedArea['burnlights'] +
    restrictedUse['burnlights'] +
    landArea['burnlights'] +
    burnAuthorization['burnlights'] : 0;

  const totalBurnAreas =  type === 'queimada' ?
    app['burnAreas'] +
    legalReserve['burnAreas'] +
    conservationUnit['burnAreas'] +
    indigenousLand['burnAreas'] +
    consolidatedUse['burnAreas'] +
    exploration['burnAreas'] +
    deforestation['burnAreas'] +
    embargoedArea['burnAreas'] +
    restrictedUse['burnAreas'] +
    landArea['burnAreas'] +
    burnAuthorization['burnAreas'] : 0;

  const propertyDeforestation = [
    app,
    legalReserve,
    conservationUnit,
    indigenousLand,
    consolidatedUse,
    exploration,
    deforestation,
    embargoedArea,
    restrictedUse,
    landArea,
    burnAuthorization,
    {
      affectedArea: 'Vegetação RADAM BR',
      recentDeforestation: 0,
      pastDeforestation: radamText,
      burnlights: 0,
      burnAreas: 0
    },
    {
      affectedArea: 'Total',
      recentDeforestation: totalRecentDeforestation,
      pastDeforestation: totalPastDeforestation,
      burnlights: totalBurnlights,
      burnAreas: totalBurnAreas
    }
  ];

  resultReportData['tableData'] = propertyDeforestation;

  prodesYear.push({date: 'Total', area: resultReportData.property.prodesTotalArea});

  resultReportData['prodesTableData'] = prodesYear;

  const currentYear = new Date().getFullYear();

  resultReportData['urlGsImage']  = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.MUNICIPIOS.workspace}:${views.STATIC.children.MUNICIPIOS.view},${views.STATIC.children.MUNICIPIOS.workspace}:${views.STATIC.children.MUNICIPIOS.view},${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=&bbox=-61.6904258728027,-18.0950622558594,-50.1677627563477,-7.29556512832642&width=250&height=250&cql_filter=id_munic>0;municipio='${resultReportData.property.city}';numero_do1='${resultReportData.property.register}'&srs=EPSG:4326&format=image/png`;
  resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${resultReportData.prodesStartYear}/P1Y&cql_filter=numero_do1='${resultReportData.property.register}'&srs=EPSG:4326&format=image/png`;
  resultReportData['urlGsImage2'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_style,${views.DYNAMIC.children.PRODES.workspace}:${views.DYNAMIC.children.PRODES.view}_style&bbox=${resultReportData.property.bbox}&width=404&height=431&time=${resultReportData.prodesStartYear}/${currentYear}&cql_filter=numero_do1='${resultReportData.property.register}';de_car_validado_sema_numero_do1='${resultReportData.property.register}'&srs=EPSG:4674&format=image/png`;
  resultReportData['urlGsImage3'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:MosaicSpot2008_car_validado&styles=&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${resultReportData.prodesStartYear}/P1Y&cql_filter=numero_do1='${resultReportData.property.register}'&srs=EPSG:4326&format=image/png`;
  resultReportData['urlGsImage4'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${currentYear}/P1Y&cql_filter=numero_do1='${resultReportData.property.register}';de_car_validado_sema_numero_do1='${resultReportData.property.register}'&srs=EPSG:4674&format=image/png`;
  resultReportData['urlGsLegend'] = `${confGeoServer.baseHost}/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=forceLabels:on;layout:vertical&LAYER=${views.DYNAMIC.children.PRODES.workspace}:${views.DYNAMIC.children.PRODES.view}`;


  return resultReportData;
};

getViewsReport = async function() {
  return await ViewUtil.getGrouped()
};

getCarData = async function(carTableName, municipiosTableName, columnCarEstadualSemas, columnCarFederalSemas, columnAreaHaCar, carRegister){
  const sql = `
            SELECT
                    car.${columnCarEstadualSemas} AS register,
                    car.${columnCarFederalSemas} AS federalregister,
                    COALESCE(car.${columnAreaHaCar}, 0) AS area,
                    car.nome_da_p1 AS name,
                    car.municipio1 AS city,
                    car.cpfcnpj AS cpf,
                    car.nomepropri AS owner,
                    munic.comarca AS county,
                    substring(ST_EXTENT(munic.geom)::TEXT, 5, length(ST_EXTENT(munic.geom)::TEXT) - 5) as citybbox,
                    substring(ST_EXTENT(car.geom)::TEXT, 5, length(ST_EXTENT(car.geom)::TEXT) - 5) as bbox,
                    ST_Y(ST_Transform (ST_Centroid(car.geom), 4326)) AS "lat",
                    ST_X(ST_Transform (ST_Centroid(car.geom), 4326)) AS "long"
            FROM public.${carTableName} AS car
            INNER JOIN public.${municipiosTableName} munic ON
                    car.${columnCarEstadualSemas} = '${carRegister}'
                    AND munic.municipio = car.municipio1
            GROUP BY car.${columnCarEstadualSemas}, car.${columnCarFederalSemas}, car.${columnAreaHaCar}, car.nome_da_p1, car.municipio1, car.geom, munic.comarca, car.cpfcnpj, car.nomepropri`;
  const result = await Report.sequelize.query(sql, QUERY_TYPES_SELECT);

  return result[0];
};

setDeterData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnExecutionDate, carRegister) {
  if (propertyData && views.DETER && type === 'deter') {
    const sqlDeterYear = `SELECT
                              extract(year from date_trunc('year', cd.${columnExecutionDate})) AS date,
                              COALESCE(SUM(cd.${columnCalculatedAreaHa}), 0) as area
                              FROM public.${views.DETER.children.CAR_X_DETER.table_name} cd
                              WHERE cd.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date;`;
    const sqlAPPDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_APP.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReserveDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_RESERVA.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    // const sqlConservationUnitDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_UC.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlIndigenousLandDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_TI.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConsolidatedUseDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_USOCON.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlExploraDETERCount = `SELECT SUM(${columnCalculatedAreaHa}) AS count FROM public.${views.DETER.children.CAR_DETER_X_EXPLORA.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlDesmateDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_DESMATE.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlEmbargoedAreaDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_EMB.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLandAreaDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_DESEMB.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlRestrictUseDETERCount = `SELECT COUNT(1) AS count FROM public.${views.DETER.children.CAR_DETER_X_USO_RESTRITO.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlBurnAuthorizationDETERCount = `SELECT COUNT(1) AS count FROM public.${views.DETER.children.CAR_DETER_X_QUEIMA.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlFisionomiaDETERCount = `SELECT de_veg_radambr_fisionomia AS class, COUNT(1) AS count FROM public.${views.DETER.children.CAR_DETER_X_VEG_RADAM.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

    const resultRestrictUseDETERCount = await Report.sequelize.query(sqlRestrictUseDETERCount, QUERY_TYPES_SELECT);
    const restrictUseDETERCount = resultRestrictUseDETERCount;

    const resultBurnAuthorizationDETERCount = await Report.sequelize.query(sqlBurnAuthorizationDETERCount, QUERY_TYPES_SELECT);
    const burnAuthorizationDETERCount = resultBurnAuthorizationDETERCount;

    const resultFisionomiaDETERCount = await Report.sequelize.query(sqlFisionomiaDETERCount, QUERY_TYPES_SELECT);
    const fisionomiaDETERCount = resultFisionomiaDETERCount;

    const resultAPPDETERCount = await Report.sequelize.query(sqlAPPDETERCount, QUERY_TYPES_SELECT);
    const aPPDETERCount = resultAPPDETERCount;

    const resultLegalReserveDETERCount = await Report.sequelize.query(sqlLegalReserveDETERCount, QUERY_TYPES_SELECT);
    const legalReserveDETERCount = resultLegalReserveDETERCount;

    // const resultConservationUnitDETERCount = await Report.sequelize.query(sqlConservationUnitDETERCount, QUERY_TYPES_SELECT);
    // const conservationUnitDETERCount = resultConservationUnitDETERCount;

    const resultIndigenousLandDETERCount = await Report.sequelize.query(sqlIndigenousLandDETERCount, QUERY_TYPES_SELECT);
    const indigenousLandDETERCount = resultIndigenousLandDETERCount;

    const resultConsolidatedUseDETERCount = await Report.sequelize.query(sqlConsolidatedUseDETERCount, QUERY_TYPES_SELECT);
    const consolidatedUseDETERCount = resultConsolidatedUseDETERCount;

    const resultExploraDETERCount = await Report.sequelize.query(sqlExploraDETERCount, QUERY_TYPES_SELECT);
    const explorationDETERCount = resultExploraDETERCount;

    const resultDesmateDETERCount = await Report.sequelize.query(sqlDesmateDETERCount, QUERY_TYPES_SELECT);
    const deforestationDETERCount = resultDesmateDETERCount;

    const resultEmbargoedAreaDETERCount = await Report.sequelize.query(sqlEmbargoedAreaDETERCount, QUERY_TYPES_SELECT);
    const embargoedAreaDETERCount = resultEmbargoedAreaDETERCount;

    const resultLandAreaDETERCount = await Report.sequelize.query(sqlLandAreaDETERCount, QUERY_TYPES_SELECT);
    const landAreaDETERCount = resultLandAreaDETERCount;

    const resultDeterYear = await Report.sequelize.query(sqlDeterYear, QUERY_TYPES_SELECT);
    const deterYear = resultDeterYear;
  }
};

setProdesData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnExecutionDate, carRegister) {
  if (propertyData && views.PRODES && type === 'prodes') {
    const sqlProdesYear = `SELECT
                              extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
                              COALESCE(SUM(cp.${columnCalculatedAreaHa}), 0) as area
                              FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} AS cp
                              WHERE cp.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date`;
    const sqlProdesArea = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlProdesTotalArea = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}'`;

    const sqlIndigenousLand = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConservationUnit = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReserve = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlAPP = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConsolidatedUse = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOCON.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlAnthropizedUse = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOANT.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlNativeVegetation = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_VEGNAT.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlAPPPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReservePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConservationUnitPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlIndigenousLandPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConsolidatedUsePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOCON.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlExploraPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EXPLORA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlDesmatePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESMATE.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlEmbargoedAreaPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EMB.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLandAreaPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESEMB.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlRestrictUsePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USO_RESTRITO.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlBurnAuthorizationPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_QUEIMA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlFisionomiaPRODESSum = `SELECT de_veg_radambr_fisionomia AS class, sum(${columnCalculatedAreaHa}) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_VEG_RADAM.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

    const resultRestrictUsePRODESSum = await Report.sequelize.query(sqlRestrictUsePRODESSum, QUERY_TYPES_SELECT);
    const restrictUsePRODESSum = resultRestrictUsePRODESSum;

    const resultBurnAuthorizationPRODESSum = await Report.sequelize.query(sqlBurnAuthorizationPRODESSum, QUERY_TYPES_SELECT);
    const burnAuthorizationPRODESSum = resultBurnAuthorizationPRODESSum;

    const resultFisionomiaPRODESSum = await Report.sequelize.query(sqlFisionomiaPRODESSum, QUERY_TYPES_SELECT);
    const fisionomiaPRODESSum = resultFisionomiaPRODESSum;

    const resultAPPPRODESSum = await Report.sequelize.query(sqlAPPPRODESSum, QUERY_TYPES_SELECT);
    const aPPPRODESSum = resultAPPPRODESSum;

    const resultLegalReservePRODESSum = await Report.sequelize.query(sqlLegalReservePRODESSum, QUERY_TYPES_SELECT);
    const legalReservePRODESSum = resultLegalReservePRODESSum;

    const resultConservationUnitPRODESSum = await Report.sequelize.query(sqlConservationUnitPRODESSum, QUERY_TYPES_SELECT);
    const conservationUnitPRODESSum = resultConservationUnitPRODESSum;

    const resultIndigenousLandPRODESSum = await Report.sequelize.query(sqlIndigenousLandPRODESSum, QUERY_TYPES_SELECT);
    const indigenousLandPRODESSum = resultIndigenousLandPRODESSum;

    const resultConsolidatedUsePRODESSum = await Report.sequelize.query(sqlConsolidatedUsePRODESSum, QUERY_TYPES_SELECT);
    const consolidatedUsePRODESSum = resultConsolidatedUsePRODESSum;

    const resultExploraPRODESSum = await Report.sequelize.query(sqlExploraPRODESSum, QUERY_TYPES_SELECT);
    const explorationPRODESSum = resultExploraPRODESSum;

    const resultDesmatePRODESSum = await Report.sequelize.query(sqlDesmatePRODESSum, QUERY_TYPES_SELECT);
    const deforestationPRODESSum = resultDesmatePRODESSum;

    const resultEmbargoedAreaPRODESSum = await Report.sequelize.query(sqlEmbargoedAreaPRODESSum, QUERY_TYPES_SELECT);
    const embargoedAreaPRODESSum = resultEmbargoedAreaPRODESSum;

    const resultLandAreaPRODESSum = await Report.sequelize.query(sqlLandAreaPRODESSum, QUERY_TYPES_SELECT);
    const landAreaPRODESSum = resultLandAreaPRODESSum;

    const resultProdesArea = await Report.sequelize.query(sqlProdesArea, QUERY_TYPES_SELECT);
    const prodesArea = resultProdesArea;

    const resultProdesTotalArea = await Report.sequelize.query(sqlProdesTotalArea, QUERY_TYPES_SELECT);
    const prodesTotalArea = resultProdesTotalArea;

    const resultIndigenousLand = await Report.sequelize.query(sqlIndigenousLand, QUERY_TYPES_SELECT);
    const indigenousLand = resultIndigenousLand;

    const resultConservationUnit = await Report.sequelize.query(sqlConservationUnit, QUERY_TYPES_SELECT);
    const conservationUnit = resultConservationUnit;

    const resultLegalReserve = await Report.sequelize.query(sqlLegalReserve, QUERY_TYPES_SELECT);
    const legalReserve = resultLegalReserve;

    const resultAPP = await Report.sequelize.query(sqlAPP, QUERY_TYPES_SELECT);
    const app = resultAPP;

    const resultConsolidatedUse = await Report.sequelize.query(sqlConsolidatedUse, QUERY_TYPES_SELECT);
    const consolidatedArea = resultConsolidatedUse;

    const resultAnthropizedUse = await Report.sequelize.query(sqlAnthropizedUse, QUERY_TYPES_SELECT);
    const anthropizedUse = resultAnthropizedUse;

    const resultNativeVegetation = await Report.sequelize.query(sqlNativeVegetation, QUERY_TYPES_SELECT);
    const nativeVegetation = resultNativeVegetation;

    const resultProdesYear = await Report.sequelize.query(sqlProdesYear, QUERY_TYPES_SELECT);
    const prodesYear = resultProdesYear;


    propertyData['prodesArea'] = prodesArea[0]['area'];
    propertyData['prodesTotalArea'] = prodesTotalArea[0]['area'];
    propertyData['prodesYear'] = prodesYear;

    let prodesSumArea = 0;

    prodesSumArea += conservationUnitPRODESSum[0]['area'] ? conservationUnitPRODESSum[0]['area'] : 0;
    prodesSumArea += aPPPRODESSum[0]['area'] ? aPPPRODESSum[0]['area'] : 0;
    prodesSumArea += legalReservePRODESSum[0]['area'] ? legalReservePRODESSum[0]['area'] : 0;
    prodesSumArea += indigenousLandPRODESSum[0]['area'] ? indigenousLandPRODESSum[0]['area'] : 0;
    prodesSumArea += consolidatedUsePRODESSum[0]['area'] ? consolidatedUsePRODESSum[0]['area'] : 0;
    prodesSumArea += deforestationPRODESSum[0]['area'] ? deforestationPRODESSum[0]['area'] : 0;
    prodesSumArea += embargoedAreaPRODESSum[0]['area'] ? embargoedAreaPRODESSum[0]['area'] : 0;
    prodesSumArea += landAreaPRODESSum[0]['area'] ? landAreaPRODESSum[0]['area'] : 0;

    if (!propertyData['tableData']){ propertyData['tableData'] = {}; }
    propertyData['tableData']['affectedArea'] = 'APP';
    propertyData['tableData']['pastDeforestation'] = aPPPRODESSum[0]['area'];

    if (!propertyData['prodesLegalReserve']){ propertyData['prodesLegalReserve'] = {}; }
    propertyData['prodesLegalReserve']['affectedArea'] = 'ARL';
    propertyData['prodesLegalReserve']['pastDeforestation'] = legalReservePRODESSum[0]['area'];

    if (!propertyData['prodesRestrictedUse']){ propertyData['prodesRestrictedUse'] = {}; }
    propertyData['prodesRestrictedUse']['affectedArea'] = 'AUR';
    propertyData['prodesRestrictedUse']['pastDeforestation'] = restrictUsePRODESSum[0]['area'];

    if (!propertyData['prodesConservationUnit']){ propertyData['prodesConservationUnit'] = {}; }
    propertyData['prodesConservationUnit']['affectedArea'] = 'UC';
    propertyData['prodesConservationUnit']['pastDeforestation'] = conservationUnitPRODESSum[0]['area'];

    if (!propertyData['prodesIndigenousLand']){ propertyData['prodesIndigenousLand'] = {}; }
    propertyData['prodesIndigenousLand']['affectedArea'] = 'TI';
    propertyData['prodesIndigenousLand']['pastDeforestation'] = indigenousLandPRODESSum[0]['area'];

    if (!propertyData['prodesConsolidatedUse']){ propertyData['prodesConsolidatedUse'] = {}; }
    propertyData['prodesConsolidatedUse']['affectedArea'] = 'AUC';
    propertyData['prodesConsolidatedUse']['pastDeforestation'] = consolidatedUsePRODESSum[0]['area'];

    if (!propertyData['prodesExploration']){ propertyData['prodesExploration'] = {}; }
    propertyData['prodesExploration']['affectedArea'] = 'AUTEX';
    propertyData['prodesExploration']['pastDeforestation'] = explorationPRODESSum[0]['area'];

    if (!propertyData['prodesDeforestation']){ propertyData['prodesDeforestation'] = {}; }
    propertyData['prodesDeforestation']['affectedArea'] = 'AD';
    propertyData['prodesDeforestation']['pastDeforestation'] = deforestationPRODESSum[0]['area'];

    if (!propertyData['prodesEmbargoedArea']){ propertyData['prodesEmbargoedArea'] = {}; }
    propertyData['prodesEmbargoedArea']['affectedArea'] = 'Área embargada';
    propertyData['prodesEmbargoedArea']['pastDeforestation'] = embargoedAreaPRODESSum[0]['area'];

    if (!propertyData['prodesLandArea']){ propertyData['prodesLandArea'] = {}; }
    propertyData['prodesLandArea']['affectedArea'] = 'Área desembargada';
    propertyData['prodesLandArea']['pastDeforestation'] = landAreaPRODESSum[0]['area'];

    if (!propertyData['prodesBurnAuthorization']){ propertyData['prodesBurnAuthorization'] = {}; }
    propertyData['prodesBurnAuthorization']['affectedArea'] = 'AQ';
    propertyData['prodesBurnAuthorization']['pastDeforestation'] = burnAuthorizationPRODESSum[0]['area'];

    if (!propertyData['prodesRadam']){ propertyData['prodesRadam'] = {}; }
    propertyData['prodesRadam'] = fisionomiaPRODESSum;

    if (!propertyData['foundProdes']){ propertyData['foundProdes'] = {}; }
    propertyData['foundProdes'] = prodesSumArea ? true : false
  }

  return await propertyData;

};

setBurnedData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCarEstadualSemas, columnExecutionDate, carRegister) {
  if (propertyData && views.BURNED && type === 'queimada') {
    const sqlBurningSpotlights = `
            SELECT
                    count(1) as focuscount,
                    extract('YEAR' FROM focus.${columnExecutionDate}) AS year
            FROM public.${views.BURNED.children.CAR_X_FOCOS.table_name} AS focus
            INNER JOIN public.${tableName} AS car on
                    focus.${columnCarEstadual} = car.${columnCarEstadualSemas} AND
                    extract('YEAR' FROM focus.${columnExecutionDate}) > 2007 AND
                    car.${columnCarEstadualSemas} = '${carRegister}'
            group by year `;

    const resultBurningSpotlights = await Report.sequelize.query(sqlBurningSpotlights, QUERY_TYPES_SELECT);
    const burningSpotlights = resultBurningSpotlights;

    const sqlSpotlightsYear = `SELECT
                              extract(year from date_trunc('year', cf.${columnExecutionDate})) AS date,
                              COUNT(cf.*) as spotlights
                              FROM public.${views.BURNED.children.CAR_X_FOCOS.table_name} cf
                              WHERE cf.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date;`;
    const sqlAPPFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_APP.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReserveFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_RESERVA.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConservationUnitFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_UC.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlIndigenousLandFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_TI.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConsolidatedUseFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_USOCON.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlExploraFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_EXPLORA.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlDesmateFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_DESMATE.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlEmbFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_EMB.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLandAreaFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_DESEMB.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlRestrictUseFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_USO_RESTRITO.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlBurnAuthorizationFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_QUEIMA.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlFisionomiaFOCOSCount = `SELECT de_veg_radambr_fisionomia AS class, COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_VEG_RADAM.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

    const resultRestrictUseFOCOSCount = await Report.sequelize.query(sqlRestrictUseFOCOSCount, QUERY_TYPES_SELECT);
    const restrictUseFOCOSCount = resultRestrictUseFOCOSCount;

    const resultBurnAuthorizationFOCOSCount = await Report.sequelize.query(sqlBurnAuthorizationFOCOSCount, QUERY_TYPES_SELECT);
    const burnAuthorizationFOCOSCount = resultBurnAuthorizationFOCOSCount;

    const resultFisionomiaFOCOSCount = await Report.sequelize.query(sqlFisionomiaFOCOSCount, QUERY_TYPES_SELECT);
    const fisionomiaFOCOSCount = resultFisionomiaFOCOSCount;

    const resultAPPFOCOSCount = await Report.sequelize.query(sqlAPPFOCOSCount, QUERY_TYPES_SELECT);
    const aPPFOCOSCount = resultAPPFOCOSCount;

    const resultLegalReserveFOCOSCount = await Report.sequelize.query(sqlLegalReserveFOCOSCount, QUERY_TYPES_SELECT);
    const legalReserveFOCOSCount = resultLegalReserveFOCOSCount;

    const resultConservationUnitFOCOSCount = await Report.sequelize.query(sqlConservationUnitFOCOSCount, QUERY_TYPES_SELECT);
    const conservationUnitFOCOSCount = resultConservationUnitFOCOSCount;

    const resultIndigenousLandFOCOSCount = await Report.sequelize.query(sqlIndigenousLandFOCOSCount, QUERY_TYPES_SELECT);
    const indigenousLandFOCOSCount = resultIndigenousLandFOCOSCount;

    const resultConsolidatedUseFOCOSCount = await Report.sequelize.query(sqlConsolidatedUseFOCOSCount, QUERY_TYPES_SELECT);
    const consolidatedUseFOCOSCount = resultConsolidatedUseFOCOSCount;

    const resultExploraFOCOSCount = await Report.sequelize.query(sqlExploraFOCOSCount, QUERY_TYPES_SELECT);
    const explorationFOCOSCount = resultExploraFOCOSCount;

    const resultDesmateFOCOSCount = await Report.sequelize.query(sqlDesmateFOCOSCount, QUERY_TYPES_SELECT);
    const deforestationFOCOSCount = resultDesmateFOCOSCount;

    const resultEmbFOCOSCount = await Report.sequelize.query(sqlEmbFOCOSCount, QUERY_TYPES_SELECT);
    const embargoedAreaFOCOSCount = resultEmbFOCOSCount;

    const resultLandAreaFOCOSCount = await Report.sequelize.query(sqlLandAreaFOCOSCount, QUERY_TYPES_SELECT);
    const landAreaFOCOSCount = resultLandAreaFOCOSCount;


    const resultSpotlightsYear = await Report.sequelize.query(sqlSpotlightsYear, QUERY_TYPES_SELECT);
    const spotlightsYear = resultSpotlightsYear;
  }
};

setBurnedAreaData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnCarEstadualSemas, columnExecutionDate, carRegister) {
  if (propertyData && views.BURNED_AREA && type === 'queimada') {
    const sqlBurnedAreas = `
                    SELECT
                    COALESCE(SUM(areaq.${columnCalculatedAreaHa}), 0) as burnedAreas,
                    extract('YEAR' FROM areaq.${columnExecutionDate}) as date
                    FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.table_name} as areaq
                    INNER JOIN public.${tableName} AS car on
                    areaq.${columnCarEstadual} = car.${columnCarEstadualSemas} AND
                    car.${columnCarEstadualSemas} = '${carRegister}'
                    group by date
                  `;

    const resultBurnedAreas = await Report.sequelize.query(sqlBurnedAreas, QUERY_TYPES_SELECT);
    const burnedAreas = resultBurnedAreas;

    const sqlBurnedAreasYear = `SELECT
                              extract(year from date_trunc('year', areaq.${columnExecutionDate})) AS date,
                              COALESCE(SUM(areaq.${columnCalculatedAreaHa}), 0) as burnedAreas
                              FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.table_name} AS areaq
                              WHERE areaq.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date`;

    const resultBurnedAreasYear = await Report.sequelize.query(sqlBurnedAreasYear, QUERY_TYPES_SELECT);
    const burnedAreasYear = resultBurnedAreasYear;
    const sqlAPPBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_APP.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReserveBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_RESERVA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlConservationUnitBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_UC.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlIndigenousLandBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_TI.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlConsolidatedUseBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_USOCON.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlExploraBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EXPLORA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlDesmateBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESMATE.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlEmbargoedAreaBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EMB.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLandAreaBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESEMB.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlRestrictUseBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_USO_RESTRITO.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlBurnAuthorizationBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_QUEIMA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlFisionomiaBURNEDAREASum = `SELECT de_veg_radambr_fisionomia AS class, sum(${columnCalculatedAreaHa}) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_VEG_RADAM.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

    const resultRestrictUseBURNEDAREASum = await Report.sequelize.query(sqlRestrictUseBURNEDAREASum, QUERY_TYPES_SELECT);
    const restrictUseBURNEDAREASum = resultRestrictUseBURNEDAREASum;

    const resultBurnAuthorizationBURNEDAREASum = await Report.sequelize.query(sqlBurnAuthorizationBURNEDAREASum, QUERY_TYPES_SELECT);
    const burnAuthorizationBURNEDAREASum = resultBurnAuthorizationBURNEDAREASum;

    const resultFisionomiaBURNEDAREASum = await Report.sequelize.query(sqlFisionomiaBURNEDAREASum, QUERY_TYPES_SELECT);
    const fisionomiaBURNEDAREASum = resultFisionomiaBURNEDAREASum;

    const resultAPPBURNEDAREASum = await Report.sequelize.query(sqlAPPBURNEDAREASum, QUERY_TYPES_SELECT);
    const aPPBURNEDAREASum = resultAPPBURNEDAREASum;

    const resultLegalReserveBURNEDAREASum = await Report.sequelize.query(sqlLegalReserveBURNEDAREASum, QUERY_TYPES_SELECT);
    const legalReserveBURNEDAREASum = resultLegalReserveBURNEDAREASum;

    const resultConservationUnitBURNEDAREASum = await Report.sequelize.query(sqlConservationUnitBURNEDAREASum, QUERY_TYPES_SELECT);
    const conservationUnitBURNEDAREASum = resultConservationUnitBURNEDAREASum;

    const resultIndigenousLandBURNEDAREASum = await Report.sequelize.query(sqlIndigenousLandBURNEDAREASum, QUERY_TYPES_SELECT);
    const indigenousLandBURNEDAREASum = resultIndigenousLandBURNEDAREASum;

    const resultConsolidatedUseBURNEDAREASum = await Report.sequelize.query(sqlConsolidatedUseBURNEDAREASum, QUERY_TYPES_SELECT);
    const consolidatedUseBURNEDAREASum = resultConsolidatedUseBURNEDAREASum;

    const resultExploraBURNEDAREASum = await Report.sequelize.query(sqlExploraBURNEDAREASum, QUERY_TYPES_SELECT);
    const explorationBURNEDAREASum = resultExploraBURNEDAREASum;

    const resultDesmateBURNEDAREASum = await Report.sequelize.query(sqlDesmateBURNEDAREASum, QUERY_TYPES_SELECT);
    const deforestationBURNEDAREASum = resultDesmateBURNEDAREASum;

    const resultEmbargoedAreaBURNEDAREASum = await Report.sequelize.query(sqlEmbargoedAreaBURNEDAREASum, QUERY_TYPES_SELECT);
    const embargoedAreaBURNEDAREASum = resultEmbargoedAreaBURNEDAREASum;

    const resultLandAreaBURNEDAREASum = await Report.sequelize.query(sqlLandAreaBURNEDAREASum, QUERY_TYPES_SELECT);
    const landAreaBURNEDAREASum = resultLandAreaBURNEDAREASum;
  }
};


module.exports = FileReport = {
  async saveBase64(document, code, type, path, docName){
    const binaryData = new Buffer(document, 'base64').toString('binary')

    await fs.writeFile(path, binaryData, "binary", err => {
      if (err) {
        throw err;
      }
      console.log(`Arquivo salvo em .. ${path}`);
    })
  },
  async get(id) {
    const result = id ? await Report.findByPk(id) : await Report.findAll()

    try{
      if (result.length && (result.length > 0)) {
        result.forEach(report => {
          report.dataValues.base64 = fs.readFileSync(`${report.path}/${report.name}`, 'base64')
        })
      } else {
        result.dataValues.base64 = fs.readFileSync(`${result.path}/${result.name}`, 'base64')
      }

      return Result.ok(result)
    } catch (e) {
      return Result.err(e);
    }
  },
  async newNumber(type) {
    const sql =
      ` SELECT '${type.trim()}' AS type,
               EXTRACT(YEAR FROM CURRENT_TIMESTAMP) AS year,
               LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0') AS newNumber,
               CONCAT(
                    LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0'),
                    '/',
                    EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
               ) AS code
        FROM alertas.reports AS rep
        WHERE rep.type = '${type.trim()}'
          AND rep.created_at BETWEEN
            CAST(concat(EXTRACT(YEAR FROM CURRENT_TIMESTAMP),\'-01-01 00:00:00\') AS timestamp) AND CURRENT_TIMESTAMP`;

    try {
      const result = await Report.sequelize.query(sql, QUERY_TYPES_SELECT);

      return Result.ok(result)
    } catch (e) {
      return Result.err(e);
    }
  },
  async getReportsByCARCod(carCode) {
    try {
      const confWhere = {where: { carCode: carCode.trim() }};

      return Result.ok(await Report.findAll(confWhere));
    } catch (e) {
      return Result.err(e);
    }
  },
  async generatePdf(docDefinition, type, carCode) {
    try {
      const fonts = {
        Roboto: {
          normal: 'fonts/Roboto-Regular.ttf',
          bold: 'fonts/Roboto-Medium.ttf',
          italics: 'fonts/Roboto-Italic.ttf',
          bolditalics: 'fonts/Roboto-MediumItalic.ttf'
        }
      };

      const pathDoc = `documentos/`;

      const code = await this.newNumber(type.trim());
      const docName = `${code.data[0].newnumber}_${code.data[0].year.toString()}_${code.data[0].type.trim()}.pdf`

      const printer = new PdfPrinter(fonts);
      docDefinition.content[4].text =
        type === 'deter' ? `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº ${code.data[0].code}` :
          type === 'prodes' ? `RELATÓRIO TÉCNICO SOBRE DE DESMATAMENTO Nº ${code.data[0].code}` :
            type === 'queimada' ? `RELATÓRIO SOBRE CICATRIZ DE QUEIMADA Nº ${code.data[0].code}` :
              `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº XXXXX/${code.data[0].year}`;

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(await fs.createWriteStream(`${pathDoc}/${docName}`));
      pdfDoc.end();

      const report = await this.saveReport(docName, code.data[0].newnumber, carCode, pathDoc, type);
      return Result.ok(report)
    } catch (e) {
      return Result.err(e)
    }
  },
  async saveReport(docName, newnumber, carCode, path, type) {
    try {
      const report = new Report({
        name: docName.trim(),
        code: parseInt(newnumber),
        carCode: carCode.trim(),
        path: path.trim(),
        type: type.trim() })

      return await Report.create(report.dataValues).then(report => report.dataValues)
    } catch (e) {
      throw e
    }
  },
  async delete(id) {
    try {
      const report = await Report.findByPk(id)
      await fs.unlink(`${report.dataValues.path}/${report.dataValues.name}`, err => {
        if (err) {
          throw err;
        }
        console.log(`Arquivo ${report.dataValues.path}/${report.dataValues.name} excluído com sucesso!`);
      })
      const countRowDeleted = await Report.destroy({ where: {id} }).then(rowDeleted => rowDeleted).catch(err => err)
      const result = countRowDeleted ?
        `Arquivo ${report.dataValues.name}, id = ${id}, excluído com Sucesso!` :
        `Arquivo ${report.dataValues.name}, id = ${id}, não encontrado!`
      return Result.ok(result)
    } catch (err) {
      return Result.err(err)
    }
  },
  async save(document) {
    try {
      const binaryData = new Buffer(document.base64, 'base64').toString('binary')
      const code = await this.newNumber(document.type.trim());
      const docName = `${code.data[0].newnumber}_${code.data[0].year}_${code.data[0].type}.pdf`

      await fs.writeFile(`${document.path}/${docName}`, binaryData, "binary", err => {
        if (err) {
          throw err;
        }
        console.log(`Arquivo salvo em ..${document.path.trim()}/${docName.trim()}`);
      })

      const report = new Report({
        name: docName.trim(),
        code: parseInt(code.data[0].newnumber),
        carCode: document['carCode'].trim(),
        path: document['path'].trim(),
        type: document['type'].trim() })

      const result = await Report.create(report.dataValues).then(report => report.dataValues)

      return Result.ok(result)
    } catch (e) {
      return Result.err(e)
    }
  },
  async getReportCarData(query) {
    const { carRegister, date, type } = query;


    let dateFrom = null;
    let dateTo = null;

    if (date) {
      dateFrom = date[0];
      dateTo = date[1];
    }


    try {
      const views = await getViewsReport();

      const columnCarEstadualSemas = 'numero_do1';
      const columnCarFederalSemas = 'numero_do2';
      const columnAreaHaCar = 'area_ha_';
      const columnCarEstadual = 'de_car_validado_sema_numero_do1';
      const columnCalculatedAreaHa = 'calculated_area_ha';
      const columnExecutionDate = 'execution_date';

      const tableName = views.STATIC.children.CAR_VALIDADO.table_name;

      let propertyData = await getCarData(
        tableName,
        views.STATIC.children.MUNICIPIOS.table_name,
        columnCarEstadualSemas,
        columnCarFederalSemas,
        columnAreaHaCar,
        carRegister);

      const dateSql = ` and ${columnExecutionDate}::date >= '${dateFrom}' AND ${columnExecutionDate}::date <= '${dateTo}'`;

      await setDeterData(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnExecutionDate, carRegister);
      await setBurnedData(type, views, propertyData, dateSql, columnCarEstadual, columnCarEstadualSemas, columnExecutionDate, carRegister);
      await setBurnedAreaData(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnCarEstadualSemas, columnExecutionDate, carRegister);
      await setProdesData(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnExecutionDate, carRegister);

      return Result.ok(await setReportFormat(propertyData, views, type));
    } catch (e) {
      return Result.err(e)
    }
  },
  async getSynthesisCarData(query) {
    const { carRegister, date } = query;

    let dateFrom = null;
    let dateTo = null;

    if (date) {
      dateFrom = date[0];
      dateTo = date[1];
    }

    try {
      const views = await getViewsReport();

      const columnCarEstadualSemas = 'numero_do1';
      const columnCarFederalSemas = 'numero_do2';
      const columnAreaHaCar = 'area_ha_';
      const columnCarEstadual = 'de_car_validado_sema_numero_do1';
      const columnCalculatedAreaHa = 'calculated_area_ha';
      const columnExecutionDate = 'execution_date';

      const tableName = views.STATIC.children.CAR_VALIDADO.table_name;

      const propertyData = await getCarData(
        tableName,
        views.STATIC.children.MUNICIPIOS.table_name,
        columnCarEstadualSemas,
        columnCarFederalSemas,
        columnAreaHaCar,
        carRegister);

      const sqlBurningSpotlights = `
                    SELECT
                    count(1) as focuscount,
                    extract('YEAR' FROM focus.${columnExecutionDate}) as year
                    FROM public.a_carfocos_74 as focus
                    INNER JOIN public.${tableName} AS car on
                    focus.${columnCarEstadual} = car.${columnCarEstadualSemas} AND
                    extract('YEAR' FROM focus.${columnExecutionDate}) > 2007 AND
                    car.${columnCarEstadualSemas} = '${carRegister}'
                    group by year
                  `;

      const resultBurningSpotlights = await Report.sequelize.query(sqlBurningSpotlights, QUERY_TYPES_SELECT);
      const burningSpotlights = resultBurningSpotlights;

      const sqlBurnedAreas = `
                    SELECT
                    COALESCE(SUM(areaq.${columnCalculatedAreaHa}), 0) as burnedAreas,
                    extract('YEAR' FROM areaq.${columnExecutionDate}) as date
                    FROM public.a_caraq_86 as areaq
                    INNER JOIN public.${tableName} AS car on
                    areaq.${columnCarEstadual} = car.${columnCarEstadualSemas} AND
                    car.${columnCarEstadualSemas} = '${carRegister}'
                    group by date
                  `;

      const resultBurnedAreas = await Report.sequelize.query(sqlBurnedAreas, QUERY_TYPES_SELECT);
      const burnedAreas = resultBurnedAreas;

      const sqlBurnedAreasYear = `SELECT
                              extract(year from date_trunc('year', areaq.${columnExecutionDate})) AS date,
                              COALESCE(SUM(areaq.${columnCalculatedAreaHa}), 0) as burnedAreas
                              FROM public.a_caraq_86 areaq
                              WHERE areaq.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date;`;
      const resultBurnedAreasYear = await Report.sequelize.query(sqlBurnedAreasYear, QUERY_TYPES_SELECT);
      const burnedAreasYear = resultBurnedAreasYear;

      const sqlProdesYear = `SELECT
                              extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
                              COALESCE(SUM(cp.${columnCalculatedAreaHa}), 0) as area
                              FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} cp
                              WHERE cp.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date;`;

      const sqlDeterYear = `SELECT
                              extract(year from date_trunc('year', cd.${columnExecutionDate})) AS date,
                              COALESCE(SUM(cd.${columnCalculatedAreaHa}), 0) as area
                              FROM public.a_cardeter_49 cd
                              WHERE cd.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date;`;

      const sqlSpotlightsYear = `SELECT
                              extract(year from date_trunc('year', cf.${columnExecutionDate})) AS date,
                              COUNT(cf.*) as spotlights
                              FROM public.a_carfocos_74 cf
                              WHERE cf.${columnCarEstadual} = '${carRegister}'
                              GROUP BY date
                              ORDER BY date;`;

      const dateSql = ` and ${columnExecutionDate}::date >= '${dateFrom}' AND ${columnExecutionDate}::date <= '${dateTo}'`;

      const sqlProdesArea = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlProdesTotalArea = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}'`;

      const sqlIndigenousLand = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConservationUnit = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLegalReserve = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlAPP = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConsolidatedUse = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOCON.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlAnthropizedUse = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOANT.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlNativeVegetation = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_VEGNAT.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlAPPDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_APP.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLegalReserveDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_RESERVA.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      // const sqlConservationUnitDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_UC.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlIndigenousLandDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_TI.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConsolidatedUseDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_USOCON.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlExploraDETERCount = `SELECT SUM(${columnCalculatedAreaHa}) AS count FROM public.${views.DETER.children.CAR_DETER_X_EXPLORA.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlDesmateDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_DESMATE.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlEmbargoedAreaDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_EMB.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLandAreaDETERCount = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS count FROM public.${views.DETER.children.CAR_DETER_X_DESEMB.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlRestrictUseDETERCount = `SELECT COUNT(1) AS count FROM public.${views.DETER.children.CAR_DETER_X_USO_RESTRITO.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlBurnAuthorizationDETERCount = `SELECT COUNT(1) AS count FROM public.${views.DETER.children.CAR_DETER_X_QUEIMA.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlFisionomiaDETERCount = `SELECT de_veg_radambr_fisionomia AS class, COUNT(1) AS count FROM public.${views.DETER.children.CAR_DETER_X_VEG_RADAM.table_name} where ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

      const resultRestrictUseDETERCount = await Report.sequelize.query(sqlRestrictUseDETERCount, QUERY_TYPES_SELECT);
      const restrictUseDETERCount = resultRestrictUseDETERCount;

      const resultBurnAuthorizationDETERCount = await Report.sequelize.query(sqlBurnAuthorizationDETERCount, QUERY_TYPES_SELECT);
      const burnAuthorizationDETERCount = resultBurnAuthorizationDETERCount;

      const resultFisionomiaDETERCount = await Report.sequelize.query(sqlFisionomiaDETERCount, QUERY_TYPES_SELECT);
      const fisionomiaDETERCount = resultFisionomiaDETERCount;

      const resultAPPDETERCount = await Report.sequelize.query(sqlAPPDETERCount, QUERY_TYPES_SELECT);
      const aPPDETERCount = resultAPPDETERCount;

      const resultLegalReserveDETERCount = await Report.sequelize.query(sqlLegalReserveDETERCount, QUERY_TYPES_SELECT);
      const legalReserveDETERCount = resultLegalReserveDETERCount;

      // const resultConservationUnitDETERCount = await Report.sequelize.query(sqlConservationUnitDETERCount, QUERY_TYPES_SELECT);
      // const conservationUnitDETERCount = resultConservationUnitDETERCount;

      const resultIndigenousLandDETERCount = await Report.sequelize.query(sqlIndigenousLandDETERCount, QUERY_TYPES_SELECT);
      const indigenousLandDETERCount = resultIndigenousLandDETERCount;

      const resultConsolidatedUseDETERCount = await Report.sequelize.query(sqlConsolidatedUseDETERCount, QUERY_TYPES_SELECT);
      const consolidatedUseDETERCount = resultConsolidatedUseDETERCount;

      const resultExploraDETERCount = await Report.sequelize.query(sqlExploraDETERCount, QUERY_TYPES_SELECT);
      const explorationDETERCount = resultExploraDETERCount;

      const resultDesmateDETERCount = await Report.sequelize.query(sqlDesmateDETERCount, QUERY_TYPES_SELECT);
      const deforestationDETERCount = resultDesmateDETERCount;

      const resultEmbargoedAreaDETERCount = await Report.sequelize.query(sqlEmbargoedAreaDETERCount, QUERY_TYPES_SELECT);
      const embargoedAreaDETERCount = resultEmbargoedAreaDETERCount;

      const resultLandAreaDETERCount = await Report.sequelize.query(sqlLandAreaDETERCount, QUERY_TYPES_SELECT);
      const landAreaDETERCount = resultLandAreaDETERCount;

      const sqlAPPPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLegalReservePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConservationUnitPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlIndigenousLandPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConsolidatedUsePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOCON.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlExploraPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EXPLORA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlDesmatePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESMATE.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlEmbargoedAreaPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EMB.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLandAreaPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESEMB.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlRestrictUsePRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USO_RESTRITO.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlBurnAuthorizationPRODESSum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_QUEIMA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlFisionomiaPRODESSum = `SELECT de_veg_radambr_fisionomia AS class, sum(${columnCalculatedAreaHa}) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_VEG_RADAM.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

      const resultRestrictUsePRODESSum = await Report.sequelize.query(sqlRestrictUsePRODESSum, QUERY_TYPES_SELECT);
      const restrictUsePRODESSum = resultRestrictUsePRODESSum;

      const resultBurnAuthorizationPRODESSum = await Report.sequelize.query(sqlBurnAuthorizationPRODESSum, QUERY_TYPES_SELECT);
      const burnAuthorizationPRODESSum = resultBurnAuthorizationPRODESSum;

      const resultFisionomiaPRODESSum = await Report.sequelize.query(sqlFisionomiaPRODESSum, QUERY_TYPES_SELECT);
      const fisionomiaPRODESSum = resultFisionomiaPRODESSum;

      const resultAPPPRODESSum = await Report.sequelize.query(sqlAPPPRODESSum, QUERY_TYPES_SELECT);
      const aPPPRODESSum = resultAPPPRODESSum;

      const resultLegalReservePRODESSum = await Report.sequelize.query(sqlLegalReservePRODESSum, QUERY_TYPES_SELECT);
      const legalReservePRODESSum = resultLegalReservePRODESSum;

      const resultConservationUnitPRODESSum = await Report.sequelize.query(sqlConservationUnitPRODESSum, QUERY_TYPES_SELECT);
      const conservationUnitPRODESSum = resultConservationUnitPRODESSum;

      const resultIndigenousLandPRODESSum = await Report.sequelize.query(sqlIndigenousLandPRODESSum, QUERY_TYPES_SELECT);
      const indigenousLandPRODESSum = resultIndigenousLandPRODESSum;

      const resultConsolidatedUsePRODESSum = await Report.sequelize.query(sqlConsolidatedUsePRODESSum, QUERY_TYPES_SELECT);
      const consolidatedUsePRODESSum = resultConsolidatedUsePRODESSum;

      const resultExploraPRODESSum = await Report.sequelize.query(sqlExploraPRODESSum, QUERY_TYPES_SELECT);
      const explorationPRODESSum = resultExploraPRODESSum;

      const resultDesmatePRODESSum = await Report.sequelize.query(sqlDesmatePRODESSum, QUERY_TYPES_SELECT);
      const deforestationPRODESSum = resultDesmatePRODESSum;

      const resultEmbargoedAreaPRODESSum = await Report.sequelize.query(sqlEmbargoedAreaPRODESSum, QUERY_TYPES_SELECT);
      const embargoedAreaPRODESSum = resultEmbargoedAreaPRODESSum;

      const resultLandAreaPRODESSum = await Report.sequelize.query(sqlLandAreaPRODESSum, QUERY_TYPES_SELECT);
      const landAreaPRODESSum = resultLandAreaPRODESSum;

      const sqlAPPFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_APP.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLegalReserveFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_RESERVA.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConservationUnitFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_UC.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlIndigenousLandFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_TI.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConsolidatedUseFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_USOCON.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlExploraFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_EXPLORA.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlDesmateFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_DESMATE.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlEmbFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_EMB.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLandAreaFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_DESEMB.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlRestrictUseFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_USO_RESTRITO.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlBurnAuthorizationFOCOSCount = `SELECT COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_QUEIMA.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlFisionomiaFOCOSCount = `SELECT de_veg_radambr_fisionomia AS class, COUNT(1) AS count FROM public.${views.BURNED.children.CAR_FOCOS_X_VEG_RADAM.table_name} where ${views.BURNED.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

      const resultRestrictUseFOCOSCount = await Report.sequelize.query(sqlRestrictUseFOCOSCount, QUERY_TYPES_SELECT);
      const restrictUseFOCOSCount = resultRestrictUseFOCOSCount;

      const resultBurnAuthorizationFOCOSCount = await Report.sequelize.query(sqlBurnAuthorizationFOCOSCount, QUERY_TYPES_SELECT);
      const burnAuthorizationFOCOSCount = resultBurnAuthorizationFOCOSCount;

      const resultFisionomiaFOCOSCount = await Report.sequelize.query(sqlFisionomiaFOCOSCount, QUERY_TYPES_SELECT);
      const fisionomiaFOCOSCount = resultFisionomiaFOCOSCount;

      const resultAPPFOCOSCount = await Report.sequelize.query(sqlAPPFOCOSCount, QUERY_TYPES_SELECT);
      const aPPFOCOSCount = resultAPPFOCOSCount;

      const resultLegalReserveFOCOSCount = await Report.sequelize.query(sqlLegalReserveFOCOSCount, QUERY_TYPES_SELECT);
      const legalReserveFOCOSCount = resultLegalReserveFOCOSCount;

      const resultConservationUnitFOCOSCount = await Report.sequelize.query(sqlConservationUnitFOCOSCount, QUERY_TYPES_SELECT);
      const conservationUnitFOCOSCount = resultConservationUnitFOCOSCount;

      const resultIndigenousLandFOCOSCount = await Report.sequelize.query(sqlIndigenousLandFOCOSCount, QUERY_TYPES_SELECT);
      const indigenousLandFOCOSCount = resultIndigenousLandFOCOSCount;

      const resultConsolidatedUseFOCOSCount = await Report.sequelize.query(sqlConsolidatedUseFOCOSCount, QUERY_TYPES_SELECT);
      const consolidatedUseFOCOSCount = resultConsolidatedUseFOCOSCount;

      const resultExploraFOCOSCount = await Report.sequelize.query(sqlExploraFOCOSCount, QUERY_TYPES_SELECT);
      const explorationFOCOSCount = resultExploraFOCOSCount;

      const resultDesmateFOCOSCount = await Report.sequelize.query(sqlDesmateFOCOSCount, QUERY_TYPES_SELECT);
      const deforestationFOCOSCount = resultDesmateFOCOSCount;

      const resultEmbFOCOSCount = await Report.sequelize.query(sqlEmbFOCOSCount, QUERY_TYPES_SELECT);
      const embargoedAreaFOCOSCount = resultEmbFOCOSCount;

      const resultLandAreaFOCOSCount = await Report.sequelize.query(sqlLandAreaFOCOSCount, QUERY_TYPES_SELECT);
      const landAreaFOCOSCount = resultLandAreaFOCOSCount;


      const sqlAPPBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_APP.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLegalReserveBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_RESERVA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlConservationUnitBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_UC.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlIndigenousLandBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_TI.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlConsolidatedUseBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_USOCON.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlExploraBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EXPLORA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlDesmateBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESMATE.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlEmbargoedAreaBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EMB.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlLandAreaBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESEMB.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

      const sqlRestrictUseBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_USO_RESTRITO.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlBurnAuthorizationBURNEDAREASum = `SELECT COALESCE(SUM(${columnCalculatedAreaHa}), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_QUEIMA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
      const sqlFisionomiaBURNEDAREASum = `SELECT de_veg_radambr_fisionomia AS class, sum(${columnCalculatedAreaHa}) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_VEG_RADAM.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

      const resultRestrictUseBURNEDAREASum = await Report.sequelize.query(sqlRestrictUseBURNEDAREASum, QUERY_TYPES_SELECT);
      const restrictUseBURNEDAREASum = resultRestrictUseBURNEDAREASum;

      const resultBurnAuthorizationBURNEDAREASum = await Report.sequelize.query(sqlBurnAuthorizationBURNEDAREASum, QUERY_TYPES_SELECT);
      const burnAuthorizationBURNEDAREASum = resultBurnAuthorizationBURNEDAREASum;

      const resultFisionomiaBURNEDAREASum = await Report.sequelize.query(sqlFisionomiaBURNEDAREASum, QUERY_TYPES_SELECT);
      const fisionomiaBURNEDAREASum = resultFisionomiaBURNEDAREASum;

      const resultAPPBURNEDAREASum = await Report.sequelize.query(sqlAPPBURNEDAREASum, QUERY_TYPES_SELECT);
      const aPPBURNEDAREASum = resultAPPBURNEDAREASum;

      const resultLegalReserveBURNEDAREASum = await Report.sequelize.query(sqlLegalReserveBURNEDAREASum, QUERY_TYPES_SELECT);
      const legalReserveBURNEDAREASum = resultLegalReserveBURNEDAREASum;

      const resultConservationUnitBURNEDAREASum = await Report.sequelize.query(sqlConservationUnitBURNEDAREASum, QUERY_TYPES_SELECT);
      const conservationUnitBURNEDAREASum = resultConservationUnitBURNEDAREASum;

      const resultIndigenousLandBURNEDAREASum = await Report.sequelize.query(sqlIndigenousLandBURNEDAREASum, QUERY_TYPES_SELECT);
      const indigenousLandBURNEDAREASum = resultIndigenousLandBURNEDAREASum;

      const resultConsolidatedUseBURNEDAREASum = await Report.sequelize.query(sqlConsolidatedUseBURNEDAREASum, QUERY_TYPES_SELECT);
      const consolidatedUseBURNEDAREASum = resultConsolidatedUseBURNEDAREASum;

      const resultExploraBURNEDAREASum = await Report.sequelize.query(sqlExploraBURNEDAREASum, QUERY_TYPES_SELECT);
      const explorationBURNEDAREASum = resultExploraBURNEDAREASum;

      const resultDesmateBURNEDAREASum = await Report.sequelize.query(sqlDesmateBURNEDAREASum, QUERY_TYPES_SELECT);
      const deforestationBURNEDAREASum = resultDesmateBURNEDAREASum;

      const resultEmbargoedAreaBURNEDAREASum = await Report.sequelize.query(sqlEmbargoedAreaBURNEDAREASum, QUERY_TYPES_SELECT);
      const embargoedAreaBURNEDAREASum = resultEmbargoedAreaBURNEDAREASum;

      const resultLandAreaBURNEDAREASum = await Report.sequelize.query(sqlLandAreaBURNEDAREASum, QUERY_TYPES_SELECT);
      const landAreaBURNEDAREASum = resultLandAreaBURNEDAREASum;

      const resultProdesArea = await Report.sequelize.query(sqlProdesArea, QUERY_TYPES_SELECT);
      const prodesArea = resultProdesArea;

      const resultProdesTotalArea = await Report.sequelize.query(sqlProdesTotalArea, QUERY_TYPES_SELECT);
      const prodesTotalArea = resultProdesTotalArea;

      const resultIndigenousLand = await Report.sequelize.query(sqlIndigenousLand, QUERY_TYPES_SELECT);
      const indigenousLand = resultIndigenousLand;

      const resultConservationUnit = await Report.sequelize.query(sqlConservationUnit, QUERY_TYPES_SELECT);
      const conservationUnit = resultConservationUnit;

      const resultLegalReserve = await Report.sequelize.query(sqlLegalReserve, QUERY_TYPES_SELECT);
      const legalReserve = resultLegalReserve;

      const resultAPP = await Report.sequelize.query(sqlAPP, QUERY_TYPES_SELECT);
      const app = resultAPP;

      const resultConsolidatedUse = await Report.sequelize.query(sqlConsolidatedUse, QUERY_TYPES_SELECT);
      const consolidatedArea = resultConsolidatedUse;

      const resultAnthropizedUse = await Report.sequelize.query(sqlAnthropizedUse, QUERY_TYPES_SELECT);
      const anthropizedUse = resultAnthropizedUse;

      const resultNativeVegetation = await Report.sequelize.query(sqlNativeVegetation, QUERY_TYPES_SELECT);
      const nativeVegetation = resultNativeVegetation;

      const resultDeterYear = await Report.sequelize.query(sqlDeterYear, QUERY_TYPES_SELECT);
      const deterYear = resultDeterYear;

      const resultProdesYear = await Report.sequelize.query(sqlProdesYear, QUERY_TYPES_SELECT);
      const prodesYear = resultProdesYear;

      const resultSpotlightsYear = await Report.sequelize.query(sqlSpotlightsYear, QUERY_TYPES_SELECT);
      const spotlightsYear = resultSpotlightsYear;

      if (propertyData) {
        propertyData.burningSpotlights = burningSpotlights;
        propertyData.burnedAreas = burnedAreas;
        // propertyData.deter = deter[0]
        propertyData.prodesArea = prodesArea[0]['area'];
        propertyData.prodesTotalArea = prodesTotalArea[0]['area'];
        propertyData.prodesYear = prodesYear;
        propertyData.deterYear = deterYear;
        propertyData.spotlightsYear = spotlightsYear;
        propertyData.burnedAreasYear = burnedAreasYear;
        propertyData.indigenousLand = indigenousLand[0];
        propertyData.conservationUnit = conservationUnit[0];
        propertyData.legalReserve = legalReserve[0];
        propertyData.app = app[0];
        propertyData.consolidatedArea = consolidatedArea[0];
        propertyData.anthropizedUse = anthropizedUse[0];
        propertyData.nativeVegetation = nativeVegetation[0];

        let prodesSumArea = 0;

        prodesSumArea += conservationUnitPRODESSum[0]['area'] ? conservationUnitPRODESSum[0]['area'] : 0;
        prodesSumArea += aPPPRODESSum[0]['area'] ? aPPPRODESSum[0]['area'] : 0;
        prodesSumArea += legalReservePRODESSum[0]['area'] ? legalReservePRODESSum[0]['area'] : 0;
        prodesSumArea += indigenousLandPRODESSum[0]['area'] ? indigenousLandPRODESSum[0]['area'] : 0;
        prodesSumArea += consolidatedUsePRODESSum[0]['area'] ? consolidatedUsePRODESSum[0]['area'] : 0;
        prodesSumArea += deforestationPRODESSum[0]['area'] ? deforestationPRODESSum[0]['area'] : 0;
        prodesSumArea += embargoedAreaPRODESSum[0]['area'] ? embargoedAreaPRODESSum[0]['area'] : 0;
        prodesSumArea += landAreaPRODESSum[0]['area'] ? landAreaPRODESSum[0]['area'] : 0

        let deterSumArea = 0;
        deterSumArea += aPPDETERCount[0]['count'] ? aPPDETERCount[0]['count'] : 0
        deterSumArea += legalReserveDETERCount[0]['count'] ? legalReserveDETERCount[0]['count'] : 0
        // deterSumArea+=conservationUnitDETERCount[0]['count']?conservationUnitDETERCount[0]['count']:0
        deterSumArea += indigenousLandDETERCount[0]['count'] ? indigenousLandDETERCount[0]['count'] : 0
        deterSumArea += consolidatedUseDETERCount[0]['count'] ? consolidatedUseDETERCount[0]['count'] : 0
        deterSumArea += deforestationDETERCount[0]['count'] ? deforestationDETERCount[0]['count'] : 0
        deterSumArea += embargoedAreaDETERCount[0]['count'] ? embargoedAreaDETERCount[0]['count'] : 0
        deterSumArea += landAreaDETERCount[0]['count'] ? landAreaDETERCount[0]['count'] : 0

        let burnlightCount = 0
        burnlightCount += aPPFOCOSCount[0]['count'] ? aPPFOCOSCount[0]['count'] : 0
        burnlightCount += legalReserveFOCOSCount[0]['count'] ? legalReserveFOCOSCount[0]['count'] : 0
        burnlightCount += conservationUnitFOCOSCount[0]['count'] ? conservationUnitFOCOSCount[0]['count'] : 0
        burnlightCount += indigenousLandFOCOSCount[0]['count'] ? indigenousLandFOCOSCount[0]['count'] : 0
        burnlightCount += consolidatedUseFOCOSCount[0]['count'] ? consolidatedUseFOCOSCount[0]['count'] : 0
        burnlightCount += deforestationFOCOSCount[0]['count'] ? deforestationFOCOSCount[0]['count'] : 0
        burnlightCount += embargoedAreaFOCOSCount[0]['count'] ? embargoedAreaFOCOSCount[0]['count'] : 0
        burnlightCount += landAreaFOCOSCount[0]['count'] ? landAreaFOCOSCount[0]['count'] : 0

        let burnedAreaSum = 0
        burnedAreaSum += aPPBURNEDAREASum[0]['area'] ? aPPBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += legalReserveBURNEDAREASum[0]['area'] ? legalReserveBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += conservationUnitBURNEDAREASum[0]['area'] ? conservationUnitBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += indigenousLandBURNEDAREASum[0]['area'] ? indigenousLandBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += consolidatedUseBURNEDAREASum[0]['area'] ? consolidatedUseBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += deforestationBURNEDAREASum[0]['area'] ? deforestationBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += embargoedAreaBURNEDAREASum[0]['area'] ? embargoedAreaBURNEDAREASum[0]['area'] : 0
        burnedAreaSum += landAreaBURNEDAREASum[0]['area'] ? landAreaBURNEDAREASum[0]['area'] : 0

        propertyData.prodesApp = {
          affectedArea: 'APP',
          recentDeforestation: aPPDETERCount[0]['count'] | '',
          pastDeforestation: aPPPRODESSum[0]['area'],
          burnlights: aPPFOCOSCount[0]['count'] | '',
          burnAreas: aPPBURNEDAREASum[0]['area']
        }

        propertyData.prodesLegalReserve = {
          affectedArea: 'ARL',
          recentDeforestation: legalReserveDETERCount[0]['count'] | '',
          pastDeforestation: legalReservePRODESSum[0]['area'],
          burnlights: legalReserveFOCOSCount[0]['count'] | '',
          burnAreas: legalReserveBURNEDAREASum[0]['area'],
        }

        propertyData.prodesRestrictedUse = {
          affectedArea: 'AUR',
          recentDeforestation: restrictUseDETERCount[0]['count'] | '',
          pastDeforestation: restrictUsePRODESSum[0]['area'],
          burnlights: restrictUseFOCOSCount[0]['count'] | '',
          burnAreas: restrictUseBURNEDAREASum[0]['area'],
        }

        propertyData.prodesConservationUnit = {
          affectedArea: 'UC',
          recentDeforestation: 0, /*conservationUnitDETERCount[0]['count']|'',*/
          pastDeforestation: conservationUnitPRODESSum[0]['area'],
          burnlights: conservationUnitFOCOSCount[0]['count'] | '',
          burnAreas: conservationUnitBURNEDAREASum[0]['area']
        }

        propertyData.prodesIndigenousLand = {
          affectedArea: 'TI',
          recentDeforestation: indigenousLandDETERCount[0]['count'] | '',
          pastDeforestation: indigenousLandPRODESSum[0]['area'],
          burnlights: indigenousLandFOCOSCount[0]['count'] | '',
          burnAreas: indigenousLandBURNEDAREASum[0]['area'],
        }

        propertyData.prodesConsolidatedUse = {
          affectedArea: 'AUC',
          recentDeforestation: consolidatedUseDETERCount[0]['count'] | '',
          pastDeforestation: consolidatedUsePRODESSum[0]['area'],
          burnlights: consolidatedUseFOCOSCount[0]['count'] | '',
          burnAreas: consolidatedUseBURNEDAREASum[0]['area'],
        }

        propertyData.prodesExploration = {
          affectedArea: 'AUTEX',
          recentDeforestation: explorationDETERCount[0]['count'],
          pastDeforestation: explorationPRODESSum[0]['area'],
          burnlights: explorationFOCOSCount[0]['count'],
          burnAreas: explorationBURNEDAREASum[0]['area'],
        }

        propertyData.prodesDeforestation = {
          affectedArea: 'AD',
          recentDeforestation: deforestationDETERCount[0]['count'] | '',
          pastDeforestation: deforestationPRODESSum[0]['area'],
          burnlights: deforestationFOCOSCount[0]['count'] | '',
          burnAreas: deforestationBURNEDAREASum[0]['area'],
        }

        propertyData.prodesEmbargoedArea = {
          affectedArea: 'Área embargada',
          recentDeforestation: embargoedAreaDETERCount[0]['count'] | '',
          pastDeforestation: embargoedAreaPRODESSum[0]['area'],
          burnlights: embargoedAreaFOCOSCount[0]['count'] | '',
          burnAreas: embargoedAreaBURNEDAREASum[0]['area'],
        }

        propertyData.prodesLandArea = {
          affectedArea: 'Área desembargada',
          recentDeforestation: landAreaDETERCount[0]['count'] | '',
          pastDeforestation: landAreaPRODESSum[0]['area'],
          burnlights: landAreaFOCOSCount[0]['count'] | '',
          burnAreas: landAreaBURNEDAREASum[0]['area'],
        }

        propertyData.prodesBurnAuthorization = {
          affectedArea: 'AQ',
          recentDeforestation: burnAuthorizationDETERCount[0]['count'] | '',
          pastDeforestation: burnAuthorizationPRODESSum[0]['area'],
          burnlights: burnAuthorizationFOCOSCount[0]['count'] | '',
          burnAreas: burnAuthorizationBURNEDAREASum[0]['area'],
        }

        propertyData.prodesRadam = fisionomiaPRODESSum

        propertyData.foundProdes = prodesSumArea ? true : false
        propertyData.foundDeter = deterSumArea ? true : false
        propertyData.foundBurnlight = burnlightCount || burnedAreaSum ? true : false

        return Result.ok(propertyData);
      }
    } catch (e) {
      return Result.err(e)
    }
  }
}
