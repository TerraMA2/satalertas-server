const Result = require(__dirname + `/../utils/result`);
const ExportService = require("../services/export.service.js");

exports.get = async (req, res) => {
    try {
        const { filePath } = await ExportService.get(req.body.params);
        const fileBase64 = fs.readFileSync(filePath, 'base64')
        res.json(Result.ok(fileBase64));
    } catch (e) {
        res.json(e);
    }
};
