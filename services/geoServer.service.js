
const viewUtil = require("../utils/view");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
const confDb = require(__dirname + '/../config/config.json')[env];

const URL = `${confGeoServer.host}workspaces/${confGeoServer.workspace}/featuretypes`;
const CONFIG = { headers: { "Authorization": 'Basic ' + Buffer.from('admin:geoserver').toString('base64'), "Content-Type": 'application/xml' } };
const CONFIG_JSON = { headers: { "Authorization": 'Basic ' + Buffer.from('admin:geoserver').toString('base64'), "Content-Type": 'application/json' } };

module.exports = geoServerService = {

  async setMethod(url) {
    let result = await axios.get(url, CONFIG_JSON).then(resp => resp).catch(err => err);
    return (result.status && (result.status === 200)) ? 'put' : 'post';
  },

  async saveGeoServer(name, method, url, xmlOrJson, config) {
    const urlMethod = (method === 'put') ? `${url}/${name}`: url;
    const result = await axios[method]( urlMethod, xmlOrJson, config).then(resp => resp ).catch(err => err);
    return result.statusText = result.status ? `${result.status}/${result.statusText} - ${name}` : `${result.response.status}/${result.response.statusText} - ${result.response.data}`
  },

  async saveViewsGeoServer(layers) {
    await this.validateWorkspace();
    await this.validateDataStore();
    let response = [];
    for (let layer of layers) {
      const method = await this.setMethod(`${URL}/${layer.title}.json`);
      const xml = viewUtil.setXml(layer);
      response.push(await this.saveGeoServer(layer.title, method, URL, xml, CONFIG));
    }
    return response;
  },

  async validateWorkspace() {
    const urlW = `${confGeoServer.host}workspaces`;
    const method = await this.setMethod(`${urlW}/${confGeoServer.workspace}.json`);
    let data = geoServerUtil.setWorkSpace(confGeoServer.workspace);
    console.log(await this.saveGeoServer(data.workspace.name, method, urlW, data, CONFIG_JSON));
  },

  async validateDataStore() {
    const urlD = `${confGeoServer.host}workspaces/${confGeoServer.workspace}/datastores`;
    const method = await this.setMethod(`${urlD}/${confGeoServer.datastore}.json`);
    const data = geoServerUtil.setDataStore(confDb, confGeoServer);
    console.log(await this.saveGeoServer(data.dataStore.name, method, urlD, data, CONFIG_JSON));
  },

  async deleteView(layersToInsert){
    let response = [];

    for (let layer of layersToInsert) {

      const res = await axios.delete(
        `${URL}/${layer.title}`,CONFIG)
        .then(resp => resp )
        .catch(err => err);

      res.statusText = res.status ? `${res.status}/${res.statusText} - ${layer.title}` : `${res.response.status}/${res.response.statusText} - ${res.response.data}`;
      response.push(res.statusText);
    }

    return response;
  },

  async saveViewsJsonGeoServer(layers){

    await this.validateWorkspace();
    await this.validateDataStore();

    const response = [];
    for (let layer of layers) {
      const url = `${URL}/${layer.title}.json`;
      const json = await axios.get( url, CONFIG_JSON).then(resp => resp ).catch(err => err);

      const method = (json && json.status && json.status === 200) ? 'put' : 'post';

      const jsonView = geoServerUtil.setJsonView(json, layer);
      response.push(await this.saveGeoServer(layer.title, method, URL, jsonView, CONFIG_JSON) );
    }
    return response;
  }
};
