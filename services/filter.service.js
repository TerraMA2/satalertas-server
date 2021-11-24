const config = require("../config/filter-config.json");
const infoColumns = require("./info-columns.service");
const layerService = require("./layer.service");

async function cityCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value.value;
  let layerFilterCql;
  const cityColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = cityColumns.tableInfocolumns.find(
    (col) => col.secondaryType === "city_geocode"
  );
  const geometryColumn = cityColumns.tableInfocolumns.find((col) => col.primaryType === "geometry");
  if (filterData.hasOwnProperty("geocodigo")) {
    layerFilterCql = `${geocodeColumn.columnName} = ${filterData.geocodigo}`;
  }
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},querySingle('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}'))`;
  return strCqlFilter;
}

async function countyCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value.value;
  let layerFilterCql = "";
  const cityColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = cityColumns.tableInfocolumns.find(
    (col) => col.secondaryType === "city_geocode"
  );
  const geometryColumn = cityColumns.tableInfocolumns.find((col) => col.primaryType === "geometry");
  if (filterData.hasOwnProperty("geocodigo")) {
    layerFilterCql = `${geocodeColumn.columnName} IN (${filterData.geocodeList})`;
  }
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},collectGeometries(queryCollection('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}')))`;
  return strCqlFilter;
}

async function mesoregionCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value;
  let layerFilterCql = "";
  const cityColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = cityColumns.tableInfocolumns.find(
    (col) => col.secondaryType === "city_geocode"
  );
  const geometryColumn = cityColumns.tableInfocolumns.find((col) => col.primaryType === "geometry");
  if (filterData.hasOwnProperty("geocodeList")) {
    layerFilterCql = `${geocodeColumn.columnName} IN (${filterData.geocodeList})`;
  }
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},collectGeometries(queryCollection('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}')))`;
  return strCqlFilter;
}

async function collectCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value;
  let layerFilterCql = "";
  const cityColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = cityColumns.tableInfocolumns.find(
    (col) => col.secondaryType === "city_geocode"
  );
  const geometryColumn = cityColumns.tableInfocolumns.find((col) => col.primaryType === "geometry");
  if (filterData.hasOwnProperty("geocodeList")) {
    layerFilterCql = `${geocodeColumn.columnName} IN (${filterData.geocodeList})`;
  }
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},collectGeometries(queryCollection('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}')))`;
  return strCqlFilter;
}

async function biomeCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value;
  let layerFilterCql;
  const layerFilterColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = layerFilterColumns.tableInfocolumns.find(
    (col) => col.columnName === "__gid"
  );
  const geometryColumn = layerFilterColumns.tableInfocolumns.find(
    (col) => col.primaryType === "geometry"
  );
  layerFilterCql = `${geocodeColumn.columnName} = ${filterData.gid}`;
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},querySingle('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}'))`;
  return strCqlFilter;
}

async function ucCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value;
  let layerFilterCql;
  const layerFilterColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = layerFilterColumns.tableInfocolumns.find(
    (col) => col.columnName === "codigo_uc"
  );
  const geometryColumn = layerFilterColumns.tableInfocolumns.find(
    (col) => col.primaryType === "geometry"
  );
  layerFilterCql = `${geocodeColumn.columnName} = ${filterData.ucCode}`;
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},querySingle('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}'))`;
  return strCqlFilter;
}

async function tiCQLFilter(filterValues, mainLayerGeometry, filterLayer) {
  const filterData = filterValues.value;
  let layerFilterCql;
  const layerFilterColumns = await infoColumns.getInfocolumnsByTableName(filterLayer.table.name);
  const geocodeColumn = layerFilterColumns.tableInfocolumns.find(
    (col) => col.columnName === "objectid"
  );
  const geometryColumn = layerFilterColumns.tableInfocolumns.find(
    (col) => col.primaryType === "geometry"
  );
  layerFilterCql = `${geocodeColumn.columnName} = ${filterData.objectId}`;
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},querySingle('${filterLayer.gsLayer}','${geometryColumn.columnName}','${layerFilterCql}'))`;
  return strCqlFilter;
}

exports.getGeoserverThemeFilter = async (filterData) => {
  const { filter, layer } = filterData;
  const mainLayer = await layerService.getLayerByViewId({
    groupView: layer,
    groupCode: layer.groupCode,
  });
  const filterLayer = config.filter[filter.type];
  const mainLayerColumns = mainLayer.tableInfocolumns;
  const mainLayerGeometry = mainLayerColumns.find((col) => col.primaryType === "geometry");
  switch (filter.type) {
    case config.filterTypes.CITY:
      return await cityCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.COUNTY:
      return await countyCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.MESOREGION:
      return await mesoregionCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.MICROREGION:
      return await collectCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.IMMEDIATEREGION:
      return await collectCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.INTERMEDIATEREGION:
      return await collectCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.PJBH:
      return await collectCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.BIOME:
      return await biomeCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.UC:
      return await ucCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    case config.filterTypes.TI:
      return await tiCQLFilter(filter, mainLayerGeometry.columnName, filterLayer);
    default:
      break;
  }
  // return cqlFilter;
};
