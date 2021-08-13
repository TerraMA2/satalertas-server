const { QueryTypes } = require('sequelize');
const QUERY_TYPES_SELECT = { type: QueryTypes.SELECT };
const models = require('../models');
const { View, sequelize } = models;
const Filter = require("../utils/filter/filter.utils");
const InfoColumnsService = require("../services/info-columns.service");
const logger = require('../utils/logger');
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];

getColumnsTable = async function(tableName, schema, alias = '') {
  const sql =
    ` SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
        AND table_schema = '${schema}'
        AND column_name not like '%geom%' ` ;
  const columns = await sequelize.query(sql, QUERY_TYPES_SELECT)

  let columnsNameStr = '';
  alias = alias ? `${alias}.` : '';
  columns.forEach(column => {
    columnsNameStr += columnsNameStr === '' ? `${alias}${column.column_name}` : `, ${alias}${column.column_name}`;
  })
  return columnsNameStr;
}
getColumnByType = async function(tableName, schema, type) {
  const sql =
    ` SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
        AND table_schema = '${schema}'
        AND udt_name = '${type}'
      ORDER BY ordinal_position` ;
  const columns = await sequelize.query(sql, QUERY_TYPES_SELECT)

  return columns.length > 0 ? columns[0].column_name :  '' ;
}

const getSql = {
  async burnedCentroid(filter) {
    const table = filter.table
    return `
      WITH group_result AS (
        SELECT ${table.alias}.de_car_validado_sema_gid
        FROM ${table.name} AS ${table.alias} ${filter.secondaryTables}
        ${filter.sqlWhere}
        GROUP BY ${table.alias}.de_car_validado_sema_gid
        ${filter.sqlHaving}
      )
      SELECT  group_result.*
            , ST_Y(ST_Centroid(c.geom)) AS "lat"
            , ST_X(ST_Centroid(c.geom)) AS "long"
      FROM de_car_validado_sema AS c,
           group_result
      WHERE group_result.de_car_validado_sema_gid= c.gid
    `;
  },
  async popupInfo(filter) {
    return `
      WITH group_result AS (
        SELECT COUNT(1) AS ${filter.table.aliasAlert}, ${filter.table.alias}.${filter.table.columnGid}
        FROM ${filter.table.name} AS ${filter.table.alias} ${filter.secondaryTables}
        ${filter.sqlWhere}
        GROUP BY ${filter.table.alias}.${filter.table.columnGid}
        ${filter.sqlHaving}
      )
      SELECT group_result.*, ${filter.table.columnsTable}
      FROM de_car_validado_sema AS c,
           group_result
      ${filter.whereCar}
    `;
  },
  async popupInfoCar(filter) {
    return `
      SELECT ${filter.table.columnsTable}
      FROM de_car_validado_sema AS c
      ${filter.whereCar}
    `;
  },
  async othersData(filter) {
    const table = filter.table
    return `
      WITH group_result AS (
        SELECT ${table.alias}.de_car_validado_sema_gid
        FROM ${table.name} AS ${table.alias}
        ${filter.secondaryTables}
        ${filter.sqlWhere}
        GROUP BY ${table.alias}.de_car_validado_sema_gid
        ${filter.sqlHaving}
      )
      SELECT group_result.*, ${columnsTable}
      FROM de_car_validado_sema AS c,
           group_result
      WHERE group_result.de_car_validado_sema_gid= c.gid
    `;
  }
}

getFilter = async function (params) {
  const layer = JSON.parse(params.view);

  const table = {
    name: layer.tableName,
    alias: 'main_table',
    owner:  layer.isPrimary ? '' : `${layer.tableOwner}_`
  };

  const filter = await Filter.setFilter(View, params, table, layer);
  filter['table'] = table;

  return filter;
}

setInfoColumns = async function (data, codGroup) {
  const infoColumns = await InfoColumnsService.getInfoColumns(codGroup);
  const dataValue = data[0];
  const changedRow = [];
  for ( const e of Object.entries(dataValue)) {
    const key = e[0];
    if (key !== 'lat' && key !== 'long') {
      const value = e[1];
      if (infoColumns[key] && infoColumns[key].alias && infoColumns[key].alias !== undefined) {
        if (infoColumns[key].show) {
          changedRow.push({key: infoColumns[key].alias, value: value, type: infoColumns[key].type});
        }
      } else {
        changedRow.push({key, value});
      }
    }
  };
  return changedRow;
}

