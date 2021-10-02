const Filter = require("../utils/filter.utils");
const {sequelize, Report} = require("../models");
const {QueryTypes} = require("sequelize");
const config = require(__dirname + "/../config/config.json");

module.exports.getDeterTotalDeforestationArea = async (carGid, filter) => {
  const totalDeforestationAreaSql = `
            SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
            FROM public.a_cardeter_31
            WHERE de_car_validado_sema_gid = '${carGid}'
            ${Filter.getDateFilterSql(filter.date)}
            ${Filter.getFilterClassSearch(filter, true)}
  `;

  return await sequelize.query(totalDeforestationAreaSql, {
    type: QueryTypes.SELECT,
    plain: true,
    raw: true
  });
};

module.exports.getDeterDeforestationPerClass = async (carGid, filter) => {
  const deforestationPerClassSql = `
      SELECT 'APP' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_cardeter_app_68
      WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'ARL' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_reserva_36
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'TI' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_ti_39
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'AUTEX' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_explora_92
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'AD' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_desmate_91
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'Área embargada' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_emb_41
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'Área desembargada' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_desemb_42
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'UC – US' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_uc_40
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        and de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
      UNION ALL
        SELECT 'UC – PI' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_uc_40
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
        AND de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
      UNION ALL
        SELECT 'AQC' AS class_name, COALESCE(SUM(CAST(calculated_area_ha  AS DECIMAL)), 0) AS area
        FROM public.a_cardeter_queima_44
        WHERE a_cardeter_31_de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        ${Filter.getFilterClassSearch(filter, false)}
    `;

  return await sequelize.query(deforestationPerClassSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      class_name: 'className'
    }
  });
};

module.exports.getDeterDeforestationAlerts = async (carGid, filter) => {
  const deforestationAlertsSql = `
      SELECT
            carxdeter.a_cardeter_31_id AS id,
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
      FROM public.a_cardeter_31 AS carxdeter, public.de_biomas_mt biomes
      WHERE de_car_validado_sema_gid = '${carGid}'
            ${Filter.getDateFilterSql(filter.date)}
            ${Filter.getFilterClassSearch(filter, true)}
            AND st_intersects(biomes.geom, carxdeter.intersection_geom)
      GROUP BY a_cardeter_31_id, biomes.gid `;

  return await sequelize.query(deforestationAlertsSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      path_row: 'pathRow',
      date_code: 'dateCode'
    }
  });
};

module.exports.getProdesTotalDeforestationArea = async (carGid, filter) => {
  const totalDeforestationAreaSql = `
      SELECT COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_1
      where de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)} `;

  return await sequelize.query(totalDeforestationAreaSql, {
        type: QueryTypes.SELECT,
        plain: true,
        raw: true
      }
  );
};

module.exports.getProdesVegRadam = async (carGid) => {
  const vegRadamSql = `
        SELECT fisionomia,
        ROUND(CAST(area_ha_car_vegradam AS DECIMAL), 4) AS area
        FROM car_x_vegradam
        WHERE gid = ${carGid} `;

  return await sequelize.query(vegRadamSql, {
    type: QueryTypes.SELECT
  });
};

module.exports.getProdesConsolidateUseArea = async (carGid) => {
  const consolidateUseAreaSql = `
    SELECT ROUND(COALESCE(SUM(CAST(area_ha_car_usocon AS DECIMAL)), 0), 4) AS area
    FROM public.de_car_x_usocon
    where gid_car = '${carGid}'`;

  return await sequelize.query(consolidateUseAreaSql, {
    type: QueryTypes.SELECT,
    plain: true
  });
};

