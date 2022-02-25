const enums = require('../utils/Enums');
const SatAlertasChart = require('./SatAlertasChart.model');
const QUERY_TYPES_SELECT = { type: 'SELECT' };
const models = require('../models');
const Report = models.reports;

const sqlDeter = (propertyGid) => `SELECT
extract(year from date_trunc('year', cd.execution_date)) AS date,
cd.dd_deter_inpe_classname AS classe,
COALESCE(SUM(CAST(cd.calculated_area_ha  AS DECIMAL)), 0) AS value
FROM public.a_cardeter_31 cd
WHERE cd.de_car_validado_sema_gid = '${propertyGid}'
GROUP BY date, classe
ORDER BY classe, date;`;

const sqlCalor = (propertyGid) => `SELECT
extract(year from date_trunc('year', cf.execution_date)) AS date,
COUNT(cf.*) AS value
FROM public.a_carfocos_99 cf
WHERE cf.de_car_validado_sema_gid = '${propertyGid}'
GROUP BY date
ORDER BY date;`;

const sqlProdes = (propertyGid) => `SELECT
extract(year from date_trunc('year', areaq.execution_date)) AS date,
COALESCE(SUM(CAST(areaq.calculated_area_ha  AS DECIMAL)), 0) AS value
FROM public.a_caraq_75 areaq
WHERE areaq.de_car_validado_sema_gid = '${propertyGid}'
GROUP BY date
ORDER BY date;`;

function randomRGB(min, max) {
  const rand = () => min + Math.floor(Math.random() * (max - min + 1));
  return `rgb(${rand()}, ${rand()}, ${rand()})`;
}
async function getData(sql, queryTypes = QUERY_TYPES_SELECT) {
  return await Report.sequelize.query(sql, queryTypes);
}

function genLabels(data, colName = 'date') {
  const labels = [];
  data.forEach((item) => {
    item
      .map((item) => item[`${colName}`])
      .forEach((label) => {
        if (!labels.includes(label)) labels.push(label);
      });
  });
  const firstYear = Math.min(...labels);
  const lastYear = Math.max(...labels);
  const qt_years = lastYear - firstYear + 1;
  if (qt_years > labels.length) {
    Array.from({ length: qt_years }, (_, year) => {
      return year + firstYear;
    }).forEach((year) => {
      if (!labels.includes(year)) labels.push(year);
    });
  }
  labels.sort();
  return labels;
}

function deterClassToDataSet(data) {
  const allClasses = [];
  const subDatasets = [];
  data.forEach((result) => {
    const { classe } = result;
    if (!allClasses.includes(classe)) allClasses.push(classe);
  });
  allClasses.forEach((cls) => {
    const {
      colors: { backgroundColor, borderColor },
    } = enums.DETER[cls.toUpperCase()];
    const subDataset = {
      label: cls.split('_').join(' '),
      font: 'DETER',
      rawValues: [...data.filter((ds) => ds.classe == cls)],
    };
    if (backgroundColor !== '') {
      subDataset.backgroundColor = backgroundColor;
    }
    if (borderColor !== '') {
      subDataset.borderColor = borderColor;
    }
    subDatasets.push(subDataset);
  });
  return subDatasets;
}

async function twoAxisGraph(propertyGid, newReport = false) {
  const promisses = [
    getData(sqlDeter(propertyGid)),
    getData(sqlProdes(propertyGid)),
    getData(sqlCalor(propertyGid)), // se precisar do dados de calor
  ];
  return Promise.all(promisses).then((fetchData) => {
    const [deter, prodes, calor] = fetchData;
    const { FOCOS, PRODES } = enums;
    let labels = [];
    const allDatasets = [];
    labels = genLabels(fetchData, 'date');
    allDatasets.push(
      {
        label: 'FOCOS DE CALOR',
        type: 'line',
        rawValues: calor,
        axis: 'y',
        borderWidth: 2,
        ...FOCOS.colors,
        showLine: !newReport,
        fill: false,
      },
      {
        label: 'PRODES',
        type: 'bar',
        rawValues: prodes,
        axis: 'y1',
        ...PRODES.colors,
        fill: false,
      },
    );
    deterClassToDataSet(deter).forEach((dts) => {
      dts.type = 'bar';
      dts.fill = false;
      dts.yAxisID = 'y1';
      allDatasets.push(dts);
    });
    allDatasets.forEach((rawDs) => {
      const data = [];
      const { rawValues } = rawDs;
      labels.forEach((label) => {
        const val = rawValues.find(({ date }) => date === label);
        data.push((val && parseFloat(val.value)) || 0);
      });
      rawDs.data = data;
    });
    return { labels, datasets: allDatasets };
  });
}

