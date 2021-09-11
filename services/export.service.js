const {execSync, spawnSync} = require('child_process')
const fs = require("fs");
const {response} = require("../utils/response");
const path = require('path')
const config = require(__dirname + '/../config/config.json')
const ViewService = require("../services/view.service")
const BadRequestError = require('../errors/bad-request.error');
const InternalServerError = require('../errors/internal-server.error');

module.exports.get = async (params) => {
    const fileFormats = params['fileFormats'].split(',');
    const fileFormatsLength = fileFormats.length;
    if (fileFormatsLength === 0) {
        throw new BadRequestError('Format(s) not found');
    }
    const formats = await this.getFormats(fileFormats);
    const layer = JSON.parse(params.specificParameters)
    const tableName = layer.tableName;
    const connectionString = "PG:host=" + config.db.host + " port=" + config.db.port + " user=" + config.db.username + " password=" + config.db.password + " dbname=" + config.db.database;
    const sql = await ViewService.getSqlExport(params);
    const tmpFolder = path.resolve(__dirname, '..', 'tmp');
    fs.rmdirSync(tmpFolder, {recursive: true});
    let file = '';
    formats.forEach(format => {
        const fileExtension = format.fileExtension;
        const fileName = tableName + fileExtension;
        const filePath = path.resolve(tmpFolder, (fileExtension === '.shp' ? 'shapefile/' : ''));
        file = filePath + '/' + fileName;
        fs.mkdirSync(filePath, {recursive: true})
        const args = ['-progress', '-f', format.ogr2ogrFormat, filePath + '/' + fileName, connectionString, '-fieldTypeToString', 'Date,Time,DateTime', '-sql', sql, '-skipfailures'];
        if (fileExtension === '.csv') {
            args.push('-lco', 'LINEFORMAT=CRLF', '-lco', 'SEPARATOR=COMMA');
        }
        const spawnResponse = spawnSync('ogr2ogr', args);
        if (spawnResponse.status !== 0) {
            throw new InternalServerError(`Couldn't export ${ fileName } file`);
        }

        if (fileExtension === '.shp') {
            const zipPath = path.resolve(__dirname, filePath, '..', fileName + ".zip");
            const zipGenerationCommand = "zip -r -j " + zipPath + " " + filePath;
            execSync(zipGenerationCommand);
            file = zipPath;
        }
    })
    if (fileFormatsLength > 1) {
        file = path.resolve(__dirname, tmpFolder + '/', tableName + ".zip");
        const zipGenerationCommand = "zip -j " + file + " " + tmpFolder + '/' + tableName + '.*';
        execSync(zipGenerationCommand);
    }
    const fileBase64 = fs.readFileSync(file, 'base64')
    return response(200, fileBase64);
}
module.exports.getFormats = async (formats) => {
    let fileExtension = '';
    let ogr2ogrFormat = '';
    let contentType = '';
    return formats.map(format => {
        switch (format) {
            case 'csv':
                fileExtension = '.csv';
                ogr2ogrFormat = 'CSV';
                contentType = 'text/csv';
                break;
            case 'shapefile':
                fileExtension = '.shp';
                ogr2ogrFormat = 'ESRI Shapefile';
                contentType = 'application/zip';
                break;
            case 'kml':
                fileExtension = '.kml';
                ogr2ogrFormat = 'KML';
                contentType = 'application/vnd.google-earth.kml+xml';
                break;
            case 'geojson':
                fileExtension = '.json';
                ogr2ogrFormat = 'GeoJSON';
                contentType = 'application/vnd.google-earth.geo+json';
                break;
        }
        return {
            fileExtension,
            ogr2ogrFormat,
            contentType
        };
    })
}
