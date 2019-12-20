const
  models = require('../models');
  Report = models.Report;
  FileService = require("../services/file.service");

exports.upload = async (req, res) => {
    const document = req.body;

    res.json(await FileService.save(document));
};

exports.get = async (req, res) => {
    const id = req.params.id;

    res.json(await FileService.get(id));
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    res.json(await FileService.delete(id));
};
