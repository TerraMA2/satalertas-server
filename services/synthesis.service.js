const {sequelize} = require('../models');
const geoServerService = require("../services/geoServer.service");
const config = require(__dirname + '/../config/config.json');
const synthesisConfig = require(__dirname + `/../config/${ config.project }/synthesis.json`);
const {QueryTypes} = require("sequelize");
const BadRequestError = require('../errors/bad-request.error');
const carService = require('./car.service');
const Filter = require('../utils/filter.utils');
const formatter = require("../utils/formatter.utils");

getSynthesisHistory = async (options) => {
  let {
    data,
    period,
    layers,
    bbox,
    cqlFilter,
    styles,
    title,
    descriptionPrefix,
    descriptionSuffix,
    landsatLayers,
    propertyData
  } = options;
  const analysisHistory = [];
  for (let year = period['startYear']; year <= period['endYear']; year++) {
    let filteredLayers = layers;
    let filteredCqlFilter = cqlFilter;
    let filteredStyles = styles;
    if (landsatLayers) {
      if (landsatLayers.hasOwnProperty(year)) {
        filteredLayers = layers.replace(/{landsatLayer}/g, landsatLayers[year]);
      } else {
        filteredLayers = layers.split(',').slice(1).join(',');
        filteredCqlFilter = cqlFilter.split(';').slice(1).join(';');
        if (styles) {
          filteredStyles = styles.split(',').slice(1).join(',');
        }
      }
    }

    if (propertyData) {
      filteredCqlFilter = filteredCqlFilter.replace(/{rid}/g, propertyData.gid);
      filteredCqlFilter = filteredCqlFilter.replace(/{gid}/g, propertyData.gid);
      filteredCqlFilter = filteredCqlFilter.replace(/{cityName}/g, propertyData.cityName);
    }
    const time = `${ year }/P1Y`
    const image = await geoServerService.getMapImage({
      layers: filteredLayers,
      bbox,
      time,
      cql_filter: filteredCqlFilter,
      styles: filteredStyles,
      width: 400,
      height: 400
    });
    const analysisData = data && data.length > 0 ? data.find(analysis => analysis.year === year) : null;
    const value = analysisData ? formatter.formatNumber(analysisData.value) : formatter.formatNumber(0);

    analysisHistory.push({
      title: `${ title } ${ year }`,
      image,
      description: `${ descriptionPrefix } ${ year }: ${ value } ${ descriptionSuffix }`,
      year,
      value: value.split(' ').splice(0, 1).join('')
    });
  }
  return analysisHistory;
};

getSynthesisCard = async (options) => {
  let {
    data,
    layers,
    bbox,
    cqlFilter,
    time,
    date,
    style,
    title,
    descriptionPrefix,
    descriptionSuffix,
    propertyData
  } = options;

  if (date) {
    title = title.replace(/{filterDate}/g, date);
  }
  if (propertyData) {
    cqlFilter = cqlFilter.replace(/{rid}/g, propertyData.gid);
    cqlFilter = cqlFilter.replace(/{gid}/g, propertyData.gid);
    cqlFilter = cqlFilter.replace(/{cityName}/g, propertyData.cityName);
  }
  const image = await geoServerService.getMapImage({
    layers,
    bbox,
    time,
    cql_filter: cqlFilter,
    styles: style,
    width: 400,
    height: 400
  });
  const area = data ? formatter.formatNumber(data.area) : formatter.formatNumber(0);
  const description = data ? `${ descriptionPrefix } ${ area } ${ descriptionSuffix }` : '';
  return {
    title,
    image,
    description
  }
};

getChartData = (chartData, legends) => {
  const years = [];
  const values = [];
  if (chartData && chartData.length > 0) {
    chartData.forEach(data => {
      const value = parseFloat(data.value);
      const year = data.year;
      years.push(year);
      values.push(value);
    });
  }
  return getChartJson(legends, years, values);
}

getPerPropertyChart = (chartData, propertyArea, label) => {
  if (chartData && chartData.length > 0) {
    const chartDataPerProperty = chartData.map(data => [propertyArea, parseFloat(data.value)]);
    return chartDataPerProperty.map(data => getChartJson([data.year], ['Área imóvel', label], data));
  }
}

