const {sequelize} = require('../models');
const geoServerService = require("../services/geoServer.service");
const config = require(__dirname + '/../config/config.json');
const synthesisConfig = require(__dirname + `/../config/${ config.project }/synthesis.json`);
const {QueryTypes} = require("sequelize");
const BadRequestError = require('../errors/bad-request.error');
const viewService = require("../services/view.service");
const Layer = require("../utils/layer.utils");

getSynthesisHistory = (options) => {
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
            filteredCqlFilter = filteredCqlFilter.replace(/{cityName}/g, propertyData.city);
        }
        const time = `${ year }/P1Y`
        const url = geoServerService.getGeoserverURL(filteredLayers, bbox, time, filteredCqlFilter, filteredStyles);
        const numberFormat = new Intl.NumberFormat('pt-BR', {
            style: 'unit',
            unit: 'hectare',
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        });
        const analysisData = data && data.length > 0 ? data.find((analysis) => analysis.date === year) : null;
        const value = analysisData ? numberFormat.format(analysisData.value) : numberFormat.format(0);

        analysisHistory.push({
            title: `${ title } ${ year }`,
            image: url,
            description: `${ descriptionPrefix } ${ year }: ${ value } ${ descriptionSuffix }`,
            year,
            value: value.split(' ').splice(0, 1).join('')
        });
    }
    return analysisHistory;
};

getSynthesisCard = (options) => {
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
        cqlFilter = cqlFilter.replace(/{cityName}/g, propertyData.city);
    }
    const numberFormat = new Intl.NumberFormat('pt-BR', {
        style: 'unit',
        unit: 'hectare',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
    const url = geoServerService.getGeoserverURL(layers, bbox, time, cqlFilter, style);
    const area = data ? numberFormat.format(data.area) : numberFormat.format(0);
    const description = data ? `${ descriptionPrefix } ${ area } ${ descriptionSuffix }` : '';
    return {
        title,
        image: url,
        description
    }
};

getCarData = async (
    carTableName,
    municipiosTableName,
    columnCarEstadualSemas,
    columnCarFederalSemas,
    columnAreaHaCar,
    carRegister,
) => {
    const sql = `
      SELECT
              car.gid AS gid,
              car.${ columnCarEstadualSemas } AS register,
              car.${ columnCarFederalSemas } AS federalregister,
              ROUND(COALESCE(car.${ columnAreaHaCar }, 0), 4) AS area,
              ROUND(COALESCE((car.${ columnAreaHaCar }/100), 0), 4) AS area_km,
              car.nome_da_p1 AS name,
              car.municipio1 AS city,
              car.cpfcnpj AS cpf,
              car.nomepropri AS owner,
              munic.comarca AS county,
              substring(ST_EXTENT(munic.geom)::TEXT, 5, length(ST_EXTENT(munic.geom)::TEXT) - 5) AS citybbox,
              substring(ST_EXTENT(UF.geom)::TEXT, 5, length(ST_EXTENT(UF.geom)::TEXT) - 5) AS statebbox,
              substring(ST_EXTENT(car.geom)::TEXT, 5, length(ST_EXTENT(car.geom)::TEXT) - 5) AS bbox,
              substring(ST_EXTENT(ST_Transform(car.geom, ${ config.geoserver.planetSRID }))::TEXT, 5, length(ST_EXTENT(ST_Transform(car.geom, ${ config.geoserver.planetSRID }))::TEXT) - 5) AS bboxplanet,
              ST_Y(ST_Centroid(car.geom)) AS "lat",
              ST_X(ST_Centroid(car.geom)) AS "long"
      FROM public.${ carTableName } AS car
      INNER JOIN public.${ municipiosTableName } munic ON
              car.gid = '${ carRegister }'
              AND munic.municipio = car.municipio1
      INNER JOIN de_uf_mt_ibge UF ON UF.gid = 1
      GROUP BY car.${ columnCarEstadualSemas }, car.${ columnCarFederalSemas }, car.${ columnAreaHaCar }, car.gid, car.nome_da_p1, car.municipio1, car.geom, munic.comarca, car.cpfcnpj, car.nomepropri
    `;
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        plain: true
    });
};