module.exports.getProdesDeforestationPerClass = async (carGid, filter) => {
  const deforestationPerClassSql = `
      SELECT 'TI' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_ti_7
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'ARL' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_reserva_64
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'APP' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_app_67
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'AUTEX' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_explora_90
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'AD' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_desmate_89
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'AUR' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_usorestrito_15
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'Área embargada' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_emb_9
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'Área desembargada' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_desemb_10
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'AQC' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_queima_12
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}' ${Filter.getDateFilterSql(filter.date)}
      UNION ALL
      SELECT 'UC – US' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_uc_8
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      and de_unidade_cons_sema_grupo = 'USO SUSTENTÁVEL'
      UNION ALL
      SELECT 'UC – PI' AS class_name, COALESCE(SUM(CAST(calculated_area_ha AS DECIMAL)), 0) AS area
      FROM public.a_carprodes_uc_8
      WHERE a_carprodes_1_de_car_validado_sema_gid = '${carGid}'
      ${Filter.getDateFilterSql(filter.date)}
      and de_unidade_cons_sema_grupo = 'PROTEÇÃO INTEGRAL'
    `;

  return await sequelize.query(deforestationPerClassSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      class_name: 'className'
    }
  });
};

module.exports.getProdesDeforestationByVegetationType = async (carGid, filter) => {
  const deforestationByVegetationTypeSql = `
    SELECT fisionomia AS class_name,
    SUM(ST_Area(ST_Intersection(car_prodes.intersection_geom, radam.geom)::geography) / 10000.0) AS area
    FROM public.a_carprodes_1 AS car_prodes,
    public.de_veg_radambr AS radam
    WHERE car_prodes.de_car_validado_sema_gid = '${carGid}'
    ${Filter.getDateFilterSql(filter.date)}
    AND ST_Intersects(car_prodes.intersection_geom, radam.geom)
    GROUP BY radam.fisionomia`;

  return await sequelize.query(deforestationByVegetationTypeSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      class_name: 'className'
    }
  });
}

module.exports.getProdesDeforestationByYear = async (carGid, filter) => {
  const deforestationByYearSql = `
        SELECT extract(year from date_trunc('year', cp.execution_date)) AS year,
        ROUND(COALESCE(SUM(CAST(cp.calculated_area_ha AS DECIMAL)), 0), 4) AS area
        FROM public.a_carprodes_1 AS cp
        WHERE cp.de_car_validado_sema_gid = '${carGid}'
        ${Filter.getDateFilterSql(filter.date)}
        GROUP BY year
        ORDER BY year `;

  return await sequelize.query(deforestationByYearSql, {
    type: QueryTypes.SELECT
  });
}

module.exports.getDeforestationPeriod = async (carGid, filter) => {
  const deforestationPeriodSql = `
          SELECT 2006 AS start_year,
          MAX(prodes.ano) AS end_year
          FROM dd_prodes_inpe AS prodes`;

  return await sequelize.query(deforestationPeriodSql, {
        type: QueryTypes.SELECT,
        plain: true,
        raw: true,
        fieldMap: {
          start_year: 'startYear',
          end_year: 'endYear',
        }
      }
  );
}

module.exports.getDeforestationHistory = async (carGid, filter) => {
  const deforestationHistorySql = `
          WITH
            date_range AS (SELECT generate_series(2006, extract(year from current_date)::int -1) AS date),
            report_values AS
            (
              SELECT extract(year from cp.execution_date) AS date,
              ROUND(COALESCE(SUM(CAST(cp.calculated_area_ha AS DECIMAL)), 0),4) AS area
              FROM public.a_carprodes_1 cp
              WHERE cp.de_car_validado_sema_gid = '${carGid}'
              GROUP BY date
              ORDER BY date
            )
            SELECT dr.date, coalesce(rv.area, 0) || ' ha' AS area
            FROM date_range AS dr
            LEFT JOIN report_values AS rv ON (dr.date = rv.date)
          `;

  return await sequelize.query(deforestationHistorySql, {
    type: QueryTypes.SELECT
  });
}

