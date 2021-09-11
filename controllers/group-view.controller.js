const GroupViewService = require(__dirname + '/../services/group-view.service');

exports.get = async (req, res, next) => {
    try {
        res.json(await GroupViewService.get());
    } catch (e) {
        next(e)
    }
};

exports.getByGroupId = async (req, res, next) => {
    try {
        res.json(await GroupViewService.getByGroupId(req.query.groupId));
    } catch (e) {
        next(e)
    }
};

exports.getAvailableLayers = async (req, res, next) => {
    try {
        res.json(await GroupViewService.getAvailableLayers(req.query.groupId));
    } catch (e) {
        next(e)
    }
};
exports.add = async (req, res, next) => {
    try {
        const newGroup = req.body;
        res.json(await GroupViewService.add(newGroup));
    } catch (e) {
        next(e)
    }
}

exports.update = async (req, res, next) => {
    try {
        const groupModify = req.body.params;
        res.json(await GroupViewService.update(groupModify));
    } catch (e) {
        next(e)
    }
}

exports.updateAdvanced = async (req, res, next) => {
    try {
        const groupModify = req.body.params;
        res.json(await GroupViewService.updateAdvanced(groupModify));
    } catch (e) {
        next(e)
    }
}
