const {QueryTypes} = require('sequelize');
const {CarValidado, sequelize} = require('../models');
const Filter = require("../utils/filter.utils");
const BadRequestError = require('../errors/bad-request.error');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');
const config = require(__dirname + '/../config/config.json');

module.exports.get = async (params) => {
    const specificParameters = JSON.parse(params.specificParameters);
    const filterReceived = JSON.parse(params.filter);
    const layer = JSON.parse(specificParameters.view);
    if (!specificParameters || !filterReceived || !layer) {
        throw new BadRequestError('Error occurred while getting CARs');
    }

    const table = {
        name: layer.tableName,
        alias: specificParameters.tableAlias,
        owner: ''
    };
    const order = layer.groupCode !== 'BURNED' && (specificParameters.sortField && specificParameters.sortOrder)
                    ? ` ORDER BY ${ specificParameters.sortField } 
                    ${ specificParameters.sortOrder === '1' ? 'ASC' : 'DESC' } ` : ``;
    const filter =
        specificParameters.isDynamic ?
            await Filter.setFilter(CarValidado, params, table, layer) :
            {
                sqlWhere: '',
                secondaryTables: '',
                sqlHaving: '',
                order,
                limit: specificParameters.limit ? ` LIMIT ${ specificParameters.limit }` : '',
                offset: specificParameters.offset ? ` OFFSET ${ specificParameters.offset }` : ''
            };

    const sqlSelectCount = specificParameters.count ? `,COUNT(1) AS ${ specificParameters.countAlias }` : '';
    const sqlSelectSum = specificParameters.sum && layer.groupCode !== 'BURNED' ? `,SUM(${ specificParameters.tableAlias }.${ specificParameters.sumField }) AS ${ specificParameters.sumAlias }` : '';
    const sqlSelect =
        `SELECT 
        property.gid AS gid,
        property.numero_do1 AS registro_estadual,
        property.numero_do2 AS registro_federal,
        property.nome_da_p1 AS nome_propriedade,
        property.municipio1 AS municipio,
        property.area_ha_ AS area,
        property.situacao_1 AS situacao,
        ST_Y(ST_Centroid(property.geom)) AS "lat",
        ST_X(ST_Centroid(property.geom)) AS "long",
        (SELECT count(1) > 0 FROM alertas.reports rep WHERE property.gid = rep.car_gid) AS has_pdf
        ${ sqlSelectSum }
        ${ sqlSelectCount }`;

    const sqlFrom = ` FROM public.${ table.name } AS ${ specificParameters.tableAlias }`;

    const sqlGroupBy = layer && layer.groupCode && layer.groupCode === 'CAR' ? '' : ` GROUP BY property.gid `;

    const column = layer.isPrimary ? 'de_car_validado_sema_gid' : 'a_carfocos_20_de_car_validado_sema_gid';

    filter.secondaryTables += specificParameters.isDynamic ? '  , public.de_car_validado_sema AS property' : '';

    filter.sqlWhere += specificParameters.isDynamic ?
        ` AND property.gid = ${ specificParameters.tableAlias }.de_car_validado_sema_gid ` : '';

    if (filterReceived.themeSelected && specificParameters.isDynamic) {
        filter.sqlWhere += ' AND property.geocodigo = county.geocodigo '
    }
    const sqlWhere =
        filter.sqlHaving ?
            ` ${ filter.sqlWhere }
            AND ${ specificParameters.tableAlias }.de_car_validado_sema_gid IN
                ( SELECT tableWhere.${ column } AS subtitle
                FROM public.${ table.name } AS tableWhere
                GROUP BY tableWhere.de_car_validado_sema_gid
                ${ filter.sqlHaving }) ` :
            filter.sqlWhere;

    let sql =
        `${ sqlSelect }
        ${ sqlFrom }
        ${ filter.secondaryTables }
        ${ sqlWhere }
        ${ sqlGroupBy }
        ${ filter.order }
        ${ filter.limit }
        ${ filter.offset }`;

    let carResult;
    try {
        carResult = await sequelize.query(sql, {type: QueryTypes.SELECT});
    } catch (e) {
        return response(httpStatus.BAD_REQUEST, null)
    }

    const resultCount = await sequelize.query(
        `SELECT 1
        ${ sqlFrom } 
        ${ filter.secondaryTables }
        ${ sqlWhere } 
        ${ sqlGroupBy }`,
        {type: QueryTypes.SELECT});

    carResult.push(resultCount && resultCount.length ? resultCount.length : 0);
    return carResult;
}

module.exports.getCarData = async (
    carTableName,
    cityTableName,
    sateCarColumn,
    federalCarColumn,
    carAreaColumn,
    carGId
) => {
    const sql = `
      SELECT
              car.gid AS gid,
              car.${ sateCarColumn } AS state_register,
              car.${ federalCarColumn } AS federal_register,
              ROUND(COALESCE(car.${ carAreaColumn }, 0), 4) AS area,
              ROUND(COALESCE((car.${ carAreaColumn }/100), 0), 4) AS area_km,
              car.nome_da_p1 AS name,
              car.municipio1 AS city,
              car.cpfcnpj AS cpf,
              car.nomepropri AS owner,
              munic.comarca AS county,
              substring(ST_EXTENT(munic.geom)::TEXT, 5, length(ST_EXTENT(munic.geom)::TEXT) - 5) AS city_bbox,
              substring(ST_EXTENT(UF.geom)::TEXT, 5, length(ST_EXTENT(UF.geom)::TEXT) - 5) AS state_bbox,
              substring(ST_EXTENT(car.geom)::TEXT, 5, length(ST_EXTENT(car.geom)::TEXT) - 5) AS bbox,
              substring(ST_EXTENT(ST_Transform(car.geom, ${config.geoserver.planetSRID}))::TEXT, 5, length(ST_EXTENT(ST_Transform(car.geom, ${config.geoserver.planetSRID}))::TEXT) - 5) AS planet_bbox,
              ST_Y(ST_Centroid(car.geom)) AS "lat",
              ST_X(ST_Centroid(car.geom)) AS "long"
      FROM public.${ carTableName } AS car
      INNER JOIN public.${ cityTableName } munic ON
              car.gid = '${ carGId }'
              AND munic.municipio = car.municipio1
      INNER JOIN de_uf_mt_ibge UF ON UF.gid = 1
      GROUP BY car.${ sateCarColumn }, car.${ federalCarColumn }, car.${ carAreaColumn }, car.gid, car.nome_da_p1, car.municipio1, car.geom, munic.comarca, car.cpfcnpj, car.nomepropri
    `;
    return await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        plain: true,
        fieldMap: {
            state_register: 'stateRegister',
            federal_register: 'federalRegister',
            area_km: 'areaKm',
            city_bbox: 'cityBBox',
            state_bbox: 'stateBBox',
            planet_bbox: 'planetBBox'
        }
    });
};
