const GeoServerService = require("../services/geoServer.service");

exports.configGeoserver = async (req, res, next) => {
  res.json(await GeoServerService.configGeoserver());
};

exports.deleteViews = async (req, res, next) => {
  const views = req.body;
  res.json(await GeoServerService.deleteView(views));
};

exports.saveViews = async (req, res, next) => {
  res.json(await GeoServerService.saveViewsJsonGeoServer());
};

exports.updateDataStore = async (req, res, _next) => {
  const jsonData = req.body;
  res.json(await GeoServerService.updateDataStore(jsonData));

};
exports.updateAllDataStores = async (_req, res, _next) => {
  const result = await GeoServerService.updateAllDataStores()
  res.status(200).json(result);
};
