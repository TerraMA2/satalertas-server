"use strict";
const groupData = require("./burned_area.json");

const layersData = `SELECT
  (CASE WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
    ELSE dsf.value
    END) as table_name,
  vw.id AS "view_id"
FROM terrama2.views AS vw
INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
WHERE dsf.key = 'table_name' AND (CASE
  WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
  ELSE dsf.value
  END) IN (:tableNames)
ORDER BY view_id;`;
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { cod, label, layers = undefined } = groupData;
    const { QueryTypes } = queryInterface.sequelize;
    const optionsInsert = { raw: true, type: QueryTypes.INSERT };
    const optionsSelect = { raw: true, type: QueryTypes.SELECT };
    const optionsUpdate = { raw: true, type: QueryTypes.UPDATE };
    let createGroup = "INSERT INTO terrama2.groups (name, code)\n\t";
    createGroup += `VALUES ('${label}', '${cod}')\n\t`;
    createGroup += "RETURNING id;";
    const tableNames = layers.map((item) => item.tableName);
    queryInterface.sequelize
      .query(createGroup, optionsInsert)
      .then((result) => {
        return result[0][0]["id"];
      })
      .then(async (id) => {
        optionsSelect.replacements = { tableNames };
        return await queryInterface.sequelize.query(layersData, optionsSelect).then((result) => {
          result.forEach((resultItem) => {
            Object.assign(
              resultItem,
              layers.find((item) => item.tableName === resultItem.table_name)
            );
            delete resultItem.table_name;
            if (resultItem.hasOwnProperty("subLayers")) {
              const layersIds = result
                .filter((item) => resultItem.subLayers.includes(item.table_name))
                .map((item) => item.view_id);
              resultItem.subLayers = layersIds;
            }
          });
          return { groupId: id, layersToInsert: result };
        });
      })
      .then(async (result) => {
        const { groupId, layersToInsert } = result;
        let populateLayers =
          "INSERT INTO terrama2.rel_group_views (group_id, view_id, short_name)\n\t";
        populateLayers += "VALUES \n\t";
        const values = [];
        for (let layerToInsert of layersToInsert) {
          const { shortLabel, view_id: viewId } = layerToInsert;
          values.push(`(${groupId}, ${viewId}, '${shortLabel}')`);
        }
        populateLayers += values.join(",\n\t");
        populateLayers += "\n RETURNING id AS view_group_id, view_id;";
        const [insertResult, _] = await queryInterface.sequelize.query(
          populateLayers,
          optionsInsert
        );
        return { insertResult, layersToInsert };
      })
      .then((result) => {
        const { insertResult, layersToInsert } = result;
        const layersWithSublayers = layersToInsert.filter((item) =>
          item.hasOwnProperty("subLayers")
        );
        for (let layer in layersWithSublayers) {
          let updateSQL = "UPDATE terrama2.rel_group_views\n";
          const { view_group_id: layerGroupId } = insertResult.find(
            (item) => item.view_id === layersWithSublayers[layer].view_id
          );
          const subLayersIds = insertResult
            .filter((item) => layersWithSublayers[layer].subLayers.includes(item.view_id))
            .map((item) => item.view_group_id);
          optionsUpdate.replacements = { layerGroupId, subLayersIds };
          // Configuring primary layer
          updateSQL += `SET sub_layers = '{:subLayersIds}',\n`;
          updateSQL += `\tis_primary = true,\n`;
          updateSQL += `\tis_sublayer = false\n`;
          updateSQL += `WHERE id = :layerGroupId;`;
          queryInterface.sequelize.query(updateSQL, optionsUpdate);
          // Configuring sublayers
          let configSubLayerSQL = "UPDATE terrama2.rel_group_views\n";
          configSubLayerSQL += "SET is_sublayer = true\n";
          configSubLayerSQL += `WHERE id IN (:subLayersIds);`;
          queryInterface.sequelize.query(configSubLayerSQL, optionsUpdate);
        }
      });
  },

  down: async (queryInterface, Sequelize) => {
    const { cod } = groupData;
    const { QueryTypes } = queryInterface.sequelize;
    const optionsInsert = { raw: true, type: QueryTypes.DELETE };
    let removeGroup = 'DELETE FROM terrama2."groups"\n';
    removeGroup += `WHERE code = '${cod}'\n`;
    removeGroup += "RETURNING id;";
    queryInterface.sequelize
      .query(removeGroup, optionsInsert)
      .then((result) => result[0]["id"])
      .then((groupId) => {
        let removeGroupLayers = "DELETE FROM terrama2.rel_group_views\n";
        removeGroupLayers += "WHERE group_id = :groupId;";
        optionsInsert.replacements = { groupId };
        queryInterface.sequelize.query(removeGroupLayers, optionsInsert);
      });
  },
};
