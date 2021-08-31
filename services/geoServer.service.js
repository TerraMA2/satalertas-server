const ViewUtil = require("../utils/view.utils");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const config = require(__dirname + '/../config/config.json');
const confDb = require(__dirname + '/../config/config.json')['db'];
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
        const geoserverApi = config.geoserverApi;
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

        return Promise.all([
            workspacesResponse,
            dataStoresResponse,
            stylesResponse,
            landsatsResponse,
            sentinelsResponse,
            spotsResponse,
            planetsResponse,
            layerGroupsResponse
        ])
    },

    async updateLayer(view) {
        let result = null;

        if (view.title.substring(view.title.length - 3, view.title.length) === 'sql') {
            const url = `${ config.geoserverApiURL }layers`;

            const layer =
            {
                workspaceName: view.view_workspace,
                data: {
                    layer: {
                        name: view.title,
                        type: "VECTOR",
                        defaultStyle: {
                            name: `${ view.view_workspace }:${ view.view }_style`,
                            workspace: view.view_workspace,
                            href: `${ config.geoserverApiURL }workspaces/${ view.view_workspace }/styles/${ view.view }_style.json`
                        }
                    }
                }
            };

            result = await axios['put'](url, layer).then(resp => resp).catch(err => err);

        }
        return result;
    },

    async saveGeoServer(name, method, url, xmlOrJson, config) {
        const urlMethod = (method === 'put') ? `${ url }/${ name }` : url;
        const result = await axios[method](urlMethod, xmlOrJson, config).then(resp => resp).catch(err => err);

        const message = result.status && (result.status === 200) ? ' successfully modified! ' : '';
        return result.statusText =
            result.status ?
                `${ result.status }/${ result.statusText } - ${ name } ${ message }` :
                `${ result.response.status }/${ result.response.statusText } - ${ result.response.data }`
    },

    async getDataStoreData(nameWorkspace, nameDataStore) {
        const url = `${ config.geoserverApiURL }workspaces/${ nameWorkspace }/datastores/${ nameDataStore }.json`;
        return axios.get(url).then(resp => resp.data.dataStore).catch(err => err);
    },

    async updateDataStore({workspaceName, datastoreName}) {
        const url = `${ config.geoserverApiURL }workspaces/${ workspaceName }/datastores`;
        const datastore = await this.getDataStoreData(workspaceName, datastoreName);
        if (datastore && (datastore.type === 'PostGIS')) {
            const dataStoreJson = geoServerUtil.detDataStoreJson(confDb, workspaceName, datastoreName);
            console.log(await this.saveGeoServer(data.dataStore.name, 'put', url, dataStoreJson)); // Dont remove this console.log
        }
    },

    async getWorkspaces() {
        const urlWorkspaces = `${ config.geoserverApiURL }workspaces.json`;
        const result = await axios.get(urlWorkspaces).then(resp => resp).catch(err => err)
        return result.status && (result.status === 200) ? result.data.workspaces.workspace : `${ result.response.status }/${ result.response.statusText } - ${ result.response.data }`;
    },

    async getDataStores(nameWorkspace) {
        const urlWorkspace = `${ config.geoserverApiURL }workspaces/${ nameWorkspace }/datastores.json`;
        return await axios.get(urlWorkspace).then(resp => resp.data.dataStores.dataStore).catch(err => err);
    },

    async updateDataStores(workspaceName) {
        const dataStores = await this.getDataStores(workspaceName);
        if (dataStores) {
            return Promise.all(dataStores.map(({name}) => {
                const ds = {workspaceName, nameDataStore: name}
                return this.updateDataStore(ds);
            }));
        }
    },

    async updateAllDataStores() {
        const workspaces = await this.getWorkspaces();
        if (workspaces) {
            return Promise.all(workspaces.map(({name}) => this.updateDataStores(name)));
        }
    },

    async deleteView(views) {
        let response = [];

        for (let view of views) {

            view.name = view.name ? view.name : view.title;

            const urli = `${ config.geoserverApiURL }workspaces/${ view.workspace }/featuretypes/${ view.name }?recurse=true`;

            const res = await axios.delete(urli).then(resp => resp).catch(err => err);

            res.statusText = res.status ? `${ res.status }/${ res.statusText } - ${ view.name } successfully deleted!` : `${ res.response.status }/${ res.response.statusText } - ${ res.response.data }`;
            response.push(res.statusText);
        }

        return response;
    },

    async saveViewsJsonGeoServer() {
        const response = [];
        const views = await setViewsDynamic();
        for (let view of views) {
            view.name = view.name ? view.name : view.title;

            const featureTypesUrl = `${ config.geoserverApiURL }workspaces/${ view.workspace }/featuretypes`;

            const viewFeatureTypeUrl = `${ featureTypesUrl }/${ view.name }.json`;
            const viewFeatureTypeJson = await axios.get(viewFeatureTypeUrl).then(resp => resp).catch(err => err);

            const method = (viewFeatureTypeJson.data && viewFeatureTypeJson && viewFeatureTypeJson.status && viewFeatureTypeJson.status === 200 && viewFeatureTypeJson.data) ? 'put' : 'post';

            const jsonView = geoServerUtil.setJsonView(viewFeatureTypeJson, view);
            response.push(await this.saveGeoServer(view.name, method, featureTypesUrl, jsonView));

            await this.updateLayer(view);
        }
        return response;
    },

    getGeoserverURL(layers, bbox, time, cqlFilter, styles) {
        let url = `${ config.geoserverBasePath }/wms?service=WMS&version=1.1.0&request=GetMap&layers=${ layers }&bbox=${ bbox }&width=400&height=400&time=${ time }&cql_filter=${ cqlFilter }&srs=EPSG:${ config.sridTerraMa }&format=image/png`;
        if (styles) {
            url += `&styles=${ styles }`
        }
        return url;
    },
    getGeoserverLegendURL(layer) {
        return {
            url: `${ config.geoserverBasePath }/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=${ layer }`
        };
    }
};
