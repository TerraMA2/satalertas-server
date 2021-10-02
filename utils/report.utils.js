const formatter = require("./formatter.utils");
const fs = require("fs");
const viewService = require("../services/view.service");
const {QueryTypes} = require("sequelize");
const {sequelize, Report} = require("../models");
const Layer = require("../utils/layer.utils");
const gsLayers = require("../enum/geoserver-layers");
const geoserverService = require("../services/geoServer.service");
const satVegService = require("../services/sat-veg.service");
const ProdesChart = require("../charts/prodes-chart");
const config = require(__dirname + "/../config/config.json");
const PdfMake = require("pdfmake/build/pdfmake.min");
const PdfFonts = require("pdfmake/build/vfs_fonts");
const docDefinitions = require("../utils/helpers/report/doc-definition.js");
const PdfPrinter = require("pdfmake");
PdfMake.vfs = PdfFonts.pdfMake.vfs;

module.exports.getDeforestationAlertsImages = (deforestationAlerts) => {
  if (!deforestationAlerts || deforestationAlerts.length === 0) {
    return [];
  }
  const deforestationAlertsContext = [];
  let images = [];
  let titleDate = [];
  let subTitleArea = [];
  let startingYear = new Date().getFullYear();

  deforestationAlertsContext.push({
    text: `Na figura 3, a seguir, será  representado o detalhamento dos alertas.`,
    alignment: "right",
    margin: [30, 0, 30, 0],
    style: "body",
  });

  for (const deforestationAlert of deforestationAlerts) {
    images.push(this.getImageObject(
            deforestationAlert.deforestationAlertYearBeforeImage,
            [225, 225],
            [0, 0, 0, 0],
            "left"
        )
    );
    images.push(this.getImageObject(
            deforestationAlert.deforestationAlertCurrentYearImage,
            [225, 225],
            [13, 0, 0, 0],
            "right"
        )
    );

    startingYear = deforestationAlert.year - 1 < startingYear ? deforestationAlert.year - 1 : startingYear;

    titleDate.push({
      text: `Alerta(${ deforestationAlert.date }) - Imagem(${ deforestationAlert.year - 1 })`,
      fontSize: 8,
      style: "body",
      alignment: "center",
    });

    titleDate.push({
      text: `Alerta(${ deforestationAlert.date }) - Imagem(${ deforestationAlert.date })`,
      fontSize: 8,
      style: "body",
      alignment: "center",
    });

    subTitleArea.push({
      text: `${ deforestationAlert.area }`,
      fontSize: 8,
      style: "body",
      alignment: "center",
    });

    deforestationAlertsContext.push(
        {
          columns: titleDate,
          margin: [30, 0, 30, 0],
        },
        {
          columns: images,
          margin: [30, 0, 30, 0],
        },
        {
          columns: [
            this.getImageObject(
                deforestationAlert.deforestationAlertPlanetCurrentYearImage,
                [420, 420],
                [0, 0],
                "center"
            ),
          ],
          margin: [30, 5, 30, 0],
        },
        {
          columns: subTitleArea,
          margin: [30, 5, 30, 5],
        }
    );

    deforestationAlertsContext.push({
      text: "",
      pageBreak: "after",
    });

    images = [];
    titleDate = [];
    subTitleArea = [];
  }

  deforestationAlertsContext.push({
    text: [
      {
        text: "Figura 3. ",
        bold: true,
      },
      {
        text: ` Comparativo de imagens de satélite anterior à ${ startingYear } e atual ${ new Date().getFullYear() }.`,
        bold: false,
      },
    ],
    margin: [30, 0, 30, 0],
    alignment: "center",
    fontSize: 9
  });
  return deforestationAlertsContext;
}

