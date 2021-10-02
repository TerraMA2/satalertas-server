const FiringCharts = require("../charts/firing-chart");
const {Report} = require("../models");
const fs = require("fs");
const config = require(__dirname + "/../config/config.json");
const BadRequestError = require("../errors/bad-request.error");
const Layer = require("../utils/layer.utils");
const formatter = require("../utils/formatter.utils");
const ReportType = require("../enum/report-types");
const geoserverService = require("./geoServer.service");
const carService = require("./car.service");
const reportUtil = require("../utils/report.utils");
const Filter = require("../utils/filter.utils");
const gsLayers = require("../enum/geoserver-layers");
const satVegService = require("../services/sat-veg.service");
const ProdesChart = require("../charts/prodes-chart");
const reportDAO = require("../dao/report.dao");

module.exports.getById = async (reportId) => {
  if (!reportId) {
    throw new BadRequestError("Report not found");
  }
  const report = await Report.findByPk(reportId);
  report.dataValues.base64 = fs.readFileSync(`${ report.path }${ report.name }`, "base64");
  return report;
};

module.exports.getByCarGid = async (carGid) => {
  if (!carGid) {
    throw new BadRequestError("Property not found");
  }
  const options = {
    where: {
      carGid
    }
  };
  return await Report.findAll(options);
};

module.exports.generatePdf = async (reportData) => {
  if (!reportData) {
    throw new BadRequestError("Report not found");
  }
  const pathDoc = `documentos/`;

  const code = await reportUtil.generateNumber(reportData.type.trim());
  const docName = `${ code.newNumber }_${ code.year.toString() }_${ code.type.trim() }.pdf`;
  reportData.code = code.newNumber;

  await reportUtil.generateReport(pathDoc, docName, reportData);
  const report = await reportUtil.saveReport(docName, code.newNumber, reportData, pathDoc);

  const document = fs.readFileSync(`${ pathDoc }${ docName }`, 'base64');
  return {
    name: report.name,
    document
  }
};

module.exports.getReport = async (carGid, date, type, filter) => {
  if (!carGid) {
    throw new BadRequestError("Property not found");
  }

  let reportData = {};
  filter = JSON.parse(filter);

  const startDate = new Date(date[0]).toLocaleDateString('pt-BR');
  const endDate = new Date(date[1]).toLocaleDateString('pt-BR');
  const today = new Date();
  const currentYear = today.getFullYear();
  const formattedFilterDate = `${ startDate } a ${ endDate }`;
  const code = `XXXXX/${ currentYear }`;

  const propertyData = await carService.getCarData(carGid);
  propertyData.area = formatter.formatHectare(propertyData.area);
  propertyData.lat = formatter.formatNumber(propertyData.lat);
  propertyData.long = formatter.formatNumber(propertyData.long);

  if (filter) {
    filter["date"] = date;
  } else {
    filter = {date: date};
  }

  if (type === ReportType.DETER) {
    const deterData = await getDeterData(carGid, filter);

    reportData = {...reportData, ...propertyData, ...deterData};

    reportData['images'] = await getDeterImages(reportData, filter);
  } else if (type === ReportType.PRODES) {
    const prodesData = await getProdesData(carGid, filter);

    reportData = {...reportData, ...propertyData, ...prodesData};

    reportData['images'] = await getProdesImages(reportData, date)
  } else if (type === ReportType.FIRING) {
    const burnedData = await getBurnedData(carGid, filter);

    reportData = {...reportData, ...propertyData, ...burnedData};

    reportData['images'] = await getBurnedImages(reportData, filter);
  }
  reportData.sat = 'XXXXXXXXXXXXX';
  reportData.code = code;
  reportData.date = date;
  reportData.type = type;
  reportData.formattedFilterDate = formattedFilterDate;
  reportData.currentYear = currentYear;
  reportData.currentDate = `${ ('0' + (today.getDate())).slice(-2) }/${ ('0' + (today.getMonth() + 1)).slice(-2) }/${ currentYear }`;

  const docDefinitions = reportUtil.getDocDefinitions(reportData);

  docDefinitions.content = await reportUtil.getContentConclusion(docDefinitions.content, reportData.comments);
  reportData = JSON.stringify(reportData);
  const reportBase64 = await reportUtil.getReportBase64(docDefinitions);
  return {
    reportBase64,
    reportData
  }
};

