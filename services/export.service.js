const { execSync, spawnSync } = require('child_process')
    path = require('path')
    fs = require('fs')
    env = process.env.NODE_ENV || 'development'
    config = require(__dirname + '/../config/config.json')[env]
    Filter = require("../utils/filter/filter.utils");
    crypto = require('crypto');

module.exports = exportService = {
    async get(params) {
        const fileFormats = params['fileFormats'].split(',');
        const tableName = params['tableName'];
        const formats = await this.getFormats(fileFormats);
        const connectionString = "PG:host=" + config.host + " port=" + config.port + " user=" + config.username + " password=" + config.password + " dbname=" + config.database;
        const sql = `SELECT * FROM public.${tableName} LIMIT 10`;
        const tmpFolder = path.resolve(__dirname, '..', 'tmp');
        fs.rmdirSync(tmpFolder, { recursive: true });
        const formatsLength = formats.length;
        if (!formatsLength) {
            console.error('Formats not found.');
            return "";
        }
        let file = '';
        for (let i = 0; i < formatsLength; i++) {
            const format = formats[i];
            const fileName = tableName + format.fileExtention;
            const filePath = path.resolve(tmpFolder, (format.fileExtention === '.shp' ? 'shapefile/' : ''));
            file = filePath + '/' + fileName;
            fs.mkdirSync(filePath, { recursive: true })
            let args = ['-progress', '-F', format.ogr2ogrFormat, filePath + '/' + fileName, connectionString, '-fieldTypeToString', 'Date,Time,DateTime', '-sql', sql, '-skipfailures'];
            if(format.fileExtention === '.csv') {
                args.push('-lco', 'LINEFORMAT=CRLF', '-lco', 'SEPARATOR=COMMA');
            }
            await spawnSync('ogr2ogr', args);

            if (format.fileExtention === '.shp') {
                const zipPath = path.resolve(__dirname, filePath, '..', fileName + ".zip");
                const zipGenerationCommand = "zip -r -j " + zipPath + " " + filePath;
                await execSync(zipGenerationCommand);
                file = zipPath;
            }
        }
        if (formatsLength > 1) {
            const zipPath = path.resolve(__dirname, tmpFolder + '/', tableName + ".zip");
            const zipGenerationCommand = "zip -j " + zipPath + " " + tmpFolder + '/' + tableName + '.*';
            execSync(zipGenerationCommand);
            return {
                format: 'application/zip',
                filePath: zipPath,
                fileName: `${tableName}.zip`
            };
        } else {
            return {
                format: formats[0].contentType,
                filePath: file,
                fileName: `${tableName + formats[0].fileExtention}`
            };
        }
    },
    async getFormats(formats) {
        const fileExtentions = [];
        let fileExtention = '';
        let ogr2ogrFormat = '';
        let contentType = '';
        for (let i = 0; i < formats.length; i++) {
            const f = formats[i];
            switch(f) {
                case 'csv':
                    fileExtention = '.csv';
                    ogr2ogrFormat = 'CSV';
                    contentType = 'text/csv';
                    break;
                case 'shapefile':
                    fileExtention = '.shp';
                    ogr2ogrFormat = 'ESRI Shapefile';
                    contentType = 'application/zip';
                    break;
                case 'kml':
                    fileExtention = '.kml';
                    ogr2ogrFormat = 'KML';
                    contentType = 'application/vnd.google-earth.kml+xml';
                    break;
                case 'geojson':
                    fileExtention = '.json';
                    ogr2ogrFormat = 'GeoJSON';
                    contentType = 'application/vnd.google-earth.geo+json';
                    break;
            }

            const fileExt = {
                fileExtention,
                ogr2ogrFormat,
                contentType
            };

            fileExtentions.push(fileExt);
        }
        return fileExtentions;
    }
};
