const models = require('../models');
const {View} = models;
const {QueryTypes} = require('sequelize');
const BadRequestError = require("../errors/bad-request.error");

module.exports.get = async (type) => {
  if (!type) {
    throw new BadRequestError('Error occurred while getting classes');
  }
  const sql = `SELECT ${ type }.classname AS name, row_number() over () AS gid FROM public.dd_deter_inpe ${ type }
                 GROUP BY ${ type }.classname
                 ORDER BY ${ type }.classname`;

  return await View.sequelize.query(sql, {type: QueryTypes.SELECT});
}
