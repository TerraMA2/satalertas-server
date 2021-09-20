'use strict';
const auxiliaryTables = require('./auxyliarytables.json');
let sqlInsert = `INSERT INTO terrama2.infocolumn_table_list (table_name, type)
VALUES\n\t`;
sqlInsert += auxiliaryTables
  .map((table) => `('${table.tableName}', '${table.type}')`)
  .join(',\n\t');
sqlInsert += '\nRETURNING table_name, id;';
console.log("sqlInsert")

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    const { query, QueryTypes } = queryInterface.sequelize;
    const options = { raw: true, type: QueryTypes.INSERT }
    await queryInterface.sequelize.query(sqlInsert, options)
      .then((result) => result[0])
      .then(async (response) => {
        let sqlColumnsInsert =
          'INSERT INTO terrama2.infocolumn_columns_list (\n';
        sqlColumnsInsert +=
          '  table_id, column_name, primary_type, alias, column_position, hide, disable_editing, description\n';
        sqlColumnsInsert += ')\n';
        sqlColumnsInsert += 'VALUES\n\t';

        let values = [];
        response.forEach((element) => {
          const { id, table_name } = element;
          const columnsTable = auxiliaryTables.find(
            (table) => table.tableName === table_name,
          );
          columnsTable.columns.forEach((column) => {
            const {
              columnName,
              primaryType,
              alias,
              columnPosition,
              hide,
              disableEditing,
              description,
            } = column;
            const sql = `(${id}, '${columnName}', '${primaryType}', '${alias}', ${columnPosition}, ${hide}, ${disableEditing}, '${description}')`;
            values.push(sql);
          });
        });
        values = values.join(',\n\t');
        sqlColumnsInsert += values + ';';
        return await queryInterface.sequelize.query(sqlColumnsInsert, {type: QueryTypes.INSERT});
      });
  },

  down: async (queryInterface, Sequelize) => {},
};
