const {execSync, spawnSync} = require('child_process')
const fs = require("fs");
const path = require('path')
const config = require(__dirname + '/../config/config.json')
const BadRequestError = require('../errors/bad-request.error');
const InternalServerError = require('../errors/internal-server.error');
const Filter = require("../utils/filter.utils");
const models = require("../models");
const {View} = models;

module.exports.get = async (params) => {
    const fileFormats = params['fileFormats'].split(',');
    const fileFormatsLength = fileFormats.length;
    if (fileFormatsLength === 0) {
        throw new BadRequestError('Format(s) not found');
    }
    const formats = await getFormats(fileFormats);
    const layer = JSON.parse(params.specificParameters)
    const tableName = layer.tableName;
    const connectionString = "PG:host=" + config.db.host + " port=" + config.db.port + " user=" + config.db.username + " password=" + config.db.password + " dbname=" + config.db.database;
    const sql = await getSql(params);
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
    return fs.readFileSync(file, 'base64')
}
getFormats = async (formats) => {
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

getSql = async (params) => {
    const view = JSON.parse(params.specificParameters);
    if (!view) {
        throw new BadRequestError('Missing specificParameters');
    }
    const table = {
        name: view.tableName,
        alias: 'main_table',
    };
    const columns = await Filter.getColumns(view, '', table.alias);
    const filter = await Filter.getFilter(View, table, params, view, columns);

    const columnGid =
        view.groupCode === 'CAR' ? 'gid' : 'de_car_validado_sema_gid';

    filter.sqlWhere = params.selectedGids
        ? filter.sqlWhere
            ? ` ${ filter.sqlWhere } AND ${ columnGid } in (${ params.selectedGids }) `
            : ` WHERE ${ columnGid } in (${ params.selectedGids }) `
        : filter.sqlWhere;

    const sqlWhere = filter.sqlHaving
        ? `${ filter.sqlWhere } 
            AND ${ table.alias }.${ columns.column1 } IN
            ( SELECT tableWhere.${ columns.column1 } AS subtitle
            FROM public.${ table.name } AS tableWhere
            GROUP BY tableWhere.${ columns.column1 }
            ${ filter.sqlHaving }) `
        : filter.sqlWhere;

    return `SELECT * FROM public.${ table.name } AS ${ table.alias } ${ filter.secondaryTables } ${ sqlWhere } `;
};
