'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.sequelize
      .query(
        `
    INSERT INTO terrama2.infocolumn_table_list (table_name, type)
    VALUES ('infocolumn_columns_list', 'column_list')
    RETURNING id;`,
        { raw: true },
      )
      .then((result) => result[0][0]['id'])
      .then(async (id) => {
        return await queryInterface.sequelize.query(`
        INSERT INTO terrama2.infocolumn_columns_list (
          table_id, column_name, primary_type, alias, column_position, hide, disable_editing, description
        )
        VALUES
          (${id}, 'id', 'integer', 'id', 0, true, true, 'Campo de identificação' ),
          (${id}, 'column_name', 'string', 'Nome da Coluna', 1, false, false, 'Nome da Coluna no Banco' ),
          (${id}, 'alias', 'string', 'Apelido', 2, false, false, 'Nome a ser exibido.' ),
          (${id}, 'primary_type', 'string', 'Tipo Primário', 3, false, true, 'Tipo do campo na tabela do banco' ),
          (${id}, 'secondary_type', 'type', 'Tipo Secundário', 4, false, true, 'Tipo auxiliar do campo' ),
          (${id}, 'hide', 'boolean', 'Esconder Campo', 5, false, false, 'Exibe ou não o campo para o usuário' ),
          (${id}, 'disable_editing', 'boolean', 'Bloquear Edição', 6, false, false, 'Desabilita a edição do campo' ),
          (${id}, 'column_position', 'integer', 'Posição da coluna', 7, true, false, 'Posição da coluna na exibição' ),
          (${id}, 'description', 'string', 'Descrição', 8, false, false, 'Descrição do campo' );`);
      });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
