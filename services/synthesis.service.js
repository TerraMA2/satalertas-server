const Result = require('../utils/result');
const { Report, sequelize } = require('../models');
const env = process.env.NODE_ENV || 'development';
const GeoServerService = require("../services/geoServer.service");
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
const { msgError } = require('../utils/messageError');

const QUERY_TYPES_SELECT = { type: 'SELECT' };

getSynthesisHistory = function (options) {
  let {data, period, layers, bbox, cqlFilter, styles, title, descriptionPrefix, descriptionSuffix, landsatLayers, propertyData} = options;
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
      filteredCqlFilter = filteredCqlFilter.replace(/{cityName}/g, propertyData.city);
    }
    const time = `${year}/P1Y`
    const url = GeoServerService.getGeoserverURL(filteredLayers, bbox, time, filteredCqlFilter, filteredStyles);
    const numberFormat = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'hectare', minimumFractionDigits: 4, maximumFractionDigits: 4 });
    const analysisData = data && data.length > 0 ? data.find((analysis) => analysis.date === year) : null;
    const value = analysisData ? numberFormat.format(analysisData.value) : numberFormat.format(0);

    analysisHistory.push({
      title: `${title} ${year}`,
      image: url,
      description: `${descriptionPrefix} ${year}: ${value} ${descriptionSuffix}`,
      year,
      value: value.split(' ').splice(0, 1).join('')
    });
  }
  return analysisHistory;
};

getSynthesisCard = function (options) {
  let {data, layers, bbox, cqlFilter, time, date, style, title, descriptionPrefix, descriptionSuffix, propertyData} = options;

  if (date) {
    title = title.replace(/{filterDate}/g, date);
  }
  if (propertyData) {
    cqlFilter = cqlFilter.replace(/{rid}/g, propertyData.gid);
    cqlFilter = cqlFilter.replace(/{gid}/g, propertyData.gid);
    cqlFilter = cqlFilter.replace(/{cityName}/g, propertyData.city);
  }
  const numberFormat = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'hectare', minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const url = GeoServerService.getGeoserverURL(layers, bbox, time, cqlFilter, style);
  const area = data ? numberFormat.format(data.area) : numberFormat.format(0);
  const description = data ? `${descriptionPrefix} ${area} ${descriptionSuffix}` : '';
  return {
      title,
      image: url,
      description
  }
};

setBoundingBox = function (bBox) {
  const bboxArray = bBox.split(',');
  const bbox1 = bboxArray[0].split(' ');
  const bbox2 = bboxArray[1].split(' ');

  let Xmax = parseFloat(bbox2[0]);
  let Xmin = parseFloat(bbox1[0]);

  let Ymax = parseFloat(bbox2[1]);
  let Ymin = parseFloat(bbox1[1]);

  let difX = Math.abs(Math.abs(Xmax) - Math.abs(Xmin));
  let difY = Math.abs(Math.abs(Ymax) - Math.abs(Ymin));

  if (difX > difY) {
    const fac = difX - difY;
    Ymin -= fac / 2;
    Ymax += fac / 2;
  } else if (difX < difY) {
    const fac = difY - difX;
    Xmin -= fac / 2;
    Xmax += fac / 2;
  }

  return `${Xmin},${Ymin},${Xmax},${Ymax}`;
};

getCarData = async function (
  carTableName,
  municipiosTableName,
  columnCarEstadualSemas,
  columnCarFederalSemas,
  columnAreaHaCar,
  carRegister,
) {
  const sql = `
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
              substring(ST_EXTENT(ST_Transform(car.geom, ${confGeoServer.sridPlanet}))::TEXT, 5, length(ST_EXTENT(ST_Transform(car.geom, ${confGeoServer.sridPlanet}))::TEXT) - 5) AS bboxplanet,
              ST_Y(ST_Centroid(car.geom)) AS "lat",
              ST_X(ST_Centroid(car.geom)) AS "long"
      FROM public.${carTableName} AS car
      INNER JOIN public.${municipiosTableName} munic ON
              car.gid = '${carRegister}'
              AND munic.municipio = car.municipio1
      INNER JOIN de_uf_mt_ibge UF ON UF.gid = 1
      GROUP BY car.${columnCarEstadualSemas}, car.${columnCarFederalSemas}, car.${columnAreaHaCar}, car.gid, car.nome_da_p1, car.municipio1, car.geom, munic.comarca, car.cpfcnpj, car.nomepropri
    `;
  const result = await sequelize.query(sql, QUERY_TYPES_SELECT);

  return result[0];
};

