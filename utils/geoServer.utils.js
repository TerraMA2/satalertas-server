
const env = process.env.NODE_ENV || 'development';
const confGeoServer = require(__dirname + '/../geoserver-conf/config.json')[env];

setViewJson = function(view){
  return {
    "featureType": {
      "name": view.name,
      "nativeName": view.name,
      "title": view.title,
      "keywords": { "string": [ "features", view.title ] },
      "srs": "EPSG:4326",
      "nativeBoundingBox": { },
      "latLonBoundingBox": { },
      "projectionPolicy": "FORCE_DECLARED",
      "enabled": true,
      "metadata": {
        "entry": [
          {
            "@key": "JDBC_VIRTUAL_TABLE",
            "virtualTable": {
              "name": view.name,
              "sql": view.sql,
              "escapeSql": false,
              "keyColumn":view.keyColumn,
              "geometry": {
                "name": view.geometry.name,
                "type": view.geometry.type,
                "srid": view.geometry.srid
              }
            }
          },
          {
            "@key": "cachingEnabled",
            "$": "false"
          }
        ]
      },
      "maxFeatures": 0,
      "numDecimals": 0,
      "overridingServiceSRS": false,
      "skipNumberMatched": false,
      "circularArcPresent": false
    }
  };
};

addParameter = function(json) {
  json.featureType.metadata.entry[0].virtualTable.parameter = [
    {
      name: 'min',
      defaultValue: 0,
      regexpValidator: '^[\\d]+$'
    },
    {
      name: 'max',
      defaultValue: 99999999999,
      regexpValidator: '^[\\d]+$'
    }
  ];
};

updateBoundingBox = function(json){
  json.featureType.nativeBoundingBox = {
      "minx": -180,
      "maxx": 180,
      "miny": -90,
      "maxy": 90,
      "crs": "EPSG:4326"
  };
  json.featureType.latLonBoundingBox = {
      "minx": -180,
      "maxx": 180,
      "miny": -90,
      "maxy": 90,
      "crs": "EPSG:4326"
  };
};

const geoServerUtil = {
  setWorkSpace(name) {
    return {
      "workspace": {
        "name": name
      }
    }
  },
  setDataStore(confDb, nameWorkspace, nameDatastore){
    return  {
      "dataStore": {
        "name": nameDatastore,
        "type": "PostGIS",
        "enabled": true,
        "workspace": {
          "name": nameWorkspace,
          "href": `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/rest/workspaces/${nameWorkspace}.json`
        },
        "connectionParameters": {
          "entry": [
            {
              "@key": "database",
              "$": confDb.database
            },
            {
              "@key": "host",
              "$": confDb.host
            },
            {
              "@key": "port",
              "$": confDb.port
            },
            {
              "@key": "passwd",
              "$": confDb.password
            },
            {
              "@key": "dbtype",
              "$": "postgis"
            },
            {
              "@key": "namespace",
              "$": `http://${nameWorkspace}`
            },
            {
              "@key": "max connections",
              "$": "50"
            },
            {
              "@key": "user",
              "$": confDb.username
            }
          ]
        }
      }
    }
  },
  setJsonView(json, view){
    const viewJson = (json.status && json === 200) ? json : setViewJson(view);

    updateBoundingBox(viewJson);
    if (view.addParameter) {
      addParameter(viewJson);
    }
    viewJson.featureType.metadata.entry[0].virtualTable.sql = view.sql;

    return viewJson;
  }
};

module.exports = geoServerUtil;
