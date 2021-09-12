const GroupViewService = require(__dirname + '/../services/group-view.service');
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const groupViews = await GroupViewService.get();
        res.json(response(httpStatus.SUCCESS, groupViews));
    } catch (e) {
        next(e)
    }
};

exports.getByGroupId = async (req, res, next) => {
    try {
        const groupViews = await GroupViewService.getByGroupId(req.query.groupId);
        res.json(response(httpStatus.SUCCESS, groupViews));
    } catch (e) {
        next(e)
    }
};

exports.getAvailableLayers = async (req, res, next) => {
    try {
        const availableLayers = await GroupViewService.getAvailableLayers(req.query.groupId);
        res.json(response(httpStatus.SUCCESS, availableLayers));
    } catch (e) {
        next(e)
    }
};
exports.add = async (req, res, next) => {
    try {
        const newGroup = req.body;
        const groupView = await GroupViewService.add(newGroup);
        res.json(response(httpStatus.SUCCESS, groupView));
    } catch (e) {
        next(e)
    }
}

exports.update = async (req, res, next) => {
    try {
        const groupModify = req.body.params;
        const result = await GroupViewService.update(groupModify)
        res.json(response(httpStatus.SUCCESS, result));
    } catch (e) {
        next(e)
    }
}

exports.updateAdvanced = async (req, res, next) => {
    try {
        const groupModify = req.body.params;
        const groupViews = await GroupViewService.updateAdvanced(groupModify);
        res.json(response(httpStatus.SUCCESS, groupViews));
    } catch (e) {
        next(e)
    }
}
