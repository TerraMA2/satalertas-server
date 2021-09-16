const models = require('../models');
const {View} = models;
const {QueryTypes} = require('sequelize');
const BadRequestError = require("../errors/bad-request.error");
const viewService = require("../services/view.service");

module.exports.get = async (type) => {
    if (!type) {
        throw new BadRequestError('Error occurred while getting classes');
    }
    const groupViews = await viewService.getSidebarLayers(true);
    const tableName = groupViews['DYNAMIC'].children[type.toUpperCase()].tableName;
    const sql = `SELECT ${ type }.classname AS name, row_number() over () AS gid FROM public.${ tableName } ${ type }
                 GROUP BY ${ type }.classname
                 ORDER BY ${ type }.classname`;

    return await View.sequelize.query(sql, {type: QueryTypes.SELECT});
}
