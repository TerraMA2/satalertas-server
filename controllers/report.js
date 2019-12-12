const models = require('../models')
    Report = models.Report

exports.add = (req, res, next) => {
    const base64Document = req.params.base64Documents
    Report.create({file_name, file_path}).then(report => {

    }).then(viewsJSON => {
        res.json(viewsJSON)
    })
}
