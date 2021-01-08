const GroupService = require(__dirname + '/../services/group.service');

exports.getAll = async (req, res) => {
    try {
        res.json(await GroupService.getAll());
    } catch (e) {
        res.json(e);
    }
};

exports.getById = async (req, res) => {
    try {
        res.json(await GroupService.getById(req.query.id));
    } catch (e) {
        res.json(e);
    }
};
