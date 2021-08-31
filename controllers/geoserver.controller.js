const GeoServerService = require("../services/geoServer.service");

exports.configGeoserver = async (req, res, next) => {
  res.json(await GeoServerService.configGeoserver());
};

exports.addUpdateFilterLayers = async (req, res, next) => {
  res.json(await GeoServerService.addUpdateFilterLayers());
};
