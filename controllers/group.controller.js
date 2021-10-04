const groupService = require(__dirname + '/../services/group.service');
const {response} = require("../utils/response.utils");
const httpStatus = require('../enum/http-status');

exports.get = async (req, res, next) => {
  try {
    const groups = await groupService.get();
    res.json(response(httpStatus.SUCCESS, groups));
  } catch (e) {
    next(e);
  }
};

exports.getCodGroups = async (req, res, next) => {
  try {
    const codGroups = await groupService.getCodGroups();
    res.json(response(httpStatus.SUCCESS, codGroups));
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const {query} = req;
    const group = await groupService.getById(query.id);
    res.json(response(httpStatus.SUCCESS, group));
  } catch (e) {
    next(e);
  }
};

exports.add = async (req, res, next) => {
  try {
    const newGroup = req.body;
    const group = await groupService.add(newGroup);
    res.json(response(httpStatus.SUCCESS, group));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const groupModify = req.body;
    const group = await groupService.update(groupModify);
    res.json(response(httpStatus.SUCCESS, group));
  } catch (e) {
    next(e);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const groupDelete = req.params.id;
    const result = await groupService.deleteGroup(groupDelete);
    res.json(response(httpStatus.SUCCESS, result));
  } catch (e) {
    next(e);
  }
};
