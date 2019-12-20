const
  models = require('../models');
  Report = models.Report;
  FileService = require("../services/file.service");

exports.add = (req, res) => {
    const document = req.body;

    res.json(FileService.upload(document));
};

exports.get = async (req, res, next) => {
    const id = req.query.id;

    res.json(await FileService.get(id));
};

exports.delete = async (req, res, next) => {
    const id = req.query.id;
    const file = req.body;

    res.json(await FileService.delete(id, file));
};
