const cityService = require(__dirname + '/../services/city.service');
const logger = require('../utils/logger');

exports.getAll = async (req, res) => {
  try {
    res.json(await cityService.getAll());
  } catch (e) {
    const msgErr = `In city.controller, method getAll:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllRegions = async (req, res) => {
  try {
    res.json(await cityService.getAllRegions());
  } catch (e) {
    const msgErr = `In city.controller, method getAllRegions:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllMesoregions = async (req, res) => {
  try {
    res.json(await cityService.getAllMesoregions());
  } catch (e) {
    const msgErr = `In city.controller, method getAllMesoregions:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllImmediateRegion = async (req, res) => {
  try {
    res.json(await cityService.getAllImmediateRegion());
  } catch (e) {
    const msgErr = `In city.controller, method getAllImmediateRegion:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllIntermediateRegion = async (req, res) => {
  try {
    res.json(await cityService.getAllIntermediateRegion());
  } catch (e) {
    const msgErr = `In city.controller, method getAllIntermediateRegion:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllPjbh = async (req, res) => {
  try {
    res.json(await cityService.getAllPjbh());
  } catch (e) {
    const msgErr = `In city.controller, method getAllPjbh:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllMicroregions = async (req, res) => {
  try {
    res.json(await cityService.getAllMicroregions());
  } catch (e) {
    const msgErr = `In city.controller, method getAllMicroregions:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};
