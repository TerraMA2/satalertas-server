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

exports.add = async (req, res) => {
    const newGroup = req.body;
    res.json(await GroupService.add(newGroup));
}

exports.update = async (req, res) => {
    const groupModify = req.body;
    res.json(await GroupService.update(groupModify));
}

exports.deleteGroup = async (req, res) => {
    const groupDelete = req.params.id;
    res.json( await GroupService.deleteGroup(groupDelete))
}
