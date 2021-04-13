
setViewJson = function(json, view){
  let result = {};
  if (json.status && json.status === 200 && json.data){
    result = json.data;

    if (result.featureType.metadata.entry && (result.featureType.metadata.entry["@key"] === "JDBC_VIRTUAL_TABLE")) {
      result.featureType.metadata.entry.virtualTable.sql = view.sql;
    } else {
      result.featureType.metadata.entry.forEach(entry => {
        if (entry["@key"]  === "JDBC_VIRTUAL_TABLE") {
          entry.virtualTable.sql = view.sql;
        }
      });
    }
  } else {
    result =  {
      "featureType": {
        "name": view.name,
        "nativeName": view.name,
        "title": view.title,
        "keywords": { "string": [ "features", view.title ] },
        "srs": `EPSG:${confGeoServer.sridTerraMa}`,
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
                "geometry": {
                  "name": view.geometry.name,
                  "type": view.geometry.type,
                  "srid": view.geometry.srid
                }
              }
            },
            {
              "@key": "time",
              "dimensionInfo": {
                "enabled": true,
                "attribute": "execution_date",
                "presentation": "CONTINUOUS_INTERVAL",
                "units": "ISO8601",
                "defaultValue": {
                  "strategy": "MAXIMUM"
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
  }

  updateBoundingBox(result);
  if (view.addParameter) {
    addParameter(result);
  }

  return result;
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
      defaultValue: 999999999,
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
      "crs": `EPSG:${confGeoServer.sridTerraMa}`
  };
  json.featureType.latLonBoundingBox = {
      "minx": -180,
      "maxx": 180,
      "miny": -90,
      "maxy": 90,
      "crs": `EPSG:${confGeoServer.sridTerraMa}`
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
          "href": `${confGeoServer.host}workspaces/${nameWorkspace}.json`
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
    return setViewJson(json, view);
  }
};

module.exports = geoServerUtil;
