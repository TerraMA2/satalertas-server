const axios = require('axios');
const config = require(__dirname + '/../config/config.json');
const geoserverConfig = require(__dirname + `/../config/${ config.project }/geoserver/geoserver-config.json`);
const path = require("path");
const fs = require("fs");

module.exports.configGeoserver = async () => {
    const api = config.geoserver.api;
    const workspacesConfig = geoserverConfig.workspaces;
    const dataStoresConfig = geoserverConfig.dataStores;
    const stylesConfig = geoserverConfig.styles;
    const layerGroupsConfig = geoserverConfig.layerGroups;
    const layersConfig = geoserverConfig.layers;
    const landsatConfig = layersConfig.landsat;
    const sentinelConfig = layersConfig.sentinel;
    const spotConfig = layersConfig.spot;
    const planetConfig = layersConfig.planet;
    const featureTypesConfig = geoserverConfig.featureTypes;

    const workspacesResponse = await axios({
        url: "/workspace/createAll",
        method: 'post',
        baseURL: api,
        data: workspacesConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const dataStoresResponse = await axios({
        url: "/datastore/createAll",
        method: 'post',
        baseURL: api,
        data: dataStoresConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const stylesFolder = path.resolve(__dirname, `../config/${ config.project }/geoserver`, 'styles');

    const stylesResponse = await axios({
        url: "/style/uploadAll",
        method: 'post',
        baseURL: api,
        data: stylesConfig.map(style => {
            const filename = style.data.style.filename;
            const sldPath = `${ stylesFolder }/${ filename }`;
            const stats = fs.statSync(sldPath);
            const fileSizeInBytes = stats.size;
            style.sldFile = Buffer.from(fs.readFileSync(sldPath, {encoding: 'utf8'})).toString('base64');
            style.sldFileSize = fileSizeInBytes;
            return style;
        }),
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const layerGroupsResponse = axios({
        url: "/layergroup/createAll",
        method: 'post',
        baseURL: api,
        data: layerGroupsConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const landsatsResponse = axios({
        url: "/layer/createAll",
        method: 'post',
        baseURL: api,
        data: landsatConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const sentinelsResponse = axios({
        url: "/layer/createAll",
        method: 'post',
        baseURL: api,
        data: sentinelConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const spotsResponse = axios({
        url: "/layer/createAll",
        method: 'post',
        baseURL: api,
        data: spotConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const planetsResponse = axios({
        url: "/layer/createAll",
        method: 'post',
        baseURL: api,
        data: planetConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    const featureTypesResponse = axios({
        url: "/featuretype/createAll",
        method: 'post',
        baseURL: api,
        data: featureTypesConfig,
        params: {
            geoserverBasePath: config.geoserver.basePath
        }
    }).then(res => res.data);

    return Promise.all([
        workspacesResponse,
        dataStoresResponse,
        stylesResponse,
        landsatsResponse,
        sentinelsResponse,
        spotsResponse,
        planetsResponse,
        layerGroupsResponse,
        featureTypesResponse
    ])
}

module.exports.get = async ({type, workspaceName = null, dataStoreName = '', name = ''}) => {
    const url = `${ config.geoserver.api }${ type }`;
    const options = {};
    let params = {};
    switch (type) {
        case 'workspace':
            params = {
                workspaceName
            }
            break;
        case 'featuretype':
            params = {
                workspaceName,
                featureTypeName: name,
                dataStoreName
            }
            break;
        case 'datastore':
            params = {
                workspaceName,
                type: type + 's',
                dataStoreName
            }
            break;
        case 'layer':
            params = {
                workspaceName,
                type: type + 's',
                layerName: name
            }
            break;
        case 'layergroup':
            params = {
                workspaceName,
                layerGroupName: name
            }
            break;
        case 'style':
            params = {
                workspaceName,
                styleName: name
            }
            break;
    }
    options['params'] = params;
    return await axios.get(url, options).then(response => response.data.data);
}

module.exports.getMapURL = async (params) => {
    return this.getMap(params, true);
}

module.exports.getMapImage = async (params) => {
    return this.getMap(params, false);
}

module.exports.getMapImageDETER = async (params, onlyUrl = false) => {
    return this.getMap(params, onlyUrl, config.geoserver.baseHostDeter);
}

module.exports.getWMSInfo = async (params) => {
    return this.getInfo(params, 'wms');
}

module.exports.getWFSInfo = async (params) => {
    return this.getInfo(params, 'wfs');
}

module.exports.getInfo = async (params, type = 'wms') => {
    params['geoserverBasePath'] = config.geoserver.basePath;
    return axios({url: `${ config.geoserver.api }info/${type}`, method: 'get', params}).then(response => response.data.data);
}

module.exports.getMap = async (params, onlyUrl = false, baseURL = null) => {
    if (onlyUrl) {
        params['onlyUrl'] = '1';
    }
    params['baseURL'] = baseURL;
    params['geoserverBasePath'] = config.geoserver.basePath;
    params['format'] = 'image/png';
    if (!params['version']) {
      params['version'] = '1.1.1';
    }
    if (!params['srs']) {
      params['srs'] = `EPSG:${ config.geoserver.defaultSRID }`;
    }
    return axios({url: `${ config.geoserver.api }image/map`, method: 'get', params}).then(response => {
      return response.data.data
    });
}

module.exports.getLegend = async (params, onlyUrl = false) => {
    if (onlyUrl) {
        params['onlyUrl'] = '1';
    }
    params['format'] = 'image/png';
    if (!params['version']) {
      params['version'] = '1.0.0';
    }
    params['geoserverBasePath'] = config.geoserver.basePath;
    return axios({url: `${ config.geoserver.api }image/legend`, method: 'get', params}).then(response => response.data.data);
}

module.exports.getLegendURL = async (params) => {
    return this.getLegend(params, true);
}

module.exports.getLegendImage = async (params) => {
    return await this.getLegend(params, false);
}
