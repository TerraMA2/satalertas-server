
const Result = require("../utils/result")
  models = require('../models')
  Report = models.reports
  env = process.env.NODE_ENV || 'development'
  confDb = require(__dirname + '/../config/config.json')[env]

module.exports = FileService = {

  async get(id) {
    return (Result.ok({result: `Feature not implemented! ${id}`}));
  },
  upload(document) {
    try {
      Report.create({name: document['name'],path: document['path']}).then(report => {
        return Result.created(report);
      });
    } catch (e) {
      return Result.err(e);
    }
  },
  async delete(id, file) {
    return (Result.ok({result: `Feature not implemented! ${id}`, file: file}));
  }
};
