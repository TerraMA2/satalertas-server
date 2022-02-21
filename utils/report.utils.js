const fs = require('fs');
// const docDefinitions = require('./helpers/report/docDefinitions');

module.exports.getDeforestationHistoryImages = (deforestationHistory) => {
  const deforestationColumns = [];
  const deforestationData = [];
  const deforestationHistoryContext = [{ text: '', pageBreak: 'after' }];
  const deforestationHistoryCount = deforestationHistory.length;

  if (deforestationHistoryCount === 0) {
    return [];
  }
  deforestationHistoryContext.push({
    columns: [
      {
        text:
          'O histórico do desmatamento desde ' +
          `${deforestationHistory[0]}` +
          ' pode ser visto na figura 7',
        margin: [30, 0, 30, 15],
        style: 'bodyIndentFirst',
      },
    ],
  });
  for (let i = 0; i < deforestationHistoryCount; i++) {
    const deforestation = deforestationHistory[i];
    const { date, area } = deforestation;

    deforestationData.push([
      {
        text: `${date}`,
        style: 'body',
        alignment: 'center',
      },
      deforestation[`deforestationHistoryImage${i}`],
      {
        text: `${area}`,
        style: 'body',
        alignment: 'center',
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
        text: "Figura k7. ",
        bold: true,
      },
      {
        text: ` Histórico de desmatamento do PRODES desde ${ deforestationHistory[0].date }.`,
        bold: false,
      },
    ],
    margin: [30, 0, 30, 0],
    alignment: "center",
    fontSize: 9,
  });

  return deforestationHistoryContext;
};

module.exports.getNDVIImages = (ndviImages, startDate, endDate) => {
  if (!ndviImages || ndviImages === []) {
    return [];
  }
  const ndviContext = [
    {text: "", pageBreak: "after"},
    {
      columns: [
        {
          text: `Os gráficos a seguir representam os NDVIs dos 5 (cinco) maiores polígonos de desmatamento do PRODES no imóvel no período de ${ startDate } a ${ endDate }.`,
          margin: [30, 20, 30, 5],
          style: "body",
        },
      ],
    },
  ];
  ndviImages.forEach((image) => {
    ndviContext.push(
        {
          margin: [30, 0, 30, 0],
          alignment: "center",
          columns: [image.geoserverImage],
        },
        {
          margin: [30, 0, 30, 0],
          alignment: "center",
          columns: [image.ndviChartImage],
        },
        {text: "", pageBreak: "after"}
    );
  });
  return ndviContext;
};
