const env = process.env.NODE_ENV || 'development';
const confGeoServer = require('../../../geoserver-conf/config.json')[env];
const VIEWS = require('../views/view');
const { msgError } = require('../../../utils/messageError');

function layerData(layersList, options = undefined) {
  const {
    geoserverUrl = confGeoServer.baseHost,
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
  const url = `${confGeoServer.legendUrl}${workspace}:${layer}`;
  return {
    title,
    url,
  };
}

// function setFilter(groupViews, data_view) {
function setFilter(group, layer) {
  try {
    let filter = {};
    const view_default = `${group.workspace}:${layer.viewName}`;
    if (VIEWS[layer.groupCode] && VIEWS[layer.groupCode].filter) {
      filter = VIEWS[layer.groupCode].filter(
        view_default,
        confGeoServer.workspace,
        layer.cod,
        group[layer.groupCode].tableOwner,
        layer.is_primary,
        );
      }
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