module.exports.getDeforestationHistoryImages = (deforestationHistory) => {
  const deforestationHistoryContext = [];
  const deforestationData = [];
  const deforestationColumns = [];

  const deforestationHistoryCount = deforestationHistory.length;
  if (deforestationHistoryCount === 0) {
    return [];
  }
  deforestationHistoryContext.push({
    text: "",
    pageBreak: "after",
  });
  deforestationHistoryContext.push({
    columns: [
      {
        text: `O histórico do desmatamento desde ${ deforestationHistory[0].date } pode ser visto na figura 7.`,
        margin: [30, 0, 30, 15],
        style: "bodyIndentFirst",
      },
    ],
  });
  for (let i = 0; i < deforestationHistoryCount; i++) {
    const deforestation = deforestationHistory[i];
    const {date, area} = deforestation;

    deforestationData.push([
      {
        text: `${ date }`,
        style: "body",
        alignment: "center",
      },
      deforestation[`deforestationHistoryImage${ i }`],
      {
        text: `${ area }`,
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
        text: ` Histórico de desmatamento do PRODES desde ${ deforestationHistory[0].date }.`,
        bold: false,
      },
    ],
    margin: [30, 0, 30, 0],
    alignment: "center",
    fontSize: 9,
  });

  return deforestationHistoryContext;
}

module.exports.getImageObject = (image, fit, margin, alignment) => {
  if (!image || !image[0] || image[0].includes("data:application/vnd.ogc.se_xml")) {
    return {
      text: "Imagem não encontrada.",
      alignment: "center",
      color: "#ff0000",
      fontSize: 9,
      italics: true,
      margin: [30, 60, 30, 60],
    };
  }
  return {
    image,
    fit,
    margin,
    alignment,
  };
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

module.exports.getStaticImages = () => {
  const staticImages = [];
  const headerImages = [];
  const partnerImages = [];
  const chartImages = [];
  headerImages.push(
      this.getImageObject(
          [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/mpmt-small.png", "base64") }`],
          [320, 50],
          [60, 25, 0, 20],
          "left"
      ),
      this.getImageObject(
          [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/logo-satelites-alerta-horizontal.png", "base64") }`],
          [320, 50],
          [0, 25, 0, 0],
          "left"
      ),
      this.getImageObject(
          [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/inpe.png", "base64") }`],
          [320, 50],
          [0, 25, 70, 20],
          "right"
      )
  )
  chartImages['satVegChart1'] = this.getImageObject(
      [`data:image/png;base64,${ fs.readFileSync("assets/img/satveg_grafico_fig2.png", "base64") }`],
      [480, 400],
      [0, 3],
      "center"
  );
  chartImages['satVegChart2'] = this.getImageObject(
      [`data:image/png;base64,${ fs.readFileSync("assets/img/satveg_grafico_fig3.png", "base64") }`],
      [480, 400],
      [3, 3],
      "center"
  );
  chartImages['satVegChart3'] = this.getImageObject(
      [`data:image/png;base64,${ fs.readFileSync("assets/img/satveg_grafico_fig4.png", "base64") }`],
      [480, 400],
      [3, 3],
      "center"
  );

  partnerImages.push(
      {
        columns: [
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/mpmt-small.png", "base64") }`],
              [180, 50],
              [30, 0, 0, 0],
              "left"
          ),
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/pjedaou-large.png", "base64") }`],
              [100, 50],
              [30, 0, 0, 0],
              "center"
          ),
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/caex.png", "base64") }`],
              [80, 50],
              [30, 0, 25, 0],
              "right"
          )
        ]
      },
      {
        columns: [
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/inpe.png", "base64") }`],
              [130, 60],
              [80, 30, 0, 0],
              "left"
          ),
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/dpi.png", "base64") }`],
              [100, 60],
              [95, 30, 0, 0],
              "center"
          ),
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/terrama2-large.png", "base64") }`],
              [100, 60],
              [0, 30, 30, 0],
              "right"
          )
        ]
      },
      {
        columns: [
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/mt.png", "base64") }`],
              [100, 60],
              [80, 30, 0, 0],
              "left"
          ),
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/sema.png", "base64") }`],
              [100, 60],
              [130, 25, 0, 0],
              "center"
          ),
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/logo-patria-amada-brasil-horizontal.png", "base64") }`],
              [100, 60],
              [0, 30, 25, 0],
              "right"
          )
        ]
      },
      {
        columns: [
          this.getImageObject(
              [`data:image/png;base64,${ fs.readFileSync("assets/img/logos/Brasao_BPMA.png", "base64") }`],
              [80, 60],
              [500, 25, 0, 0],
              "center"
          )
        ]
      }
  );

  staticImages['headerImages'] = headerImages;
  staticImages['partnerImages'] = partnerImages;
  staticImages['chartImages'] = chartImages;
  return staticImages;
};

