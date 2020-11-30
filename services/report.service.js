
const Result = require("../utils/result")
  models = require('../models')
  Report = models.reports
  env = process.env.NODE_ENV || 'development'
  confDb = require(__dirname + '/../config/config.json')[env]
  PdfPrinter = require('pdfmake')
  fs = require('fs')
  env = process.env.NODE_ENV || 'development'
  confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env]
  ViewUtil = require("../utils/view.utils")
  SatVegService = require("../services/sat-veg.service")
  axios = require('axios')
  logger = require('../utils/logger')

const config = {
  headers: {'X-My-Custom-Header': 'Header-Value'}
};

const DocDefinitions = require(__dirname + '/../utils/helpers/report/doc-definition.js')
const QUERY_TYPES_SELECT = { type: "SELECT" };

const dateFormat = function (date) {
  const year = date.split('-')[0];
  let month = date.split('-')[1];
  let day = date.split('-')[2];
  if (Number(day) < 10) {
    day = `0${day}`;
  }
  if (Number(month) < 10) {
    month = `0${month}`;
  }

  return `${day}/${month}/${year}`;
}

getFilterClassSearch = function(sql, filter, view, tableOwner){
  const classSearch = filter && filter.classSearch ? filter.classSearch : null;
  if (classSearch && (classSearch.radioValue === 'SELECTION') && (classSearch.analyzes.length > 0)){
    classSearch.analyzes.forEach(analyze => {
      if (analyze.valueOption && analyze.type) {
        if (view.cod_group === 'DETER') {
          const columnName = view.is_primary ? `dd_deter_inpe_classname` : `${tableOwner}_dd_deter_inpe_classname`;
          sql += ` AND ${columnName} like '%${analyze.valueOption.name}%' `
        }
      }
    });
  }

  return sql;
}

getImageObject = function (image, fit, margin, alignment) {
  if (image && image[0] && !image[0].includes('data:application/vnd.ogc.se_xml')) {
    return new Image(
        image,
        fit,
        margin,
        alignment
    );
  } else {
    return {
      text: 'Imagem não encontrada.',
      alignment: 'center',
      color: '#ff0000',
      fontSize: 9,
      italics: true,
      margin: [30, 60, 30, 60]
    };
  }
}

setAnalysisYear = function(data, period, variable) {
  const analysisYears = [];
  for (let year = period['startYear']; year <= period['endYear']; year++){
    analysisYears.push( {date: year, [`${variable}`] : data.find(analise => analise.date === year) ? (data.find(analise => analise.date === year)[variable]) : '0.0000'} );
  }
  return analysisYears;
}

setBoundingBox = function(bBox) {

  const bboxArray = bBox.split(',');
  const bbox1 = bboxArray[0].split(' ')
  const bbox2 = bboxArray[1].split(' ')

  let Xmax = parseFloat(bbox2[0]);
  let Xmin = parseFloat(bbox1[0]);

  let Ymax = parseFloat(bbox2[1]);
  let Ymin = parseFloat(bbox1[1]);

  let difX = Math.abs(Math.abs(Xmax) - Math.abs(Xmin));
  let difY = Math.abs( Math.abs(Ymax) - Math.abs(Ymin));

  if(difX > difY) {
    const fac = difX - difY;
    Ymin -= fac/2;
    Ymax += fac/2;
  } else if(difX < difY) {
    const fac = difY - difX;
    Xmin -= fac/2;
    Xmax += fac/2;
  }

  return `${Xmin}, ${Ymin}, ${Xmax}, ${Ymax}`;
}

