const groupViewService = require(__dirname + '/../services/group-view.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
    try {
        const groupViews = await groupViewService.get();
        res.json(response(httpStatus.SUCCESS, groupViews));
    } catch (e) {
        next(e)
    }
};

exports.getByGroupId = async (req, res, next) => {
    try {
        const { groupId } = req.query;
        const groupViews = await groupViewService.getByGroupId(groupId);
        res.json(response(httpStatus.SUCCESS, groupViews));
    } catch (e) {
        next(e)
    }
};

exports.getAvailableLayers = async (req, res, next) => {
    try {
        const availableLayers = await groupViewService.getAvailableLayers(req.query.groupId);
        res.json(response(httpStatus.SUCCESS, availableLayers));
    } catch (e) {
        next(e)
    }
};
exports.add = async (req, res, next) => {
    try {
        const newGroup = req.body;
        const groupView = await groupViewService.add(newGroup);
        res.json(response(httpStatus.SUCCESS, groupView));
    } catch (e) {
        next(e)
    }
}

exports.update = async (req, res, next) => {
    try {
        const groupModify = req.body.params;
        const result = await groupViewService.update(groupModify)
        res.json(response(httpStatus.SUCCESS, result));
    } catch (e) {
        next(e)
    }
}

exports.updateAdvanced = async (req, res, next) => {
    try {
        const groupModify = req.body.params;
        const groupViews = await groupViewService.updateAdvanced(groupModify);
        res.json(response(httpStatus.SUCCESS, groupViews));
    } catch (e) {
        next(e)
    }
}
