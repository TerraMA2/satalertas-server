const models = require('../models');
const {View} = models;
const {QueryTypes} = require('sequelize');
const BadRequestError = require("../errors/bad-request.error");
const ViewService = require("../services/view.service");
const QUERY_TYPES_SELECT = {type: QueryTypes.SELECT};

module.exports.get = async (type) => {
    if (!type) {
        throw new BadRequestError('Type not found');
    }
    const groupViews = await ViewService.getSidebarLayers(true);
    const tableName = groupViews['DYNAMIC'].children[type.toUpperCase()].tableName;
    if (!tableName) {
        throw new BadRequestError('Table not found');
    }
    const sql = ` 
                  SELECT ${ type }.classname AS name, row_number() over () AS gid FROM public.${ tableName } ${ type }
                  GROUP BY ${ type }.classname
                  ORDER BY ${ type }.classname
              `;

    return await View.sequelize.query(sql, QUERY_TYPES_SELECT);
}