const analysisReportFormat = {
  prodes(reportData, views, resultReportData, carColumn, carColumnSema, date, filter = null) {
    resultReportData['urlGsImage']  = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.MUNICIPIOS.workspace}:${views.STATIC.children.MUNICIPIOS.view},${views.STATIC.children.MUNICIPIOS.workspace}:${views.STATIC.children.MUNICIPIOS.view},${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=&bbox=${reportData['statebbox']}&width=400&height=400&cql_filter=geocodigo<>'';municipio='${resultReportData.property.city}';numero_do1='${resultReportData.property.register}'&srs=EPSG:4326&format=image/png`;

    resultReportData['prodesStartYear'] = resultReportData.property['period'][0]['start_year'];

    resultReportData['prodesTableData'] = reportData.analyzesYear;
    resultReportData['prodesTableData'].push({date: 'Total', area: resultReportData.property.prodesTotalArea});

    // resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;
    resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;

    // resultReportData['urlGsImage2'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_yellow_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.DYNAMIC.children.PRODES.workspace}:${views.DYNAMIC.children.PRODES.view}_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=${resultReportData.property['period'][0]['start_year']}/${resultReportData.property['period'][0]['end_year']}&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage2'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_yellow_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.DYNAMIC.children.PRODES.workspace}:${views.DYNAMIC.children.PRODES.view}_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=${resultReportData.property['period'][0]['start_year']}/${resultReportData.property['period'][0]['end_year']}&cql_filter=${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;

    resultReportData['urlGsLegend'] = `${confGeoServer.baseHost}/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=forceLabels:on;forceTitles:off;layout:vertical&LAYER=${views.STATIC.children.CAR_VALIDADO.workspace}:CAR_VALIDADO_X_CAR_PRODES_X_USOCON`;

    resultReportData['urlGsImage3'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:MosaicSpot2008,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/2019&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage4'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:LANDSAT_8_2018,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/2018&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage5'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:SENTINEL_2_2019,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/2019&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    // resultReportData['urlGsImage6'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage6'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&cql_filter=${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;

    resultReportData['urlGsDeforestationHistory'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:#{image}#,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/#{year}#&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsDeforestationHistory1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/#{year}#&cql_filter=${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4674&format=image/png`;
    
  },
  deter (reportData, views, resultReportData, carColumn, carColumnSema, date, filter = null) {
    const cql_filter_deter = `${carColumn}='${resultReportData.property.gid}' ${getFilterClassSearch('', filter, views.DETER.children.CAR_X_DETER, views.DETER.tableOwner)}`;
    resultReportData['urlGsImage']  = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.MUNICIPIOS.workspace}:${views.STATIC.children.MUNICIPIOS.view},${views.STATIC.children.MUNICIPIOS.workspace}:${views.STATIC.children.MUNICIPIOS.view},${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=&bbox=${reportData['statebbox']}&width=400&height=400&cql_filter=geocodigo<>'';municipio='${resultReportData.property.city}';numero_do1='${resultReportData.property.register}'&srs=EPSG:4326&format=image/png`;

    // resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;
    resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;

    resultReportData['urlGsImage3'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:MosaicSpot2008,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${date[0]}/${date[1]}&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${cql_filter_deter}&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage4'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:LANDSAT_8_2018,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${date[0]}/${date[1]}&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${cql_filter_deter}&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage5'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:SENTINEL_2_2019,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${date[0]}/${date[1]}&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${cql_filter_deter}&srs=EPSG:4674&format=image/png`;
    resultReportData['urlGsImage6'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${date[0]}/${date[1]}&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${cql_filter_deter}&srs=EPSG:4674&format=image/png`;

    if(resultReportData.property['deflorestationAlerts'] && resultReportData.property['deflorestationAlerts'].length > 0) {
      resultReportData.property['deflorestationAlerts'].forEach(alert => {
        alert.bbox = setBoundingBox(alert.bbox);
        const bboxDeter = alert.bbox.split(',')
        const yearBefore = (alert.year - 1);

        const view =
          yearBefore < 2013 ? 'LANDSAT_5_' :
            yearBefore < 2017 ? 'LANDSAT_8_' :
              'SENTINEL_2_';

        alert['urlGsImageBefore'] =  `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:${view}${yearBefore},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${alert.bbox}&width=600&height=600&time=P1Y/${alert.year}&cql_filter=RED_BAND>0;${views.DETER.children.CAR_X_DETER.table_name}_id='${alert.id}'&srs=EPSG:4674&format=image/png`;
        alert['urlGsImageCurrent'] = `${confGeoServer.baseHostDeter}/?request=GetMap&service=WMS&version=1.3.0&transparent=true&CRS=EPSG:4326&WIDTH=336&HEIGHT=336&FORMAT=image/png&LAYERS=${alert.sat}_${alert.sensor}_${alert.path_row}_${alert.date_code}&bbox=${bboxDeter[1].trim()},${bboxDeter[0].trim()},${bboxDeter[3].trim()},${bboxDeter[2].trim()}`;
        // alert['urlGsImagePlanetCurrentAndCar'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/${alert.year}&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${views.DETER.children.CAR_X_DETER.table_name}_id='${alert.id}'&srs=EPSG:4674&format=image/png`;
        alert['urlGsImagePlanetCurrentAndCar'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views.DETER.children.CAR_X_DETER.workspace}:${views.DETER.children.CAR_X_DETER.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views.PRODES.children.CAR_X_PRODES.workspace}:${views.PRODES.children.CAR_X_PRODES.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=600&height=600&time=P1Y/${alert.year}&cql_filter=${carColumnSema}='${resultReportData.property.gid}';gid_car='${resultReportData.property.gid}';${views.DETER.children.CAR_X_DETER.table_name}_id='${alert.id}'&srs=EPSG:4674&format=image/png`;
      });
    }
  },
  queimada (reportData, views, resultReportData, carColumn, carColumnSema, date, filter = null) {
    // resultReportData['urlGsImage']  = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=RED_BAND>0;${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;
    resultReportData['urlGsImage']  = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;

    // Com Planet
    // resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:planet_latest_global_monthly,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.BURNED.children.CAR_X_FOCOS.workspace}:${views.BURNED.children.CAR_X_FOCOS.view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.BURNED.children.CAR_X_FOCOS.workspace}:${views.BURNED.children.CAR_X_FOCOS.view}_style&bbox=${resultReportData.property.bbox}&width=400&height=400&cql_filter=RED_BAND>0;${carColumn}='${resultReportData.property.gid};${carColumnSema}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;
    resultReportData['urlGsImage1'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.BURNED.children.CAR_X_FOCOS.workspace}:${views.BURNED.children.CAR_X_FOCOS.view}&styles=${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_Mod_style,${views.BURNED.children.CAR_X_FOCOS.workspace}:${views.BURNED.children.CAR_X_FOCOS.view}_style&bbox=${resultReportData.property.bbox}&width=400&height=400&time=${date[0]}/${date[1]}&cql_filter=${carColumnSema}='${resultReportData.property.gid}';${carColumn}='${resultReportData.property.gid}'&srs=EPSG:4326&format=image/png`;
  }
}

setReportFormat = async function(reportData, views, type, carColumn, carColumnSema, date, filter) {
  const resultReportData = {};

  resultReportData['bbox'] = setBoundingBox(reportData.bbox);

  reportData.bbox = resultReportData.bbox;

  resultReportData['property'] = reportData;

  reportData['statebbox'] = setBoundingBox(reportData['statebbox']);
  carColumnSema= 'rid';

  analysisReportFormat[type](reportData, views, resultReportData, carColumn, carColumnSema, date, filter);

  return resultReportData;
};

getImageObject = function(image, fit, margin, alignment) {
  if (image && image[0] && !image[0].includes('data:application/vnd.ogc.se_xml')) {
    return {
      image: image,
      fit: fit,
      margin: margin,
      alignment: alignment
    };
  } else {
    return {
      text: 'Imagem não encontrada.',
      alignment: 'center',
      color: '#ff0000',
      fontSize: 9,
      italics: true,
      margin: [30, 60, 30, 60]
    };
  }
};

getViewsReport = async function() { return await ViewUtil.getGrouped() };

getCarData = async function(carTableName, municipiosTableName, columnCarEstadualSemas, columnCarFederalSemas, columnAreaHaCar, carRegister){
  const sql =
    `
      SELECT
              car.gid AS gid,
              car.${columnCarEstadualSemas} AS register,
              car.${columnCarFederalSemas} AS federalregister,
              ROUND(COALESCE(car.${columnAreaHaCar}, 0), 4) AS area,
              ROUND(COALESCE((car.${columnAreaHaCar}/100), 0), 4) AS area_km,
              car.nome_da_p1 AS name,
              car.municipio1 AS city,
              car.cpfcnpj AS cpf,
              car.nomepropri AS owner,
              munic.comarca AS county,
              substring(ST_EXTENT(munic.geom)::TEXT, 5, length(ST_EXTENT(munic.geom)::TEXT) - 5) AS citybbox,
              substring(ST_EXTENT(UF.geom)::TEXT, 5, length(ST_EXTENT(UF.geom)::TEXT) - 5) AS statebbox,
              substring(ST_EXTENT(car.geom)::TEXT, 5, length(ST_EXTENT(car.geom)::TEXT) - 5) AS bbox,
              ST_Y(ST_Centroid(car.geom)) AS "lat",
              ST_X(ST_Centroid(car.geom)) AS "long"
      FROM public.${carTableName} AS car
      INNER JOIN public.${municipiosTableName} munic ON
              car.gid = '${carRegister}'
              AND munic.municipio = car.municipio1
      INNER JOIN de_uf_mt_ibge UF ON UF.gid = 1
      GROUP BY car.${columnCarEstadualSemas}, car.${columnCarFederalSemas}, car.${columnAreaHaCar}, car.gid, car.nome_da_p1, car.municipio1, car.geom, munic.comarca, car.cpfcnpj, car.nomepropri
    `;

  const result = await Report.sequelize.query(sql, QUERY_TYPES_SELECT);

  return result[0];
};

setDeterData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnExecutionDate, carRegister, filter) {
  if ((propertyData && views.DETER && type === 'deter')) {

    // --- Total area of Deter period ----------------------------------------------------------------------------------
    const sqlDeterAreaPastDeforestation =
        `   
            SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area 
            FROM public.${views.DETER.children.CAR_X_DETER.table_name} 
            WHERE ${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_X_DETER, views.DETER.tableOwner)} `;
    const resultDeterAreaPastDeforestation = await Report.sequelize.query(sqlDeterAreaPastDeforestation, QUERY_TYPES_SELECT);
    propertyData['areaPastDeforestation'] = resultDeterAreaPastDeforestation[0]['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Deforestation alerts and areas ------------------------------------------------------------------------------
    const sqlDeflorestationAlerts = `
      SELECT 
            carxdeter.${views.DETER.children.CAR_X_DETER.table_name}_id AS id,
            SUBSTRING(ST_EXTENT(carxdeter.intersection_geom)::TEXT, 5, length(ST_EXTENT(carxdeter.intersection_geom)::TEXT) - 5) AS bbox,
            COALESCE(calculated_area_ha, 4) AS area,
            TO_CHAR(carxdeter.execution_date, 'dd/mm/yyyy') AS date,
            TO_CHAR(carxdeter.execution_date, 'yyyy') AS year,
            TRIM(carxdeter.dd_deter_inpe_sensor) AS sensor,
            TRIM(TO_CHAR(CAST(REPLACE(carxdeter.dd_deter_inpe_path_row, '/', '') AS DECIMAL), '999_999')) AS path_row,
            TRIM(TO_CHAR(carxdeter.execution_date, 'ddmmyyyy')) AS date_code,
            ( CASE WHEN carxdeter.dd_deter_inpe_satellite = 'Cbers4' THEN 'CBERS-4'
                   ELSE UPPER(TRIM(carxdeter.dd_deter_inpe_satellite)) END) AS sat
      FROM public.${views.DETER.children.CAR_X_DETER.table_name} AS carxdeter, public.${views.STATIC.children.BIOMAS.table_name} bio
      WHERE ${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_X_DETER, views.DETER.tableOwner)}
            AND st_intersects(bio.geom, carxdeter.intersection_geom)
      GROUP BY a_cardeter_31_id, bio.gid `;

    propertyData['deflorestationAlerts'] = await Report.sequelize.query(sqlDeflorestationAlerts, QUERY_TYPES_SELECT);
    // -----------------------------------------------------------------------------------------------------------------

    // ---- Values of table --------------------------------------------------------------------------------------------
    const sqlCrossings = `
      SELECT 'app' AS relationship, 'APP' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
      FROM public.${views.DETER.children.CAR_DETER_X_APP.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_APP, views.DETER.tableOwner)}      
      UNION ALL
        SELECT 'legalReserve' AS relationship, 'ARL' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_RESERVA.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_RESERVA, views.DETER.tableOwner)}
      UNION ALL
        SELECT 'indigenousLand' AS relationship, 'TI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_TI.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_TI, views.DETER.tableOwner)}
      UNION ALL
        SELECT 'exploration' AS relationship, 'AUTEX' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_EXPLORA.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_EXPLORA, views.DETER.tableOwner)}
      UNION ALL
        SELECT 'deforestation' AS relationship, 'AD' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_DESMATE.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_DESMATE, views.DETER.tableOwner)}
      UNION ALL
        SELECT 'embargoedArea' AS relationship, 'Área embargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_EMB.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_EMB, views.DETER.tableOwner)}
      UNION ALL
        SELECT 'landArea' AS relationship, 'Área desembargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_DESEMB.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_DESEMB, views.DETER.tableOwner)}
      UNION ALL
        SELECT 'ucUs' AS relationship, 'UC – US' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_UC.table_name} 
        WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_UC, views.DETER.tableOwner)}  AND de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
      UNION ALL
        SELECT 'ucPi' AS relationship, 'UC – PI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_UC.table_name} 
        WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_UC, views.DETER.tableOwner)} AND de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
      UNION ALL
        SELECT 'burnAuthorization' AS relationship, 'AQC' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
        FROM public.${views.DETER.children.CAR_DETER_X_QUEIMA.table_name} WHERE ${views.DETER.tableOwner}_${columnCarEstadual} = '${carRegister}' ${getFilterClassSearch(dateSql, filter, views.DETER.children.CAR_DETER_X_QUEIMA, views.DETER.tableOwner)}
    `;

    const resCrossings = await Report.sequelize.query(sqlCrossings, QUERY_TYPES_SELECT);
    let deterSumArea = 0;
    resCrossings.forEach(crossing => {
      if (!propertyData['tableData']){ propertyData['tableData'] = []; }
      propertyData['tableData'].push({ affectedArea: crossing['affected_area'], pastDeforestation: crossing['area'] });

      deterSumArea += parseFloat(crossing['area']) ? parseFloat(crossing['area']) : 0.0000;
    });

    if (!propertyData['foundDeter']){ propertyData['foundDeter'] = {}; }
    propertyData['foundDeter'] = !!deterSumArea;
    // -----------------------------------------------------------------------------------------------------------------

  }

  return await propertyData;
};

setProdesData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnExecutionDate, carRegister) {
  if (propertyData && views.PRODES && type === 'prodes') {
    // --- Prodes area grouped by year ---------------------------------------------------------------------------------
    const sqlProdesYear =
      `SELECT
        extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
        ROUND(COALESCE(SUM(CAST(cp.${columnCalculatedAreaHa}  AS DECIMAL)), 0), 4) AS area
      FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} AS cp
      WHERE cp.${columnCarEstadual} = '${carRegister}'
      GROUP BY date
      ORDER BY date `;
      propertyData['analyzesYear'] = await Report.sequelize.query(sqlProdesYear, QUERY_TYPES_SELECT);
    // -----------------------------------------------------------------------------------------------------------------

    // --- Radam View vegetation of area grouped by physiognomy --------------------------------------------------------
    const sqlVegRadam = ` SELECT gid, numero_do1, numero_do2, fisionomia, ROUND(CAST(area_ha_ AS DECIMAL), 4) AS area_ha_, ROUND(CAST(area_ha_car_vegradam AS DECIMAL), 4) AS area_ha_car_vegradam FROM car_x_vegradam WHERE gid = ${carRegister} `;
    propertyData['vegRadam']  = await Report.sequelize.query(sqlVegRadam, QUERY_TYPES_SELECT);
    // -----------------------------------------------------------------------------------------------------------------

    // --- Fisionomia of prodes radam ----------------------------------------------------------------------------------
    const sqlFisionomiaPRODESSum =
    `
      SELECT
             fisionomia AS class,
             SUM(ST_Area(ST_Intersection(car_prodes.intersection_geom, radam.geom)::geography) / 10000.0) AS area
      FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} AS car_prodes, public.${views.STATIC.children.VEGETACAO_RADAM_BR.table_name} AS radam
      WHERE car_prodes.de_car_validado_sema_gid = '${carRegister}' ${dateSql}
       AND ST_Intersects(car_prodes.intersection_geom, radam.geom)
      GROUP BY radam.fisionomia`;

    propertyData['prodesRadam'] = await Report.sequelize.query(sqlFisionomiaPRODESSum, QUERY_TYPES_SELECT);
    // -----------------------------------------------------------------------------------------------------------------

    // --- Total area of prodes ----------------------------------------------------------------------------------------
    const sqlProdesTotalArea = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}'`;
    const resultProdesTotalArea = await Report.sequelize.query(sqlProdesTotalArea, QUERY_TYPES_SELECT);
    propertyData['prodesTotalArea'] = resultProdesTotalArea[0]['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Total area of prodes period ----------------------------------------------------------------------------------------
    const sqlProdesAreaPastDeforestation = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}' ${dateSql} `;
    const resultProdesAreaPastDeforestation = await Report.sequelize.query(sqlProdesAreaPastDeforestation, QUERY_TYPES_SELECT);
    propertyData['areaPastDeforestation'] = resultProdesAreaPastDeforestation[0]['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Total area of UsoCon ----------------------------------------------------------------------------------------
    const sqlUsoConArea = `SELECT ROUND(COALESCE(SUM(CAST(area_ha_car_usocon AS DECIMAL)), 0), 4) AS area FROM public.${views.STATIC.children.CAR_X_USOCON.table_name} where gid_car = '${carRegister}'`;
    const resultUsoConArea = await Report.sequelize.query(sqlUsoConArea, QUERY_TYPES_SELECT);
    propertyData['areaUsoCon'] = resultUsoConArea[0]['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // --- Prodes area by period ---------------------------------------------------------------------------------------
    const sqlProdesArea = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const resultProdesArea = await Report.sequelize.query(sqlProdesArea, QUERY_TYPES_SELECT);
    propertyData['prodesArea'] = resultProdesArea[0]['area'];
    // -----------------------------------------------------------------------------------------------------------------

    // ---- Values of table --------------------------------------------------------------------------------------------
    const sqlCrossings =
      ` SELECT 'indigenousLand' AS relationship, 'TI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'legalReserve' AS relationship, 'ARL' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'app' AS relationship, 'APP' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'exploration' AS relationship, 'AUTEX' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EXPLORA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'deforestation' AS relationship, 'AD' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESMATE.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL 
        SELECT 'restrictedUse' AS relationship, 'AUR' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USO_RESTRITO.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'embargoedArea' AS relationship, 'Área embargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_EMB.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'landArea' AS relationship, 'Área desembargada' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_DESEMB.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'burnAuthorization' AS relationship, 'AQC' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_QUEIMA.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}
        UNION ALL
        SELECT 'ucUs' AS relationship, 'UC – US' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} and de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
        UNION ALL 
        SELECT 'ucPi' AS relationship, 'UC – PI' AS affected_area, COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} and de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
      `;
    // -----------------------------------------------------------------------------------------------------------------

    // ----- Area of Deforestation History -----------------------------------------------------------------------------
    const sqlDeforestationHistory =
        ` SELECT
                            extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
                            ROUND(COALESCE(SUM(CAST(cp.${columnCalculatedAreaHa}  AS DECIMAL)), 0),4) AS area
            FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} cp
            WHERE cp.${columnCarEstadual} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
    const deflorestationHistory = await Report.sequelize.query(sqlDeforestationHistory, QUERY_TYPES_SELECT);


    propertyData['period']  = await Report.sequelize.query(  ` SELECT  (MAX(prodes.ano) - 11) AS start_year, MAX(prodes.ano) AS end_year  FROM ${views.DYNAMIC.children.PRODES.table_name} AS prodes ` , QUERY_TYPES_SELECT);

    propertyData['deflorestationHistory'] = setAnalysisYear(deflorestationHistory, { startYear:  propertyData['period'][0]['start_year'], endYear:  propertyData['period'][0]['end_year'] }, 'area');
    // ---------------------------------------------------------------------------------------------------------------

    const resCrossings = await Report.sequelize.query(sqlCrossings, QUERY_TYPES_SELECT);
    let prodesSumArea = 0;
    resCrossings.forEach(crossing => {
      if (!propertyData['tableData']){ propertyData['tableData'] = []; }
      propertyData['tableData'].push({ affectedArea: crossing['affected_area'], pastDeforestation: crossing['area'] });

      prodesSumArea += parseFloat(crossing['area']) ? parseFloat(crossing['area']) : 0.0000;
    });

    if (!propertyData['foundProdes']){ propertyData['foundProdes'] = {}; }
    propertyData['foundProdes'] = !!prodesSumArea;

    let radamProdes = 0;
    let radamText = '';
    if (propertyData['prodesRadam'] && propertyData['prodesRadam'].length > 0) {
      for (const radam of propertyData['prodesRadam']) {
        const area = radam['area'];
        const cls = radam['class'];
        if (cls !== null) {
          radamText += radamText === '' ? `${cls}: ${area}` : `\n ${cls}: ${area}`;
          radamProdes += area;
        }
      }
    }

    propertyData['tableVegRadam'] = {
      affectedArea: 'Vegetação RADAM BR',
      pastDeforestation: radamText
    };
  }

  return await propertyData;
};

setBurnedData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCarEstadualSemas, columnExecutionDate, carRegister, filter) {
  if (propertyData && views.BURNED && type === 'queimada') {
    // ---  Firing Authorization ---------------------------------------------------------------------------------------
    const sqlFiringAuth = `
        SELECT 
                aut.titulo_nu1,
                TO_CHAR(aut.data_apro1, 'DD/MM/YYYY') AS data_apro, TO_CHAR(aut.data_venc1, 'DD/MM/YYYY') AS data_venc,
                SUM(ROUND((COALESCE(aut.area__m2_,0) / 10000), 4)) AS area_ha
        FROM public.${views.STATIC.children.AUTORIZACAO_QUEIMA.table_name} AS aut
        JOIN public.${views.STATIC.children.CAR_VALIDADO.table_name} AS car ON st_contains(car.geom, aut.geom)
        WHERE   car.${columnCarEstadualSemas} = ${carRegister}
            AND '${filter.date[0]}' <= aut.data_apro1
            AND '${filter.date[1]}' >= data_venc1
            GROUP BY aut.titulo_nu1, aut.data_apro1, aut.data_venc1
    `;
    const resultFiringAuth = await Report.sequelize.query(sqlFiringAuth, QUERY_TYPES_SELECT);
    propertyData['firingAuth'] = resultFiringAuth;
    // -----------------------------------------------------------------------------------------------------------------

    // ---  Firing Authorization ---------------------------------------------------------------------------------------
    const sqlBurnCount = `
        SELECT SUM(COALESCE(total_focus, 0)) AS total_focus,
               SUM(COALESCE(authorized_focus, 0)) AS authorized_focus,
               SUM(COALESCE(unauthorized_focus, 0)) AS unauthorized_focus
        FROM (
            SELECT  COUNT(1) AS total_focus,
                    0 AS authorized_focus,
                    COUNT(1) AS  unauthorized_focus
            FROM public.${views.BURNED.children.CAR_X_FOCOS.table_name} car_focos
            WHERE   car_focos.${columnCarEstadual} = ${carRegister}
                AND car_focos.${columnExecutionDate} BETWEEN '${filter.date[0]}' AND '${filter.date[1]}'
                      
            UNION ALL
            
            SELECT  0 AS foco_total,
                    COUNT(1) AS authorized_focus,
                    COUNT(1)*(-1) AS  unauthorized_focus
            FROM public.${views.BURNED.children.CAR_FOCOS_X_QUEIMA.table_name} AS CAR_FOCOS_X_QUEIMA
            WHERE  CAR_FOCOS_X_QUEIMA.${views.BURNED.children.CAR_X_FOCOS.table_name}_${columnCarEstadual} = ${carRegister}
               AND '${filter.date[0]}' <= CAR_FOCOS_X_QUEIMA.de_autorizacao_queima_sema_data_apro1
               AND '${filter.date[0]}' >= CAR_FOCOS_X_QUEIMA.de_autorizacao_queima_sema_data_venc1
        ) AS CAR_X_FOCOS_X_QUEIMA
    `;
    const resultBurnCount = await Report.sequelize.query(sqlBurnCount, QUERY_TYPES_SELECT);
    propertyData['burnCount'] = resultBurnCount[0];
    // -----------------------------------------------------------------------------------------------------------------

    // ---  historyBurnlight ---------------------------------------------------------------------------------------
    const sqlHistoryBurnlight = `
            SELECT  COUNT(1) AS total_focus,
                    0 AS authorized_focus,
                    0 AS  unauthorized_focus,
                    COUNT(1) filter(where to_char(car_focos.execution_date, 'MMDD') between '0715' and '0915') as prohibitive_period, -- Contando focos no periodo proibitivo
                    (EXTRACT(YEAR FROM car_focos.execution_date))::INT AS month_year_occurrence
            FROM public.${views.BURNED.children.CAR_X_FOCOS.table_name} car_focos
            WHERE car_focos.${columnCarEstadual} = ${carRegister}
                AND car_focos.${columnExecutionDate} BETWEEN '2008-01-01T00:00:00.000Z' AND '${filter.date[1]}'
            GROUP BY month_year_occurrence
            ORDER BY month_year_occurrence
    `;
    const resultHistoryBurnlight = await Report.sequelize.query(sqlHistoryBurnlight, QUERY_TYPES_SELECT);
    propertyData['historyBurnlight'] = resultHistoryBurnlight;
    // -----------------------------------------------------------------------------------------------------------------
  }

  return await propertyData;
};

setBurnedAreaData = async function(type, views, propertyData, dateSql, columnCarEstadual, columnCalculatedAreaHa, columnCarEstadualSemas, columnExecutionDate, carRegister) {
  if (propertyData && views.BURNED_AREA && type === 'queimada') {
    const sqlBurnedAreas = `
      SELECT
        ROUND(COALESCE(SUM(CAST(areaq.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS burnedAreas,
        extract('YEAR' FROM areaq.${columnExecutionDate}) AS date
      FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.table_name} AS areaq
      INNER JOIN public.${views.STATIC.children.CAR_VALIDADO.table_name} AS car on
      areaq.${columnCarEstadual} = car.${columnCarEstadualSemas} AND
      car.${columnCarEstadualSemas} = '${carRegister}'
      group by date
    `;

    const resultBurnedAreas = await Report.sequelize.query(sqlBurnedAreas, QUERY_TYPES_SELECT);
    const burnedAreas = resultBurnedAreas;

    const sqlBurnedAreasYear = `
      SELECT
        extract(year from date_trunc('year', areaq.${columnExecutionDate})) AS date,
        ROUND(COALESCE(SUM(CAST(areaq.${columnCalculatedAreaHa}  AS DECIMAL)), 0), 4) AS burnedAreas
      FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.table_name} AS areaq
      WHERE areaq.${columnCarEstadual} = '${carRegister}'
      GROUP BY date
      ORDER BY date`;

    const resultBurnedAreasYear = await Report.sequelize.query(sqlBurnedAreasYear, QUERY_TYPES_SELECT);
    const burnedAreasYear = resultBurnedAreasYear;
    const sqlAPPBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_APP.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLegalReserveBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_RESERVA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlIndigenousLandBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_TI.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlExploraBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EXPLORA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlDesmateBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESMATE.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlEmbargoedAreaBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_EMB.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlLandAreaBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_DESEMB.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;

    const sqlRestrictUseBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_USO_RESTRITO.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    const sqlBurnAuthorizationBURNEDAREASum = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_QUEIMA.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql}`;
    // const sqlFisionomiaBURNEDAREASum = `SELECT de_veg_radambr_fisionomia AS class, sum(CAST(${columnCalculatedAreaHa}  AS DECIMAL)) AS area FROM public.${views.BURNED_AREA.children.CAR_AQ_X_VEG_RADAM.table_name} where ${views.BURNED_AREA.tableOwner}_${columnCarEstadual} = '${carRegister}' ${dateSql} group by de_veg_radambr_fisionomia`

    const resultRestrictUseBURNEDAREASum = await Report.sequelize.query(sqlRestrictUseBURNEDAREASum, QUERY_TYPES_SELECT);
    const restrictUseBURNEDAREASum = resultRestrictUseBURNEDAREASum;

    const resultBurnAuthorizationBURNEDAREASum = await Report.sequelize.query(sqlBurnAuthorizationBURNEDAREASum, QUERY_TYPES_SELECT);
    const burnAuthorizationBURNEDAREASum = resultBurnAuthorizationBURNEDAREASum;

    // const resultFisionomiaBURNEDAREASum = await Report.sequelize.query(sqlFisionomiaBURNEDAREASum, QUERY_TYPES_SELECT);
    // const fisionomiaBURNEDAREASum = resultFisionomiaBURNEDAREASum;

    const resultAPPBURNEDAREASum = await Report.sequelize.query(sqlAPPBURNEDAREASum, QUERY_TYPES_SELECT);
    const aPPBURNEDAREASum = resultAPPBURNEDAREASum;

    const resultLegalReserveBURNEDAREASum = await Report.sequelize.query(sqlLegalReserveBURNEDAREASum, QUERY_TYPES_SELECT);
    const legalReserveBURNEDAREASum = resultLegalReserveBURNEDAREASum;

    const resultIndigenousLandBURNEDAREASum = await Report.sequelize.query(sqlIndigenousLandBURNEDAREASum, QUERY_TYPES_SELECT);
    const indigenousLandBURNEDAREASum = resultIndigenousLandBURNEDAREASum;

    const resultExploraBURNEDAREASum = await Report.sequelize.query(sqlExploraBURNEDAREASum, QUERY_TYPES_SELECT);
    const explorationBURNEDAREASum = resultExploraBURNEDAREASum;

    const resultDesmateBURNEDAREASum = await Report.sequelize.query(sqlDesmateBURNEDAREASum, QUERY_TYPES_SELECT);
    const deforestationBURNEDAREASum = resultDesmateBURNEDAREASum;

    const resultEmbargoedAreaBURNEDAREASum = await Report.sequelize.query(sqlEmbargoedAreaBURNEDAREASum, QUERY_TYPES_SELECT);
    const embargoedAreaBURNEDAREASum = resultEmbargoedAreaBURNEDAREASum;

    const resultLandAreaBURNEDAREASum = await Report.sequelize.query(sqlLandAreaBURNEDAREASum, QUERY_TYPES_SELECT);
    const landAreaBURNEDAREASum = resultLandAreaBURNEDAREASum;

    propertyData['burnedAreas'] = burnedAreas;
    propertyData['burnedAreasYear'] = burnedAreasYear;

    let burnedAreaSum = 0;

    burnedAreaSum += aPPBURNEDAREASum[0]['area'] ? aPPBURNEDAREASum[0]['area'] : 0;
    burnedAreaSum += legalReserveBURNEDAREASum[0]['area'] ? legalReserveBURNEDAREASum[0]['area'] : 0;
    burnedAreaSum += indigenousLandBURNEDAREASum[0]['area'] ? indigenousLandBURNEDAREASum[0]['area'] : 0;
    burnedAreaSum += deforestationBURNEDAREASum[0]['area'] ? deforestationBURNEDAREASum[0]['area'] : 0;
    burnedAreaSum += embargoedAreaBURNEDAREASum[0]['area'] ? embargoedAreaBURNEDAREASum[0]['area'] : 0;
    burnedAreaSum += landAreaBURNEDAREASum[0]['area'] ? landAreaBURNEDAREASum[0]['area'] : 0;

    if (!propertyData['tableData']){ propertyData['tableData'] = {}; }
    propertyData['tableData']['affectedArea'] = 'APP';
    propertyData['tableData']['burnAreas'] = parseFloat(aPPBURNEDAREASum[0]['area'] | 0);

    if (!propertyData['prodesLegalReserve']){ propertyData['prodesLegalReserve'] = {}; }
    propertyData['prodesLegalReserve']['affectedArea'] = 'ARL';
    propertyData['prodesLegalReserve']['burnAreas'] =  parseFloat(legalReserveBURNEDAREASum[0]['area'] | 0);

    if (!propertyData['prodesRestrictedUse']){ propertyData['prodesRestrictedUse'] = {}; }
    propertyData['prodesRestrictedUse']['affectedArea'] = 'AUR';
    propertyData['prodesRestrictedUse']['burnAreas'] = parseFloat(restrictUseBURNEDAREASum[0]['area'] | 0);

    if (!propertyData['prodesIndigenousLand']){ propertyData['prodesIndigenousLand'] = {}; }
    propertyData['prodesIndigenousLand']['affectedArea'] = 'TI';
    propertyData['prodesIndigenousLand']['burnAreas'] = parseFloat(indigenousLandBURNEDAREASum[0]['area']);

    if (!propertyData['prodesExploration']){ propertyData['prodesExploration'] = {}; }
    propertyData['prodesExploration']['affectedArea'] = 'AUTEX';
    propertyData['prodesExploration']['burnAreas'] = parseFloat(explorationBURNEDAREASum[0]['area']);

    if (!propertyData['prodesDeforestation']){ propertyData['prodesDeforestation'] = {}; }
    propertyData['prodesDeforestation']['affectedArea'] = 'AD';
    propertyData['prodesDeforestation']['burnAreas'] = parseFloat(deforestationBURNEDAREASum[0]['area']);

    if (!propertyData['prodesEmbargoedArea']){ propertyData['prodesEmbargoedArea'] = {}; }
    propertyData['prodesEmbargoedArea']['affectedArea'] = 'Área embargada';
    propertyData['prodesEmbargoedArea']['burnAreas'] = parseFloat(embargoedAreaBURNEDAREASum[0]['area']);

    if (!propertyData['prodesLandArea']){ propertyData['prodesLandArea'] = {}; }
    propertyData['prodesLandArea']['affectedArea'] = 'Área desembargada';
    propertyData['prodesLandArea']['burnAreas'] = parseFloat(landAreaBURNEDAREASum[0]['area']);

    if (!propertyData['prodesBurnAuthorization']){ propertyData['prodesBurnAuthorization'] = {}; }
    propertyData['prodesBurnAuthorization']['affectedArea'] = 'AQ';
    propertyData['prodesBurnAuthorization']['burnAreas'] = parseFloat(burnAuthorizationBURNEDAREASum[0]['area']);

    if (!propertyData['foundBurnlight']) {
      propertyData['foundBurnlight'] = !!burnedAreaSum
    }
  }

  return await propertyData;
};

getContextChartNdvi = async function(chartImages, startDate, endDate) {
  const ndviContext = [];
  if (chartImages && (chartImages.length > 0)) {
    for (let i = 0; i < chartImages.length; ++i) {
      if (i === 0) {
        ndviContext.push({text: '', pageBreak: 'after'});
        ndviContext.push(
            {
              columns: [{
                text: `Os gráficos a seguir representam os NDVI das áreas de desmatamento do PRODES no imóvel no período de ${dateFormat(startDate)} a ${dateFormat(endDate)}.`,
                margin: [30, 20, 30, 15],
                style: 'body'
              }]
            });
      } else {
        ndviContext.push({text: '', pageBreak: 'after'});
      }
      ndviContext.push({columns: [chartImages[i].geoserverImageNdvi]});
      ndviContext.push({columns: [chartImages[i].myChart]});
    }
    ndviContext.push(
        {
          text: '',
          pageBreak: 'after'
        }
    )
  }
  return ndviContext;
}

getContextDesflorestationHistory = async function(deflorestationHistory, urlGsDeforestationHistory) {
  const deflorestationHistoryContext = [];

  if (deflorestationHistory && deflorestationHistory.length > 0) {
    let images = [];
    let titles = [];
    let subTitles = [];

    deflorestationHistoryContext.push({
      text: '',
      pageBreak: 'after'
    });

    for (let i = 0; i < deflorestationHistory.length; ++i) {
      let url = urlGsDeforestationHistory.replace(new RegExp('#{image}#', ''), `LANDSAT_5_${deflorestationHistory[i].date}`);
      url = url.replace(new RegExp('#{year}#', ''), deflorestationHistory[i].date);

      let image = await axios.get(url, config).then(resp => resp);
      let buff = new Buffer(image.data, 'binary');
      let imgBase64 = `data:image/png;base64,${buff.toString('base64')}`;

      images.push(getImageObject([`data:image/png;base64,${fs.readSync(image.data, 'base64')}`], [200, 200], [0, 10], 'center'));
      titles.push({
        text: `${deflorestationHistory[i].date}`,
        style: 'body',
        alignment: 'center'
      });
      subTitles.push({
        text: `${deflorestationHistory[i].area} ha`,
        style: 'body',
        alignment: 'center'
      });

      if ((i % 3) === 0) {
        deflorestationHistoryContext.push(
          {
            columns: titles,
            margin: [30, 0, 30, 0]
          },
          {
            columns: images,
            margin: [30, 0, 30, 0]
          },
          {
            columns: subTitles,
            margin: [30, 0, 30, 0]
          }
        );

        images = [];
        titles = [];
        subTitles = [];
      }
    }

    deflorestationHistoryContext.push( {
      text: '',
      pageBreak: 'after'
    });
  }

  return deflorestationHistoryContext;
}

getDesflorestationHistoryAndChartNdviContext = async function(docDefinitionContent, reportData) {
  const startDate = new Date(reportData.date[0]).toLocaleDateString('pt-BR');
  const endDate = new Date(reportData.date[1]).toLocaleDateString('pt-BR');

  const content = [];
  for (let j = 0; j < docDefinitionContent.length; j++) {
    if (j === 98) {
      reportData.desflorestationHistoryContext.forEach(desflorestationHistory => {
        content.push(desflorestationHistory);
      });

      const ndviContext = await getContextChartNdvi(reportData['chartImages'], startDate, endDate);
      ndviContext.forEach(ndvi => {
        content.push(ndvi);
      });
    }

    content.push(docDefinitionContent[j]);
  }

  return content;
}

getContentForDeflorestionAlertsContext = async function(docDefinitionContent, deflorestationAlertsContext) {
  const content = [];

  for (let j = 0; j < docDefinitionContent.length; j++) {
    if (j === 65) {
      deflorestationAlertsContext.forEach(deflorestationAlerts => {
        content.push(deflorestationAlerts);
      });
    }

    content.push(docDefinitionContent[j]);
  }

  return content;
}

getConclusion = async function(conclusionText) {
  const firstLineMargin = 152;
  const margin = 30;
  const numberOfCharactersInTheFirstLine = 70;
  const conclusionParagraphs = conclusionText ? conclusionText.split('\n') : [ 'XXXXXXXXXXXXX.' ];
  const conclusion = [];

  for(let i = 0; i < conclusionParagraphs.length; i++) {
    const alignment = conclusionParagraphs[i].length > numberOfCharactersInTheFirstLine ? 'right' : 'left';

    const paragraph =  [];

    let firstLine = conclusionParagraphs[i].substring(0, numberOfCharactersInTheFirstLine).trim();

    let numberOfCharacters = 0;
    if ((conclusionParagraphs[i].length > numberOfCharactersInTheFirstLine) && (conclusionParagraphs[i][numberOfCharactersInTheFirstLine + 1] !== '')) {
      for (let j = 0 ; j < numberOfCharactersInTheFirstLine - 1 ; j++) {
        numberOfCharacters++;
        if (firstLine[numberOfCharactersInTheFirstLine - numberOfCharacters] && firstLine[numberOfCharactersInTheFirstLine - numberOfCharacters].trim() === '') {
          firstLine = firstLine.substring(0, numberOfCharactersInTheFirstLine - numberOfCharacters).trim();
          j = numberOfCharactersInTheFirstLine;
        }
      }

      if (numberOfCharacters > 0) {
        let text = '';
        let number = 0;
        for (let j = 0 ; j < (firstLine.length); j++) {
          text += firstLine[j];
          if ((number < (numberOfCharacters - 5)) && (firstLine[j].trim() === '')) {
            text += ' ';
            number++;
          }
        }
        firstLine = text;
      }
    }

    if (firstLine.trim() !== '') {
      conclusion.push({
        text: `${firstLine}`,
        alignment: `${alignment}`,
        margin: [firstLineMargin, 0, margin, 0],
        style: 'body'
      });
    }

    if (conclusionParagraphs[i].length > numberOfCharactersInTheFirstLine) {
      const restOfText = conclusionParagraphs[i].substring(numberOfCharactersInTheFirstLine - numberOfCharacters).trim();
      if (restOfText.trim() !== '') {
        conclusion.push({
          text: `${restOfText}`,
          margin: [30, 0, 30, 5],
          style: 'body'
        });
      }
    }

  }
  return conclusion;
}

getContentConclusion = async function(docDefinitionContent, conclusionText, line) {
  const content = [];
  const conclusion = await getConclusion(conclusionText);
  for (let j = 0; j < docDefinitionContent.length; j++) {
    if (j === line) {
      conclusion.forEach(conclusionParagraph => {
        content.push(conclusionParagraph);
      });
    }

    content.push(docDefinitionContent[j]);
  }

  return content;
}

setDocDefinitions = async function(reportData, docDefinition) {
  if (reportData.type === 'prodes') {
    docDefinition.content = await getContentConclusion(docDefinition.content, reportData.property.comments, 99);
    docDefinition.content = await getDesflorestationHistoryAndChartNdviContext(docDefinition.content, reportData);
  }

  if (reportData.type === 'deter') {
    docDefinition.content = await getContentConclusion(docDefinition.content, reportData.property.comments, 66);
    docDefinition.content = await getContentForDeflorestionAlertsContext(docDefinition.content, reportData.deflorestationAlertsContext);
  }
  
  if (reportData.type === 'queimada') {
    docDefinition.content = await getContentConclusion(docDefinition.content, reportData.property.comments, 47);
  }

  return await docDefinition;
};

setImages = async function(reportData){
  if (!reportData['images']) { reportData.images = {}; }
  reportData['images']['headerImage0'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/mpmt-small.png', 'base64')}`], [320, 50], [60, 25, 0, 20], 'left')
  reportData['images']['headerImage1'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/logo-satelites-alerta-horizontal.png', 'base64')}`], [320, 50], [0, 25, 0, 0], 'left')
  reportData['images']['headerImage2'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/inpe.png', 'base64')}`], [320, 50], [0, 25, 70, 20], 'right')
  reportData['images']['chartImage1'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/report-chart-1.png', 'base64')}`], [200, 200], [0, 3], 'center')
  reportData['images']['chartImage2'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/report-chart-2.png', 'base64')}`], [250, 250], [3, 3], 'center');
  reportData['images']['chartImage3'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/report-chart-3.png', 'base64')}`], [250, 250], [3, 3], 'center');
  reportData['images']['partnerImage1'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/mpmt-small.png', 'base64')}`], [180, 50], [30, 0, 0, 0], 'left');
  reportData['images']['partnerImage2'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/pjedaou-large.png', 'base64')}`], [100, 50], [30, 0, 0, 0], 'center');
  reportData['images']['partnerImage3'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/caex.png', 'base64')}`], [80, 50], [30, 0, 25, 0], 'right');
  reportData['images']['partnerImage4'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/inpe.png', 'base64')}`], [130, 60], [80, 30, 0, 0], 'left');
  reportData['images']['partnerImage5'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/dpi.png', 'base64')}`], [100, 60], [95, 30, 0, 0], 'center');
  reportData['images']['partnerImage6'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/terrama2-large.png', 'base64')}`], [100, 60], [0, 30, 30, 0], 'right');
  reportData['images']['partnerImage7'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/mt.png', 'base64')}`], [100, 60], [80, 30, 0, 0], 'left');
  reportData['images']['partnerImage8'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/sema.png', 'base64')}`], [100, 60], [130, 25, 0, 0], 'center');
  reportData['images']['partnerImage9'] = getImageObject([`data:image/png;base64,${fs.readFileSync('assets/img/logos/logo-patria-amada-brasil-horizontal.png', 'base64')}`], [100, 60], [0, 30, 25, 0], 'right');
}

module.exports = FileReport = {
  async saveBase64(document, code, type, path, docName){
    const binaryData = new Buffer(document, 'base64').toString('binary')

    await fs.writeFile(path, binaryData, "binary", err => {
      if (err) {
        throw err;
      }
      logger.error(`Arquivo salvo em .. ${path}`);
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
      const confWhere = {where: { carGid: carCode.trim() }};

      return Result.ok(await Report.findAll(confWhere));
    } catch (e) {
      return Result.err(e);
    }
  },
  async generatePdf(reportData) {
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

      reportData['code'] = await this.newNumber(reportData.type.trim());
      const docName = `${reportData['code'].data[0].newnumber}_${reportData['code'].data[0].year.toString()}_${reportData['code'].data[0].type.trim()}.pdf`

      const printer = new PdfPrinter(fonts);
      const document = await this.getDocDefinitions(reportData);
      const pdfDoc = printer.createPdfKitDocument(document.docDefinitions);
      pdfDoc.pipe(await fs.createWriteStream(`${pathDoc}/${docName}`));
      pdfDoc.end();

      const report = await this.saveReport(docName, reportData['code'].data[0].newnumber, reportData, pathDoc);
      report['document'] = document; // await this.getDocDefinitions(reportData);

      return Result.ok(report)
    } catch (e) {
      return Result.err(e)
    }
  },
  async saveReport(docName, newNumber, reportData, path) {
    try {
      const report = new Report({
        name: docName.trim(),
        code: parseInt(newNumber),
        carCode: reportData['property'].register ? reportData['property'].register.trim() : reportData['property'].federalregister,
        carGid: reportData['property'].gid,
        path: path.trim(),
        type: reportData['type'].trim() })

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
        logger.error(`Arquivo ${report.dataValues.path}/${report.dataValues.name} excluído com sucesso!`);
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
        logger.error(`Arquivo salvo em ..${document.path.trim()}/${docName.trim()}`);
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

    let filter = JSON.parse(query.filter);

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
      const columnCarFederal = 'de_car_validado_sema_numero_do2';
      const columnCalculatedAreaHa = 'calculated_area_ha';
      const columnExecutionDate = 'execution_date';

      const columnCarSemas = 'gid';
      const columnCar = `de_car_validado_sema_gid`;

      const tableName = views.STATIC.children.CAR_VALIDADO.table_name;

      let propertyData = await getCarData(
        tableName,
        views.STATIC.children.MUNICIPIOS.table_name,
        columnCarEstadualSemas,
        columnCarFederalSemas,
        columnAreaHaCar,
        carRegister);

      const dateSql = ` and ${columnExecutionDate}::date >= '${dateFrom}' AND ${columnExecutionDate}::date <= '${dateTo}'`;

      if(filter) {
        filter['date'] = date;
      } else {
        filter = { date: date };
      }
      await setDeterData(type, views, propertyData, dateSql, columnCar, columnCalculatedAreaHa, columnExecutionDate, carRegister, filter);
      await setProdesData(type, views, propertyData, dateSql, columnCar, columnCalculatedAreaHa, columnExecutionDate, carRegister);
      await setBurnedData(type, views, propertyData, dateSql, columnCar, columnCarSemas, columnExecutionDate, carRegister, filter);
      // await setBurnedAreaData(type, views, propertyData, dateSql, columnCar, columnCalculatedAreaHa, columnCarSemas, columnExecutionDate, carRegister);

      return Result.ok(await setReportFormat(propertyData, views, type, columnCar, columnCarSemas, date, filter));
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
      const columnCarFederal = 'de_car_validado_sema_numero_do2';
      const columnCalculatedAreaHa = 'calculated_area_ha';
      const columnExecutionDate = 'execution_date';

      const columnCarSemas = 'gid';
      const columnCar = `de_car_validado_sema_gid`;

      const tableName = views.STATIC.children.CAR_VALIDADO.table_name;

      const propertyData = await getCarData(
        tableName,
        views.STATIC.children.MUNICIPIOS.table_name,
        columnCarEstadualSemas,
        columnCarFederalSemas,
        columnAreaHaCar,
        carRegister);

      // --- Implements vision of Burned Area of CAR for year ----------------------------------------------------------
      const sqlBurnedAreasYear =
          ` SELECT
                  extract(year from date_trunc('year', areaq.${columnExecutionDate})) AS date,
                  COALESCE(SUM(CAST(areaq.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
            FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.table_name} areaq
            WHERE areaq.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const resultBurnedAreasYear = await Report.sequelize.query(sqlBurnedAreasYear, QUERY_TYPES_SELECT);
      const burnedAreasYear = resultBurnedAreasYear;
      // ---------------------------------------------------------------------------------------------------------------

      // ----- Area of Prodes for year---------------------------------------------------------------------------------------------------
      const sqlProdesYear =
          ` SELECT
                  extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
                  COALESCE(SUM(CAST(cp.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
            FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} cp
            WHERE cp.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const prodesYear = await Report.sequelize.query(sqlProdesYear, QUERY_TYPES_SELECT);
      // ---------------------------------------------------------------------------------------------------------------

      // ---------------------------------------------------------------------------------------------------------------
      const sqlDeterYear =
          ` SELECT
                  extract(year from date_trunc('year', cd.${columnExecutionDate})) AS date,
                  COALESCE(SUM(CAST(cd.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area
            FROM public.${views.DETER.children.CAR_X_DETER.table_name} cd
            WHERE cd.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const deterYear = await Report.sequelize.query(sqlDeterYear, QUERY_TYPES_SELECT);
      // ---------------------------------------------------------------------------------------------------------------

      // ---------------------------------------------------------------------------------------------------------------
      const sqlSpotlightsYear =
          ` SELECT
                  extract(year from date_trunc('year', cf.${columnExecutionDate})) AS date,
                  COUNT(cf.*) AS spotlights
            FROM public.${views.BURNED.children.CAR_X_FOCOS.table_name} cf
            WHERE cf.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const spotlightsYear = await Report.sequelize.query(sqlSpotlightsYear, QUERY_TYPES_SELECT);
      // ---------------------------------------------------------------------------------------------------------------

      const dateSql = ` AND ${columnExecutionDate}::date >= '${dateFrom}' AND ${columnExecutionDate}::date <= '${dateTo}'`;
      // ---------------------------------------------------------------------------------------------------------------
      const sqlProdesArea = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCar} = '${carRegister}' ${dateSql}`;
      const prodesArea = await Report.sequelize.query(sqlProdesArea, QUERY_TYPES_SELECT);

      const sqlProdesTotalArea = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} where ${columnCar} = '${carRegister}'`;
      const prodesTotalArea = await Report.sequelize.query(sqlProdesTotalArea, QUERY_TYPES_SELECT);
      // ---------------------------------------------------------------------------------------------------------------

      // ---- Detailed view of the property ----------------------------------------------------------------------------
      const sqlIndigenousLand = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const sqlConservationUnit= `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const sqlLegalReserve = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const sqlAPP = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const sqlAnthropizedUse = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOANT.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const sqlNativeVegetation = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_VEGNAT.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;

      const indigenousLand = await Report.sequelize.query(sqlIndigenousLand, QUERY_TYPES_SELECT);
      const conservationUnit = await Report.sequelize.query(sqlConservationUnit, QUERY_TYPES_SELECT);
      const legalReserve = await Report.sequelize.query(sqlLegalReserve, QUERY_TYPES_SELECT);
      const app = await Report.sequelize.query(sqlAPP, QUERY_TYPES_SELECT);
      const anthropizedUse = await Report.sequelize.query(sqlAnthropizedUse, QUERY_TYPES_SELECT);
      const nativeVegetation = await Report.sequelize.query(sqlNativeVegetation, QUERY_TYPES_SELECT);

      if (propertyData) {
        //---- Year of beginning and end of each analysis --------------------------------------------------------------
        const sqlDatesSynthesis = `
          SELECT 'prodesYear' AS key, MIN(prodes.ano) AS start_year, MAX(prodes.ano) AS end_year
          FROM ${views.DYNAMIC.children.PRODES.table_name} AS prodes
          UNION ALL
          SELECT 'deterYear'                                                    AS key,
                 MIN(extract(year from date_trunc('year', deter.date))) AS start_year,
                 MAX(extract(year from date_trunc('year', deter.date))) AS end_year
          FROM ${views.DYNAMIC.children.DETER.table_name} AS deter
          UNION ALL
          SELECT 'spotlightsYear'                                                        AS key,
                 MIN(extract(year from date_trunc('year', spotlights.data_hora_gmt))) AS start_year,
                 MAX(extract(year from date_trunc('year', spotlights.data_hora_gmt))) AS end_year
          FROM ${views.DYNAMIC.children.FOCOS_QUEIMADAS.table_name}  AS spotlights
          UNION ALL
          SELECT 'burnedAreaYear'                                                           AS key,
                 MIN(extract(year from date_trunc('year', burnedarea.timestamp))) AS start_year,
                 MAX(extract(year from date_trunc('year', burnedarea.timestamp))) AS end_year
          FROM ${views.DYNAMIC.children.AREAS_QUEIMADAS.table_name}  AS burnedarea;
        `;

        const datesSynthesis = await Report.sequelize.query(sqlDatesSynthesis, QUERY_TYPES_SELECT);

        datesSynthesis.forEach(years => {
          if (!propertyData['analysisPeriod']) { propertyData['analysisPeriod'] = { } }
          if (!propertyData['analysisPeriod'][years.key]) { propertyData['analysisPeriod'][years.key] = { }}

          propertyData['analysisPeriod'][years.key]['startYear'] = years.start_year;
          propertyData['analysisPeriod'][years.key]['endYear'] = years.end_year;
        });
        //--------------------------------------------------------------------------------------------------------------

        propertyData.prodesArea = prodesArea[0]['area'];
        propertyData.prodesTotalArea = prodesTotalArea[0]['area'];

        propertyData.deterYear = setAnalysisYear(deterYear, propertyData['analysisPeriod']['deterYear'], 'area');
        propertyData.prodesYear = setAnalysisYear(prodesYear, { startYear: 1999, endYear: propertyData['analysisPeriod']['prodesYear']['endYear'] }, 'area');
        propertyData.spotlightsYear = setAnalysisYear(spotlightsYear, propertyData['analysisPeriod']['spotlightsYear'], 'spotlights');
        propertyData.burnedAreasYear = setAnalysisYear(burnedAreasYear, propertyData['analysisPeriod']['burnedAreaYear'], 'area');

        propertyData.indigenousLand = indigenousLand[0];
        propertyData.conservationUnit = conservationUnit[0];
        propertyData.legalReserve = legalReserve[0];
        propertyData.app = app[0];
        propertyData.anthropizedUse = anthropizedUse[0];
        propertyData.nativeVegetation = nativeVegetation[0];
        // -------------------------------------------------------------------------------------------------------------

        //---- Focus and standardization of the bbox to display a square image -----------------------------------------
        propertyData['bbox'] = setBoundingBox(propertyData['bbox']);
        propertyData['citybbox'] = setBoundingBox(propertyData['citybbox']);
        propertyData['statebbox'] = setBoundingBox(propertyData['statebbox']);
        //--------------------------------------------------------------------------------------------------------------

        return Result.ok(propertyData);
      }
    } catch (e) {
      return Result.err(e)
    }
  },
  async getChartOptions(labels, data){
    return {
      type: 'line',
      data: {
        labels: labels,
        lineColor: 'rgb(10,5,109)',
        datasets: [{
          label: 'NDVI',
          data: data,
          backgroundColor: 'rgba(17,17,177,0)',
          borderColor: 'rgba(5,177,0,1)',
          showLine: true,
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: false,
        legend: {
          display: false
        }
      }
    };
  },
  async getPointsAlerts(query) {
    const {carRegister, date, type} = query;
    const views = await ViewUtil.getGrouped();

    const carColumn = 'gid';
    const carColumnSemas = 'de_car_validado_sema_gid';

    const groupType = {prodes: 'CAR_X_PRODES', deter: 'CAR_X_DETER', queimada: ''}

    const sql = `
        SELECT
               CAST(main_table.monitored_id AS integer),
               main_table.a_carprodes_1_id,
               ST_Y(ST_Centroid(main_table.intersection_geom)) AS "lat",
               ST_X(ST_Centroid(main_table.intersection_geom)) AS "long",
               extract(year from date_trunc('year', main_table.execution_date)) AS startYear,
               main_table.execution_date
        FROM public.${views[type.toUpperCase()].children[groupType[type]].table_name} AS main_table
        WHERE main_table.${carColumnSemas} = '${carRegister}'
          AND main_table.execution_date BETWEEN '${date[0]}' AND '${date[1]}'
          AND main_table.calculated_area_ha > 12
    `;

    const sqlBbox = `
      SELECT
            substring(ST_EXTENT(car.geom)::TEXT, 5, length(ST_EXTENT(car.geom)::TEXT) - 5) AS bbox
      FROM de_car_validado_sema AS car 
      WHERE car.${carColumn} = '${carRegister}'
      GROUP BY gid`;

    try {
      const carBbox = await Report.sequelize.query(sqlBbox, QUERY_TYPES_SELECT);
      const points = await Report.sequelize.query(sql, QUERY_TYPES_SELECT);

      let bbox = setBoundingBox((carBbox[0].bbox));

      const currentYear = new Date().getFullYear();
      for (let index = 0 ; index < points.length; index++) {
        points[index]['url'] = `${confGeoServer.baseHost}/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2_35:SENTINEL_2_2019,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view},${views.STATIC.children.CAR_X_USOCON.workspace}:${views.STATIC.children.CAR_X_USOCON.view},${views[type.toUpperCase()].children[groupType[type]].workspace}:${views[type.toUpperCase()].children[groupType[type]].view}&styles=,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_VALIDADO.view}_yellow_style,${views.STATIC.children.CAR_VALIDADO.workspace}:${views.STATIC.children.CAR_X_USOCON.view}_hatched_style,${views[type.toUpperCase()].children[groupType[type]].workspace}:${views[type.toUpperCase()].children[groupType[type]].view}_red_style&bbox=${bbox}&width=600&height=600&time=${points[index].startyear}/${currentYear}&cql_filter=RED_BAND>0;rid='${carRegister}';gid_car='${carRegister}';${views[type.toUpperCase()].children[groupType[type]].table_name}_id=${points[index].a_carprodes_1_id}&srs=EPSG:4674&format=image/png`;

        points[index]['options'] = await SatVegService
          .get({long: points[index].long, lat: points[index].lat },'ndvi', 3, 'wav', '', 'aqua')
          .then( async resp => {
            const labels = resp['listaDatas'];
            const data = resp['listaSerie'];
            logger.error(labels)
            logger.error(data)
            return this.getChartOptions(labels, data);
          });
      }

      return Result.ok(points);
    } catch (e) {
      return Result.err(e)
    }
  },
  async getBurnlightCharts(query) {
    try {
      const sql = "";
      const burnlightData = await Report.sequelize.query(sql, QUERY_TYPES_SELECT);
      const labels = burnlightData['labels'];
      const data = burnlightData['data']

      const options = this.getChartOptions(labels, data);
      return Result.ok(options);
    } catch (e) {
      return Result.err(e)
    }
  },
  async getDocDefinitions(reportData) {
    try {
      const code = reportData['code'] ? reportData['code'].data[0].code : `XXXXX/${reportData['currentYear']}`;
      const title =
        reportData['type'] === 'deter' ? `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº ${code}` :
          reportData['type'] === 'prodes' ? `RELATÓRIO TÉCNICO SOBRE DE DESMATAMENTO Nº ${code}` :
            reportData['type'] === 'queimada' ? `RELATÓRIO SOBRE CICATRIZ DE QUEIMADA Nº ${code}` :
              `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº XXXXX/${reportData['currentYear']}`;

      await setImages(reportData);

      const headerDocument = [
        reportData.images.headerImage0,
        reportData.images.headerImage1,
        reportData.images.headerImage2
      ];

      const docDefinitions = DocDefinitions[reportData['type']](headerDocument, reportData, title);

      return { docDefinitions: await setDocDefinitions(reportData, docDefinitions), headerDocument: headerDocument };
    } catch (e) {
      logger.error(e)
    }
  },
  async createPdf(reportData) {
    try {
      return Result.ok(await this.getDocDefinitions(reportData));
    } catch (e) {
      logger.error(e)
    }
  }
};
