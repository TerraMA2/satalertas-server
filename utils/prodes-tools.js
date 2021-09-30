const { getImageObject } = require("./image-handler");
const { getMapImage } = require("../services/geoServer.service");

module.exports.getContextDeforestationHistory = async (
  deforestationHistory,
  urlGsDeforestationHistory
) => {
  const deforestationHistoryContext = [];
  const deforestationHistoryCount = deforestationHistory.length;

  if (deforestationHistory && deforestationHistoryCount > 0) {
    const deforestationData = [];
    const deforestationColumns = [];

    deforestationHistoryContext.push({
      text: "",
      pageBreak: "after",
    });
    deforestationHistoryContext.push({
      columns: [
        {
          text: `O histórico do desmatamento desde ${deforestationHistory[0].date} pode ser visto na figura 7.`,
          margin: [30, 0, 30, 15],
          style: "bodyIndentFirst",
        },
      ],
    });
    for (let i = 0; i < deforestationHistoryCount; ++i) {
      const deforestation = deforestationHistory[i];
      const { date, area } = deforestation;
      let view = date < 2013
          ? "LANDSAT_5_"
          : date < 2017
          ? "LANDSAT_8_"
          : "SENTINEL_2_";
      view = `${view}${date}`

      let mapImg = {...urlGsDeforestationHistory};
      if(date !== 2012) {
        mapImg['layers'] = `terrama2_35:${view},${mapImg['layers']}`
        mapImg['styles'] = `,${mapImg['styles']}`
        mapImg['cql_filter'] = `RED_BAND>0;${mapImg['cql_filter']}`
      }

      mapImg['time'] = `P1Y/${date}`;

      deforestationData.push([
        {
          text: `${date}`,
          style: "body",
          alignment: "center",
        },
        getImageObject(await getMapImage(mapImg), [117, 117], [5, 0], "center"),
        {
          text: `${area}`,
          style: "body",
          alignment: "center",
        },
      ]);
    }

    for (let start = 0; start < deforestationData.length; start += 3) {
      if (start !== 0 && start % 12 === 0) {
        deforestationColumns.push({
          text: "",
          pageBreak: "after",
        });
      }
      if (start + 3 < deforestationData.length) {
        deforestationColumns.push({
          margin: [30, 0, 30, 0],
          alignment: "center",
          columns: [...deforestationData.slice(start, start + 3)],
        });
      } else {
        deforestationColumns.push({
          margin: [30, 0, 30, 0],
          alignment: "center",
          columns: [...deforestationData.slice(start)],
        });
      }
    }

    deforestationHistoryContext.push(...deforestationColumns, {
      text: [
        {
          text: "Figura 7. ",
          bold: true,
        },
        {
          text: ` Histórico de desmatamento do PRODES desde ${deforestationHistory[0].date}.`,
          bold: false,
        },
      ],
      margin: [30, 0, 30, 0],
      alignment: "center",
      fontSize: 9,
    });
  }

  return deforestationHistoryContext;
};
