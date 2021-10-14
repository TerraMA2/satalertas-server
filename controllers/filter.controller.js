const cityService = require('../services/city.service');
const countyService = require('../services/county.service');
const indigenousLandService = require('../services/indigenous-land.service');
const projusService = require('../services/projus.service');
const conservationUnitService = require('../services/conservation-unit.service');
const biomeService = require('../services/biome.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.getCity = async (req, res, next) => {
  try {
    const cities = await cityService.get();
    res.json(response(httpStatus.SUCCESS, cities));
  } catch (e) {
    next(e);
  }
};

exports.getCounty = async (req, res, next) => {
  try {
    const counties = await countyService.getAllCounties();
    res.json(response(httpStatus.SUCCESS, counties));
  } catch (e) {
    next(e);
  }
};

exports.getMesoregions = async (req, res, next) => {
  try {
    const mesoregions = await cityService.getMesoregions();
    res.json(response(httpStatus.SUCCESS, mesoregions));
  } catch (e) {
    next(e);
  }
};

exports.getImmediateRegion = async (req, res, next) => {
  try {
    const immediateRegions = await cityService.getImmediateRegion();
    res.json(response(httpStatus.SUCCESS, immediateRegions));
  } catch (e) {
    next(e);
  }
};

exports.getIntermediateRegion = async (req, res, next) => {
  try {
    const intermediateRegions = await cityService.getIntermediateRegion();
    res.json(response(httpStatus.SUCCESS, intermediateRegions));
  } catch (e) {
    next(e);
  }
};

exports.getPjbh = async (req, res, next) => {
  try {
    const pjbhs = await cityService.getPjbh();
    res.json(response(httpStatus.SUCCESS, pjbhs));
  } catch (e) {
    next(e);
  }
};

exports.getMicroregions = async (req, res, next) => {
  try {
    const microregions = await cityService.getMicroregions()
    res.json(response(httpStatus.SUCCESS, microregions));
  } catch (e) {
    next(e);
  }
};

exports.getTI = async (req, res, next) => {
  try {
    const indigenousLands = await indigenousLandService.get();
    res.json(response(httpStatus.SUCCESS, indigenousLands));
  } catch (e) {
    next(e);
  }
};

exports.getUC = async (req, res, next) => {
  try {
    const conservationUnits = await conservationUnitService.get()
    res.json(response(httpStatus.SUCCESS, conservationUnits));
  } catch (e) {
    next(e)
  }
};

exports.getProjus = async (req, res, next) => {
  try {
    const projus = await projusService.get();
    res.json(response(httpStatus.SUCCESS, projus));
  } catch (e) {
    next(e)
  }
};

exports.getBiome = async (req, res, next) => {
  try {
    const biomes = await biomeService.get();
    res.json(response(httpStatus.SUCCESS, biomes));
  } catch (e) {
    next(e);
  }
};
