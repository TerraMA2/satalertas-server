const GroupViewService = require(__dirname + '/../services/group-view.service');

exports.getAll = async (req, res) => {
    try {
        res.json(await GroupViewService.getAll());
    } catch (e) {
        res.json(e);
    }
};

exports.getByGroupId = async (req, res) => {
    try {
        res.json(await GroupViewService.getByGroupId(req.query.groupId));
    } catch (e) {
        res.json(e);
    }
};

exports.getAvailableLayers = async (req, res) => {
    try {
        console.log("gv controller: ", req.query)
        // console.log("gv controller body: ", req.body.params)
        res.json(await GroupViewService.getAvailableLayers(req.query.groupId));
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

exports.updateAdvanced = async (req, res) => {
    const groupModify = req.body.params;
    res.json(await GroupViewService.updateAdvanced(groupModify));
}