getDeterData = async (carGid, filter) => {
  let totalDeforestationArea = await reportDAO.getDeterTotalDeforestationArea(carGid, filter);

  totalDeforestationArea = formatter.formatHectare(totalDeforestationArea.area);

  const deforestationPerClass = await reportDAO.getDeterDeforestationPerClass(carGid, filter);
  deforestationPerClass.forEach(element => element.area = formatter.formatNumber(element.area));

  const deforestationAlerts = await reportDAO.getDeterDeforestationAlerts(carGid, filter);

  deforestationAlerts.forEach(deforestationAlert => {
    deforestationAlert.area = formatter.formatHectare(deforestationAlert.area);
    deforestationAlert.bbox = Layer.setBoundingBox(deforestationAlert.bbox);
  });

  return {
    totalDeforestationArea,
    deforestationPerClass,
    deforestationAlerts
  };
};

getProdesData = async (carGid, filter) => {
  let totalDeforestationArea = await reportDAO.getProdesTotalDeforestationArea(carGid, filter);

  totalDeforestationArea = formatter.formatHectare(totalDeforestationArea.area);

  const vegRadam = await reportDAO.getProdesVegRadam(carGid, filter);

  vegRadam.forEach((element) => element.area = formatter.formatHectare(element.area));

  let consolidateUseArea = await reportDAO.getProdesConsolidateUseArea(carGid, filter);

  consolidateUseArea = formatter.formatNumber(consolidateUseArea.area);

  const deforestationPerClass = await reportDAO.getProdesDeforestationPerClass(carGid, filter);

  deforestationPerClass.forEach(element => element.area = formatter.formatNumber(element.area));

  let deforestationByVegetationType = await reportDAO.getProdesDeforestationByVegetationType(carGid, filter);

  let areaText = "";
  if (deforestationByVegetationType && deforestationByVegetationType.length > 0) {
    deforestationByVegetationType.forEach((element, index) => {
      const {area, className} = element;
      if (index !== 0) {
        areaText += '\n'
      }
      areaText += `${ className }: ${ formatter.formatNumber(area) }`;
    });
  }

  deforestationByVegetationType = {
    className: "Vegetação RADAM BR",
    area: areaText
  };

  const deforestationByYear = await reportDAO.getProdesDeforestationByYear(carGid, filter);

  deforestationByYear.forEach(element => element.area = formatter.formatNumber(element.area));

  deforestationByYear.push({
    year: 'Total',
    area: totalDeforestationArea
  });

  const deforestationPeriod = await reportDAO.getDeforestationPeriod(carGid, filter);

  const deforestationHistory = await reportDAO.getDeforestationHistory(carGid, filter);

  return {
    totalDeforestationArea,
    vegRadam,
    consolidateUseArea,
    deforestationPerClass,
    deforestationByVegetationType,
    deforestationByYear,
    deforestationPeriod,
    deforestationHistory
  }
};

getBurnedData = async (carGid, filter) => {
  const burningAuthorization = await reportDAO.getBurningAuthorization(carGid, filter);

  let totalFireSpot = await reportDAO.getTotalFireSpot(carGid, filter);

  totalFireSpot = totalFireSpot.total;

  const fireSpotHistory = await reportDAO.getFireSpotHistory(carGid, filter);

  return {
    burningAuthorization,
    totalFireSpot,
    fireSpotHistory
  };
};

