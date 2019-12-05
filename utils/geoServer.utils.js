setViewJson = function(layer){
  return {
    "featureType": {
      "name": layer.title,
      "nativeName": layer.title,
      "namespace": {
        "name": layer.workspace,
        "href": `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/rest/namespaces/${layer.workspace}`
      },
      "title": layer.title,
      "keywords": { "string": [ "features", layer.title ] },
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
              "name": layer.title,
              "sql": layer.sql,
              "escapeSql": false,
              "geometry": {
                "name": "intersection_geom",
                "type": "Geometry",
                "srid": 4326
              }
            }
          },
          {
            "@key": "cachingEnabled",
            "$": "false"
          }
        ]
      },
      "store": {
        "@class": "dataStore",
        "name": layer.dataStore,
        "href": `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/rest/workspaces/${layer.workspace}/datastores/${layer.dataStore}.json`
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
  setDataStore(confDb, confGeoServer){
    return  {
      "dataStore": {
        "name": confGeoServer.datastore,
        "type": "PostGIS",
        "enabled": true,
        "workspace": {
          "name": confGeoServer.workspace,
          "href": "http://www.terrama2.dpi.inpe.br/mpmt/geoserver/rest/workspaces/terrama2_84.json"
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
              "$": `http://${confGeoServer.workspace}`
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
  setJsonView(json, layer){
    const viewJson = (json.status && json === 200) ? json : setViewJson(layer);

    updateBoundingBox(viewJson);
    if (layer.addParameter) {
      addParameter(viewJson);
    }
    viewJson.featureType.metadata.entry[0].virtualTable.sql = layer.sql;

    return viewJson;
  }
};

module.exports = geoServerUtil;