getChartJson = (legends, labels, data) => {
  if (!Array.isArray(labels)) {
    labels = [labels];
  }
  const backgroundColors = labels.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16));
  return {
    labels,
    datasets: [
      {
        label: legends,
        backgroundColor: backgroundColors,
        data
      }
    ]
  };
}

module.exports.getPropertyData = async (carGId) => {
  if (!carGId) {
    throw new BadRequestError('CAR not found');
  }
  return await carService.getCarData(carGId);
}

module.exports.getVisions = async (carGId, date) => {
  const [startDate, endDate] = date;
  const geoserverTime = `${ startDate }/${ endDate }`;
  const formattedFilterDate = `${ new Date(startDate).toLocaleDateString('pt-BR') } - ${ new Date(endDate).toLocaleDateString('pt-BR') }`;

  const propertyData = await this.getPropertyData(carGId);

  const cardsConfig = synthesisConfig.cards;
  const visionsConfig = cardsConfig.visions;

  const stateVisionCard = await getSynthesisCard({
    data: null,
    layers: visionsConfig.state.layers,
    bbox: propertyData.stateBBox,
    cqlFilter: visionsConfig.state.cqlFilter,
    time: geoserverTime,
    title: visionsConfig.state.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });

  const cityVisionCard = await getSynthesisCard({
    data: null,
    layers: visionsConfig.city.layers,
    bbox: propertyData.cityBBox,
    cqlFilter: visionsConfig.city.cqlFilter,
    time: geoserverTime,
    title: visionsConfig.city.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });
  const deterAlertVisionCard = await getSynthesisCard({
    data: null,
    layers: visionsConfig.deterAlert.layers,
    bbox: propertyData.bbox,
    cqlFilter: visionsConfig.deterAlert.cqlFilter,
    time: geoserverTime,
    date: formattedFilterDate,
    title: visionsConfig.deterAlert.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });
  const ambientalDegradationVisionCard = await getSynthesisCard({
    data: null,
    layers: visionsConfig.ambientalDegradation.layers,
    bbox: propertyData.bbox,
    cqlFilter: visionsConfig.ambientalDegradation.cqlFilter,
    time: geoserverTime,
    date: formattedFilterDate,
    title: visionsConfig.ambientalDegradation.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });
  const deforestationVisionCard = await getSynthesisCard({
    data: null,
    layers: visionsConfig.deforestation.layers,
    bbox: propertyData.bbox,
    cqlFilter: visionsConfig.deforestation.cqlFilter,
    time: geoserverTime,
    date: formattedFilterDate,
    title: visionsConfig.deforestation.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });
  const burnedAreaVisionCard = await getSynthesisCard({
    data: null,
    layers: visionsConfig.burnedArea.layers,
    bbox: propertyData.bbox,
    cqlFilter: visionsConfig.burnedArea.cqlFilter,
    time: geoserverTime,
    date: formattedFilterDate,
    title: visionsConfig.burnedArea.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });

  return [
    stateVisionCard,
    cityVisionCard,
    deterAlertVisionCard,
    ambientalDegradationVisionCard,
    deforestationVisionCard,
    burnedAreaVisionCard
  ];
}

module.exports.getLegends = async () => {
  const cardsConfig = synthesisConfig.cards;
  const legendsConfig = cardsConfig.legends;
  const municipalBoundariesLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.municipalBoundaries.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const nativeVegetationAreaLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.nativeVegetationArea.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const indigenousLandLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.indigenousLand.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const appAreaLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.appArea.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const consolidatedUseAreaLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.consolidatedUseArea.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const carLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.car.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const anthropizedUseLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.anthropizedUse.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const carDeterLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.carDeter.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const legalreserveLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.legalreserve.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });
  const carProdesLegend = await geoServerService.getLegendImage({
    layer: legendsConfig.carProdes.layer,
    width: 20,
    height: 20,
    legend_options: 'forceLabels:on'
  });

  return [
    municipalBoundariesLegend,
    nativeVegetationAreaLegend,
    indigenousLandLegend,
    appAreaLegend,
    consolidatedUseAreaLegend,
    carLegend,
    anthropizedUseLegend,
    carDeterLegend,
    legalreserveLegend,
    carProdesLegend
  ];
}

