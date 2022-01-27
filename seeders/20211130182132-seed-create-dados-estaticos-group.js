"use strict";

const groupCode = "DADOSESTATICOS";
let createGroup = "INSERT INTO terrama2.groups (name, code)\n\t";
createGroup += `VALUES ('Dados Estáticos', '${groupCode}')\n\t`;
createGroup += "RETURNING id;";

let removeGroup = `DELETE FROM terrama2."groups"
WHERE code = '${groupCode}'
RETURNING id;`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { QueryTypes } = queryInterface.sequelize;
    const options = { raw: true, type: QueryTypes.INSERT };
    await queryInterface.sequelize
      .query(createGroup, options)
      .then((result) => result[0][0])
      .then(async (result) => {
        let populateLayers = "INSERT INTO terrama2.rel_group_views (group_id, view_id)\n\t";
        populateLayers += `SELECT
      ${result["id"]} AS "group_id",
      vw.id AS "view_id"
    FROM terrama2.views AS vw
    INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
    INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
    LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
    WHERE dsf.key = 'table_name' AND dsf.value LIKE 'de_%'
    ORDER BY view_id;`;
        return await queryInterface.sequelize.query(populateLayers, options);
      });
  },

  down: async (queryInterface, _Sequelize) => {
    const { QueryTypes } = queryInterface.sequelize;
    const options = { raw: true, type: QueryTypes.DELETE };
    await queryInterface.sequelize.query(removeGroup, options);
  },
};