module.exports = FileReport = {
  async getSynthesis(query) {
    const { carRegister, date, formattedFilterDate } = query;

    let { synthesisConfig } = query;

    let dateFrom = null;
    let dateTo = null;
    let geoserverTime = "";

    if (date) {
      dateFrom = date[0];
      dateTo = date[1];
      geoserverTime = `${dateFrom}/${dateTo}`;
    }

    try {
      const views = await getViewsReport();

      const columnCarEstadualSemas = 'numero_do1';
      const columnCarFederalSemas = 'numero_do2';
      const columnAreaHaCar = 'area_ha_';
      const columnCalculatedAreaHa = 'calculated_area_ha';
      const columnExecutionDate = 'execution_date';

      const columnCar = `de_car_validado_sema_gid`;

      const tableName = views.STATIC.children.CAR_VALIDADO.table_name;

      const propertyData = await getCarData(
        tableName,
        views.STATIC.children.MUNICIPIOS.table_name,
        columnCarEstadualSemas,
        columnCarFederalSemas,
        columnAreaHaCar,
        carRegister,
      );

      const bbox = setBoundingBox(propertyData['bbox']);
      const cityBBox = setBoundingBox(propertyData['citybbox']);
      const stateBBox = setBoundingBox(propertyData['statebbox']);

      const burnedAreasHistorySql = ` SELECT
                  extract(year from date_trunc('year', areaq.${columnExecutionDate})) AS date,
                  COALESCE(SUM(CAST(areaq.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS value
            FROM public.${views.BURNED_AREA.children.CAR_X_AREA_Q.table_name} areaq
            WHERE areaq.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const burnedAreaHistory = await sequelize.query(
          burnedAreasHistorySql,
          QUERY_TYPES_SELECT,
      );

      const prodesHistorySql = ` SELECT
                  extract(year from date_trunc('year', cp.${columnExecutionDate})) AS date,
                  COALESCE(SUM(CAST(cp.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS value
            FROM public.${views.PRODES.children.CAR_X_PRODES.table_name} cp
            WHERE cp.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const prodesHistory = await sequelize.query(
          prodesHistorySql,
          QUERY_TYPES_SELECT,
      );

      const deterHistorySql = ` SELECT
                  extract(year from date_trunc('year', cd.${columnExecutionDate})) AS date,
                  COALESCE(SUM(CAST(cd.${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS value
            FROM public.${views.DETER.children.CAR_X_DETER.table_name} cd
            WHERE cd.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const deterHistory = await sequelize.query(
          deterHistorySql,
          QUERY_TYPES_SELECT,
      );

      const fireSpotHistorySql = ` SELECT
                  extract(year from date_trunc('year', cf.${columnExecutionDate})) AS date,
                  COUNT(cf.*) AS value
            FROM public.${views.BURNED.children.CAR_X_FOCOS.table_name} cf
            WHERE cf.${columnCar} = '${carRegister}'
            GROUP BY date
            ORDER BY date`;
      const fireSpotHistory = await sequelize.query(
          fireSpotHistorySql,
          QUERY_TYPES_SELECT,
      );

      const dateSql = ` AND ${columnExecutionDate}::date >= '${dateFrom}' AND ${columnExecutionDate}::date <= '${dateTo}'`;

      const indigenousLandSql = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_TI.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const conservationUnitSql = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_UC.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const legalReserveSql = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_RESERVA.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const aPPSql = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_APP.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const anthropizedUseSql = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_USOANT.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;
      const nativeVegetationSql = `SELECT COALESCE(SUM(CAST(${columnCalculatedAreaHa}  AS DECIMAL)), 0) AS area FROM public.${views.PRODES.children.CAR_PRODES_X_VEGNAT.table_name} where ${views.PRODES.tableOwner}_${columnCar} = '${carRegister}' ${dateSql}`;

      let indigenousLand = await sequelize.query(
        indigenousLandSql,
        QUERY_TYPES_SELECT,
      );
      indigenousLand = indigenousLand[0];
      let conservationUnit = await sequelize.query(
        conservationUnitSql,
        QUERY_TYPES_SELECT,
      );
      conservationUnit = conservationUnit[0];
      let legalReserve = await sequelize.query(
        legalReserveSql,
        QUERY_TYPES_SELECT,
      );
      legalReserve = legalReserve[0];
      let app = await sequelize.query(
          aPPSql,
          QUERY_TYPES_SELECT
      );
      app = app[0];
      let anthropizedUse = await sequelize.query(
        anthropizedUseSql,
        QUERY_TYPES_SELECT,
      );
      anthropizedUse = anthropizedUse[0];
      let nativeVegetation = await sequelize.query(
        nativeVegetationSql,
        QUERY_TYPES_SELECT,
      );
      nativeVegetation = nativeVegetation[0];

      if (propertyData) {
        //---- Year of beginning and end of each analysis --------------------------------------------------------------
        const sqlDatesSynthesis = `
          SELECT 'prodesYear' AS key, MIN(prodes.ano) AS start_year, MAX(prodes.ano) AS end_year
          FROM ${views.DYNAMIC.children.PRODES.table_name} AS prodes
          UNION ALL
          SELECT 'deterYear' AS key,
                 MIN(extract(year from date_trunc('year', deter.date))) AS start_year,
                 MAX(extract(year from date_trunc('year', deter.date))) AS end_year
          FROM ${views.DYNAMIC.children.DETER.table_name} AS deter
          UNION ALL
          SELECT 'fireSpotYear' AS key,
                 MIN(extract(year from date_trunc('year', spotlights.data_hora_gmt))) AS start_year,
                 MAX(extract(year from date_trunc('year', spotlights.data_hora_gmt))) AS end_year
          FROM ${views.DYNAMIC.children.FOCOS_QUEIMADAS.table_name}  AS spotlights
          UNION ALL
          SELECT 'burnedAreaYear' AS key,
                 MIN(extract(year from date_trunc('year', burnedarea.timestamp))) AS start_year,
                 MAX(extract(year from date_trunc('year', burnedarea.timestamp))) AS end_year
          FROM ${views.DYNAMIC.children.AREAS_QUEIMADAS.table_name}  AS burnedarea;
        `;

        const datesSynthesis = await sequelize.query(
          sqlDatesSynthesis,
          QUERY_TYPES_SELECT,
        );
        let analysisPeriod = [];
        datesSynthesis.forEach((years) => {
          const period =
            {
              startYear: years.start_year,
              endYear: years.end_year
            }
          analysisPeriod[years.key] = period;
        });

        synthesisConfig = JSON.parse(synthesisConfig);

        const visionsConfig = synthesisConfig.visions;

        const stateVisionCard = getSynthesisCard({
          data: null,
          layers: visionsConfig.state.layers,
          bbox: stateBBox,
          cqlFilter: visionsConfig.state.cqlFilter,
          time: geoserverTime,
          title: visionsConfig.state.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });

        const cityVisionCard = getSynthesisCard({
          data: null,
          layers: visionsConfig.city.layers,
          bbox: cityBBox,
          cqlFilter: visionsConfig.city.cqlFilter,
          time: geoserverTime,
          title: visionsConfig.city.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });
        const deterAlertVisionCard = getSynthesisCard({
          data: null,
          layers: visionsConfig.deterAlert.layers,
          bbox: bbox,
          cqlFilter: visionsConfig.deterAlert.cqlFilter,
          time: geoserverTime,
          date: formattedFilterDate,
          title: visionsConfig.deterAlert.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });
        const ambientalDegradationVisionCard = getSynthesisCard({
          data: null,
          layers: visionsConfig.ambientalDegradation.layers,
          bbox: bbox,
          cqlFilter: visionsConfig.ambientalDegradation.cqlFilter,
          time: geoserverTime,
          date: formattedFilterDate,
          title: visionsConfig.ambientalDegradation.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });
        const deforestationVisionCard = getSynthesisCard({
          data: null,
          layers: visionsConfig.deforestation.layers,
          bbox: bbox,
          cqlFilter: visionsConfig.deforestation.cqlFilter,
          time: geoserverTime,
          date: formattedFilterDate,
          title: visionsConfig.deforestation.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });
        const burnedAreaVisionCard = getSynthesisCard({
          data: null,
          layers: visionsConfig.burnedArea.layers,
          bbox: bbox,
          cqlFilter: visionsConfig.burnedArea.cqlFilter,
          time: geoserverTime,
          date: formattedFilterDate,
          title: visionsConfig.burnedArea.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });

        const visions = [
          stateVisionCard,
          cityVisionCard,
          deterAlertVisionCard,
          ambientalDegradationVisionCard,
          deforestationVisionCard,
          burnedAreaVisionCard
        ]

        const legendsConfig = synthesisConfig.legends;

        const municipalBoundariesLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.municipalBoundaries.layer);
        const nativeVegetationAreaLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.nativeVegetationArea.layer);
        const indigenousLandLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.indigenousLand.layer);
        const appAreaLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.appArea.layer);
        const consolidatedUseAreaLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.consolidatedUseArea.layer);
        const carLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.car.layer);
        const anthropizedUseLegend= GeoServerService.getGeoserverLegendURL(legendsConfig.anthropizedUse.layer);
        const carDeterLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.carDeter.layer);
        const legalreserveLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.legalreserve.layer);
        const carProdesLegend = GeoServerService.getGeoserverLegendURL(legendsConfig.carProdes.layer);

        const legends = [
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
        ]

        const detailedVisionsConfig = synthesisConfig.detailedVisions;

        const indigenousLandCard = getSynthesisCard({
          data: indigenousLand,
          layers: detailedVisionsConfig.indigenousLand.layers,
          bbox: bbox,
          cqlFilter: detailedVisionsConfig.indigenousLand.cqlFilter,
          time: geoserverTime,
          title: detailedVisionsConfig.indigenousLand.title,
          descriptionPrefix: detailedVisionsConfig.indigenousLand.descriptionPrefix,
          descriptionSuffix: detailedVisionsConfig.indigenousLand.descriptionSuffix,
          propertyData
        });

        const conservationUnitCard = getSynthesisCard({
          data: conservationUnit,
          layers: detailedVisionsConfig.conservationUnit.layers,
          bbox: bbox,
          cqlFilter: detailedVisionsConfig.conservationUnit.cqlFilter,
          time: geoserverTime,
          title: detailedVisionsConfig.conservationUnit.title,
          descriptionPrefix: detailedVisionsConfig.conservationUnit.descriptionPrefix,
          descriptionSuffix: detailedVisionsConfig.conservationUnit.descriptionSuffix,
          propertyData
        });
        const legalReserveCard = getSynthesisCard({
          data: legalReserve,
          layers: detailedVisionsConfig.legalReserve.layers,
          bbox: bbox,
          cqlFilter: detailedVisionsConfig.legalReserve.cqlFilter,
          time: geoserverTime,
          title: detailedVisionsConfig.legalReserve.title,
          descriptionPrefix: detailedVisionsConfig.legalReserve.descriptionPrefix,
          descriptionSuffix: detailedVisionsConfig.legalReserve.descriptionSuffix,
          propertyData
        });
        const appCard = getSynthesisCard({
          data: app,
          layers: detailedVisionsConfig.app.layers,
          bbox: bbox,
          cqlFilter: detailedVisionsConfig.app.cqlFilter,
          time: geoserverTime,
          title: detailedVisionsConfig.app.title,
          descriptionPrefix: detailedVisionsConfig.app.descriptionPrefix,
          descriptionSuffix: detailedVisionsConfig.app.descriptionSuffix,
          propertyData
        });
        const anthropizedUseCard = getSynthesisCard({
          data: anthropizedUse,
          layers: detailedVisionsConfig.anthropizedUse.layers,
          bbox: bbox,
          cqlFilter: detailedVisionsConfig.anthropizedUse.cqlFilter,
          time: geoserverTime,
          title: detailedVisionsConfig.anthropizedUse.title,
          descriptionPrefix: detailedVisionsConfig.anthropizedUse.descriptionPrefix,
          descriptionSuffix: detailedVisionsConfig.anthropizedUse.descriptionSuffix,
          propertyData
        });
        const nativeVegetationCard = getSynthesisCard({
          data: nativeVegetation,
          layers: detailedVisionsConfig.nativeVegetation.layers,
          bbox: bbox,
          cqlFilter: detailedVisionsConfig.nativeVegetation.cqlFilter,
          time: geoserverTime,
          title: detailedVisionsConfig.nativeVegetation.title,
          descriptionPrefix: detailedVisionsConfig.nativeVegetation.descriptionPrefix,
          descriptionSuffix: detailedVisionsConfig.nativeVegetation.descriptionSuffix,
          propertyData
        });

        const detailedVisions = [
            indigenousLandCard,
            conservationUnitCard,
            legalReserveCard,
            appCard,
            anthropizedUseCard,
            nativeVegetationCard
        ];

        const deforestationConfig = synthesisConfig.deforestation;

        const spotCard = getSynthesisCard({
          data: null,
          layers: deforestationConfig.spot.layers,
          bbox: bbox,
          cqlFilter: deforestationConfig.spot.cqlFilter,
          time: deforestationConfig.spot.time,
          styles: deforestationConfig.spot.styles,
          title: deforestationConfig.spot.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });
        const landsatCard = getSynthesisCard({
          data: null,
          layers: deforestationConfig.landsat.layers,
          bbox: bbox,
          cqlFilter: deforestationConfig.landsat.cqlFilter,
          time: deforestationConfig.landsat.time,
          styles: deforestationConfig.landsat.styles,
          title: deforestationConfig.landsat.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });
        const sentinelCard = getSynthesisCard({
          data: null,
          layers: deforestationConfig.sentinel.layers,
          bbox: bbox,
          cqlFilter: deforestationConfig.sentinel.cqlFilter,
          time: deforestationConfig.sentinel.time,
          styles: deforestationConfig.sentinel.styles,
          title: deforestationConfig.sentinel.title,
          descriptionPrefix: "",
          descriptionSuffix: "",
          propertyData
        });

        const deforestations = [
            spotCard,
            landsatCard,
            sentinelCard
        ];

        propertyData.bbox = bbox;
        propertyData.citybbox = cityBBox;
        propertyData.statebbox = stateBBox;

        propertyData.visions = visions;
        propertyData.legends = legends;
        propertyData.detailedVisions = detailedVisions;
        propertyData.deforestations = deforestations;

        const deterHistoryConfig = synthesisConfig.histories.deterHistory;
        const prodesHistoryConfig = synthesisConfig.histories.prodesHistory;
        const fireSpotHistoryConfig = synthesisConfig.histories.fireSpotHistory;
        const burnedAreaHistoryConfig = synthesisConfig.histories.burnedAreaHistory;
        const landsatLayers = synthesisConfig.histories.landsatLayers;

       propertyData.deterHistory = getSynthesisHistory(
           {
              data: deterHistory,
              period: analysisPeriod['deterYear'],
              layers: deterHistoryConfig.layers,
              bbox: propertyData.bbox,
              cqlFilter: deterHistoryConfig.cqlFilter,
              styles: "",
              title: deterHistoryConfig.title,
              descriptionPrefix: deterHistoryConfig.descriptionPrefix,
              descriptionSuffix: deterHistoryConfig.descriptionSuffix,
              propertyData
            }
        );
        propertyData.prodesHistory = getSynthesisHistory(
            {
            data: prodesHistory,
            period: {
              startYear: 1999,
              endYear: analysisPeriod['prodesYear']['endYear'],
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
        );
        propertyData.fireSpotHistory = getSynthesisHistory(
            {
              data: fireSpotHistory,
              period: analysisPeriod['fireSpotYear'],
              layers: fireSpotHistoryConfig.layers,
              bbox: propertyData.bbox,
              cqlFilter: fireSpotHistoryConfig.cqlFilter,
              styles: "",
              title: fireSpotHistoryConfig.title,
              descriptionPrefix: fireSpotHistoryConfig.descriptionPrefix,
              descriptionSuffix: fireSpotHistoryConfig.descriptionSuffix,
              propertyData
            }
        );
        propertyData.burnedAreaHistory = getSynthesisHistory(
            {
              data: burnedAreaHistory,
              period: analysisPeriod['burnedAreaYear'],
              layers: burnedAreaHistoryConfig.layers,
              bbox: propertyData.bbox,
              cqlFilter: burnedAreaHistoryConfig.cqlFilter,
              styles: "",
              title: burnedAreaHistoryConfig.title,
              descriptionPrefix: burnedAreaHistoryConfig.descriptionPrefix,
              descriptionSuffix: burnedAreaHistoryConfig.descriptionSuffix,
              propertyData
            }
        );

        return Result.ok(propertyData);
      }
    } catch (e) {
      msgError(__filename, 'getSynthesisCarData', e);
      return Result.err(e);
    }
  },
  async getChartOptions(labels, data) {
    return {
      type: 'line',
      data: {
        labels: labels,
        lineColor: 'rgb(10,5,109)',
        datasets: [
          {
            label: 'NDVI',
            data: data,
            backgroundColor: 'rgba(17,17,177,0)',
            borderColor: 'rgba(5,177,0,1)',
            showLine: true,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: false,
        legend: {
          display: false,
        },
      },
    };
  }
}