getChartOptions = async (labels, data) => {
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
            }
        }
    }
}

module.exports.get = async (carRegister, date) => {
    if (!carRegister || !date) {
        throw new BadRequestError('Error occurred while getting the synthesis');
    }

    const [startDate, endDate] = date;
    const geoserverTime = `${ startDate }/${ endDate }`;
    const formattedFilterDate = `${ new Date(startDate).toLocaleDateString('pt-BR') } - ${ new Date(endDate).toLocaleDateString('pt-BR') }`;

    const groupViews = await viewService.getSidebarLayers(true);

    const columnCarEstadualSemas = 'numero_do1';
    const columnCarFederalSemas = 'numero_do2';
    const columnAreaHaCar = 'area_ha_';
    const columnCalculatedAreaHa = 'calculated_area_ha';
    const columnExecutionDate = 'execution_date';

    const columnCar = `de_car_validado_sema_gid`;

    const tableName = groupViews.STATIC.children.CAR_VALIDADO.tableName;

    const propertyData = await getCarData(
        tableName,
        groupViews.STATIC.children.MUNICIPIOS.tableName,
        columnCarEstadualSemas,
        columnCarFederalSemas,
        columnAreaHaCar,
        carRegister,
    );

    const bbox = Layer.setBoundingBox(propertyData['bbox']);
    const cityBBox = Layer.setBoundingBox(propertyData['citybbox']);
    const stateBBox = Layer.setBoundingBox(propertyData['statebbox']);

    const burnedAreasHistorySql = ` SELECT
                  extract(year from date_trunc('year', areaq.${ columnExecutionDate })) AS date,
                  COALESCE(SUM(CAST(areaq.${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS value
            FROM public.${ groupViews.BURNED_AREA.children.CAR_X_AREA_Q.tableName } areaq
            WHERE areaq.${ columnCar } = '${ carRegister }'
            GROUP BY date
            ORDER BY date`;
    const burnedAreaHistory = await sequelize.query(
        burnedAreasHistorySql,
        {type: QueryTypes.SELECT}
    );

    const prodesHistorySql = ` SELECT
                  extract(year from date_trunc('year', cp.${ columnExecutionDate })) AS date,
                  COALESCE(SUM(CAST(cp.${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS value
            FROM public.${ groupViews.PRODES.children.CAR_X_PRODES.tableName } cp
            WHERE cp.${ columnCar } = '${ carRegister }'
            GROUP BY date
            ORDER BY date`;
    const prodesHistory = await sequelize.query(
        prodesHistorySql,
        {type: QueryTypes.SELECT}
    );

    const deterHistorySql = ` SELECT
                  extract(year from date_trunc('year', cd.${ columnExecutionDate })) AS date,
                  COALESCE(SUM(CAST(cd.${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS value
            FROM public.${ groupViews.DETER.children.CAR_X_DETER.tableName } cd
            WHERE cd.${ columnCar } = '${ carRegister }'
            GROUP BY date
            ORDER BY date`;
    const deterHistory = await sequelize.query(
        deterHistorySql,
        {type: QueryTypes.SELECT},
    );

    const fireSpotHistorySql = ` SELECT
                  extract(year from date_trunc('year', cf.${ columnExecutionDate })) AS date,
                  COUNT(cf.*) AS value
            FROM public.${ groupViews.BURNED.children.CAR_X_FOCOS.tableName } cf
            WHERE cf.${ columnCar } = '${ carRegister }'
            GROUP BY date
            ORDER BY date`;
    const fireSpotHistory = await sequelize.query(
        fireSpotHistorySql,
        {type: QueryTypes.SELECT},
    );

    const dateSql = ` AND ${ columnExecutionDate }::date >= '${ startDate }' AND ${ columnExecutionDate }::date <= '${ endDate }'`;

    const indigenousLandSql = `SELECT COALESCE(SUM(CAST(${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS area FROM public.${ groupViews.PRODES.children.CAR_PRODES_X_TI.tableName } where ${ groupViews.PRODES.tableOwner }_${ columnCar } = '${ carRegister }' ${ dateSql }`;
    const conservationUnitSql = `SELECT COALESCE(SUM(CAST(${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS area FROM public.${ groupViews.PRODES.children.CAR_PRODES_X_UC.tableName } where ${ groupViews.PRODES.tableOwner }_${ columnCar } = '${ carRegister }' ${ dateSql }`;
    const legalReserveSql = `SELECT COALESCE(SUM(CAST(${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS area FROM public.${ groupViews.PRODES.children.CAR_PRODES_X_RESERVA.tableName } where ${ groupViews.PRODES.tableOwner }_${ columnCar } = '${ carRegister }' ${ dateSql }`;
    const aPPSql = `SELECT COALESCE(SUM(CAST(${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS area FROM public.${ groupViews.PRODES.children.CAR_PRODES_X_APP.tableName } where ${ groupViews.PRODES.tableOwner }_${ columnCar } = '${ carRegister }' ${ dateSql }`;
    const anthropizedUseSql = `SELECT COALESCE(SUM(CAST(${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS area FROM public.${ groupViews.PRODES.children.CAR_PRODES_X_USOANT.tableName } where ${ groupViews.PRODES.tableOwner }_${ columnCar } = '${ carRegister }' ${ dateSql }`;
    const nativeVegetationSql = `SELECT COALESCE(SUM(CAST(${ columnCalculatedAreaHa }  AS DECIMAL)), 0) AS area FROM public.${ groupViews.PRODES.children.CAR_PRODES_X_VEGNAT.tableName } where ${ groupViews.PRODES.tableOwner }_${ columnCar } = '${ carRegister }' ${ dateSql }`;

    let indigenousLand = await sequelize.query(
        indigenousLandSql,
        {type: QueryTypes.SELECT},
    );
    indigenousLand = indigenousLand[0];
    let conservationUnit = await sequelize.query(
        conservationUnitSql,
        {type: QueryTypes.SELECT},
    );
    conservationUnit = conservationUnit[0];
    let legalReserve = await sequelize.query(
        legalReserveSql,
        {type: QueryTypes.SELECT},
    );
    legalReserve = legalReserve[0];
    let app = await sequelize.query(
        aPPSql,
        {type: QueryTypes.SELECT}
    );
    app = app[0];
    let anthropizedUse = await sequelize.query(
        anthropizedUseSql,
        {type: QueryTypes.SELECT},
    );
    anthropizedUse = anthropizedUse[0];
    let nativeVegetation = await sequelize.query(
        nativeVegetationSql,
        {type: QueryTypes.SELECT},
    );
    nativeVegetation = nativeVegetation[0];

    if (propertyData) {
        //---- Year of beginning and end of each analysis --------------------------------------------------------------
        const sqlDatesSynthesis = `
          SELECT 'prodesYear' AS key, MIN(prodes.ano) AS start_year, MAX(prodes.ano) AS end_year
          FROM ${ groupViews.DYNAMIC.children.PRODES.tableName } AS prodes
          UNION ALL
          SELECT 'deterYear' AS key,
                 MIN(extract(year from date_trunc('year', deter.date))) AS start_year,
                 MAX(extract(year from date_trunc('year', deter.date))) AS end_year
          FROM ${ groupViews.DYNAMIC.children.DETER.tableName } AS deter
          UNION ALL
          SELECT 'fireSpotYear' AS key,
                 MIN(extract(year from date_trunc('year', spotlights.data_hora_gmt))) AS start_year,
                 MAX(extract(year from date_trunc('year', spotlights.data_hora_gmt))) AS end_year
          FROM ${ groupViews.DYNAMIC.children.FOCOS_QUEIMADAS.tableName }  AS spotlights
          UNION ALL
          SELECT 'burnedAreaYear' AS key,
                 MIN(extract(year from date_trunc('year', burnedarea.timestamp))) AS start_year,
                 MAX(extract(year from date_trunc('year', burnedarea.timestamp))) AS end_year
          FROM ${ groupViews.DYNAMIC.children.AREAS_QUEIMADAS.tableName }  AS burnedarea;
        `;

        const datesSynthesis = await sequelize.query(
            sqlDatesSynthesis,
            {type: QueryTypes.SELECT},
        );
        let analysisPeriod = [];
        datesSynthesis.forEach((years) => {
            analysisPeriod[years.key] = {
                startYear: years.start_year,
                endYear: years.end_year
            };
        });
        const cardsConfig = synthesisConfig.cards;
        const chartsConfig = synthesisConfig.charts;

        const visionsConfig = cardsConfig.visions;

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

        const titleDeter = cardsConfig.histories.titleDeter
        const titleProdes = cardsConfig.histories.titleProdes
        const titleFireSpot = cardsConfig.histories.titleFireSpot
        const titleBurnedArea = cardsConfig.histories.titleBurnedArea
        const titleDetailedVisions = cardsConfig.detailedVisions.title
        const titleDeforestation = cardsConfig.deforestation.title

        const historyDeterChartOptions = chartsConfig.deter;
        const historyProdesChartOptions = chartsConfig.prodes;
        const historyFireSpotChartOptions = chartsConfig.fireSpot;
        const historyBurnedChartOptions = chartsConfig.burnedArea;

        const visions = [
            stateVisionCard,
            cityVisionCard,
            deterAlertVisionCard,
            ambientalDegradationVisionCard,
            deforestationVisionCard,
            burnedAreaVisionCard
        ]

        const legendsConfig = cardsConfig.legends;

        const municipalBoundariesLegend = geoServerService.getGeoserverLegendURL(legendsConfig.municipalBoundaries.layer);
        const nativeVegetationAreaLegend = geoServerService.getGeoserverLegendURL(legendsConfig.nativeVegetationArea.layer);
        const indigenousLandLegend = geoServerService.getGeoserverLegendURL(legendsConfig.indigenousLand.layer);
        const appAreaLegend = geoServerService.getGeoserverLegendURL(legendsConfig.appArea.layer);
        const consolidatedUseAreaLegend = geoServerService.getGeoserverLegendURL(legendsConfig.consolidatedUseArea.layer);
        const carLegend = geoServerService.getGeoserverLegendURL(legendsConfig.car.layer);
        const anthropizedUseLegend = geoServerService.getGeoserverLegendURL(legendsConfig.anthropizedUse.layer);
        const carDeterLegend = geoServerService.getGeoserverLegendURL(legendsConfig.carDeter.layer);
        const legalreserveLegend = geoServerService.getGeoserverLegendURL(legendsConfig.legalreserve.layer);
        const carProdesLegend = geoServerService.getGeoserverLegendURL(legendsConfig.carProdes.layer);

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

        const detailedVisionsConfig = cardsConfig.detailedVisions;

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

        const deforestationConfig = cardsConfig.deforestation;

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

        propertyData.titleDeter = titleDeter;
        propertyData.titleProdes = titleProdes;
        propertyData.titleFireSpot = titleFireSpot;
        propertyData.titleBurnedArea = titleBurnedArea;
        propertyData.titleDetailedVisions = titleDetailedVisions;
        propertyData.titleDeforestation = titleDeforestation;

        propertyData.historyDeterChartOptions = historyDeterChartOptions;
        propertyData.historyProdesChartOptions = historyProdesChartOptions;
        propertyData.historyFireSpotChartOptions = historyFireSpotChartOptions;
        propertyData.historyBurnedChartOptions = historyBurnedChartOptions;

        propertyData.bbox = bbox;
        propertyData.citybbox = cityBBox;
        propertyData.statebbox = stateBBox;

        propertyData.visions = visions;
        propertyData.legends = legends;
        propertyData.detailedVisions = detailedVisions;
        propertyData.deforestations = deforestations;

        const deterHistoryConfig = cardsConfig.histories.deterHistory;
        const prodesHistoryConfig = cardsConfig.histories.prodesHistory;
        const fireSpotHistoryConfig = cardsConfig.histories.fireSpotHistory;
        const burnedAreaHistoryConfig = cardsConfig.histories.burnedAreaHistory;
        const landsatLayers = cardsConfig.histories.landsatLayers;

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

        return propertyData;
    }
}
