
const ViewUtil = require("../utils/view.utils");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
const confDb = require(__dirname + '/../config/config.json')[env];
const ViewService = require(__dirname + "/view.service");
const FILTER = require(__dirname + '/../utils/helpers/geoserver/filter');

const URL = `${confGeoServer.host}workspaces/${confGeoServer.workspace}/featuretypes`;
const CONFIG = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/xml' } };
const CONFIG_JSON = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/json' } };

setMosaicDynamic = async function(jsonConf) {
  const mosaic =
    jsonConf && jsonConf.wmsStore && jsonConf.wmsLayer && jsonConf.groupLayer && jsonConf.legendUrl
      ? jsonConf : confGeoServer.mosaic;

  const groupViews = await ViewUtil.getGrouped()

  mosaic.wmsStore.workspaceName = groupViews.STATIC.children.CAR_VALIDADO.workspace;
  mosaic.wmsLayer.workspaceName = groupViews.STATIC.children.CAR_VALIDADO.workspace;
  mosaic.groupLayer.workspaceName = groupViews.STATIC.children.CAR_VALIDADO.workspace;
  mosaic.groupLayer.layers = [{ name: 'MosaicSpot2008' },{ name: groupViews.STATIC.children.CAR_VALIDADO.view }];

  return mosaic;
};

setViewsDynamic = async function(views) {
  if (views.length && views.length > 0) {
    return views
  } else {
    const viewsDynamic = [];
    const GROUP_FILTER = ['DETER', 'PRODES', 'BURNED', 'BURNED_AREA'];
    const FILTERS_TYPE = ['biome', 'city', 'uc', 'ti', 'default'];
    const groupViews = await ViewService.fetchGroupOfOrderedLayers();

    for (const group of GROUP_FILTER) {
      if (groupViews[group] && groupViews[group].children) {
        for (const layer of groupViews[group].children) {
          const type = group === 'BURNED' ? group.toLowerCase() : 'default';

          //if (group === 'BURNED') {
          //  const view_burned_update = VIEW_UPDATE_FILTER(
          //    layer.workspace,
          //    layer.datastore,
          //    layer.view,
          //    layer.label,
          //    layer.tableOwner,
          //    layer.tableName,
          //    layer.isPrimary)

          //  viewsDynamic.push(view_burned_update)
          //}

          const filter = await FILTER[type](
            confGeoServer.workspace,
            confGeoServer.datastore,
            layer.cod,
            layer.tableOwner,
            layer.tableName,
            layer.isPrimary);

          for (const filterType of FILTERS_TYPE){
            if (filter[filterType]) {
              const view = filter[filterType];
              view.view_workspace = layer.workspace;
              view.view = layer.view;
              viewsDynamic.push(view);
            }
          }
        }
      }
    }

    return viewsDynamic;
  }
};