getDeterImages = async (reportData, filter) => {
  const images = {};
  const cql_filter_deter = `de_car_validado_sema_gid='${ reportData.gid }'${ Filter.getFilterClassSearch(filter, true) }`;
  const layers = [
    'terrama2_119:view119',
    'terrama2_67:view67'
  ];
  const filters = `cql_filter=rid='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`;
  reportData.vectorgroupViews = {layers, filters};

  images['propertyLocationImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.stateBBox }`,
    cql_filter: `geocodigo<>'';municipio='${ reportData.cityName }';numero_do1='${ reportData.stateRegister }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: 'terrama2_170:view170,terrama2_170:view170,terrama2_119:view119',
    styles: "",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['propertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['spotPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:MosaicSpot2008,terrama2_119:view119,terrama2_122:view122,terrama2_67:view67`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: `${ Filter.getDateFilterGeoserverSql(filter.date) }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['landsatPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:LANDSAT_8_2018,terrama2_119:view119,terrama2_122:view122,terrama2_67:view67`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: `${ Filter.getDateFilterGeoserverSql(filter.date) }`,
    width: `${ config.geoserver.imgWidth }`
  }), [200, 200], [0, 10], 'center');

  images['sentinelPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:SENTINEL_2_2019,terrama2_119:view119,terrama2_122:view122,terrama2_67:view67`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: `${ Filter.getDateFilterGeoserverSql(filter.date) }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['planetPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119,terrama2_122:view122,terrama2_67:view67`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: `${ Filter.getDateFilterGeoserverSql(filter.date) }`,
    height: `${ config.geoserver.imgHeight }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  let deforestationAlerts = reportData.deforestationAlerts;
  if (!deforestationAlerts) {
    deforestationAlerts = [];
  }
  for (const deforestationAlert of deforestationAlerts) {
    const bboxDeter = deforestationAlert.bbox.split(",");
    const yearBefore = deforestationAlert.year - 1;

    const view = yearBefore < 2013 ? "LANDSAT_5_" : yearBefore < 2017 ? "LANDSAT_8_" : "SENTINEL_2_";

    deforestationAlert['deforestationAlertYearBeforeImage'] = await geoserverService.getMapImage({
      bbox: `${ deforestationAlert.bbox }`,
      cql_filter: `RED_BAND>0;a_cardeter_31_id='${ deforestationAlert.id }'`,
      height: `${ config.geoserver.imgHeight }`,
      layers: `terrama2_35:${ view }${ yearBefore },terrama2_67:view67`,
      styles: `,terrama2_35:view35_Mod_style`,
      time: `P1Y/${ deforestationAlert.year }`,
      width: `${ config.geoserver.imgWidth }`
    });

    deforestationAlert['deforestationAlertCurrentYearImage'] = await geoserverService.getMapImageDETER({
          height: `${ config.geoserver.imgHeight }`,
          layers: `${ deforestationAlert.sat }_${ deforestationAlert.sensor }_${ deforestationAlert.pathRow }_${ deforestationAlert.dateCode }`,
          width: `${ config.geoserver.imgWidth }`,
          bbox: `${ bboxDeter[1].trim() },${ bboxDeter[0].trim() },${ bboxDeter[3].trim() },${ bboxDeter[2].trim() }`,
          transparent: "true",
          version: "1.3.0"
        },
        false
    );

    deforestationAlert['deforestationAlertPlanetCurrentYearImage'] = await geoserverService.getMapImage({
      bbox: `${ reportData.planetBBox }`,
      cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';a_cardeter_31_id='${ deforestationAlert.id }'`,
      height: `${ config.geoserver.imgHeight }`,
      layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119,terrama2_122:view122,terrama2_67:view67`,
      srs: `EPSG:${ config.geoserver.planetSRID }`,
      styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
      time: `P1Y/${ deforestationAlert.year }`,
      width: `${ config.geoserver.imgWidth }`
    });
  }
  return images;
};

getProdesImages = async (reportData, filterDate) => {
  const images = [];
  const layers = [
    `terrama2_119:view119`,
    `terrama2_35:view35`,
  ];
  const filters = `cql_filter=gid=${ reportData.gid };de_car_validado_sema_gid=${ reportData.gid }`;
  reportData.vectorgroupViews = {layers, filters};

  images['propertyLocationImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.stateBBox }`,
    cql_filter: `geocodigo<>'';municipio='${ reportData.cityName.replace("'", "''") }';numero_do1='${ reportData.stateRegister }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_170:view170,terrama2_170:view170,terrama2_119:view119`,
    styles: "",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['propertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['deforestationLegendImage'] = reportUtil.getImageObject(await geoserverService.getLegendImage({
    format: "image/png",
    height: "30",
    layer: `terrama2_119:CAR_VALIDADO_X_CAR_PRODES_X_USOCON`,
    version: "1.0.0",
    width: "30",
    legend_options: "forceLabels:on;forceTitles:off;layout:vertical;columns:2;fontSize:16",
  }), [200, 200], [0, 10], 'center');

  images['deforestationPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';de_car_validado_sema_gid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_yellow_style,terrama2_119:view122_hatched_style,terrama2_119:view106_color_style`,
    time: `${ reportData["deforestationPeriod"]["startYear"] }/${ reportData["deforestationPeriod"]["endYear"] }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['spotPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox.replace(/\\s /g, "") }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';de_car_validado_sema_gid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:MosaicSpot2008,terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: "P1Y/2019",
    width: `${ config.geoserver.imgWidth }`
  }), [200, 200], [0, 10], 'center');

  images['landsatPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';de_car_validado_sema_gid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:LANDSAT_8_2018,terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: "P1Y/2018",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['sentinelPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';de_car_validado_sema_gid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:SENTINEL_2_2019,terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    time: "P1Y/2019",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['planetPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }';gid_car='${ reportData.gid }';de_car_validado_sema_gid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  const deforestationHistory = reportData.deforestationHistory;
  let count = 0;
  for (const deforestation of deforestationHistory) {
    const {date} = deforestation;
    let view = date < 2013 ? "LANDSAT_5_" : date < 2017 ? "LANDSAT_8_" : "SENTINEL_2_";
    view = `${ view }${ date }`

    let layers = `terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`;
    let styles = `terrama2_119:view119_Mod_style,terrama2_119:view122_hatched_style,terrama2_35:view35_Mod_style`
    let cqlFilter = `rid='${ reportData.gid }';gid_car='${ reportData.gid }';de_car_validado_sema_gid='${ reportData.gid }'`;

    if (date !== 2012) {
      layers = `terrama2_35:${ view },${ layers }`
      styles = `,${ styles }`
      cqlFilter = `RED_BAND>0;${ cqlFilter }`
    }

    deforestation[`deforestationHistoryImage${ count }`] = reportUtil.getImageObject(await geoserverService.getMapImage({
      layers,
      styles,
      cql_filter: cqlFilter,
      bbox: `${ reportData.bbox }`,
      width: `${ config.geoserver.imgWidth }`,
      height: `${ config.geoserver.imgHeight }`,
      time: `P1Y/${ date }`
    }), [117, 117], [5, 0], "center");
    count++;
  }

  images['ndviImages'] = await this.getNDVI(reportData.gid, filterDate);
  return images;
};

getBurnedImages = async (reportData, filter) => {
  const images = [];
  const layers = [
    'terrama2_119:view119',
    'terrama2_182:view182'
  ];
  const filters = `cql_filter=gid=${ reportData.gid };de_car_validado_sema_gid=${ reportData.gid }`;
  reportData.vectorgroupViews = {layers, filters};

  images['propertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;rid='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['propertyFireSpotsImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;gid=${ reportData.gid };de_car_validado_sema_gid=${ reportData.gid }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_119:planet_latest_global_monthly,terrama2_119:view119,terrama2_182:view182`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,terrama2_119:view119_Mod_style,terrama2_182:view182_style`,
    time: `${ Filter.getDateFilterGeoserverSql(filter.date) }`,
    width: `${ config.geoserver.imgWidth }`
  }), [180, 180], [0, 10], 'center');

  const charts = [];
  charts["fireSpotHistoryChart"] = reportUtil.getImageObject(
      await FiringCharts.historyFireSpot(reportData.fireSpotHistory).toDataUrl(),
      [450, 450],
      [0, 10],
      "center"
  );
  charts["fireSpotDeforestationChart"] = reportUtil.getImageObject(
      await FiringCharts.chartBase64(reportData.gid),
      [450, 200],
      [0, 0],
      "center",
  );

  images.charts = charts;
  return images;
};

module.exports.getNDVI = async (carGid, date) => {
  const {planetSRID} = config.geoserver;

  const ndvi = await reportDAO.getNDVI(carGid, date);
  const { carBbox, deforestationAlerts } = ndvi;

  let bbox = Layer.setBoundingBox(carBbox.bbox);

  const currentYear = new Date().getFullYear();
  const ndviImages = [];
  for (const deforestationAlert of deforestationAlerts) {
    const gsConfig = {
      bbox: `${ bbox }`,
      cql_filter: `RED_BAND>0;rid='${ carGid }';gid_car='${ carGid }';a_carprodes_1_id=${ deforestationAlert.id }`,
      height: config.geoserver.imgHeight,
      layers: `${ gsLayers.image.PLANET_LATEST },terrama2_119:view119,terrama2_122:view122,terrama2_35:view35`,
      srs: `EPSG:${ planetSRID }`,
      styles: `,terrama2_119:view119_yellow_style,terrama2_119:view122_hatched_style,terrama2_35:view35_red_style`,
      time: `${ deforestationAlert.startYear }/${ currentYear }`,
      width: config.geoserver.imgWidth,
    };

    const geoserverImage = reportUtil.getImageObject(await geoserverService.getMapImage(gsConfig), [200, 200], [10, 70], "center");
    const options = await satVegService
        .get({
          long: deforestationAlert.long,
          lat: deforestationAlert.lat
        }, "ndvi", 3, "wav", "", "aqua")
        .then(({listaDatas, listaSerie}) => ProdesChart.getChartOptions(listaDatas, listaSerie));
    const image = await ProdesChart.chartBase64(options);
    const ndviChartImage = reportUtil.getImageObject(image, [500, 500], [10, 0], "center");
    ndviImages.push({
      ndviChartImage,
      geoserverImage,
      options
    })
  }
  return ndviImages;
}
