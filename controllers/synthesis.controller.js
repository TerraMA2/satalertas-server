const synthesisService = require("../services/synthesis.service");
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

module.exports.getPropertyData = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const propertyData = await synthesisService.getPropertyData(carGId);
    res.json(response(httpStatus.SUCCESS, propertyData));
  } catch (e) {
    next(e);
  }
}
module.exports.getVisions = async (req, res, next) => {
  try {
    const {carGId, date} = req.query;
    const visions = await synthesisService.getVisions(carGId, date);
    res.json(response(httpStatus.SUCCESS, visions));
  } catch (e) {
    next(e);
  }
}
module.exports.getLegends = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const legends = await synthesisService.getLegends(carGId);
    res.json(response(httpStatus.SUCCESS, legends));
  } catch (e) {
    next(e);
  }
}
module.exports.getDetailedVisions = async (req, res, next) => {
  try {
    const {carGId, date} = req.query;
    const detailedVisions = await synthesisService.getDetailedVisions(carGId, date);
    res.json(response(httpStatus.SUCCESS, detailedVisions));
  } catch (e) {
    next(e);
  }
}
module.exports.getDeforestation = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const deforestation = await synthesisService.getDeforestation(carGId);
    res.json(response(httpStatus.SUCCESS, deforestation));
  } catch (e) {
    next(e);
  }
}
module.exports.getDeterHistory = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const deterHistory = await synthesisService.getDeterHistory(carGId);
    res.json(response(httpStatus.SUCCESS, deterHistory));
  } catch (e) {
    next(e);
  }
}
module.exports.getProdesHistory = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const prodesHistory = await synthesisService.getProdesHistory(carGId);
    res.json(response(httpStatus.SUCCESS, prodesHistory));
  } catch (e) {
    next(e);
  }
}
module.exports.getFireSpotHistory = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const fireSpotHistory = await synthesisService.getFireSpotHistory(carGId);
    res.json(response(httpStatus.SUCCESS, fireSpotHistory));
  } catch (e) {
    next(e);
  }
}
module.exports.getBurnedAreaHistory = async (req, res, next) => {
  try {
    const {carGId} = req.query;
    const burnedAreaHistory = await synthesisService.getBurnedAreaHistory(carGId);
    res.json(response(httpStatus.SUCCESS, burnedAreaHistory));
  } catch (e) {
    next(e);
  }
}
module.exports.getCharts = async (req, res, next) => {
  try {
    const charts = await synthesisService.getCharts();
    res.json(response(httpStatus.SUCCESS, charts));
  } catch (e) {
    next(e);
  }
}
