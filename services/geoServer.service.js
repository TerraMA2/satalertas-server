
const viewUtil = require("../utils/view");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
const confDb = require(__dirname + '/../config/config.json')[env];
const layerStyle = require('../geoserver-conf/views/layers-style/layers-style');

const URL = `${confGeoServer.host}workspaces/${confGeoServer.workspace}/featuretypes`;
const CONFIG = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/xml' } };
const CONFIG_JSON = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/json' } };


module.exports = geoServerService = {

  async updateLayer(view) {
    let result = null;

    if(view.title.substring(view.title.length-3, view.title.length) === 'sql') {
      const url = `${confGeoServer.host}layers/${view.workspace}:${view.title}.json`;
      const analyze =
        view.title.indexOf('deter', 0) > -1 ? 'deter' :
          view.title.indexOf('prodes', 0) > -1 ? 'prodes' :
            view.title.indexOf('focos', 0) > -1 ? 'focos' :
              view.title.indexOf('aq', 0) > -1 ? 'aq' : '';

      const crossing = view.title.substring(0, view.title.indexOf('_', 0));

      const layer = {
        layer: {
          name: view.title,
          type: "VECTOR",
          defaultStyle: {
            name: `${layerStyle[analyze][crossing].workspace}:${layerStyle[analyze][crossing].name}`,
            workspace: layerStyle[analyze][crossing].workspace,
            href: `${confGeoServer.host}workspaces/${layerStyle[analyze][crossing].workspace}/styles/${layerStyle[analyze][crossing].name}.json`
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
    return result.statusText = result.status ? `${result.status}/${result.statusText} - ${name} ${message}` : `${result.response.status}/${result.response.statusText} - ${result.response.data}`
  },

  async saveViewsGeoServer(views) {
    let response = [];
    for (let view of views) {

      view.name = view.name ? view.name : view.title;

      await this.validateWorkspace(view.workspace);
      await this.validateDataStore(view.workspace, view.dataStore);

      const method = await this.setMethod(`${URL}/${view.name}.json`);
      const xml = viewUtil.setXml(view);
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
      console.log(await this.saveGeoServer(data.workspace.name, method, urlW, data, CONFIG_JSON));
    }
  },

  async validateDataStore(nameWorkspace, nameDataStrore) {
    const urlD = `${confGeoServer.host}workspaces/${nameWorkspace}/datastores`;
    const method = await this.setMethod(`${urlD}/${nameDataStrore}.json`);

    if (method === 'post') {
      const data = geoServerUtil.setDataStore(confDb, nameWorkspace, nameDataStrore);
      console.log(await this.saveGeoServer(data.dataStore.name, method, urlD, data, CONFIG_JSON));
    }
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
        "srs": "EPSG:4326",
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
    const response = [];

    try {
      response.push(await this.createWmsStore(
        jsonConf.wmsStore.name, jsonConf.wmsStore.description, jsonConf.wmsStore.workspaceName,
        jsonConf.wmsStore.capabilitiesURL));

      response.push(await this.createWmsLayer(jsonConf.wmsLayer.name, jsonConf.wmsLayer.title,
        jsonConf.wmsLayer.description, jsonConf.wmsLayer.workspaceName, jsonConf.wmsLayer.wmsStoreName,
        jsonConf.wmsLayer.abstract));

      response.push(await this.createGroupLayer(jsonConf.groupLayer.name, jsonConf.groupLayer.title,
        jsonConf.groupLayer.workspaceName, jsonConf.groupLayer.layers, jsonConf.groupLayer.styles));
    } catch (e) {
      response.push(e);
      console.log(e);
    }

    return response;
  }
};
