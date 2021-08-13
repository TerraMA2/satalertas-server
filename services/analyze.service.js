const models = require('../models');
const { View } = models;
const logger = require('../utils/logger');
const ViewUtil = require("../utils/view.utils");
const { QueryTypes } = require('sequelize');
const QUERY_TYPES_SELECT = { type: QueryTypes.SELECT };

const analyses = {
  async deter(group) {

    const sql = ` 
      SELECT deter.classname AS name, row_number() over () AS gid  FROM public.${group.table_name} deter
      GROUP BY deter.classname
      ORDER BY deter.classname
    `
    return View.sequelize.query(sql, QUERY_TYPES_SELECT);
  }
}
module.exports = AnalyzeService = {
  async getAllClassByType(type) {
    try {
      const groupView = await ViewUtil.getGrouped();

      return await analyses[type](groupView['DYNAMIC'].children[type.toUpperCase()]);
    } catch (e) {
      const msgErr = `In unit analyse.service, method getAllClassByType:${e}`;
      logger.error(msgErr);
      throw new Error(msgErr);
    }
  }
};
