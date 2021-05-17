const GroupViewService = require(__dirname + '/../services/group-view.service');

exports.getAll = async (req, res) => {
    try {
        res.json(await GroupViewService.getAll());
    } catch (e) {
        res.json(e);
    }
};

exports.getByIdGroup = async (req, res) => {
    try {
        res.json(await GroupViewService.getByIdGroup(req.query.id_group));
    } catch (e) {
        res.json(e);
    }
};

exports.getNotBelongingToTheGroup = async (req, res) => {
    try {
        res.json(await GroupViewService.getNotBelongingToTheGroup(req.query.id_group));
    } catch (e) {
        res.json(e);
    }
};
exports.add = async (req, res) => {
    const newGroup = req.body;
    res.json(await GroupViewService.add(newGroup));
}

exports.update = async (req, res) => {
    const groupModify = req.body.params;
    res.json(await GroupViewService.update(groupModify));
}
