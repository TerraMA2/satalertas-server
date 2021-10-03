const axios = require('axios')

exports.get = async (coordinates, type, preFilter, filter, filterParam, sat) => {
  const key = 'ZW46IXzr4pRzJlX/';

  type = type ? `${ type }/` : `ndvi/`;
  const point = `ponto/${ coordinates.long }/${ coordinates.lat }/`;
  sat = sat ? `${ sat }/` : 'comb/';
  preFilter = preFilter === 'null' ? '0/' : `${ preFilter }/`;
  filter = filter === 'null' ? '' : `${ filter }/`;
  filterParam = filterParam === 'null' ? '' : `${ filterParam }`;

  const url = `https://www.satveg.cnptia.embrapa.br/satvegws/ws/perfil/${ key }${ type }${ point }${ sat }${ preFilter }${ filter }${ filterParam }`;

  return await axios.get(url).then(response => response.data);
}
