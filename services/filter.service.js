const config = require("../config/filters");
const infoColumns = require("./info-columns.service");

async function cityCQLFilter(filterData, filterLayer, infoColumns) {
  const { filter, layer } = filterData;
  const cityLayer = config.filter[filter.type];
  const cityColumns = await infoColumns.getInfocolumnsByTableName(cityLayer.table.name);
  let cqlCityFilter = "";
  const geocodeColumn = cityColumns.find((col) => col.secondaryType === "city_geocode");
  if (filterData.hasOwnProperty("geocodigo")) {
    cqlCityFilter = `${geocodeColumn} = ${filter.data.geocodigo}`;
  }
  let strCqlFilter = `INTERSECTS(${mainLayerGeometry},
      querySingle('${filterLayer.gsLayer}', '${filterLayerGeom}', '${cqlFilterLayer}')
      )`;
  return strCqlFilter;
}

exports.getGeoserverThemeFilter = async (filterData) => {
  const { filter, layer } = filterData;
  let cqlFilter;
  const filterLayerGeom = "";
  const mainLayerColumns = "";
  const mainLayerGeometry = "";
  switch (filter.type) {
    case "city":
      cqlFilter = cityCQLFilter(filter.data, filterLayer, filterLayerColumns);
      break;

    default:
      break;
  }
  return strCqlFilter;
};