function chartBase64(propertyGid, newReport = false) {
  const options = {
    title: {
      display: true,
      text: 'Desmatamento DETER e PRODES x Focos de Calor',
    },
    scales: {
      ticks: {
        fontSize: 9,
      },
      yAxes: [
        {
          id: 'y',
          ticks: {
            fontSize: 9,
          },
          type: 'linear',
          display: true,
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: 'Focos de calor (un)',
          },
          gridLines: {
            drawOnChartArea: false,
          },
        },
        {
          id: 'y1',
          ticks: {
            fontSize: 9,
          },
          type: 'linear',
          display: true,
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: 'Area desamatada (ha)',
          },
          gridLines: {
            drawOnChartArea: false,
          },
        },
      ],
    },
    legend: {
      labels: {
        fontSize: 8,
        boxWidth: 20,
        usePointStyle: !!newReport,
      },
      position: 'bottom',
    },
  };
  const newChart = new SatAlertasChart();
  return twoAxisGraph(propertyGid, newReport).then((data) => {
    const config = {
      type: 'bar',
      data: data,
      options,
    };
    newChart.setConfig(config);
    newChart.setDevicePixelRatio(8.0);
    return newChart.toDataUrl();
  });
}

function historyBurnlight(chartData) {
  const options = {
    responsive: false,
    legend: {
      labels: {
        fontSize: 8,
        boxWidth: 20,
      },
    },
    scales: {
      ticks: {
        fontSize: 9,
      },
      yAxes: [
        {
          ticks: {
            stepSize: 100,
          },
        },
      ],
    },
  };
  const allDatasets = [];
  const dataFocus = [];
  const prohibitivePeriod = [];
  let labels = [];
  labels = genLabels([chartData], 'month_year_occurrence');
  chartData.forEach((item) => {
    dataFocus.push({
      date: item['month_year_occurrence'],
      value: item.total_focus,
    });
    prohibitivePeriod.push({
      date: item['month_year_occurrence'],
      value: item.prohibitive_period,
    });
  });
  const prohibitivePeriodColor = 'rgba(255,5,0,1)';
  const allBurningColor = 'rgba(5,177,0,1)';
  allDatasets.push(
    {
      label: 'Focos de fogo ativo',
      rawValues: dataFocus,
      fill: false,
      backgroundColor: allBurningColor,
      borderColor: allBurningColor,
    },
    {
      label: 'Focos de fogo ativo (período proibitivo)',
      rawValues: prohibitivePeriod,
      fill: false,
      backgroundColor: prohibitivePeriodColor,
      borderColor: prohibitivePeriodColor,
    },
  );
  const config = {
    type: 'bar',
    options,
    data: { labels, datasets: allDatasets },
  };
  generateDatasets(allDatasets, labels, { colLabel: 'date' });

  const newChart = new SatAlertasChart();
  newChart.setWidth(450);
  newChart.setHeight(150);
  newChart.setConfig(config).setDevicePixelRatio(8.0);
  return newChart;
}

function generateDatasets(allDatasets, labels, configs = {}) {
  const { colLabel } = configs;
  allDatasets.forEach((rawDs) => {
    const { rawValues } = rawDs;
    const data = [];
    labels.forEach((label) => {
      const val = rawValues.find((dt) => dt[`${colLabel}`] === label);
      data.push((val && parseFloat(val.value)) || 0);
    });
    rawDs.data = data;
  });
}

module.exports = {
  chartBase64,
  historyBurnlight,
};
