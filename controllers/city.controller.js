const models = require('../models')
      City = models.de_municipios_sema
      logger = require('../utils/logger');

exports.getAll = async (req, res) => {

    try {
        res.json(await City.findAll());
    } catch (e) {
      const msgErr = `In city.controller, method getAll:${e}`;
      logger.error(msgErr);
      res.json(msgErr);
    }
};

exports.getAllSimplified = async (req, res) => {
  const options = {
    attributes: [
      'gid',
      ['municipio', 'name'],
      'geocodigo'
    ],
    order: [
      ['municipio']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllRegionsSimplified = async (req, res) => {
  const options = {
    attributes: [
      ['comarca', 'name']
    ],
    group: 'comarca',
    order: [
      ['comarca']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllMesoregionsSimplified = async (req, res) => {
  const options = {
    attributes: [
      ['nm_meso', 'name']
    ],
    group: 'nm_meso',
    order: [
      ['nm_meso']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllImmediateRegionSimplified = async (req, res) => {
  const options = {
    attributes: [
      ['nm_rgi', 'name']
    ],
    group: 'nm_rgi',
    order: [
      ['nm_rgi']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllIntermediateRegionSimplified = async (req, res) => {
  const options = {
    attributes: [
      ['nm_rgint', 'name']
    ],
    group: 'nm_rgint',
    order: [
      ['nm_rgint']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllPjbhSimplified = async (req, res) => {
  const options = {
    attributes: [
      ['pjbh', 'name']
    ],
    group: 'pjbh',
    order: [
      ['pjbh']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};

exports.getAllMicroregionsSimplified = async (req, res) => {
  const options = {
    attributes: [
      ['nm_micro', 'name']
    ],
    group: 'nm_micro',
    order: [
      ['nm_micro']
    ]
  };
  try {
    res.json(await City.findAll(options));
  } catch (e) {
    const msgErr = `In city.controller, method getAllSimplified:${e}`;
    logger.error(msgErr);
    res.json(msgErr);
  }
};
