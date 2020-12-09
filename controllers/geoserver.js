
const layersToInsert = require("../geoserver-conf/views/201911281134-create-layers-filter");
const layersToUpdate = require("../geoserver-conf/views/201912041412-update-layers-filter");
const GeoServerService = require("../services/geoServer.service");

exports.insertViews = async (req, res, next) => {
  res.json(await GeoServerService.saveViewsGeoServer(layersToInsert));
};

exports.updateViews = async (req, res, next) => {
  res.json(await GeoServerService.saveViewsJsonGeoServer(layersToUpdate));
};

exports.deleteViews = async (req, res, next) => {
  const views = req.body;
  res.json(await GeoServerService.deleteView(views));
};

exports.saveViews = async (req, res, next) => {
  const views = req.body;
  res.json(await GeoServerService.saveViewsJsonGeoServer(views));
};

exports.saveGroupLayer = async (req, res, next) => {
  const jsonConf = req.body;
  res.json(await GeoServerService.saveGroupLayer(jsonConf));
};

exports.updateDataStore = async (req, res, _next) => {
  const jsonData = req.body;
  res.json(await GeoServerService.updateDataStore(jsonData));
}
