const {QueryTypes} = require('sequelize');
const QUERY_TYPES_SELECT = {type: QueryTypes.SELECT};
const {CarValidado, sequelize} = require('../models');
const Filter = require("../utils/filter/filter.utils");
const BadRequestError = require('../errors/bad-request.error');
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

module.exports.get = async (params) => {
    const specificParameters = JSON.parse(params.specificParameters);
    const filterReceived = JSON.parse(params.filter);
    const layer = JSON.parse(specificParameters.view);
    if (!specificParameters || !filterReceived || !layer) {
        throw new BadRequestError('Missing parameters');
    }

    const table = {
        name: layer.tableName,
        alias: specificParameters.tableAlias,
        owner: ''
    };

    const filter =
        specificParameters.isDynamic ?
            await Filter.setFilter(CarValidado, params, table, layer) :
            {
                sqlWhere: '',
                secondaryTables: '',
                sqlHaving: '',
                order: layer.groupCode !== 'BURNED' && (specificParameters.sortField && specificParameters.sortOrder) ? ` ORDER BY ${ specificParameters.sortField } ${ specificParameters.sortOrder === '1' ? 'ASC' : 'DESC' } ` : ``,
                limit: specificParameters.limit ? ` LIMIT ${ specificParameters.limit }` : '',
                offset: specificParameters.offset ? ` OFFSET ${ specificParameters.offset }` : ''
            };

    const sqlSelectCount = specificParameters.count ? `,COUNT(1) AS ${ specificParameters.countAlias }` : '';
    const sqlSelectSum = specificParameters.sum && layer.groupCode !== 'BURNED' ? `,SUM(${ specificParameters.tableAlias }.${ specificParameters.sumField }) AS ${ specificParameters.sumAlias }` : '';
    const sqlSelect =
        ` SELECT 
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
                ${sqlSelectSum}
                ${sqlSelectCount} `;

    const sqlFrom = ` FROM public.${ table.name } AS ${ specificParameters.tableAlias }`;

    const sqlGroupBy = layer && layer.groupCode && layer.groupCode === 'CAR' ? '' : ` GROUP BY property.gid `;

    const column = layer.isPrimary ? 'de_car_validado_sema_gid' : 'a_carfocos_20_de_car_validado_sema_gid';

    filter.secondaryTables += specificParameters.isDynamic ?
        '  , public.de_car_validado_sema AS property' :
        '';

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
        carResult = await sequelize.query(sql, QUERY_TYPES_SELECT);
    } catch (e) {
        return response(httpStatus.BAD_REQUEST, null)
    }

    const resultCount = await sequelize.query(
        ` SELECT 1
                                                    ${ sqlFrom } 
                                                    ${ filter.secondaryTables }
                                                    ${ sqlWhere } 
                                                    ${ sqlGroupBy } `,
        QUERY_TYPES_SELECT);

    carResult.push(resultCount && resultCount.length ? resultCount.length : 0);
    return carResult;
}
