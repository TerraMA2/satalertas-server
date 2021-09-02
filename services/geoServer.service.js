const axios = require('axios');
const config = require(__dirname + '/../config/config.json');
const geoserverConfig = require(__dirname + `/../config/${ config.project }/geoserver/geoserver-config.json`);
const path = require("path");
const fs = require("fs");

module.exports = geoServerService = {
    async configGeoserver() {
        const geoserverApi = config.geoserver.geoserverApi;
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
            baseURL: geoserverApi,
            data: workspacesConfig
        }).then(res => res.data);

        const dataStoresResponse = await axios({
            url: "/dataStore/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: dataStoresConfig
        }).then(res => res.data);

        const stylesFolder = path.resolve(__dirname, `../config/${ config.project }/geoserver`, 'styles');

        const stylesResponse = await axios({
            url: "/style/uploadAll",
            method: 'post',
            baseURL: geoserverApi,
            data: stylesConfig.map(style => {
                const filename = style.data.style.filename;
                const sldPath = `${ stylesFolder }/${ filename }`;
                const stats = fs.statSync(sldPath);
                const fileSizeInBytes = stats.size;
                style.sldFile = Buffer.from(fs.readFileSync(sldPath, {encoding: 'utf8'})).toString('base64');
                style.sldFileSize = fileSizeInBytes;
                return style;
            })
        }).then(res => res.data);

        const layerGroupsResponse = await axios({
            url: "/layerGroup/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: layerGroupsConfig
        }).then(res => res.data);

        const landsatsResponse = await axios({
            url: "/layer/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: landsatConfig
        }).then(res => res.data);

        const sentinelsResponse = await axios({
            url: "/layer/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: sentinelConfig
        }).then(res => res.data);

        const spotsResponse = await axios({
            url: "/layer/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: spotConfig
        }).then(res => res.data);

        const planetsResponse = await axios({
            url: "/layer/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: planetConfig
        }).then(res => res.data);

        const featureTypesResponse = await axios({
            url: "/featuretype/createAll",
            method: 'post',
            baseURL: geoserverApi,
            data: featureTypesConfig
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
    },

    async get({type, workspaceName = null, dataStoreName = '', name = ''}) {
        const url = `${ config.geoserver.geoserverApi }${ type }`;
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
    },

    getGeoserverURL(layers, bbox, time, cqlFilter, styles) {
        let url = `${ config.geoserver.geoserverBasePath }/wms?service=WMS&version=1.1.0&request=GetMap&layers=${ layers }&bbox=${ bbox }&width=400&height=400&time=${ time }&cql_filter=${ cqlFilter }&srs=EPSG:${ config.geoserver.defaultSRID }&format=image/png`;
        if (styles) {
            url += `&styles=${ styles }`
        }
        return url;
    },
    getGeoserverLegendURL(layer) {
        return {
            title: layer,
            url: `${ config.geoserver.legendUrl }${ layer }`
        };
    }
};