module.exports = mapService = {
  getAnalysisCentroid: {
    async burned(params){
      try {
        const filter = await getFilter(params);
        const sql = await getSql['burnedCentroid'](filter)

        return await sequelize.query(sql, QUERY_TYPES_SELECT);
      } catch (e) {
        const msgErr = `In unit map.service, in getAnalysisCentroid method getAnalysisCentroid.BURNED: ${e}`;
        logger.error(msgErr);
        throw new Error(msgErr);
      }
    },
    async others(params) {
      try {
        const layer = JSON.parse(params.view);

        const table = {
          name: layer.tableName,
          alias: 'main_table',
          owner:  layer.isPrimary ? '' : `${layer.tableOwner}_`
        };

        const filter =  await Filter.setFilter(View, params, table, layer);

        const column =  `${table.owner}de_car_validado_sema_numero_do1`;

        const sqlWhere =
          filter.sqlHaving ?
            ` ${filter.sqlWhere} 
          AND main_table.${column}  IN
            ( SELECT tableWhere.${column} AS subtitle
              FROM public.${table.name} AS tableWhere
              GROUP BY tableWhere.${column}
              ${filter.sqlHaving}) ` :
            filter.sqlWhere;

        const columnsTable = await getColumnsTable(layer.tableName, 'public')

        const select =
          ` SELECT  DISTINCT ${columnsTable}
                  , ST_Y(ST_Centroid(${table.alias}.intersection_geom)) AS "lat"
                  , ST_X(ST_Centroid(${table.alias}.intersection_geom)) AS "long"
          `;

        const from = ` FROM public.${table.name} AS ${table.alias} `;

        const sql = ` ${select}
                    ${from}
                    ${filter.secondaryTables}
                    ${filter.sqlWhere}
                    ${filter.order}
                    ${filter.limit}
                    ${filter.offset} `;

        let result;
        let resultCount;

        result = await sequelize.query(sql, QUERY_TYPES_SELECT);
        let dataJson = result;

        if (params.countTotal) {
          const sqlCount =
            ` SELECT COUNT(1) AS count FROM public.${table.name} AS ${table.alias}
              ${filter.secondaryTables}
              ${sqlWhere} `;

          resultCount = await sequelize.query(sqlCount, QUERY_TYPES_SELECT);
          dataJson.push(resultCount[0]['count']);
        }

        return dataJson;
      } catch (e) {
        const msgErr = `In unit map.service, in getAnalysisCentroid method getAnalysisCentroid.OTHERS: ${e}`;
        logger.error(msgErr);
        throw new Error(msgErr);
      }
    }
  },
  async getPopupInfo(params){
    try {
      const table = {
        name: params.view.tableName,
        alias: 'main_table',
        owner:  params.view.isPrimary ? '' : `${params.view.tableOwner}_`,
        columnGid: 'de_car_validado_sema_gid',
        aliasAlert: 'alerts',
        columnsTable: await getColumnsTable('de_car_validado_sema', 'public', 'c')
      };

      const columns = await Filter.getColumns(params.view, table.owner, table.alias);

      const filter = await Filter.getFilter(View, table, params, params.view, columns);
      filter.table = table;
      filter.sqlWhere = filter.sqlWhere ? `${filter.sqlWhere} AND ${table.alias}.${table.columnGid} = ${params.carGid} ` : `WHERE ${table.alias}.${table.columnGid} = ${params.carGid} `;
      filter.whereCar = `WHERE c.gid = ${params.carGid}`

      const type = params.codGroup === 'STATIC' ? 'popupInfoCar' : 'popupInfo';

      const sql = await getSql[type](filter)

      const data = await sequelize.query(sql, QUERY_TYPES_SELECT)
      return setInfoColumns(data, params.codGroup);
    } catch (e) {
      const msgErr = `In unit map.service, method getAnalysisData.BURNED:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getAnalysisData(params) {
    try {
      const layer = JSON.parse(params.view);

      const table = {
        name: layer.tableName,
        alias: 'main_table',
        owner:  layer.isPrimary ? '' : `${layer.tableOwner}_`
      };

      const filter =  await Filter.setFilter(View, params, table, layer);

      const column =  `${table.owner}de_car_validado_sema_numero_do1`;

      const sqlWhere =
        filter.sqlHaving ?
          ` ${filter.sqlWhere} 
        AND main_table.${column}  IN
          ( SELECT tableWhere.${column} AS subtitle
            FROM public.${table.name} AS tableWhere
            GROUP BY tableWhere.${column}
            ${filter.sqlHaving}) ` :
          filter.sqlWhere;

      const columnsTable = await getColumnsTable(layer.tableName, 'public')

      const select =
        ` SELECT  DISTINCT ${columnsTable}
                , ST_Y(ST_Centroid(${table.alias}.intersection_geom)) AS "lat"
                , ST_X(ST_Centroid(${table.alias}.intersection_geom)) AS "long"
        `;

      const from = ` FROM public.${table.name} AS ${table.alias} `;

      const sql = ` ${select}
                  ${from}
                  ${filter.secondaryTables}
                  ${sqlWhere}
                  ${filter.order}
                  ${filter.limit}
                  ${filter.offset} `;

      let result;
      let resultCount;

      result = await sequelize.query(sql, QUERY_TYPES_SELECT);
      let dataJson = result;

      if (params.countTotal) {
        const sqlCount =
          ` SELECT COUNT(1) AS count FROM public.${table.name} AS ${table.alias}
            ${filter.secondaryTables}
            ${sqlWhere} `;

        resultCount = await sequelize.query(sqlCount, QUERY_TYPES_SELECT);
        dataJson.push(resultCount[0]['count']);
      }

      return dataJson;
    } catch (e) {
      const msgErr = `In unit map.service, method getAnalysisData.others:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getStaticData(params) {
    try {
      const specificParameters = JSON.parse(params.specificParameters);

      const layer = JSON.parse(specificParameters.view);

      const columnsTable = await getColumnsTable(layer.tableName, 'public')

      const sqlSelect =
        ` SELECT  ${columnsTable},
                  ST_Y(ST_Transform (ST_Centroid(geom), ${confGeoServer.sridTerraMa})) AS "lat",
                  ST_X(ST_Transform (ST_Centroid(geom), ${confGeoServer.sridTerraMa})) AS "long" `;
      let sqlFrom = '';
      let sqlWhere = '';

      sqlFrom += ` FROM public.${layer.tableName}`;

      if (specificParameters.sortColumn && specificParameters.sortOrder) {
        sqlWhere += ` ORDER BY ${specificParameters.sortColumn} ${specificParameters.sortOrder === 1?'ASC':'DESC'}`
      }

      if (specificParameters.limit) {
        sqlWhere += ` LIMIT ${specificParameters.limit}`
      }

      if (specificParameters.offset) {
        sqlWhere += ` OFFSET ${specificParameters.offset}`
      }

      const sql = sqlSelect + sqlFrom + sqlWhere;

      let result;
      let resultCount;

      result = await sequelize.query(sql, QUERY_TYPES_SELECT);
      let dataJson = result;

      let sqlCount;
      if (specificParameters.countTotal) {
        sqlCount = `SELECT COUNT(1) AS count FROM public.${layer.tableName}`;
        resultCount = await sequelize.query(sqlCount, QUERY_TYPES_SELECT);

        dataJson.push(resultCount[0]['count']);
      }

      return dataJson;
    } catch (e) {
      const msgErr = `In unit map.service, method getStaticData:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  },
  async getDynamicData(params) {
    try {
      const specificParameters = JSON.parse(params.specificParameters);
      const date = params.date;
      const filter = JSON.parse(params.filter);

      const layer = JSON.parse(specificParameters.view);

      const tableName = layer.tableName;
      const geomColumn = await getColumnByType(tableName,'public',  'geometry');
      const timeStampColumn = await getColumnByType(tableName,'public',  'timestamptz')
      const columnsTable = await getColumnsTable(layer.tableName, 'public')

      const sqlSelect =
        ` SELECT  ${columnsTable}
                  , ST_Y(ST_Transform (ST_Centroid(${geomColumn}), ${confGeoServer.sridTerraMa})) AS "lat"
                  , ST_X(ST_Transform (ST_Centroid(${geomColumn}), ${confGeoServer.sridTerraMa})) AS "long"
          FROM public.${tableName} 
        `;

      let sqlWhere = '';
      if (date) {
        const dateFrom = date[0];
        const dateTo = date[1];

        sqlWhere += `
              WHERE ${timeStampColumn}::date >= '${dateFrom}' AND ${timeStampColumn}::date <= '${dateTo}'
          `
      }

      if (specificParameters.sortColumn && specificParameters.sortOrder) {
        sqlWhere += ` ORDER BY ${specificParameters.sortColumn} ${specificParameters.sortOrder === 1?'ASC':'DESC'}`
      }

      if (specificParameters.limit) {
        sqlWhere += ` LIMIT ${specificParameters.limit}`
      }

      if (specificParameters.offset) {
        sqlWhere += ` OFFSET ${specificParameters.offset}`
      }

      const sql = sqlSelect + sqlWhere;

      let dataJson = await sequelize.query(sql);

      if (specificParameters.countTotal) {
        const resultCount = await sequelize.query(`SELECT COUNT(1) AS count FROM public.${tableName}`);
        dataJson.push(resultCount[0]['count'])
      }

      return dataJson;
    } catch (e) {
      const msgErr = `In unit map.service, method getDynamicData:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  }
};
