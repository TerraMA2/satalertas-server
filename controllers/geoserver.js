
const layersToInsert = require("../geoserver-conf/views/201911281134-create-layers-filter");
const layersToUpdate = require("../geoserver-conf/views/201912041412-update-layers-filter");
const GeoServerService = require("../services/geoServer.service");

exports.insertLayers = async (req, res, next) => {
  res.json(await GeoServerService.saveViewsGeoServer(layersToInsert));
};

exports.updateLayers = async (req, res, next) => {
  res.json(await GeoServerService.saveViewsJsonGeoServer(layersToUpdate));
};

exports.deleteLayers = async (req, res, next) => {
  res.json(await GeoServerService.deleteView(insertLayers()));
};
