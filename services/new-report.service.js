const FiringCharts = require("../charts/firing-chart");
const {Report, sequelize} = require("../models");
const fs = require("fs");
const config = require(__dirname + "/../config/config.json");
const {QueryTypes} = require("sequelize");
const BadRequestError = require("../errors/bad-request.error");
const viewService = require("../services/view.service");
const Layer = require("../utils/layer.utils");
const formatter = require("../utils/formatter.utils");
const ReportType = require("../enum/report-types");
const geoserverService = require("./geoServer.service");
const carService = require("./car.service");
const reportUtil = require("../utils/report.utils");
const Filter = require("../utils/filter.utils");

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

module.exports.getReport = async (carGid, date, type, filter, pdf) => {
  if (!carGid) {
    throw new BadRequestError("Property not found");
  }

  let reportData = {};
  filter = JSON.parse(filter);

  const [dateFrom, dateTo] = date;

  const groupViews = await viewService.getSidebarLayers(true);

  const stateRegisterColumn = "numero_do1";
  const federalRegisterColumn = "numero_do2";
  const carAreaColumn = "area_ha_";
  const calculatedAreaColumn = "calculated_area_ha";
  const executionDateColumn = "execution_date";
  const carIdColumn = "rid";
  const analysisCarIdColumn = `de_car_validado_sema_gid`;

  const startDate = new Date(date[0]).toLocaleDateString('pt-BR');
  const endDate = new Date(date[1]).toLocaleDateString('pt-BR');
  const today = new Date();
  const currentYear = today.getFullYear();
  const formattedFilterDate = `${ startDate } a ${ endDate }`;
  const geoserverTime = `${ dateFrom }/${ dateTo }`;
  const code = `XXXXX/${ currentYear }`;

  const propertyData = await carService.getCarData(
      groupViews.STATIC.children.CAR_VALIDADO.tableName,
      groupViews.STATIC.children.MUNICIPIOS.tableName,
      stateRegisterColumn,
      federalRegisterColumn,
      carAreaColumn,
      carGid
  );
  propertyData.area = formatter.formatHectare(propertyData.area);
  propertyData.lat = formatter.formatNumber(propertyData.lat);
  propertyData.long = formatter.formatNumber(propertyData.long);

  const dateSql = ` and ${ executionDateColumn }::date >= '${ dateFrom }' AND ${ executionDateColumn }::date <= '${ dateTo }'`;

  if (filter) {
    filter["date"] = date;
  } else {
    filter = {date: date};
  }

  if (groupViews.DETER && type === ReportType.DETER) {
    const deterData = await getDeterData(
        groupViews,
        dateSql,
        analysisCarIdColumn,
        calculatedAreaColumn,
        executionDateColumn,
        carGid,
        filter
    );

    reportData = {...reportData, ...propertyData, ...deterData};

    reportData['images'] = await getDeterImages(
        reportData,
        groupViews,
        carIdColumn,
        analysisCarIdColumn,
        geoserverTime,
        filter
    );
  } else if (groupViews.PRODES && type === ReportType.PRODES) {
    const prodesData = await getProdesData(
        groupViews,
        dateSql,
        analysisCarIdColumn,
        calculatedAreaColumn,
        executionDateColumn,
        carGid
    );

    reportData = {...reportData, ...propertyData, ...prodesData};

    reportData['images'] = await getProdesImages(
        reportData,
        groupViews,
        carIdColumn,
        analysisCarIdColumn,
        date
    )
  } else if (groupViews.BURNED && type === ReportType.FIRING) {
    const burnedData = await getBurnedData(
        groupViews,
        analysisCarIdColumn,
        carIdColumn,
        executionDateColumn,
        carGid,
        filter
    );

    reportData = {...reportData, ...propertyData, ...burnedData};

    reportData['images'] = await getBurnedImages(
        reportData,
        groupViews,
        carIdColumn,
        analysisCarIdColumn,
        geoserverTime
    )
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

getDeterData = async (
    groupViews,
    dateSql,
    analysisCarIdColumn,
    calculatedAreaColumn,
    executionDateColumn,
    carGid,
    filter
) => {
  const totalDeforestationAreaSql = `
            SELECT COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
            FROM public.${groupViews.DETER.children.CAR_X_DETER.tableName}
            WHERE ${analysisCarIdColumn} = '${carGid}'
            ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_X_DETER, groupViews.DETER.tableOwner)} `;

  let totalDeforestationArea = await sequelize.query(totalDeforestationAreaSql, {
    type: QueryTypes.SELECT,
    plain: true,
    raw: true
  });

  totalDeforestationArea = formatter.formatHectare(totalDeforestationArea.area);

  const deforestationPerClassSql = `
      SELECT 'APP' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
      FROM public.${groupViews.DETER.children.CAR_DETER_X_APP.tableName}
      WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_APP, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'ARL' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_RESERVA.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${ Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_RESERVA, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'TI' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_TI.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_TI, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'AUTEX' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_EXPLORA.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_EXPLORA, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'AD' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_DESMATE.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_DESMATE, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'Área embargada' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_EMB.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_EMB, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'Área desembargada' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_DESEMB.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_DESEMB, groupViews.DETER.tableOwner)}
      UNION ALL
        SELECT 'UC – US' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_UC.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_UC, groupViews.DETER.tableOwner)}  AND de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
      UNION ALL
        SELECT 'UC – PI' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_UC.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_UC, groupViews.DETER.tableOwner)}
        AND de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
      UNION ALL
        SELECT 'AQC' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn}  AS DECIMAL)), 0) AS area
        FROM public.${groupViews.DETER.children.CAR_DETER_X_QUEIMA.tableName}
        WHERE ${groupViews.DETER.tableOwner}_${analysisCarIdColumn} = '${carGid}'
        ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_DETER_X_QUEIMA, groupViews.DETER.tableOwner)}
    `;

  const deforestationPerClass = await sequelize.query(deforestationPerClassSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      class_name: 'className'
    }
  });

  deforestationPerClass.forEach(element => element.area = formatter.formatNumber(element.area));

  const deforestationAlertsSql = `
      SELECT
            carxdeter.${groupViews.DETER.children.CAR_X_DETER.tableName}_id AS id,
            SUBSTRING(ST_EXTENT(carxdeter.intersection_geom)::TEXT, 5, length(ST_EXTENT(carxdeter.intersection_geom)::TEXT) - 5) AS bbox,
            COALESCE(calculated_area_ha, 4) AS area,
            TO_CHAR(carxdeter.execution_date, 'dd/mm/yyyy') AS date,
            TO_CHAR(carxdeter.execution_date, 'yyyy') AS year,
            TRIM(carxdeter.dd_deter_inpe_sensor) AS sensor,
            TRIM(TO_CHAR(CAST(REPLACE(REPLACE(carxdeter.dd_deter_inpe_path_row, '/', ''), '_', '') AS DECIMAL), '999_999')) AS path_row,
            TRIM(TO_CHAR(carxdeter.execution_date, 'ddmmyyyy')) AS date_code,
            (
              CASE WHEN carxdeter.dd_deter_inpe_satellite = 'Cbers4' THEN 'CBERS-4'
              ELSE UPPER(TRIM(carxdeter.dd_deter_inpe_satellite)) END
            ) AS sat
      FROM public.${groupViews.DETER.children.CAR_X_DETER.tableName} AS carxdeter, public.${groupViews.STATIC.children.BIOMAS.tableName} biomes
      WHERE ${analysisCarIdColumn} = '${carGid}'
            ${Filter.getFilterClassSearch(dateSql, filter, groupViews.DETER.children.CAR_X_DETER, groupViews.DETER.tableOwner)}
            AND st_intersects(biomes.geom, carxdeter.intersection_geom)
      GROUP BY ${groupViews.DETER.children.CAR_X_DETER.tableName}_id, biomes.gid `;

  const deforestationAlerts = await sequelize.query(deforestationAlertsSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      path_row: 'pathRow',
      date_code: 'dateCode'
    }
  });

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

