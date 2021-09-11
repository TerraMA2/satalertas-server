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
        url: "/dataStore/createAll",
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
        url: "/layerGroup/createAll",
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

module.exports.getGeoserverURL = (layers, bbox, time, cqlFilter, styles) => {
    let url = `${ config.geoserver.baseUrl }/wms?service=WMS&version=1.1.0&request=GetMap&layers=${ layers }&bbox=${ bbox }&width=400&height=400&time=${ time }&cql_filter=${ cqlFilter }&srs=EPSG:${ config.geoserver.defaultSRID }&format=image/png`;
    if (styles) {
        url += `&styles=${ styles }`
    }
    return url;
}
module.exports.getGeoserverLegendURL = (layer) => {
    return {
        title: layer,
        url: `${ config.geoserver.legendUrl }${ layer }`
    }
}
