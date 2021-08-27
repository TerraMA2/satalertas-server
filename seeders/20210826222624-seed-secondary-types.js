'use strict';

const SQL = `INSERT INTO terrama2.secondary_types (type, label, description)
VALUES
  ('geometry', 'Geometria', 'Geometria do dado'),
  ('name', 'Nome', 'Nome da pessoa'),
  ('federal_car', 'CAR Federal', 'Número do CAR Federal'),
  ('state_car', 'CAR Estadual', 'Número do CAR Estadual'),
  ('date_value', 'Campo de data', 'Data'),
  ('identifier', 'Identificador', 'Identificador único do dado'),
  ('state_name', 'Nome (Estado)', 'Nome do Estado'),
  ('state_geocode', 'Geocodigo (estado)', 'Geocódigo do Estado'),
  ('county_name', 'Nome (comarca)', 'Nome da Comarca'),
  ('county_geocode', 'Geocódigo (comarca)', 'Geocódigo da comarca'),
  ('city_geocode', 'Geocódigo (municipio)', 'Geocódigo do município'),
  ('city_name', 'Nome (município)', 'Nome do Municipio'),
  ('description', 'Descrição', 'Descrição do campo');
`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(SQL)
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query('TRUNCATE terrama2.secondary_types RESTART IDENTITY CASCADE;')
  }
};
