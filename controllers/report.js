const
  models = require('../models');
  Report = models.Report;
  FileService = require("../services/file.service");

exports.add = (req, res, next) => {
    const base64Document = req.body.base64;
    Report.create({file_name, file_path}).then(report => {

    }).then(viewsJSON => {
        res.json(viewsJSON)
    })
};

exports.get = async (req, res, next) => {
    const id = req.query.id;

    res.json(await FileService.get(id));
};

exports.upload = async (req, res)=> {
    const file = req.body.base64;

    res.json(await FileService.upload(file));
};

exports.delete = async (req, res, next) => {
    const id = req.query.id;
    const file = req.body;

    res.json(await FileService.delete(id, file));
};