module.exports.getDetailedVisions = async (carGId, date) => {
  const propertyData = await this.getPropertyData(carGId)

  const cardsConfig = synthesisConfig.cards;
  const detailedVisionsConfig = cardsConfig.detailedVisions;
  const titleDetailedVisions = detailedVisionsConfig.title

  const indigenousLandSql = `SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area FROM public.a_carprodes_ti_7 where a_carprodes_1_de_car_validado_sema_gid = '${ carGId }' ${ Filter.getDateFilterSql(date) }`;
  const conservationUnitSql = `SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area FROM public.a_carprodes_uc_8 where a_carprodes_1_de_car_validado_sema_gid = '${ carGId }' ${ Filter.getDateFilterSql(date) }`;
  const legalReserveSql = `SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area FROM public.a_carprodes_reserva_64 where a_carprodes_1_de_car_validado_sema_gid = '${ carGId }' ${ Filter.getDateFilterSql(date) }`;
  const aPPSql = `SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area FROM public.a_carprodes_app_67 where a_carprodes_1_de_car_validado_sema_gid = '${ carGId }' ${ Filter.getDateFilterSql(date) }`;
  const anthropizedUseSql = `SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area FROM public.a_carprodes_usoant_3 where a_carprodes_1_de_car_validado_sema_gid = '${ carGId }' ${ Filter.getDateFilterSql(date) }`;
  const nativeVegetationSql = `SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area FROM public.a_carprodes_veg_5 where a_carprodes_1_de_car_validado_sema_gid = '${ carGId }' ${ Filter.getDateFilterSql(date) }`;

  let indigenousLand = await sequelize.query(
      indigenousLandSql,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
  );
  let conservationUnit = await sequelize.query(
      conservationUnitSql,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
  );
  let legalReserve = await sequelize.query(
      legalReserveSql,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
  );
  let app = await sequelize.query(
      aPPSql,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
  );
  let anthropizedUse = await sequelize.query(
      anthropizedUseSql,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
  );
  let nativeVegetation = await sequelize.query(
      nativeVegetationSql,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
  );

  const indigenousLandCard = await getSynthesisCard({
    data: indigenousLand,
    layers: detailedVisionsConfig.indigenousLand.layers,
    bbox: propertyData.bbox,
    cqlFilter: detailedVisionsConfig.indigenousLand.cqlFilter,
    time: Filter.getDateFilterGeoserverSql(date),
    title: detailedVisionsConfig.indigenousLand.title,
    descriptionPrefix: detailedVisionsConfig.indigenousLand.descriptionPrefix,
    descriptionSuffix: detailedVisionsConfig.indigenousLand.descriptionSuffix,
    propertyData
  });

  const conservationUnitCard = await getSynthesisCard({
    data: conservationUnit,
    layers: detailedVisionsConfig.conservationUnit.layers,
    bbox: propertyData.bbox,
    cqlFilter: detailedVisionsConfig.conservationUnit.cqlFilter,
    time: Filter.getDateFilterGeoserverSql(date),
    title: detailedVisionsConfig.conservationUnit.title,
    descriptionPrefix: detailedVisionsConfig.conservationUnit.descriptionPrefix,
    descriptionSuffix: detailedVisionsConfig.conservationUnit.descriptionSuffix,
    propertyData
  });
  const legalReserveCard = await getSynthesisCard({
    data: legalReserve,
    layers: detailedVisionsConfig.legalReserve.layers,
    bbox: propertyData.bbox,
    cqlFilter: detailedVisionsConfig.legalReserve.cqlFilter,
    time: Filter.getDateFilterGeoserverSql(date),
    title: detailedVisionsConfig.legalReserve.title,
    descriptionPrefix: detailedVisionsConfig.legalReserve.descriptionPrefix,
    descriptionSuffix: detailedVisionsConfig.legalReserve.descriptionSuffix,
    propertyData
  });
  const appCard = await getSynthesisCard({
    data: app,
    layers: detailedVisionsConfig.app.layers,
    bbox: propertyData.bbox,
    cqlFilter: detailedVisionsConfig.app.cqlFilter,
    time: Filter.getDateFilterGeoserverSql(date),
    title: detailedVisionsConfig.app.title,
    descriptionPrefix: detailedVisionsConfig.app.descriptionPrefix,
    descriptionSuffix: detailedVisionsConfig.app.descriptionSuffix,
    propertyData
  });
  const anthropizedUseCard = await getSynthesisCard({
    data: anthropizedUse,
    layers: detailedVisionsConfig.anthropizedUse.layers,
    bbox: propertyData.bbox,
    cqlFilter: detailedVisionsConfig.anthropizedUse.cqlFilter,
    time: Filter.getDateFilterGeoserverSql(date),
    title: detailedVisionsConfig.anthropizedUse.title,
    descriptionPrefix: detailedVisionsConfig.anthropizedUse.descriptionPrefix,
    descriptionSuffix: detailedVisionsConfig.anthropizedUse.descriptionSuffix,
    propertyData
  });
  const nativeVegetationCard = await getSynthesisCard({
    data: nativeVegetation,
    layers: detailedVisionsConfig.nativeVegetation.layers,
    bbox: propertyData.bbox,
    cqlFilter: detailedVisionsConfig.nativeVegetation.cqlFilter,
    time: Filter.getDateFilterGeoserverSql(date),
    title: detailedVisionsConfig.nativeVegetation.title,
    descriptionPrefix: detailedVisionsConfig.nativeVegetation.descriptionPrefix,
    descriptionSuffix: detailedVisionsConfig.nativeVegetation.descriptionSuffix,
    propertyData
  });

  return {
    title: titleDetailedVisions,
    detailedVisions: [
      indigenousLandCard,
      conservationUnitCard,
      legalReserveCard,
      appCard,
      anthropizedUseCard,
      nativeVegetationCard
    ]
  }
}
module.exports.getDeforestation = async (carGId) => {
  const propertyData = await this.getPropertyData(carGId)

  const cardsConfig = synthesisConfig.cards;
  const deforestationConfig = cardsConfig.deforestation;
  const titleDeforestation = deforestationConfig.title

  const spotCard = await getSynthesisCard({
    data: null,
    layers: deforestationConfig.spot.layers,
    bbox: propertyData.bbox,
    cqlFilter: deforestationConfig.spot.cqlFilter,
    time: deforestationConfig.spot.time,
    styles: deforestationConfig.spot.styles,
    title: deforestationConfig.spot.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });
  const landsatCard = await getSynthesisCard({
    data: null,
    layers: deforestationConfig.landsat.layers,
    bbox: propertyData.bbox,
    cqlFilter: deforestationConfig.landsat.cqlFilter,
    time: deforestationConfig.landsat.time,
    styles: deforestationConfig.landsat.styles,
    title: deforestationConfig.landsat.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });
  const sentinelCard = await getSynthesisCard({
    data: null,
    layers: deforestationConfig.sentinel.layers,
    bbox: propertyData.bbox,
    cqlFilter: deforestationConfig.sentinel.cqlFilter,
    time: deforestationConfig.sentinel.time,
    styles: deforestationConfig.sentinel.styles,
    title: deforestationConfig.sentinel.title,
    descriptionPrefix: "",
    descriptionSuffix: "",
    propertyData
  });

  return {
    title: titleDeforestation,
    deforestation: [
      spotCard,
      landsatCard,
      sentinelCard
    ]
  };
}
module.exports.getDeterHistory = async (carGId) => {
  const propertyData = await this.getPropertyData(carGId);

  const cardsConfig = synthesisConfig.cards;
  const historiesConfig = cardsConfig.histories;
  const deterHistoryConfig = historiesConfig.deterHistory;
  const titleDeter = historiesConfig.titleDeter;

  const deterHistorySql = `
            SELECT extract(year from date_trunc('year', cd.execution_date)) AS year,
                   COALESCE(SUM(CAST(cd.calculated_area_ha AS DECIMAL)), 0) AS value
            FROM public.a_cardeter_31 cd
            WHERE cd.de_car_validado_sema_gid = '${ carGId }'
            GROUP BY year
            ORDER BY year
            `;

  const deterHistory = await sequelize.query(
      deterHistorySql,
      {type: QueryTypes.SELECT}
  );

  const periodSql = `
          SELECT MIN(extract(year from date_trunc('year', deter.date))) AS start_year,
                 MAX(extract(year from date_trunc('year', deter.date))) AS end_year
          FROM dd_deter_inpe AS deter
        `;

  const period = await sequelize.query(
      periodSql,
      {
        type: QueryTypes.SELECT,
        fieldMap: {
          start_year: 'startYear',
          end_year: 'endYear'
        },
        plain: true
      }
  );

  const historyDeterChartData = getChartData(deterHistory, 'DETER');

  return {
    title: titleDeter,
    deterHistory: await getSynthesisHistory(
        {
          data: deterHistory,
          period,
          layers: deterHistoryConfig.layers,
          bbox: propertyData.bbox,
          cqlFilter: deterHistoryConfig.cqlFilter,
          styles: "",
          title: deterHistoryConfig.title,
          descriptionPrefix: deterHistoryConfig.descriptionPrefix,
          descriptionSuffix: deterHistoryConfig.descriptionSuffix,
          propertyData
        }
    ),
    historyDeterChartData
  };
};
module.exports.getProdesHistory = async (carGId) => {
  const propertyData = await this.getPropertyData(carGId);

  const cardsConfig = synthesisConfig.cards;
  const historiesConfig = cardsConfig.histories;
  const prodesHistoryConfig = historiesConfig.prodesHistory;
  const landsatLayers = historiesConfig.landsatLayers;
  const titleProdes = historiesConfig.titleProdes;

  const prodesHistorySql = `
            SELECT extract(year from date_trunc('year', cd.execution_date)) AS year,
                   COALESCE(SUM(CAST(cd.calculated_area_ha AS DECIMAL)), 0) AS value
            FROM public.a_carprodes_1 cd
            WHERE cd.de_car_validado_sema_gid = '${ carGId }'
            GROUP BY year
            ORDER BY year
            `;

  const prodesHistory = await sequelize.query(
      prodesHistorySql,
      {type: QueryTypes.SELECT},
  );

  const periodSql = `
          SELECT MIN(prodes.ano) AS start_year,
                 MAX(prodes.ano) AS end_year
          FROM dd_prodes_inpe AS prodes
        `;

  const period = await sequelize.query(
      periodSql,
      {
        type: QueryTypes.SELECT,
        fieldMap: {
          start_year: 'startYear',
          end_year: 'endYear'
        },
        plain: true
      }
  );

  const historyProdesChartData = getChartData(prodesHistory, 'PRODES');

  return {
    title: titleProdes,
    prodesHistory: await getSynthesisHistory(
        {
          data: prodesHistory,
          period: {
            startYear: 1999,
            endYear: period['endYear'],
          },
          layers: prodesHistoryConfig.layers,
          bbox: propertyData.bbox,
          cqlFilter: prodesHistoryConfig.cqlFilter,
          styles: prodesHistoryConfig.styles,
          title: prodesHistoryConfig.title,
          descriptionPrefix: prodesHistoryConfig.descriptionPrefix,
          descriptionSuffix: prodesHistoryConfig.descriptionSuffix,
          landsatLayers,
          propertyData
        }
    ),
    historyProdesChartData
  };
};
module.exports.getFireSpotHistory = async (carGId) => {
  const propertyData = await this.getPropertyData(carGId);

  const cardsConfig = synthesisConfig.cards;
  const historiesConfig = cardsConfig.histories;
  const fireSpotHistoryConfig = historiesConfig.fireSpotHistory;
  const titleFireSpot = historiesConfig.titleFireSpot;

  const fireSpotHistorySql = `SELECT
                  extract(year from date_trunc('year', cf.execution_date)) AS year,
                  COUNT(cf.*) AS value
            FROM public.a_carfocos_99 cf
            WHERE cf.de_car_validado_sema_gid = '${ carGId }'
            GROUP BY year
            ORDER BY year`;

  const fireSpotHistory = await sequelize.query(
      fireSpotHistorySql,
      {type: QueryTypes.SELECT}
  );

  const periodSql = `
          SELECT MIN(extract(year from date_trunc('year', fireSpots.data_hora_gmt))) AS start_year,
                 MAX(extract(year from date_trunc('year', fireSpots.data_hora_gmt))) AS end_year
          FROM dd_focos_inpe AS fireSpots
        `;

  const period = await sequelize.query(
      periodSql,
      {
        type: QueryTypes.SELECT,
        fieldMap: {
          start_year: 'startYear',
          end_year: 'endYear'
        },
        plain: true
      }
  );

  const burningFireSpotChartData = getChartData(fireSpotHistory, 'Focos');

  return {
    title: titleFireSpot,
    fireSpotHistory: await getSynthesisHistory(
        {
          data: fireSpotHistory,
          period,
          layers: fireSpotHistoryConfig.layers,
          bbox: propertyData.bbox,
          cqlFilter: fireSpotHistoryConfig.cqlFilter,
          styles: "",
          title: fireSpotHistoryConfig.title,
          descriptionPrefix: fireSpotHistoryConfig.descriptionPrefix,
          descriptionSuffix: fireSpotHistoryConfig.descriptionSuffix,
          propertyData
        }
    ),
    burningFireSpotChartData
  };
};
module.exports.getBurnedAreaHistory = async (carGId) => {
  const propertyData = await this.getPropertyData(carGId);

  const cardsConfig = synthesisConfig.cards;
  const historiesConfig = cardsConfig.histories;
  const burnedAreaHistoryConfig = historiesConfig.burnedAreaHistory;
  const titleBurnedArea = historiesConfig.titleBurnedArea;

  const burnedAreasHistorySql = `SELECT
                  extract(year from date_trunc('year', areaq.execution_date)) AS year,
                  COALESCE(SUM(CAST(areaq.calculated_area_ha AS DECIMAL)), 0) AS value
            FROM public.a_caraq_75 areaq
            WHERE areaq.de_car_validado_sema_gid = '${ carGId }'
            GROUP BY year
            ORDER BY year`;

  const burnedAreaHistory = await sequelize.query(
      burnedAreasHistorySql,
      {type: QueryTypes.SELECT}
  );

  const periodSql = `
         SELECT MIN(extract(year from date_trunc('year', burnedarea.timestamp))) AS start_year,
                MAX(extract(year from date_trunc('year', burnedarea.timestamp))) AS end_year
          FROM dd_area_queimada_inpe AS burnedarea;
        `;

  const period = await sequelize.query(
      periodSql,
      {
        type: QueryTypes.SELECT,
        fieldMap: {
          start_year: 'startYear',
          end_year: 'endYear'
        },
        plain: true
      }
  );

  const burnedAreasChartData = getChartData(burnedAreaHistory, 'Áreas Queimadas');
  const burnedAreasPerPropertyChartDatas = getPerPropertyChart(burnedAreaHistory, propertyData.area, 'Áreas Queimadas');

  return {
    title: titleBurnedArea,
    burnedAreaHistory: await getSynthesisHistory(
        {
          data: burnedAreaHistory,
          period,
          layers: burnedAreaHistoryConfig.layers,
          bbox: propertyData.bbox,
          cqlFilter: burnedAreaHistoryConfig.cqlFilter,
          styles: "",
          title: burnedAreaHistoryConfig.title,
          descriptionPrefix: burnedAreaHistoryConfig.descriptionPrefix,
          descriptionSuffix: burnedAreaHistoryConfig.descriptionSuffix,
          propertyData
        }
    ),
    burnedAreasChartData,
    burnedAreasPerPropertyChartDatas
  };
};
module.exports.getCharts = async () => {
  const chartsConfig = synthesisConfig.charts;

  const historyDeterChartOptions = chartsConfig.deter;
  const historyProdesChartOptions = chartsConfig.prodes;
  const historyFireSpotChartOptions = chartsConfig.fireSpot;
  const historyBurnedChartOptions = chartsConfig.burnedArea;

  return {
    'historyDeterChartOptions': historyDeterChartOptions,
    'historyProdesChartOptions': historyProdesChartOptions,
    'historyFireSpotChartOptions': historyFireSpotChartOptions,
    'historyBurnedChartOptions': historyBurnedChartOptions
  };
}
