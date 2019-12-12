
const FileService = require("../services/file.service");


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
