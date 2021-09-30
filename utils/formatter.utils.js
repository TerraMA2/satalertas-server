format = (value, style = 'decimal', unit = null) => {
  const options = {
    style,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  };
  if (style === 'unit') {
    if (!unit) {
      return value;
    }
    options['unit'] = unit;
  }

  const numberFormat = new Intl.NumberFormat('pt-BR', options);
  return numberFormat.format(value);
};

module.exports.formatHectare = (value) => {
  return format(value, 'unit', 'hectare');
};

module.exports.formatNumber = (value) => {
  return format(value);
};
