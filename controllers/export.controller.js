const Result = require(__dirname + `/../utils/result`);
const ExportService = require("../services/export.service.js");
const fs = require("fs");

exports.get = async (req, res) => {
    try {
        const { filePath } = await ExportService.get(req.body.params.params);
        const fileBase64 = fs.readFileSync(filePath, 'base64')
        res.json(Result.ok(fileBase64));
    } catch (e) {
        res.json(e);
    }
};
