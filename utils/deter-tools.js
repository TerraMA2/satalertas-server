const {getImageObject} = require('./image-handler')
const {formatHectare} = require("./formatter.utils");

module.exports.getContextDeforestationAlerts = async (deforestationAlerts) => {
  const deforestationAlertsContext = [];
  const deforestationAlertsCount = deforestationAlerts.length;

  if (deforestationAlerts && deforestationAlertsCount > 0) {
    let images = [];
    let titleDate = [];
    let subTitleArea = [];
    let startingYear = new Date().getFullYear();

    for (let i = 0; i < deforestationAlertsCount; ++i) {
      images.push(
        getImageObject(
          deforestationAlerts[i].urlGsImageBefore,
          [225, 225],
          [0, 0, 0, 0],
          "left"
        )
      );
      images.push(
        getImageObject(
          deforestationAlerts[i].urlGsImageCurrent,
          [225, 225],
          [13, 0, 0, 0],
          "right"
        )
      );

      startingYear =
        deforestationAlerts[i].year - 1 < startingYear
          ? deforestationAlerts[i].year - 1
          : startingYear;

      titleDate.push({
        text: `Alerta(${deforestationAlerts[i].date}) - Imagem(${deforestationAlerts[i].year - 1})`,
        fontSize: 8,
        style: "body",
        alignment: "center",
      });

      titleDate.push({
        text: `Alerta(${deforestationAlerts[i].date}) - Imagem(${deforestationAlerts[i].date})`,
        fontSize: 8,
        style: "body",
        alignment: "center",
      });

      subTitleArea.push({
        text: `${formatHectare(deforestationAlerts[i].area)}`,
        fontSize: 8,
        style: "body",
        alignment: "center",
      });

      if (i === 0) {
        deforestationAlertsContext.push({
          text: `Na  figura 3, a seguir, será  representado  o detalhamento  dos  alertas.`,
          alignment: "right",
          margin: [30, 0, 30, 0],
          style: "body",
        });
      } else {
        deforestationAlertsContext.push({
          text: "",
          pageBreak: "after",
        });
      }
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
            getImageObject(
              deforestationAlerts[i].urlGsImagePlanetCurrentAndCar,
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
          text: ` Comparativo de imagens de satélite anterior à ${startingYear} e atual ${new Date().getFullYear()}.`,
          bold: false,
        },
      ],
      margin: [30, 0, 30, 0],
      alignment: "center",
      fontSize: 9,
    });
  }
  return deforestationAlertsContext;
};