getProdesData = async (
    groupViews,
    dateSql,
    analysisCarIdColumn,
    calculatedAreaColumn,
    executionDateColumn,
    carGid
) => {
  const totalDeforestationAreaSql = `
      SELECT COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_X_PRODES.tableName}
      where ${analysisCarIdColumn} = '${carGid}'
      ${dateSql} `;

  let totalDeforestationArea = await sequelize.query(totalDeforestationAreaSql, {
        type: QueryTypes.SELECT,
        plain: true,
        raw: true
      }
  );

  totalDeforestationArea = formatter.formatHectare(totalDeforestationArea.area);

  const vegRadamSql = `
        SELECT fisionomia,
        ROUND(CAST(area_ha_car_vegradam AS DECIMAL), 4) AS area
        FROM car_x_vegradam
        WHERE gid = ${carGid} `;

  const vegRadam = await sequelize.query(vegRadamSql, {
    type: QueryTypes.SELECT
  });

  vegRadam.forEach((element) => element.area = formatter.formatHectare(element.area));

  const consolidateUseAreaSql = `
    SELECT ROUND(COALESCE(SUM(CAST(area_ha_car_usocon AS DECIMAL)), 0), 4) AS area
    FROM public.${groupViews.STATIC.children.CAR_X_USOCON.tableName}
    where gid_car = '${carGid}'`;

  let consolidateUseArea = await sequelize.query(consolidateUseAreaSql, {
    type: QueryTypes.SELECT,
    plain: true
  });

  consolidateUseArea = formatter.formatNumber(consolidateUseArea.area);

  const deforestationPerClassSql = `
      SELECT 'TI' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_TI.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'ARL' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_RESERVA.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'APP' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_APP.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'AUTEX' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_EXPLORA.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'AD' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_DESMATE.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'AUR' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_USO_RESTRITO.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'Área embargada' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_EMB.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'Área desembargada' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_DESEMB.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      UNION ALL
      SELECT 'AQC' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_QUEIMA.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}' ${dateSql}
      UNION ALL
      SELECT 'UC – US' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_UC.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      and de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
      UNION ALL
      SELECT 'UC – PI' AS class_name, COALESCE(SUM(CAST(${calculatedAreaColumn} AS DECIMAL)), 0) AS area
      FROM public.${groupViews.PRODES.children.CAR_PRODES_X_UC.tableName}
      WHERE ${groupViews.PRODES.tableOwner}_${analysisCarIdColumn} = '${carGid}'
      ${dateSql}
      and de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
    `;

  const deforestationPerClass = await sequelize.query(deforestationPerClassSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      class_name: 'className'
    }
  });

  deforestationPerClass.forEach(element => element.area = formatter.formatNumber(element.area));

  const deforestationByVegetationTypeSql = `
    SELECT fisionomia AS class_name,
    SUM(ST_Area(ST_Intersection(car_prodes.intersection_geom, radam.geom)::geography) / 10000.0) AS area
    FROM public.${groupViews.PRODES.children.CAR_X_PRODES.tableName} AS car_prodes,
    public.${groupViews.STATIC.children.VEGETACAO_RADAM_BR.tableName} AS radam
    WHERE car_prodes.de_car_validado_sema_gid = '${carGid}'
    ${dateSql}
    AND ST_Intersects(car_prodes.intersection_geom, radam.geom)
    GROUP BY radam.fisionomia`;


  let deforestationByVegetationType = await sequelize.query(deforestationByVegetationTypeSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      class_name: 'className'
    }
  });

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

  const deforestationByYearSql = `
        SELECT extract(year from date_trunc('year', cp.${executionDateColumn})) AS year,
        ROUND(COALESCE(SUM(CAST(cp.${calculatedAreaColumn} AS DECIMAL)), 0), 4) AS area
        FROM public.${groupViews.PRODES.children.CAR_X_PRODES.tableName} AS cp
        WHERE cp.${analysisCarIdColumn} = '${carGid}'
        ${dateSql}
        GROUP BY year
        ORDER BY year `;

  const deforestationByYear = await sequelize.query(deforestationByYearSql, {
    type: QueryTypes.SELECT
  });

  deforestationByYear.forEach(element => element.area = formatter.formatNumber(element.area));

  deforestationByYear.push({
    year: 'Total',
    area: totalDeforestationArea
  });

  const deforestationPeriodSql = `
        SELECT 2006 AS start_year,
        MAX(prodes.ano) AS end_year
        FROM ${groupViews.DYNAMIC.children.PRODES.tableName} AS prodes`;

  const deforestationPeriod = await sequelize.query(deforestationPeriodSql, {
        type: QueryTypes.SELECT,
        plain: true,
        raw: true,
        fieldMap: {
          start_year: 'startYear',
          end_year: 'endYear',
        }
      }
  );

  const deforestationHistorySql = `
          WITH
            date_range AS (SELECT generate_series(2006, extract(year from current_date)::int -1) AS date),
            report_values AS
            (
              SELECT extract(year from cp.${executionDateColumn}) AS date,
              ROUND(COALESCE(SUM(CAST(cp.${calculatedAreaColumn} AS DECIMAL)), 0),4) AS area
              FROM public.${groupViews.PRODES.children.CAR_X_PRODES.tableName} cp
              WHERE cp.${analysisCarIdColumn} = '${carGid}'
              GROUP BY date
              ORDER BY date
            )
            SELECT dr.date, coalesce(rv.area, 0) || ' ha' AS area
            FROM date_range AS dr
            LEFT JOIN report_values AS rv ON (dr.date = rv.date)
          `;

  let deforestationHistory = await sequelize.query(deforestationHistorySql, {
    type: QueryTypes.SELECT,
  });

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

