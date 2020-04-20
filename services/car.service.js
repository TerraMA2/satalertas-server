const models = require('../models');
      Car = models.de_car_validado_sema;
      Filter = require("../utils/filter/filter.utils");
      QUERY_TYPES_SELECT = { type: "SELECT" };

module.exports = carService = {
  async getAllSimplified(params) {
    const specificParameters = JSON.parse(params.specificParameters);
    const layer = JSON.parse(specificParameters.view);

    try {
      const table = {
        name: layer.tableName,
        alias: specificParameters.tableAlias,
        owner: ''
      };

      const filter =
        specificParameters.isDynamic ?
          await Filter.setFilter(Car, params, table, layer) :
          {
            sqlWhere: '',
            secondaryTables: '',
            sqlHaving: '',
            order: '',
            limit: specificParameters.limit ? ` LIMIT ${specificParameters.limit}` : '',
            offset: specificParameters.offset ? ` OFFSET ${specificParameters.offset}` : ''
          };

      const sqlSelectCount = specificParameters.count ? `,COUNT(1) AS ${specificParameters.countAlias}` : '';
      const sqlSelectSum = specificParameters.sum && layer.codgroup !== 'BURNED' ? `,SUM(${specificParameters.tableAlias}.${specificParameters.sumField}) AS ${specificParameters.sumAlias}` : '';
      const sqlSelect =
        ` SELECT 
                        property.gid AS gid,
                        property.numero_do1 AS registro_estadual,
                        property.numero_do2 AS registro_federal,
                        property.nome_da_p1 AS nome_propriedade,
                        property.municipio1 AS municipio,
                        property.area_ha_ AS area,
                        property.situacao_1 AS situacao,
                        ST_Y(ST_Centroid(property.geom)) AS "lat",
                        ST_X(ST_Centroid(property.geom)) AS "long",
                        (SELECT count(1) > 0 FROM alertas.reports rep WHERE property.gid = rep.car_gid) AS has_pdf
                        ${sqlSelectSum}
                        ${sqlSelectCount} `;

      const sqlFrom = ` FROM public.${table.name} AS ${specificParameters.tableAlias}`;

      const sqlGroupBy = layer && layer.codgroup && layer.codgroup === 'CAR' ? '' : ` GROUP BY property.gid `;

      const sqlOrderBy = ` ORDER BY ${layer.codgroup === 'BURNED' ? specificParameters.countAlias : specificParameters.sortField} DESC `;


      const column = layer.isPrimary ? 'de_car_validado_sema_gid' : 'a_carfocos_20_de_car_validado_sema_gid';


      filter.secondaryTables += specificParameters.isDynamic ?
        '  , public.de_car_validado_sema AS property' :
        '';

      filter.sqlWhere += specificParameters.isDynamic ?
        ` AND property.gid = ${specificParameters.tableAlias}.de_car_validado_sema_gid ` : '';

      const sqlWhere =
        filter.sqlHaving ?
          ` ${filter.sqlWhere}
                        AND ${specificParameters.tableAlias}.de_car_validado_sema_gid IN
                          ( SELECT tableWhere.${column} AS subtitle
                            FROM public.${table.name} AS tableWhere
                            GROUP BY tableWhere.de_car_validado_sema_gid
                            ${filter.sqlHaving}) ` :
          filter.sqlWhere;

      let sql =
        ` ${sqlSelect}
                    ${sqlFrom}
                    ${filter.secondaryTables}
                    ${sqlWhere}
                    ${sqlGroupBy}
                    ${sqlOrderBy}
                    ${filter.limit}
                    ${filter.offset}`;

      const carResult = await Car.sequelize.query(sql, QUERY_TYPES_SELECT);

      const resultCount = await Car.sequelize.query(
                                              ` SELECT 1
                                                    ${sqlFrom} 
                                                    ${filter.secondaryTables}
                                                    ${sqlWhere} 
                                                    ${sqlGroupBy} `,
                                                  QUERY_TYPES_SELECT);

      carResult.push(resultCount && resultCount.length ? resultCount.length : 0);

      return carResult;

    } catch (e) {
      const msgErr = `In unit car.service, method getAllSimplified:${e}`;
      console.log(msgErr);
      throw new Error(msgErr);
    }
  },
  async getAll() {
    try {
      return await Car.findAll();
    } catch (e) {
      const msgErr = `In unit car.service, method getAll:${e}`;
      console.log(msgErr);
      throw new Error(msgErr);
    }
  },
  async getByCpf(cpfCnpj) {
    try {
      const where = {
        where: {
          cpfcnpj: cpfCnpj
        }
      };

      return await Car.findAll(where);

    } catch (e) {
      const msgErr = `In unit car.service, method getByCpf:${e}`;
      console.log(msgErr);
      throw new Error(msgErr);
    }
  }
};
