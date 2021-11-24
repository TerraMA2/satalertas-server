const Sequelize = require("sequelize");
const {
  View,
  RegisteredView,
  DataSetFormat,
  DataSet,
  sequelize,
} = require("../models");
const { Op } = Sequelize;
const Tools = require("../utils/tool.utils");
const { layerData, setLegend, setFilter } = require("../utils/helpers/geoserver/assemblyLayer");
const infoColumnsService = require("./info-columns.service");
const layerTypeName = require("../enum/layer-type-name");
const { QueryTypes } = require("sequelize");

const viewTableName = {
  model: DataSet,
  as: "dataSet",
  attributes: ["id"],
  include: {
    model: DataSetFormat,
    as: "dataSetFormat",
    where: { key: { [Op.eq]: "table_name" } },
    attributes: [["value", "tableName"]],
  },
};

module.exports.removeNullProperties = (data) => {
  const filteredData = Object.entries(data).filter(([_, val]) => val);
  return Object.fromEntries(filteredData);
};

module.exports.getTableName = async (viewId) => {
  let sql = `SELECT
  (CASE
    WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
    ELSE dsf.value
    END), vw.id AS view_id
    FROM terrama2.views AS vw
    INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
    INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
    LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
    WHERE vw.id = $viewId AND dsf.key = 'table_name';`;
  const options = {
    type: QueryTypes.SELECT,
    fieldMap: { value: "tableName", view_id: "viewId" },
    bind: { viewId },
    plain: true,
  };
  const result = await sequelize.query(sql, options);
  return result.tableName;
};

module.exports.getLayerByViewId = async (params) => {
  const { groupView, groupCode } = params;
  let layer = {
    ...groupView,
    groupCode,
    tools: Tools,
    viewName: `view${groupView.viewId}`,
  };
  const options = {
    attributes: { exclude: ["id", "project_id", "data_series_id"] },
    include: [viewTableName],
  };
  await View.findByPk(groupView.viewId, options).then((response) => {
    const filteredResponse = this.removeNullProperties(response.toJSON());
    layer["type"] = layerTypeName[filteredResponse["sourceType"]];
    Object.assign(layer, filteredResponse);
    if (!layer["shortName"]) {
      layer.shortName = layer.name;
    }

    if (layer.isPrimary) {
      layer.tableOwner = layer.tableName;
    }
  });

  await infoColumnsService.getInfocolumnsByViewId(groupView.viewId).then((response) => {
    const { tableInfocolumns } = response;
    layer["tableInfocolumns"] = tableInfocolumns;
  });

  await RegisteredView.findOne({
    where: {
      view_id: groupView.viewId,
    },
    raw: true,
  }).then((response) => {
    const { workspace } = response;
    const layerDataOptions = { geoservice: "wms" };
    layer.layerData = layerData(`${workspace}:${layer.viewName}`, layerDataOptions);
    layer.legend = setLegend(layer.name, workspace, layer.viewName);
    // const gp = {
    //   workspace,
    //   groupView,
    // };
    // layer.filter = setFilter(gp, layer);
  });
  return await layer;
};
