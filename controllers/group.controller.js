const GroupService = require(__dirname + '/../services/group.service');

exports.get = async (req, res, next) => {
    try {
        res.json(await GroupService.get());
    } catch (e) {
        next(e);
    }
};

exports.getCodGroups = async (req, res, next) => {
    try {
        res.json(await GroupService.getCodGroups());
    } catch (e) {
        next(e);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const {query} = req;
        const result = await GroupService.getById(query.id);
        res.json(result);
    } catch (e) {
        next(e);
    }
};

exports.add = async (req, res, next) => {
    try {
        const newGroup = req.body;
        res.json(await GroupService.add(newGroup));
    } catch (e) {
        next(e);
    }
};

exports.update = async (req, res, next) => {
    try {
        const groupModify = req.body;
        res.json(await GroupService.update(groupModify));
    } catch (e) {
        next(e);
    }
};

exports.deleteGroup = async (req, res, next) => {
    try {
        const groupDelete = req.params.id;
        res.json(await GroupService.deleteGroup(groupDelete));
    } catch (e) {
        next(e);
    }
};
