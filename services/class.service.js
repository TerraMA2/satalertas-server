const models = require('../models');
const {View} = models;
const ViewUtil = require("../utils/view.utils");
const {QueryTypes} = require('sequelize');
const {response} = require("../utils/response");
const BadRequestError = require("../errors/bad-request.error");
const QUERY_TYPES_SELECT = {type: QueryTypes.SELECT};
const httpStatus = require('../enum/http-status');

module.exports.get = async (type) => {
    if (!type) {
        throw new BadRequestError('Tipo não encontrado');
    }
    const groupView = await ViewUtil.getGrouped();
    const tableName = groupView['DYNAMIC'].children[type.toUpperCase()].table_name;
    if (!tableName) {
        throw new BadRequestError('Tabela não encontrada');
    }
    const sql = ` 
                  SELECT ${ type }.classname AS name, row_number() over () AS gid FROM public.${ tableName } ${ type }
                  GROUP BY ${ type }.classname
                  ORDER BY ${ type }.classname
              `;

    const data = await View.sequelize.query(sql, QUERY_TYPES_SELECT);
    return response(httpStatus.SUCCESS, data);
}
