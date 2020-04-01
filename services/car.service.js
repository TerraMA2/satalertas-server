
const ViewUtil = require("../utils/view.utils");
const geoServerUtil = require("../utils/geoServer.utils");
const axios = require('axios');
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];
const confDb = require(__dirname + '/../config/config.json')[env];
const ViewService = require(__dirname + "/view.service");
const FILTER = require(__dirname + '/../utils/helpers/geoserver/filter');
const VIEW_UPDATE_FILTER = require(__dirname + '/../utils/helpers/geoserver/view.update.filter');

const URL = `${confGeoServer.host}workspaces/${confGeoServer.workspace}/featuretypes`;
const CONFIG = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/xml' } };
const CONFIG_JSON = { headers: { "Authorization": 'Basic ' + Buffer.from(`${confGeoServer.username}:${confGeoServer.password}`).toString('base64'), "Content-Type": 'application/json' } };

module.exports = geoServerService = {

  async getAllSimplified( ) {

  },

  async getAll( ) {

  },

  async getByCpf( ) {

  },

};
