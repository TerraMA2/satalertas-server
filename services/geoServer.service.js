
const viewUtil = require("../utils/view");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
const confDb = require(__dirname + '/../config/config.json')[env];

const URL = `${confGeoServer.host}workspaces/${confGeoServer.workspace}/featuretypes`;
const CONFIG = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/xml' } };
const CONFIG_JSON = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/json' } };

module.exports = geoServerService = {

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
    }
    return response;
  }
};