getBurnedData = async (
    groupViews,
    analysisCarIdColumn,
    carIdColumn,
    executionDateColumn,
    carGid,
    filter
) => {
  const burningAuthorizationSql = `
        SELECT aut.titulo_nu1 AS authorization_number,
        TO_CHAR(aut.data_apro1, 'DD/MM/YYYY') AS approval_date,
        TO_CHAR(aut.data_venc1, 'DD/MM/YYYY') AS expiration_date
        FROM public.${groupViews.STATIC.children.AUTORIZACAO_QUEIMA.tableName} AS aut
        JOIN public.${groupViews.STATIC.children.CAR_VALIDADO.tableName} AS car
        ON st_contains(car.geom, aut.geom)
        WHERE car.${carIdColumn} = ${carGid}
        AND '${filter.date[0]}' <= aut.data_apro1
        AND '${filter.date[1]}' >= data_venc1
        GROUP BY authorization_number, approval_date, expiration_date
    `;

  const burningAuthorization = await sequelize.query(burningAuthorizationSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      authorization_number: 'authorizationNumber',
      approval_date: 'approvalDate',
      expiration_date: 'expirationDate'
    }
  })

  const totalFireSpotSql = `
        SELECT COUNT(1) AS total
        FROM public.${groupViews.BURNED.children.CAR_X_FOCOS.tableName} car_focos
        WHERE car_focos.${analysisCarIdColumn} = ${carGid}
        AND car_focos.${executionDateColumn} BETWEEN '${filter.date[0]}' AND '${filter.date[1]}'
    `;

  let totalFireSpot = await sequelize.query(totalFireSpotSql, {
    type: QueryTypes.SELECT,
    plain: true,
    raw: true
  });

  totalFireSpot = totalFireSpot.total;

  const sqlHistoryFireSpot = `
            SELECT COUNT(1) AS total,
            COUNT(1) filter(where to_char(car_focos.execution_date, 'MMDD') between '0715' and '0915') as prohibitive_period,
            (EXTRACT(YEAR FROM car_focos.execution_date))::INT AS month_year_occurrence
            FROM public.${groupViews.BURNED.children.CAR_X_FOCOS.tableName} car_focos
            WHERE car_focos.${analysisCarIdColumn} = ${carGid}
            AND car_focos.${executionDateColumn} BETWEEN '2008-01-01T00:00:00.000Z' AND '${filter.date[1]}'
            GROUP BY month_year_occurrence
            ORDER BY month_year_occurrence
        `;

  const historyFireSpot = await sequelize.query(sqlHistoryFireSpot, {
    type: QueryTypes.SELECT,
    fieldMap: {
      prohibitive_period: 'prohibitivePeriod',
      month_year_occurrence: 'monthYearOccurrence'
    }
  });

  return {
    burningAuthorization,
    totalFireSpot,
    historyFireSpot
  };
};

