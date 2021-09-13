const cityService = require(__dirname + '/../services/city.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const cities = await cityService.get();
        res.json(response(httpStatus.SUCCESS, cities));
    } catch (e) {
        next(e);
    }
};

exports.getRegions = async (req, res, next) => {
    try {
        const regions = await cityService.getRegions();
        res.json(response(httpStatus.SUCCESS, regions));
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