module.exports.getNDVI = async (carGid, date, type) => {
  const {planetSRID} = config.geoserver;
  const groupViews = await viewService.getSidebarLayers(true);

  const carIdColumn = "gid";
  const analysisCarIdColumn = "de_car_validado_sema_gid";

  const groupType = {
    prodes: "CAR_X_PRODES",
    deter: "CAR_X_DETER",
    queimada: "",
  };

  const sql = `
        SELECT main_table.a_carprodes_1_id AS id,
               ST_Y(ST_Centroid(main_table.intersection_geom)) AS "lat",
               ST_X(ST_Centroid(main_table.intersection_geom)) AS "long",
               extract(year from date_trunc('year', main_table.execution_date)) AS startYear
        FROM public.${groupViews[type.toUpperCase()].children[groupType[type]].tableName} AS main_table
        WHERE main_table.${analysisCarIdColumn} = '${carGid}'
          AND main_table.execution_date BETWEEN '${date[0]}' AND '${date[1]}'
        ORDER BY main_table.calculated_area_ha DESC
        LIMIT 5
    `;

  const sqlBbox = `
    SELECT substring(ST_EXTENT(ST_Transform(geom, ${planetSRID}))::TEXT, 5, length(ST_EXTENT(ST_Transform(geom, ${planetSRID}))::TEXT) - 5) AS bbox
      FROM de_car_validado_sema
      WHERE ${carIdColumn} = ${carGid}
      GROUP BY gid`;

  const bboxOptions = {
    type: QueryTypes.SELECT,
    plain: true
  };

  const carBbox = await sequelize.query(sqlBbox, bboxOptions);
  const deforestationAlerts = await sequelize.query(sql, {type: QueryTypes.SELECT});

  let bbox = Layer.setBoundingBox(carBbox.bbox);

  const currentYear = new Date().getFullYear();
  const ndviImages = [];
  for (const deforestationAlert of deforestationAlerts) {
    const gsConfig = {
      bbox: `${ bbox }`,
      cql_filter: `RED_BAND>0;
        rid='${ carGid }';
        gid_car='${ carGid }';
        ${ groupViews[type.toUpperCase()].children[groupType[type]].tableName }_id=${ deforestationAlert.id }`,
      height: config.geoserver.imgHeight,
      layers: `${ gsLayers.image.PLANET_LATEST },${
          groupViews.STATIC.children.CAR_VALIDADO.workspace
      }:${ groupViews.STATIC.children.CAR_VALIDADO.view },${
          groupViews.STATIC.children.CAR_X_USOCON.workspace
      }:${ groupViews.STATIC.children.CAR_X_USOCON.view },${
          groupViews[type.toUpperCase()].children[groupType[type]].workspace
      }:${ groupViews[type.toUpperCase()].children[groupType[type]].view }`,
      srs: `EPSG:${ planetSRID }`,
      styles: `,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${
          groupViews.STATIC.children.CAR_VALIDADO.view
      }_yellow_style,${ groupViews.STATIC.children.CAR_VALIDADO.workspace }:${
          groupViews.STATIC.children.CAR_X_USOCON.view
      }_hatched_style,${ groupViews[type.toUpperCase()].children[groupType[type]].workspace }:${
          groupViews[type.toUpperCase()].children[groupType[type]].view
      }_red_style`,
      time: `${ deforestationAlert.startyear }/${ currentYear }`,
      width: config.geoserver.imgWidth,
    };

    const geoserverImage = this.getImageObject(await geoserverService.getMapImage(gsConfig), [200, 200], [10, 70], "center");
    const options = await satVegService
        .get({
          long: deforestationAlert.long,
          lat: deforestationAlert.lat
        }, "ndvi", 3, "wav", "", "aqua")
        .then(({listaDatas, listaSerie}) => ProdesChart.getChartOptions(listaDatas, listaSerie));
    const image = await ProdesChart.chartBase64(options);
    const ndviChartImage = await this.getImageObject(image, [500, 500], [10, 0], "center");
    ndviImages.push({
      ndviChartImage,
      geoserverImage,
      options
    })
  }
  return ndviImages;
};

