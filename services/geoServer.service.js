const ViewUtil = require("../utils/view.utils");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const config = require(__dirname + '/../config/config.json');
const geoserverConfig = require(__dirname + `/../config/${ config.project }/geoserver/geoserver-config.json`);
const ViewService = require(__dirname + "/view.service");
const FILTER = require(__dirname + '/../utils/helpers/geoserver/filter');
const path = require("path");
const fs = require("fs");

setViewsDynamic = async function () {
    const GROUP_FILTER = ['DETER', 'PRODES', 'BURNED', 'BURNED_AREA'];
    const groupViews = await ViewService.fetchGroupOfOrderedLayers();
    const views = await ViewUtil.getGrouped();
    const cityTable = views.STATIC.children.MUNICIPIOS.table_name;
    const carTable = views.STATIC.children.CAR_VALIDADO.table_name;
    const spotlightTable = views.DYNAMIC.children.FOCOS_QUEIMADAS.table_name;
    return Object.values(groupViews)
        .filter(groupView => GROUP_FILTER.includes(groupView.cod))
        .map(groupView => groupView.children ? groupView.children : null)
        .reduce((layers, current) => [...layers, ...current])
        .map(layer => {
            const groupCode = layer.codgroup;
            const type = groupCode === 'BURNED' ? groupCode.toLowerCase() : 'default';
            return FILTER[type](layer, cityTable, carTable, spotlightTable);
        }).reduce((layer, current) => [...layer, ...current]);
};

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
                style.sldFile = Buffer.from(fs.readFileSync(sldPath, 'utf8')).toString('base64');
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

        const filterLayersResponse = await this.addUpdateFilterLayers();

        return Promise.all([
            workspacesResponse,
            dataStoresResponse,
            stylesResponse,
            landsatsResponse,
            sentinelsResponse,
            spotsResponse,
            planetsResponse,
            layerGroupsResponse,
            filterLayersResponse
        ])
    },

    async addUpdateFilterLayers() {
        const views = await setViewsDynamic();
        const responses = [];
        for (const view of views) {
            const viewFeatureTypeJson = await this.get({
                type: 'featuretype',
                workspaceName: view.workspace,
                name: view.name
            });

            const method = (viewFeatureTypeJson['featureType']) ? 'put' : 'post';

            const featureJson = await geoServerUtil.getFeatureJson(viewFeatureTypeJson, view);

            const response = await axios({
                method,
                url: `${ config.geoserver.geoserverApi }featuretype`,
                data: {
                    data: featureJson,
                    workspaceName: view.workspace,
                    featureTypeName: view.name
                }
            }).then(response => response.data);
            responses.push(response);
            if (response.status === 201) {
                if (view.title.substring(view.title.length - 3, view.title.length) === 'sql') {
                    const url = `${ config.geoserver.geoserverApi }layer`;
                    const data = geoServerUtil.getLayerJson(view);
                    await axios({method: 'put', url, data}).then(resp => resp).catch(err => err);
                }
            }
        }
        return responses;
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
        let url = `${ config.geoserver.geoserverBasePath }/wms?service=WMS&version=1.1.0&request=GetMap&layers=${ layers }&bbox=${ bbox }&width=400&height=400&time=${ time }&cql_filter=${ cqlFilter }&srs=EPSG:${ config.geoserver.sridTerraMa }&format=image/png`;
        if (styles) {
            url += `&styles=${ styles }`
        }
        return url;
    },
    getGeoserverLegendURL(layer) {
        return {
            url: `${ config.geoserver.geoserverBasePath }/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=${ layer }`
        };
    }
};
