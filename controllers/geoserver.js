
'use strict';

const layers = require("../geoserver-conf/layers/201911281134-create-layers-filter")
const https = require('https')
const axios = require('axios')

exports.get = async (req, res, next) => {

  const xml = layers;

  const exe = await axios.get('https://api.github.com/users/codeheaven-io').then(resp => resp );

  if(exe.status === 200){
       console.log('passou...')
       const geo = { name:'teste,,,,ddd', data: exe.data }
       geo.layers = xml
       res.json(geo)
  }else{
       User.findAll().then(users => {
           res.json(users)
       })
  }
};