module.exports.getConclusion = (conclusionText) => {
  const conclusionParagraphs = conclusionText ? conclusionText.split("\n") : ["XXXXXXXXXXXXX."];
  const conclusion = [];

  for (const paragraph in conclusionParagraphs) {
    const paragraphObj = {
      text: conclusionParagraphs[paragraph],
      margin: [30, 0, 30, 5],
      style: "bodyIndentFirst",
    };
    conclusion.push(paragraphObj);
  }
  return conclusion;
};

module.exports.getContentConclusion = (docDefinitionContent, conclusionText) => {
  const conclusion = this.getConclusion(conclusionText);
  const conclusionIdx = docDefinitionContent.findIndex(({text}) => text && text.includes("CONCLUSÃO")) + 1;

  docDefinitionContent.splice(conclusionIdx, 0, conclusion);

  return docDefinitionContent;
};

module.exports.getReportBase64 = async (docDefinitions) => {
  const pdfDoc = PdfMake.createPdf(docDefinitions);
  return new Promise((resolve) => pdfDoc.getBase64(data => resolve(data)));
}

module.exports.getDocDefinitions = (reportData) => {
  return docDefinitions[reportData["type"]](reportData);
}

module.exports.generateNumber = async (type) => {
  const sql = `SELECT '${type.trim()}' AS type,
               EXTRACT(YEAR FROM CURRENT_TIMESTAMP) AS year,
               LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0') AS newnumber,
               CONCAT(
                    LPAD(CAST((COALESCE(MAX(rep.code), 0) + 1) AS VARCHAR), 5, '0'),
                    '/',
                    EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
               ) AS code
        FROM alertas.reports AS rep
        WHERE rep.type = '${type.trim()}'
          AND rep.created_at BETWEEN
            CAST(concat(EXTRACT(YEAR FROM CURRENT_TIMESTAMP),\'-01-01 00:00:00\') AS timestamp) AND CURRENT_TIMESTAMP`;
  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    fieldMap: {
      newnumber: "newNumber",
    },
    plain: true,
  });
};

module.exports.generateReport = async (pathDoc, docName, reportData) => {
  const fonts = {
    Roboto: {
      normal: "fonts/Roboto-Regular.ttf",
      bold: "fonts/Roboto-Medium.ttf",
      italics: "fonts/Roboto-Italic.ttf",
      bolditalics: "fonts/Roboto-MediumItalic.ttf",
    }
  };
  const printer = new PdfPrinter(fonts);
  const docDefinitions = await this.getDocDefinitions(reportData);
  const pdfDoc = printer.createPdfKitDocument(docDefinitions);
  const docStream = await fs.createWriteStream(`${ pathDoc }${ docName }`);
  pdfDoc.pipe(docStream);
  pdfDoc.end();
  return new Promise(resolve => docStream.on('finish', (data) => resolve(data)));
}

module.exports.saveReport = async (docName, newNumber, reportData, path) => {
  const report = new Report({
    name: docName.trim(),
    code: parseInt(newNumber),
    carCode: reportData.stateRegister
        ? reportData.stateRegister.trim()
        : reportData.federalregister,
    carGid: reportData.gid,
    path: path.trim(),
    type: reportData.type.trim(),
  });
  return await Report.create(report.dataValues).then((report) => report.dataValues);
};

getInformationVegRadam = function (vegRadam) {
  if (!vegRadam) {
    return '0 ha de desmatamento';
  }
  let textRadam = ' (sendo ';
  vegRadam.forEach((veg, index) => {
    if (index !== 0) {
      textRadam += ', ';
    }
    textRadam += `${ veg.area } em área da fisionomia ${ veg.fisionomia }`;
  });
  textRadam += ' segundo Mapa da vegetação do Projeto RadamBrasil)'
  return textRadam;
};
