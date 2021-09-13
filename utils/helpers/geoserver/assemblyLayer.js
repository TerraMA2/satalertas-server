const config = require(__dirname + '/../../../config/config.json');
const VIEWS = require('../views/view');
const { msgError } = require('../../../utils/messageError');

function layerData(layersList, options = undefined) {
  const {
    geoserverUrl = config.geoserver.baseUrl,
    transparent = true,
    geoservice = undefined,
  } = options;
  let layers;
  let url = `${geoserverUrl}`;
  if (Array.isArray(layers)) {
    layers = layersList.join(',');
  } else {
    layers = layersList;
  }
  if (geoservice) {
    url = `${geoserverUrl}/${geoservice}`;
  }

  return {
    url,
    layers,
    transparent,
    format: 'image/png',
    version: '1.1.0',
    time: 'P1Y/PRESENT',
  };
}

function setLegend(title, workspace, layer) {
  const url = `${config.geoserver.legendUrl}${workspace}:${layer}`;
  return {
    title,
    url,
  };
}

function setFilter(group, layer) {
  try {
    const view_default = `${group.workspace}:${layer.viewName}`;
    const filter = VIEWS.newFilter(
      view_default,
      `${ config.project }_${ config.geoserver.workspace }`,
      layer.code,
      field=layer.tableInfocolumns,
    );
    return filter;
  } catch (e) {
    throw new Error(msgError(__filename, 'setFilter', e))
  }
}

module.exports = {
  layerData,
  setLegend,
  setFilter,
};
