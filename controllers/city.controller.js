const cityService = require(__dirname + '/../services/city.service');

exports.get = async (req, res, next) => {
    try {
        res.json(await cityService.get());
    } catch (e) {
        next(e);
    }
};

exports.getRegions = async (req, res, next) => {
    try {
        res.json(await cityService.getRegions());
    } catch (e) {
        next(e);
    }
};

exports.getMesoregions = async (req, res, next) => {
    try {
        res.json(await cityService.getMesoregions());
    } catch (e) {
        next(e);
    }
};

exports.getImmediateRegion = async (req, res, next) => {
    try {
        res.json(await cityService.getImmediateRegion());
    } catch (e) {
        next(e);
    }
};

exports.getIntermediateRegion = async (req, res, next) => {
    try {
        res.json(await cityService.getIntermediateRegion());
    } catch (e) {
        next(e);
    }
};

exports.getPjbh = async (req, res, next) => {
    try {
        res.json(await cityService.getPjbh());
    } catch (e) {
        next(e);
    }
};

exports.getMicroregions = async (req, res, next) => {
    try {
        res.json(await cityService.getMicroregions());
    } catch (e) {
        next(e);
    }
};
