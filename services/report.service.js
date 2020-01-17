
const Result = require("../utils/result")
  models = require('../models')
  Report = models.reports
  env = process.env.NODE_ENV || 'development'
  confDb = require(__dirname + '/../config/config.json')[env]
  PdfPrinter = require('pdfmake')
  fs = require('fs')

const QUERY_TYPES_SELECT = { type: "SELECT" };

module.exports = FileReport = {
  async saveBase64(document, code, type, path, docName){
    const binaryData = new Buffer(document, 'base64').toString('binary')

    await fs.writeFile(path, binaryData, "binary", err => {
      if (err) {
        throw err;
      }
      console.log(`Arquivo salvo em .. ${path}`);
    })
  },
  async get(id) {
    const result = id ? await Report.findByPk(id) : await Report.findAll()

    try{
      if (result.length && (result.length > 0)) {
        result.forEach(report => {
          report.dataValues.base64 = fs.readFileSync(`${report.path}/${report.name}`, 'base64')
        })
      } else {
        result.dataValues.base64 = fs.readFileSync(`${result.path}/${result.name}`, 'base64')
      }

      return Result.ok(result)
    } catch (e) {
      return Result.err(e);
    }
  },
  async newNumber(type) {
    const sql =
      ` SELECT '${type.trim()}' AS type,
               EXTRACT(YEAR FROM CURRENT_TIMESTAMP) AS year,
               LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0') AS newNumber,
               CONCAT(
                    LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0'),
                    '/',
                    EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
               ) AS code
        FROM alertas.reports AS rep
        WHERE rep.type = '${type.trim()}'
          AND rep.created_at BETWEEN
            CAST(concat(EXTRACT(YEAR FROM CURRENT_TIMESTAMP),\'-01-01 00:00:00\') AS timestamp) AND CURRENT_TIMESTAMP`;

    try {
      const result = await Report.sequelize.query(sql, QUERY_TYPES_SELECT);

      return Result.ok(result)
    } catch (e) {
      return Result.err(e);
    }
  },
  async getReportsByCARCod(carCode) {
    try {
      const confWhere = {where: { carCode: carCode.trim() }};

      return Result.ok(await Report.findAll(confWhere));
    } catch (e) {
      return Result.err(e);
    }
  },
  async generatePdf(docDefinition, type, carCode) {
    try {
      const fonts = {
        Roboto: {
          normal: 'fonts/Roboto-Regular.ttf',
          bold: 'fonts/Roboto-Medium.ttf',
          italics: 'fonts/Roboto-Italic.ttf',
          bolditalics: 'fonts/Roboto-MediumItalic.ttf'
        }
      };

      const pathDoc = `documentos/`;

      const code = await this.newNumber(type.trim());
      const docName = `${code.data[0].newnumber}_${code.data[0].year.toString()}_${code.data[0].type.trim()}.pdf`

      const printer = new PdfPrinter(fonts);
      docDefinition.content[4].text =
        type === 'deter' ? `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº ${code.data[0].code}` :
          type === 'prodes' ? `RELATÓRIO TÉCNICO SOBRE DE DESMATAMENTO Nº ${code.data[0].code}` :
            type === 'queimada' ? `RELATÓRIO SOBRE CICATRIZ DE QUEIMADA Nº ${code.data[0].code}` :
              `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº XXXXX/${code.data[0].year}`;

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(`${pathDoc}/${docName}`));
      pdfDoc.end();

     const report = this.saveReport(docName, code.data[0].newnumber, carCode, pathDoc, type)
      return Result.ok(report)
    } catch (e) {
      return Result.err(e)
    }
  },
  async saveReport(docName, newnumber, carCode, path, type) {
    try {
      const report = new Report({
        name: docName.trim(),
        code: parseInt(newnumber),
        carCode: carCode.trim(),
        path: path.trim(),
        type: type.trim() })

      return await Report.create(report.dataValues).then(report => report.dataValues)
    } catch (e) {
      throw e
    }
  },
  async delete(id) {
    try {
      const report = await Report.findByPk(id)
      await fs.unlink(`${report.dataValues.path}/${report.dataValues.name}`, err => {
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
  },
  async save(document) {
    try {
      const binaryData = new Buffer(document.base64, 'base64').toString('binary')
      const code = await this.newNumber(document.type.trim());
      const docName = `${code.data[0].newnumber}_${code.data[0].year}_${code.data[0].type}.pdf`

      await fs.writeFile(`${document.path}/${docName}`, binaryData, "binary", err => {
        if (err) {
          throw err;
        }
        console.log(`Arquivo salvo em ..${document.path.trim()}/${docName.trim()}`);
      })

      const report = new Report({
        name: docName.trim(),
        code: parseInt(code.data[0].newnumber),
        carCode: document['carCode'].trim(),
        path: document['path'].trim(),
        type: document['type'].trim() })

      const result = await Report.create(report.dataValues).then(report => report.dataValues)

      return Result.ok(result)
    } catch (e) {
      return Result.err(e)
    }
  }
}
