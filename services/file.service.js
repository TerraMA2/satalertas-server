
const Result = require("../utils/result")
  models = require('../models')
  Report = models.reports
  env = process.env.NODE_ENV || 'development'
  confDb = require(__dirname + '/../config/config.json')[env]
  fs = require('fs')

module.exports = FileService = {
  async get(id) {
    const result = id ? await Report.findByPk(id) : await Report.findAll()

    try{
      if (result.length && (result.length > 0)) {
        result.forEach(report => {
          report.dataValues.base64 = fs.readFileSync(`${__dirname}${report.path}/${report.name}`, 'base64')
        })
      } else {
        result.dataValues.base64 = fs.readFileSync(`${__dirname}${result.path}/${result.name}`, 'base64')
      }

      return Result.ok(result)
    } catch (e) {
      return Result.err(e);
    }
  },
  async save(document) {
    try {
      const binaryData = new Buffer(document.base64, 'base64').toString('binary')

      await fs.writeFile(`${__dirname}${document.path}/${document.name}`, binaryData, "binary", err => {
        if (err) {
          throw err;
        }
        console.log(`Arquivo salvo em ..${document.path}/${document.name}`);
      })

      const report = new Report({name: document['name'], path: document['path']})
      const result = await Report.create(report.dataValues).then(report => report.dataValues)

      return Result.ok(result)
    } catch (e) {
      return Result.err(e)
    }
  },
  async delete(id) {
    try {
      const report = await Report.findByPk(id)
      await fs.unlink(`${__dirname}${report.dataValues.path}/${report.dataValues.name}`, err => {
        if (err) {
          throw err;
        }
        console.log(`Arquivo ${report.dataValues.path}/${report.dataValues.name} excluído com sucesso!`);
      })
      const countRowDeleted = await Report.destroy({ where: {id} }).then(rowDeleted => rowDeleted).catch(err => err)
      const result = countRowDeleted ?
        `Arquivo ${report.dataValues.name}, id = ${id}, excluído com Sucesso!` :
        `Arquivo ${report.dataValues.name}, id = ${id}, não encontrado!`
      return Result.ok(result)
    } catch (err) {
      return Result.err(err)
    }
  }
}
