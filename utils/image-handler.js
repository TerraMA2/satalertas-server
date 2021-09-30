module.exports.getImageObject = (image, fit, margin, alignment) => {
  if (image && image[0] && !image[0].includes("data:application/vnd.ogc.se_xml")) {
    return {
      image: image,
      fit: fit,
      margin: margin,
      alignment: alignment,
    };
  } else {
    return {
      text: "Imagem não encontrada.",
      alignment: "center",
      color: "#ff0000",
      fontSize: 9,
      italics: true,
      margin: [30, 60, 30, 60],
    };
  }
};
