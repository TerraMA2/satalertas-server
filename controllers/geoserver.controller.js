const GeoServerService = require("../services/geoServer.service");
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.configGeoserver = async (req, res, next) => {
    try {
        const geoserverResponse = await GeoServerService.configGeoserver()
        res.json(response(httpStatus.SUCCESS, geoserverResponse));
    } catch (e) {
        next(e);
    }
};
