
const layerUtil = require("../utils/layer");
const layers = require("../geoserver-conf/layers/201911281134-create-layers-filter");
const confGeoserver = require('../geoserver-conf/config');
const axios = require('axios');

exports.get = async (req, res, next) => {

  const credentials = Buffer.from('admin:geoserver').toString('base64');

  const url = `${confGeoserver.development.host}workspaces/${confGeoserver.development.workspace}/featuretypes`;

  const config = { headers: { "Authorization": 'Basic ' + credentials, "Content-Type": 'application/xml' } };

  let response = [];

  for (let layer of layers) {

    const xml = layerUtil.setXml(layer);

    const res = await axios.post(
      'http://localhost:8080/geoserver/rest/workspaces/mpmt_alertas/featuretypes',
      xml, config)
      .then(resp => resp )
      .catch(err => err);

    res.statusText = res.status ? `${res.status}/${res.statusText} - ${layer.title}` : `${res.response.status}/${res.response.statusText} - ${res.response.data}`
    response.push(res.statusText);
  };

  res.json(response);
};
