const config = require(__dirname + '/../config/config.json');
exports.getFeatureJson = function(featureJson, view){
  let json = featureJson;
  if (json && json.length > 0){
    if (json.featureType.metadata.entry && (json.featureType.metadata.entry["@key"] === "JDBC_VIRTUAL_TABLE")) {
      json.featureType.metadata.entry.virtualTable.sql = view.sql;
    } else {
      json.featureType.metadata.entry.forEach(entry => {
        if (entry["@key"] === "JDBC_VIRTUAL_TABLE") {
          entry.virtualTable.sql = view.sql;
        }
      });
    }
  } else {
    json = {
      "featureType": {
        "name": view.name,
        "nativeName": view.name,
        "title": view.title,
        "keywords": { "string": [ "features", view.title ] },
        "srs": `EPSG:${config.geoserver.sridTerraMa}`,
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

  this.updateBoundingBox(json);
  if (view.addParameter) {
    this.addParameter(json);
  }

  return json;
};

exports.getLayerJson = function (view) {
  return {
    workspaceName: view.view_workspace,
    data: {
      layer: {
        name: view.title,
        type: "VECTOR",
        defaultStyle: {
          name: `${ view.view_workspace }:${ view.view }_style`,
          workspace: view.view_workspace,
          href: `${ config.geoserver.geoserverApi }workspaces/${ view.view_workspace }/styles/${ view.view }_style.json`
        }
      }
    }
  };
}

exports.addParameter = function(json) {
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

exports.updateBoundingBox = function(json){
  json.featureType.nativeBoundingBox = {
      "minx": -180,
      "maxx": 180,
      "miny": -90,
      "maxy": 90,
      "crs": `EPSG:${config.geoserver.sridTerraMa}`
  };
  json.featureType.latLonBoundingBox = {
      "minx": -180,
      "maxx": 180,
      "miny": -90,
      "maxy": 90,
      "crs": `EPSG:${config.geoserver.sridTerraMa}`
  };
};
