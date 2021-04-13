'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
        CREATE or REPLACE VIEW car_x_vegradam AS
        SELECT c.gid, c.numero_do1, c.numero_do2, v.fisionomia, c.area_ha_,
                 SUM(ST_Area(ST_Intersection(c.geom, v.geom)::geography) / 10000.0) AS area_ha_car_vegradam
        FROM de_car_validado_sema AS c, de_veg_radambr AS v
        WHERE ST_Intersects(c.geom, v.geom)
        GROUP BY v.fisionomia, c.area_ha_, c.gid, c.numero_do1, c.numero_do2
    `);
  },
  down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.query(`DROP VIEW car_x_vegradam`);
  }
};