getDeterImages = async (
    reportData,
    groupViews,
    carIdColumn,
    analysisCarIdColumn,
    geoserverTime,
    filter
) => {
  const images = {};
  const cql_filter_deter = `${ analysisCarIdColumn }='${ reportData.gid }'${ Filter.getFilterClassSearch("", filter, groupViews.DETER.children.CAR_X_DETER, groupViews.DETER.tableOwner) }`;
  const layers = [
    `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    `${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`
  ];
  const filters = `cql_filter=${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`;
  reportData.vectorgroupViews = {layers, filters};

  images['propertyLocationImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.stateBBox }`,
    cql_filter: `geocodigo<>'';municipio='${ reportData.cityName }';numero_do1='${ reportData.stateRegister }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.MUNICIPIOS.workspace }:${ groupViews.STATIC.children.MUNICIPIOS.view },${ groupViews.STATIC.children.MUNICIPIOS.workspace }:${ groupViews.STATIC.children.MUNICIPIOS.view },${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    styles: "",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['propertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['spotPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:MosaicSpot2008,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: `${ geoserverTime }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['landsatPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:LANDSAT_8_2018,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: `${ geoserverTime }`,
    width: `${ config.geoserver.imgWidth }`
  }), [200, 200], [0, 10], 'center');

  images['sentinelPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:SENTINEL_2_2019,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: `${ geoserverTime }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['planetPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ cql_filter_deter }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: `${ geoserverTime }`,
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
      cql_filter: `RED_BAND>0;${ groupViews.DETER.children.CAR_X_DETER.tableName }_id='${ deforestationAlert.id }'`,
      height: `${ config.geoserver.imgHeight }`,
      layers: `terrama2_35:${ view }${ yearBefore },${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`,
      styles: `,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
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
      cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ groupViews.DETER.children.CAR_X_DETER.tableName }_id='${ deforestationAlert.id }'`,
      height: `${ config.geoserver.imgHeight }`,
      layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.DETER.children.CAR_X_DETER.workspace }:${ groupViews.DETER.children.CAR_X_DETER.view }`,
      srs: `EPSG:${ config.geoserver.planetSRID }`,
      styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
      time: `P1Y/${ deforestationAlert.year }`,
      width: `${ config.geoserver.imgWidth }`
    });
  }
  return images;
};

getProdesImages = async (
    reportData,
    groupViews,
    carIdColumn,
    analysisCarIdColumn,
    filterDate
) => {
  const images = [];
  const layers = [
    `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    `${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`,
  ];
  const filters = `cql_filter=${ carIdColumn }=${ reportData.gid };${ analysisCarIdColumn }=${ reportData.gid }`;
  reportData.vectorgroupViews = {layers, filters};

  images['propertyLocationImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.stateBBox }`,
    cql_filter: `geocodigo<>'';municipio='${ reportData.cityName.replace("'", "''") }';numero_do1='${ reportData.stateRegister }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.MUNICIPIOS.workspace }:${ groupViews.STATIC.children.MUNICIPIOS.view },${ groupViews.STATIC.children.MUNICIPIOS.workspace }:${ groupViews.STATIC.children.MUNICIPIOS.view },${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    styles: "",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['propertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['deforestationLegendImage'] = reportUtil.getImageObject(await geoserverService.getLegendImage({
    format: "image/png",
    height: "30",
    layer: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:CAR_VALIDADO_X_CAR_PRODES_X_USOCON`,
    version: "1.0.0",
    width: "30",
    legend_options: "forceLabels:on;forceTitles:off;layout:vertical;columns:2;fontSize:16",
  }), [200, 200], [0, 10], 'center');

  images['deforestationPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ analysisCarIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_yellow_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,terrama2_119:${ groupViews.DYNAMIC.children.PRODES.view }_color_style`,
    time: `${ reportData["deforestationPeriod"]["startYear"] }/${ reportData["deforestationPeriod"]["endYear"] }`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['spotPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox.replace(/\\s /g, "") }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ analysisCarIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:MosaicSpot2008,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: "P1Y/2019",
    width: `${ config.geoserver.imgWidth }`
  }), [200, 200], [0, 10], 'center');

  images['landsatPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ analysisCarIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:LANDSAT_8_2018,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: "P1Y/2018",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['sentinelPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.bbox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ analysisCarIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `terrama2_35:SENTINEL_2_2019,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    time: "P1Y/2019",
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['planetPropertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ analysisCarIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  const deforestationHistory = reportData.deforestationHistory;
  let count = 0;
  for (const deforestation of deforestationHistory) {
    const {date} = deforestation;
    let view = date < 2013 ? "LANDSAT_5_" : date < 2017 ? "LANDSAT_8_" : "SENTINEL_2_";
    view = `${ view }${ date }`

    let layers = `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.STATIC.children.CAR_X_USOCON.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }`;
    let styles = `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_X_USOCON.view }_hatched_style,${ groupViews.PRODES.children.CAR_X_PRODES.workspace }:${ groupViews.PRODES.children.CAR_X_PRODES.view }_Mod_style`
    let cqlFilter = `${ carIdColumn }='${ reportData.gid }';gid_car='${ reportData.gid }';${ analysisCarIdColumn }='${ reportData.gid }'`;

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

  images['ndviImages'] = await reportUtil.getNDVI(reportData.gid, filterDate, ReportType.PRODES);
  return images;
};

getBurnedImages = async (
    reportData,
    groupViews,
    carIdColumn,
    analysisCarIdColumn,
    geoserverTime
) => {
  const images = [];
  const layers = [
    `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    `${ groupViews.BURNED.children.CAR_X_FOCOS.workspace }:${ groupViews.BURNED.children.CAR_X_FOCOS.view }`,
  ];
  const filters = `cql_filter=${ carIdColumn }=${ reportData.gid };${ analysisCarIdColumn }=${ reportData.gid }`;
  reportData.vectorgroupViews = {layers, filters};

  images['propertyLimitImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }='${ reportData.gid }'`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style`,
    width: `${ config.geoserver.imgWidth }`,
  }), [200, 200], [0, 10], 'center');

  images['propertyFireSpotsImage'] = reportUtil.getImageObject(await geoserverService.getMapImage({
    bbox: `${ reportData.planetBBox }`,
    cql_filter: `RED_BAND>0;${ carIdColumn }=${ reportData.gid };${ analysisCarIdColumn }=${ reportData.gid }`,
    height: `${ config.geoserver.imgHeight }`,
    layers: `${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:planet_latest_global_monthly,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${ groupViews.BURNED.children.CAR_X_FOCOS.workspace }:${ groupViews.BURNED.children.CAR_X_FOCOS.view }`,
    srs: `EPSG:${ config.geoserver.planetSRID }`,
    styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${ groupViews.STATIC.children.CAR_VALIDADO.view }_Mod_style,${ groupViews.BURNED.children.CAR_X_FOCOS.workspace }:${ groupViews.BURNED.children.CAR_X_FOCOS.view }_style`,
    time: `${ geoserverTime }`,
    width: `${ config.geoserver.imgWidth }`
  }), [180, 180], [0, 10], 'center');

  const charts = [];
  charts["fireSpotHistoryChart"] = reportUtil.getImageObject(
    await FiringCharts.historyFireSpot(reportData.historyFireSpot).toDataUrl(),
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

module.exports.getNDVI = async (carGid, date, type) => {
  return reportUtil.getNDVI(carGid, date, type);
}