module.exports.getBurningAuthorization = async (carGid, filter) => {
  const burningAuthorizationSql = `
        SELECT aut.titulo_nu1 AS authorization_number,
        TO_CHAR(aut.data_apro1, 'DD/MM/YYYY') AS approval_date,
        TO_CHAR(aut.data_venc1, 'DD/MM/YYYY') AS expiration_date
        FROM public.de_autorizacao_queima_sema AS aut
        JOIN public.de_car_validado_sema AS car
        ON st_contains(car.geom, aut.geom)
        WHERE car.gid = ${carGid}
        AND '${filter.date[0]}' <= aut.data_apro1
        AND '${filter.date[1]}' >= data_venc1
        GROUP BY authorization_number, approval_date, expiration_date
    `;

  return await sequelize.query(burningAuthorizationSql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      authorization_number: 'authorizationNumber',
      approval_date: 'approvalDate',
      expiration_date: 'expirationDate'
    }
  })
}

module.exports.getTotalFireSpot = async (carGid, filter) => {
  const totalFireSpotSql = `
        SELECT COUNT(1) AS total
        FROM public.a_carfocos_99 car_focos
        WHERE car_focos.de_car_validado_sema_gid = ${carGid}
        AND car_focos.execution_date BETWEEN '${filter.date[0]}' AND '${filter.date[1]}'
    `;

  return await sequelize.query(totalFireSpotSql, {
    type: QueryTypes.SELECT,
    plain: true,
    raw: true
  });
}

module.exports.getFireSpotHistory = async (carGid, filter) => {
  const fireSpotHistorySql = `
            SELECT COUNT(1) AS total,
            COUNT(1) filter(where to_char(car_focos.execution_date, 'MMDD') between '0715' and '0915') as prohibitive_period,
            (EXTRACT(YEAR FROM car_focos.execution_date))::INT AS month_year_occurrence
            FROM public.a_carfocos_99 AS car_focos
            WHERE car_focos.de_car_validado_sema_gid = ${carGid}
            AND car_focos.execution_date BETWEEN '2008-01-01T00:00:00.000Z' AND '${filter.date[1]}'
            GROUP BY month_year_occurrence
            ORDER BY month_year_occurrence
        `;

  return await sequelize.query(fireSpotHistorySql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      prohibitive_period: 'prohibitivePeriod',
      month_year_occurrence: 'monthYearOccurrence'
    }
  });
}

module.exports.getNDVI = async (carGid, date) => {
  const sql = `
        SELECT main_table.a_carprodes_1_id AS id,
               ST_Y(ST_Centroid(main_table.intersection_geom)) AS "lat",
               ST_X(ST_Centroid(main_table.intersection_geom)) AS "long",
               extract(year from date_trunc('year', main_table.execution_date)) AS startYear
        FROM public.a_carprodes_1 AS main_table
        WHERE main_table.de_car_validado_sema_gid = '${carGid}'
          AND main_table.execution_date BETWEEN '${date[0]}' AND '${date[1]}'
        ORDER BY main_table.calculated_area_ha DESC
        LIMIT 5
    `;

  const deforestationAlerts = await sequelize.query(sql, {type: QueryTypes.SELECT});
  const carBbox = await this.getBBox(carGid);

  return {
    carBbox,
    deforestationAlerts
  };
};

module.exports.getBBox = async (carGid) => {
  const {planetSRID} = config.geoserver;
  const sqlBbox = `
    SELECT substring(ST_EXTENT(ST_Transform(geom, ${planetSRID}))::TEXT, 5, length(ST_EXTENT(ST_Transform(geom, ${planetSRID}))::TEXT) - 5) AS bbox
      FROM de_car_validado_sema
      WHERE gid = ${carGid}
      GROUP BY gid`;

  const bboxOptions = {
    type: QueryTypes.SELECT,
    plain: true
  };

  return await sequelize.query(sqlBbox, bboxOptions);
}

module.exports.generateNumber = async (type) => {
  const sql = `SELECT '${type.trim()}' AS type,
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
      newnumber: "newNumber",
    },
    plain: true,
  });
};

module.exports.saveReport = async (docName, newNumber, reportData, path) => {
  const report = new Report({
    name: docName.trim(),
    code: parseInt(newNumber),
    carCode: reportData.stateRegister
        ? reportData.stateRegister.trim()
        : reportData.federalregister,
    carGid: reportData.gid,
    path: path.trim(),
    type: reportData.type.trim(),
  });
  return await Report.create(report.dataValues).then((report) => report.dataValues);
};