module.exports = geoServerService = {

  async updateLayer(view) {
    let result = null;

    if(view.title.substring(view.title.length-3, view.title.length) === 'sql') {
      const url = `${confGeoServer.host}layers/${view.workspace}:${view.title}.json`;

      const layer = {
        layer: {
          name: view.title,
          type: "VECTOR",
          defaultStyle: {
            name: `${view.view_workspace}:${view.view}_style`,
            workspace: view.view_workspace,
            href: `${confGeoServer.host}workspaces/${view.view_workspace}/styles/${view.view}_style.json`
          }
        }
      };

      result = await axios['put'](url, layer, CONFIG_JSON).then(resp => resp).catch(err => err);

    }
    return result;
  },

  async setMethod(url) {
    let result = await axios.get(url, CONFIG_JSON).then(resp => resp).catch(err => err);
    return (result.status && (result.status === 200)) ? 'put' : 'post';
  },

  async saveGeoServer(name, method, url, xmlOrJson, config) {
    const urlMethod = (method === 'put') ? `${url}/${name}`: url;
    const result = await axios[method]( urlMethod, xmlOrJson, config).then(resp => resp ).catch(err => err);

    const message = result.status && (result.status === 200) ? ' successfully modified! ' : '';
    return result.statusText =
      result.status ?
        `${result.status}/${result.statusText} - ${name} ${message}` :
        `${result.response.status}/${result.response.statusText} - ${result.response.data}`
  },

  async saveViewsGeoServer(views) {
    let response = [];
    for (let view of views) {

      view.name = view.name ? view.name : view.title;

      await this.validateWorkspace(view.workspace);
      await this.validateDataStore(view.workspace, view.dataStore);

      const method = await this.setMethod(`${URL}/${view.name}.json`);
      const xml = ViewUtil.setXml(view);
      response.push(await this.saveGeoServer(view.name, method, URL, xml, CONFIG));

      await this.updateLayer(view);
    }
    return response;
  },

  async validateWorkspace(name) {
    const urlW = `${confGeoServer.host}workspaces`;
    const method = await this.setMethod(`${urlW}/${name}.json`);

    if (method === 'post') {
      let data = geoServerUtil.setWorkSpace(name);
    }
  },

  async validateDataStore(nameWorkspace, nameDataStore) {
    if (nameDataStore) {
      const urlD = `${confGeoServer.host}workspaces/${nameWorkspace}/datastores`;
      const method = await this.setMethod(`${urlD}/${nameDataStore}.json`);

      if (method === 'post') {
        const data = geoServerUtil.setDataStore(confDb, nameWorkspace, nameDataStore);
      }
    }
  },
  
  async getDataStoreData(nameWorkspace, nameDataStore) {
    const urlDS = `${confGeoServer.host}workspaces/${nameWorkspace}/datastores/${nameDataStore}.json`;
    return axios.get(urlDS, CONFIG_JSON).then(resp => resp.data.dataStore).catch(err => err);
  },

  async updateDataStore({nameWorkspace, nameDataStore}) {
    const urlD = `${confGeoServer.host}workspaces/${nameWorkspace}/datastores`;
    const isPostGis = await this.getDataStoreData(nameWorkspace, nameDataStore);
    if (isPostGis && (isPostGis.type === 'PostGIS')) {
      const data = geoServerUtil.setDataStore(confDb, nameWorkspace, nameDataStore);
      console.log(await this.saveGeoServer(data.dataStore.name, 'put', urlD, data, CONFIG_JSON));
    }
  },

  async getWorkspaces () {
    const urlWorkspaces = `${confGeoServer.host}workspaces.json`;
    const result = await axios.get(urlWorkspaces,CONFIG_JSON).then(resp => resp).catch(err => err)
    return result.status && (result.status === 200) ? result.data.workspaces.workspace : `${result.response.status}/${result.response.statusText} - ${result.response.data}`;
  },

  async getDataStores(nameWorkspace) {
    const urlWorkspace = `${confGeoServer.host}workspaces/${nameWorkspace}/datastores.json`;
    return await axios.get(urlWorkspace, CONFIG_JSON).then(resp => resp.data.dataStores.dataStore).catch(err => err);
  },
  async updateDataStores(nameWorkspace) {
    const allDataStores = await this.getDataStores(nameWorkspace);
    const updatesPromises = [];
    if (allDataStores) {
      allDataStores.forEach(({ name }) => {
        const ds = {nameWorkspace, nameDataStore: name}
        updatesPromises.push(this.updateDataStore(ds));
      });
    }
    await Promise.all(updatesPromises);
  },

  async updateAllDataStores () {
    const result = await this.getWorkspaces();
    const nameWorkspaces = result.map(({ name }) => name );
    const updatesPromises = [];
    if (nameWorkspaces) {
      nameWorkspaces.forEach(workspace => {
        updatesPromises.push(this.updateDataStores(workspace));
      });
    }
    await Promise.all(updatesPromises);
    return result;
  },

  async deleteView(views){
    let response = [];

    for (let view of views) {

      view.name = view.name ? view.name : view.title;

      const urli = `${confGeoServer.host}workspaces/${view.workspace}/featuretypes/${view.name}?recurse=true`;

      const res = await axios.delete(urli, CONFIG).then(resp => resp ).catch(err => err);

      res.statusText = res.status ? `${res.status}/${res.statusText} - ${view.name} successfully deleted!` : `${res.response.status}/${res.response.statusText} - ${res.response.data}`;
      response.push(res.statusText);
    }

    return response;
  },

  async saveViewsJsonGeoServer(views){
    const response = [];
    views = await setViewsDynamic(views);
    for (let view of views) {
      view.name = view.name ? view.name : view.title;

      await this.validateWorkspace(view.workspace);
      await this.validateDataStore(view.workspace, view.dataStore);

      const urli = `${confGeoServer.host}workspaces/${view.workspace}/featuretypes`;
      const url = `${urli}/${view.name}.json`;

      const json = await axios.get( url, CONFIG_JSON).then(resp => resp ).catch(err => err);

      const method = (json.data && json && json.status && json.status === 200 && json.data) ? 'put' : 'post';

      const jsonView = geoServerUtil.setJsonView(json, view);
      response.push(await this.saveGeoServer(view.name, method, urli, jsonView, CONFIG_JSON) );

      await this.updateLayer(view);
    }
    return response;
  },

  async createWmsStore(name, description, workspaceName, capabilitiesURL) {
    const url = `${confGeoServer.host}workspaces/${workspaceName}/wmsstores/`;

    const wmsStore = {
      "wmsStore": {
        "name": name,
        "description": description,
        "type": "WMS",
        "enabled": true,
        "workspace": {
          "name": workspaceName
        },
        "metadata": {
          "entry": {
            "@key": "useConnectionPooling",
            "$": "true"
          }
        },
        "_default": false,
        "capabilitiesURL": capabilitiesURL,
        "maxConnections": 6,
        "readTimeout": 60,
        "connectTimeout": 30
      }
    };

    return await this.saveGeoServer(name, 'post', url, wmsStore, CONFIG_JSON)
  },

  async createWmsLayer(name, title, description, workspaceName, wmsStoreName, abstract) {
    const url = `${confGeoServer.host}workspaces/${workspaceName}/wmsstores/${wmsStoreName}/wmslayers/`;

    const wmsLayer = {
      "wmsLayer": {
        "name": name,
        "nativeName": 0,
        "namespace": {
          "name": workspaceName
        },
        "title": title,
        "description": description,
        "abstract": abstract,
        "srs": `EPSG:${confGeoServer.sridTerraMa}`,
        "projectionPolicy": "FORCE_DECLARED",
        "enabled": true,
        "store": {
          "@class": "wmsStore",
          "name": `${workspaceName}:${wmsStoreName}`
        }
      }
    };

    return await this.saveGeoServer(name, 'post', url, wmsLayer, CONFIG_JSON)
  },

  async createGroupLayer(name, title, workspaceName, layers, styles)  {
    const url = `${confGeoServer.host}workspaces/${workspaceName}/layergroups/`;

    let published = [];
    if (layers && layers.length > 0){
      layers.forEach(layer => {
        published.push({ "@type": "layer",  "name": layer.name });
      })
    }

    const layerGroup = {
      "layerGroup": {
        "name": name,
        "mode": "SINGLE",
        "title": title,
        "workspace": {
          "name": workspaceName
        },
        "publishables": {
          "published": published
        }
      }
    };

    return await this.saveGeoServer(name, 'post', url, layerGroup, CONFIG_JSON)
  },

  async saveGroupLayer(jsonConf){
    const mosaic = await setMosaicDynamic(jsonConf);

    const response = [];
    try {
      response.push(await this.createWmsStore(
        mosaic.wmsStore.name, mosaic.wmsStore.description, mosaic.wmsStore.workspaceName,
        mosaic.wmsStore.capabilitiesURL));

      response.push(await this.createWmsLayer(mosaic.wmsLayer.name, mosaic.wmsLayer.title,
        mosaic.wmsLayer.description, mosaic.wmsLayer.workspaceName, mosaic.wmsLayer.wmsStoreName,
        mosaic.wmsLayer.abstract));

      response.push(await this.createGroupLayer(mosaic.groupLayer.name, mosaic.groupLayer.title,
        mosaic.groupLayer.workspaceName, mosaic.groupLayer.layers, mosaic.groupLayer.styles));
    } catch (e) {
      response.push(e);
    }

    return response;
  },
};
