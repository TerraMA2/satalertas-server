const GroupService = require(__dirname + '/../services/group.service');
const { msgError } = require('../utils/messageError');

exports.getAll = async (_req, res) => {
  try {
    res.json(await GroupService.getAll());
  } catch (e) {
    res.json(msgError('group.controller', 'group.controller', 'getAll', e));
  }
};

exports.getCodGroups = async (_req, res, _next) => {
  try {
    res.json(await GroupService.getCodGroups());
  } catch (e) {
    res.json(msgError('group.controller', 'getCodGroups', e));
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await GroupService.getById(req.query.id);
    res.json(result);
  } catch (e) {
    res.json(msgError('group.controller', 'getById', e));
  }
};

exports.add = async (req, res) => {
  try {
    const newGroup = req.body;
    res.json(await GroupService.add(newGroup));
  } catch (e) {
    res.json(msgError('group.controller', 'add', e));
  }
};

exports.update = async (req, res) => {
  try {
    const groupModify = req.body;
    res.json(await GroupService.update(groupModify));
  } catch (e) {
    res.json(msgError('group.controller', 'update', e));
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const groupDelete = req.params.id;
    res.json(await GroupService.deleteGroup(groupDelete));
  } catch (e) {
    res.json(msgError('group.controller', 'deleteGroup', e));
  }
};
