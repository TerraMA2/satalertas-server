const {camelCase} = require('case-anything');
const ViewUtil = require('../utils/view.utils');
const {
    InfocolumnsTableList,
    SecondaryTypes,
    InfocolumnColumnsList,
    sequelize,
} = require('../models');
const {QueryTypes} = sequelize;

module.exports.getAllTables = async () => {
    return await InfocolumnsTableList.findAll({raw: true});
}

module.exports.getSecondaryTypes = async () => {
    return await SecondaryTypes.findAll({raw: true});
}

module.exports.getTableColumns = async (tableId) => {
    const result = {};
    const options = {
        where: {
            tableId,
        },
        attributes: {exclude: ['table_id']},
        order: [['column_position', 'ASC']],
        raw: true
    };
    await InfocolumnColumnsList.findAll(options).then((response) => {
        result.data = response;
    });
    await this.getInfocolumnsByTableName(
        InfocolumnColumnsList.getTableName().tableName,
    ).then((response) => {
        result.columns = response.tableInfocolumns;
    });
    return result;
}

module.exports.getInfocolumnsByTableName = async (tableName) => {
    const options = {
        where: {tableName},
        include: [
            {
                model: InfocolumnColumnsList,
                as: 'tableInfocolumns',
                attributes: {exclude: ['id', 'tableId', 'table_id']},
                order: [['column_position', 'ASC']],
            },
        ],
        attributes: {
            exclude: ['id'],
        },
    };
    const tableData = await InfocolumnsTableList.findAll(options).then(
        (response) => {
            return response.map((data) => data.toJSON());
        },
    );
    tableData.forEach((table) => {
        table.tableInfocolumns.map((columns) => {
            columns.nameCamel = camelCase(columns.columnName);
            return columns;
        })
        table.tableInfocolumns.sort((a, b) => {
            if (a['columnPosition'] < b['columnPosition']) return -1;
            if (a['columnPosition'] > b['columnPosition']) return 1;
            return 0;
        });
    });
    if (Array.isArray(tableName)) {
        return tableData;
    } else {
        return tableData[0];
    }
}

module.exports.updateTableInfoColums = async (editions) => {
    for (const edition of editions) {
        const {id, tableId, columnName, ...mod} = edition;
        const where = {id};
        await InfocolumnColumnsList.update(mod, {where});
    }
    return [];
}

module.exports.getInfocolumnsByViewId = async (viewId) => {
    let sql = `SELECT
    (CASE
      WHEN vw.source_type = 3 THEN concat(TRIM(dsf.value), '_', analysis.id)
      ELSE dsf.value
      END), vw.id AS view_id
      FROM terrama2.views AS vw
      INNER JOIN terrama2.data_sets AS dst ON (vw.data_series_id = dst.data_series_id)
      INNER JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
      LEFT JOIN terrama2.analysis AS analysis ON dsf.data_set_id = analysis.dataset_output
      WHERE vw.id IN (:viewId) AND dsf.key = 'table_name';`;
    const options = {
        type: QueryTypes.SELECT,
        fieldMap: {value: 'tableName', view_id: 'viewId'},
        replacements: {viewId},
    };
    const tableNames = await sequelize.query(sql, options);
    const infocolumn = await this.getInfocolumnsByTableName(tableNames.map(({tableName}) => tableName));
    infocolumn.forEach(element => element['viewId'] = tableNames.find((table) => table.tableName === element.tableName)['viewId']);
    if (Array.isArray(viewId)) {
        return Promise.all(infocolumn);
    } else {
        return infocolumn[0];
    }
}

module.exports.getInfoColumns = async (viewId) => {
    //   const SQL = `SELECT
    //   -- dsf.key,
    //   dsf.value
    // FROM terrama2.views
    // JOIN terrama2.data_sets AS dst ON (views.data_series_id = dst.data_series_id)
    // JOIN terrama2.data_set_formats AS dsf ON (dst.id = dsf.data_set_id)
    // WHERE views.id = $viewId AND (-- dsf.key = 'table_name' OR
    //                                 dsf.key = 'attributes')
    // ORDER BY views.id;`;
    //   let infoColumns = {};
    // if (viewId) {
    //   const result = await models.sequelize.query(SQL, {
    //     bind: { viewId },
    //     type: QueryTypes.SELECT,
    //   });
    //   const dumpResult = JSON.parse(result[0].value);

    //   dumpResult.forEach((element) => {
    //     const { name, alias, visible: show } = element;
    //     infoColumns[name] = {
    //       show,
    //       alias,
    //     };
    //   });
    // } else {
    // console.log('to no info-columns.service View.ID: ', viewId);
    const groupView = await ViewUtil.getGrouped();

    const infoColumns = {
        DETER: groupView.DETER
            ? {
                alerts: {
                    show: true,
                    alias: 'Nº Alertas',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                numero_do2: {
                    show: true,
                    alias: 'CAR Federal',
                },
                numero_do1: {
                    show: true,
                    alias: 'CAR Estadual',
                },
                gid: {
                    show: true,
                    alias: 'Id. CAR',
                },
                rid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                area_ha_sema: {
                    show: false,
                    alias: 'Área do CAR(ha)',
                },
                nome_da_p1: {
                    show: true,
                    alias: 'Propriedade',
                },
                municipio1: {
                    show: true,
                    alias: 'Município',
                },
                situacao_1: {
                    show: false,
                    alias: 'Sit. CAR',
                },
                area_ha_: {
                    show: true,
                    alias: 'Área do CAR(ha)',
                    type: 'decimal',
                },
                nomepropri: {
                    show: true,
                    alias: 'Proprietário(s)',
                },
                cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                    type: 'cpf',
                },
                origem: {
                    show: false,
                    alias: 'origem',
                },

                migracao_i: {
                    show: false,
                    alias: 'migracao_i',
                },
                id_feicao: {
                    show: false,
                    alias: 'id_feicao',
                },
                nomes_prop: {
                    show: false,
                    alias: 'nomes_prop',
                },
                atividade: {
                    show: false,
                    alias: 'atividade',
                },
                apf_numero: {
                    show: false,
                    alias: 'apf_numero',
                },
                numero_art: {
                    show: false,
                    alias: 'numero_art',
                },
                modulos_fi: {
                    show: true,
                    alias: 'Módulos Fiscais',
                },
                cruza_terr: {
                    show: false,
                    alias: 'cruza_terr',
                },
                cruza_area: {
                    show: false,
                    alias: 'cruza_area',
                },
                percentual: {
                    show: false,
                    alias: 'percentual',
                },
                geocodigo: {
                    show: false,
                    alias: 'Cód. IBGE',
                },
                [`${ groupView.DETER.tableOwner }_dd_deter_inpe_classname`]: {
                    show: true,
                    alias: 'Classe',
                },
                [`${ groupView.DETER.tableOwner }_dd_deter_inpe_orbitpoint`]: {
                    show: true,
                    alias: 'Órbita/Ponto',
                },
                [`${ groupView.DETER.tableOwner }_dd_deter_inpe_satellite`]: {
                    show: true,
                    alias: 'Satélite',
                },
                [`${ groupView.DETER.tableOwner }_dd_deter_inpe_sensor`]: {
                    show: true,
                    alias: 'Sensor',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_area_ha_`]: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_cpfcnpj`]: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_municipio1`]: {
                    show: true,
                    alias: 'Município',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_nome_da_p1`]: {
                    show: true,
                    alias: 'Imóvel',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_nomepropri`]: {
                    show: true,
                    alias: 'Proprietário',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_gid`]: {
                    show: false,
                    alias: 'Id. CAR',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_numero_do2`]: {
                    show: true,
                    alias: 'CAR federal',
                },
                [`${ groupView.DETER.tableOwner }_de_car_validado_sema_situacao_1`]: {
                    show: true,
                    alias: 'Situação',
                },
                [`${ groupView.DETER.tableOwner }_id`]: {
                    show: false,
                    alias: `${ groupView.DETER.tableOwner }_id`,
                },
                areamunkm: {
                    show: true,
                    alias: 'Área (km²)',
                },
                areatotalk: {
                    show: false,
                    alias: 'areatotalk',
                },
                areauckm: {
                    show: false,
                    alias: 'areauckm',
                },
                calculated_area_ha: {
                    show: true,
                    alias: 'Área da interseção (ha)',
                },
                classname: {
                    show: true,
                    alias: 'Classe',
                },
                county: {
                    show: true,
                    alias: 'Município',
                },
                date: {
                    show: true,
                    alias: 'Data',
                },
                date_audit: {
                    show: true,
                    alias: 'Data auditoria',
                },
                dd_deter_inpe_classname: {
                    show: true,
                    alias: 'Classe',
                },
                dd_deter_inpe_orbitpoint: {
                    show: true,
                    alias: 'Órbita/Ponto',
                },
                dd_deter_inpe_satellite: {
                    show: true,
                    alias: 'Satélite',
                },
                dd_deter_inpe_sensor: {
                    show: true,
                    alias: 'Sensor',
                },
                de_area_app_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_a_infraca1: {
                    show: false,
                    alias: 'de_area_desembargadas_sema_a_infraca1',
                },
                de_area_desembargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_desembargadas_sema_area_1: {
                    show: true,
                    alias: 'Área (ha)',
                },
                de_area_desembargadas_sema_coord_x: {
                    show: true,
                    alias: 'Longitude',
                },
                de_area_desembargadas_sema_coord_y: {
                    show: true,
                    alias: 'Latitude',
                },
                de_area_desembargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_desembargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_desembargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_desembargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_embargadas_sema_a_infrac: {
                    show: true,
                    alias: 'Auto infração',
                },
                de_area_embargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_embargadas_sema_ano_desma1: {
                    show: true,
                    alias: 'Ano desmatamento',
                },
                de_area_embargadas_sema_coord_x: {
                    show: true,
                    alias: 'Longitude',
                },
                de_area_embargadas_sema_coord_y: {
                    show: true,
                    alias: 'Latitude',
                },
                de_area_embargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_embargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_embargadas_sema_fonte: {
                    show: true,
                    alias: 'Fonte',
                },
                de_area_embargadas_sema_mes: {
                    show: true,
                    alias: 'Mês',
                },
                de_area_embargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_embargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_embargadas_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_area_embargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T Embargo',
                },
                de_area_reserva_legal_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_reserva_legal_nativa_sema_tipologia: {
                    show: true,
                    alias: 'Tipologia',
                },
                de_area_uso_antropizado_solo_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_uso_consolidado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_vegetacao_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_autorizacao_desmate_sema_data_da_a1: {
                    show: true,
                    alias: 'Data DA-A1',
                },
                de_autorizacao_desmate_sema_data_do_v1: {
                    show: true,
                    alias: 'Data DO-V1',
                },
                de_autorizacao_desmate_sema_empreendi1: {
                    show: true,
                    alias: 'Empreedimento',
                },
                de_autorizacao_desmate_sema_modelo: {
                    show: true,
                    alias: 'Modelo',
                },
                de_autorizacao_desmate_sema_rid: {
                    show: false,
                    alias: 'Id.',
                },
                de_autorizacao_desmate_sema_numero_do2: {
                    show: true,
                    alias: 'CAR federal',
                },
                de_autorizacao_desmate_sema_numero_do3: {
                    show: false,
                    alias: 'de_autorizacao_desmate_sema_numero_do3',
                },
                de_autorizacao_queima_sema_data_apro1: {
                    show: true,
                    alias: 'Data aprovação',
                },
                de_autorizacao_queima_sema_data_venc1: {
                    show: true,
                    alias: 'Vencimento',
                },
                de_autorizacao_queima_sema_municipio: {
                    show: true,
                    alias: 'Município',
                },
                de_autorizacao_queima_sema_proprieta1: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_autorizacao_queima_sema_protocolo1: {
                    show: true,
                    alias: 'Protocolo',
                },
                de_autorizacao_queima_sema_razao_soc1: {
                    show: true,
                    alias: 'Razão social',
                },
                de_autorizacao_queima_sema_responsav1: {
                    show: true,
                    alias: 'Responsável',
                },
                de_autorizacao_queima_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_autorizacao_queima_sema_tipo: {
                    show: true,
                    alias: 'Tipo',
                },
                de_autorizacao_queima_sema_titulo_nu1: {
                    show: true,
                    alias: 'Título',
                },
                de_car_validado_sema_area_ha_: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                de_car_validado_sema_cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                de_car_validado_sema_municipio1: {
                    show: true,
                    alias: 'Município',
                },
                de_car_validado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_car_validado_sema_nomepropri: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_car_validado_sema_numero_do2: {
                    show: true,
                    alias: 'CAR federal',
                },
                de_car_validado_sema_situacao_1: {
                    show: true,
                    alias: 'Situação',
                },
                de_terra_indigena_sema_ano_popul1: {
                    show: true,
                    alias: 'Ano população',
                },
                de_terra_indigena_sema_data_inst: {
                    show: true,
                    alias: 'Data inst',
                },
                de_terra_indigena_sema_etnia: {
                    show: true,
                    alias: 'Etnia',
                },
                de_terra_indigena_sema_inst_lega1: {
                    show: true,
                    alias: 'Inst. legal',
                },
                de_terra_indigena_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_terra_indigena_sema_nome_ti_a1: {
                    show: true,
                    alias: 'Nome TI',
                },
                de_terra_indigena_sema_populacao: {
                    show: true,
                    alias: 'População',
                },
                de_terra_indigena_sema_sit_jurid1: {
                    show: true,
                    alias: 'Situação jurídica',
                },
                de_unidade_cons_sema_area_calc1: {
                    show: false,
                    alias: 'de_unidade_cons_sema_area_calc1',
                },
                de_unidade_cons_sema_area_ofic1: {
                    show: true,
                    alias: 'Àrea oficial',
                },
                de_unidade_cons_sema_ato_legal: {
                    show: true,
                    alias: 'Ato legal',
                },
                de_unidade_cons_sema_categoria: {
                    show: true,
                    alias: 'Categoria',
                },
                de_unidade_cons_sema_codigo_uc: {
                    show: false,
                    alias: 'de_unidade_cons_sema_codigo_uc',
                },
                de_unidade_cons_sema_data_cada1: {
                    show: true,
                    alias: 'Data cadastro',
                },
                de_unidade_cons_sema_grupo: {
                    show: true,
                    alias: 'Grupo',
                },
                de_unidade_cons_sema_jurisdica1: {
                    show: true,
                    alias: 'Jurisdição',
                },
                de_unidade_cons_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_unidade_cons_sema_operador: {
                    show: true,
                    alias: 'Operador',
                },
                de_unidade_cons_sema_origem: {
                    show: true,
                    alias: 'Origem',
                },
                de_unidade_cons_sema_plano_man1: {
                    show: true,
                    alias: 'Plano manejo',
                },
                de_unidade_cons_sema_versao: {
                    show: true,
                    alias: 'Versão',
                },
                execution_date: {
                    show: true,
                    alias: 'Data',
                },
                geom: {
                    show: false,
                    alias: 'geom',
                },
                gid: {
                    show: false,
                    alias: 'gid',
                },
                intersect_id: {
                    show: false,
                    alias: 'intersect_id',
                },
                intersection_geom: {
                    show: false,
                    alias: 'intersection_geom',
                },
                lot: {
                    show: false,
                    alias: 'lot',
                },
                monitored_id: {
                    show: false,
                    alias: 'monitored_id',
                },
                orbitpoint: {
                    show: true,
                    alias: 'Órbita/Ponto',
                },
                pid_a_cardeter: {
                    show: false,
                    alias: 'pid_a_cardeter',
                },
                pid_a_cardeter_app: {
                    show: false,
                    alias: 'pid_a_cardeter_app',
                },
                pid_a_cardeter_desemb: {
                    show: false,
                    alias: 'pid_a_cardeter_desemb',
                },
                pid_a_cardeter_desmate: {
                    show: false,
                    alias: 'pid_a_cardeter_desmate',
                },
                pid_a_cardeter_emb: {
                    show: false,
                    alias: 'pid_a_cardeter_emb',
                },
                pid_a_cardeter_queima: {
                    show: false,
                    alias: 'pid_a_cardeter_queima',
                },
                pid_a_cardeter_reserva: {
                    show: false,
                    alias: 'pid_a_cardeter_reserva',
                },
                pid_a_cardeter_ti: {
                    show: false,
                    alias: 'pid_a_cardeter_ti',
                },
                pid_a_cardeter_usoant: {
                    show: false,
                    alias: 'pid_a_cardeter_usoant',
                },
                pid_a_cardeter_veg: {
                    show: false,
                    alias: 'pid_a_cardeter_veg',
                },
                quadrant: {
                    show: false,
                    alias: 'quadrant',
                },
                satellite: {
                    show: true,
                    alias: 'Satélite',
                },
                sensor: {
                    show: true,
                    alias: 'Sensor',
                },
                uc: {
                    show: false,
                    alias: 'uc',
                },
                uf: {
                    show: false,
                    alias: 'uf',
                },
            }
            : '',
        PRODES: groupView.PRODES
            ? {
                alerts: {
                    show: true,
                    alias: 'Quantidade de Alertas',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                numero_do2: {
                    show: true,
                    alias: 'CAR Federal',
                },
                numero_do1: {
                    show: true,
                    alias: 'CAR Estadual',
                },
                gid: {
                    show: true,
                    alias: 'Id. CAR',
                },
                rid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                area_ha_sema: {
                    show: false,
                    alias: 'Área do CAR(ha)',
                },
                nome_da_p1: {
                    show: true,
                    alias: 'Propriedade',
                },
                municipio1: {
                    show: true,
                    alias: 'Município',
                },
                situacao_1: {
                    show: false,
                    alias: 'Sit. CAR',
                },
                area_ha_: {
                    show: true,
                    alias: 'Área do CAR(ha)',
                    type: 'decimal',
                },
                nomepropri: {
                    show: true,
                    alias: 'Proprietário(s)',
                },
                cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                    type: 'cpf',
                },
                origem: {
                    show: false,
                    alias: 'origem',
                },

                migracao_i: {
                    show: false,
                    alias: 'migracao_i',
                },
                id_feicao: {
                    show: false,
                    alias: 'id_feicao',
                },
                nomes_prop: {
                    show: false,
                    alias: 'nomes_prop',
                },
                atividade: {
                    show: false,
                    alias: 'atividade',
                },
                apf_numero: {
                    show: false,
                    alias: 'apf_numero',
                },
                numero_art: {
                    show: false,
                    alias: 'numero_art',
                },
                modulos_fi: {
                    show: true,
                    alias: 'Módulos Fiscais',
                },
                cruza_terr: {
                    show: false,
                    alias: 'cruza_terr',
                },
                cruza_area: {
                    show: false,
                    alias: 'cruza_area',
                },
                percentual: {
                    show: false,
                    alias: 'percentual',
                },
                geocodigo: {
                    show: false,
                    alias: 'Cód. IBGE',
                },
                [`${ groupView.PRODES.tableOwner }_dd_prodes_inpe_class_name`]: {
                    show: true,
                    alias: 'Classe',
                },
                [`${ groupView.PRODES.tableOwner }_dd_prodes_inpe_mainclass`]: {
                    show: true,
                    alias: 'Classe',
                },
                dd_prodes_inpe_ano: {
                    show: false,
                    alias: 'Ano',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_area_ha_`]: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_cpfcnpj`]: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_municipio1`]:
                    {
                        show: true,
                        alias: 'Município',
                    },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_nome_da_p1`]:
                    {
                        show: true,
                        alias: 'Imóvel',
                    },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_nomepropri`]:
                    {
                        show: true,
                        alias: 'Proprietário',
                    },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_gid`]: {
                    show: false,
                    alias: 'Id. Car',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_numero_do1`]:
                    {
                        show: false,
                        alias: 'Id. ',
                    },
                [`de_car_validado_sema_numero_do1`]: {
                    show: false,
                    alias: 'Id.',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_nomes_prop`]:
                    {
                        show: false,
                        alias: 'CPF/Proprietário',
                    },
                [`de_car_validado_sema_nomes_prop`]: {
                    show: false,
                    alias: 'CPF/Proprietário',
                },
                [`de_car_validado_sema_numero_do2`]: {
                    show: true,
                    alias: 'CAR federal',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_numero_do2`]:
                    {
                        show: true,
                        alias: 'CAR federal',
                    },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_situacao_1`]:
                    {
                        show: true,
                        alias: 'Situação',
                    },
                [`${ groupView.PRODES.tableOwner }_id`]: {
                    show: false,
                    alias: `${ groupView.PRODES.tableOwner }_id`,
                },
                ano: {
                    show: true,
                    alias: 'Ano',
                },
                areameters: {
                    show: true,
                    alias: 'Área (m²)',
                },
                calculated_area_ha: {
                    show: true,
                    alias: 'Área da interseção (ha)',
                },
                class_n_01: {
                    show: false,
                    alias: 'class_n_01',
                },
                class_name: {
                    show: false,
                    alias: 'class_name',
                },
                dd_prodes_inpe_class_name: {
                    show: true,
                    alias: 'Classe',
                },
                dd_prodes_inpe_mainclass: {
                    show: true,
                    alias: 'Classe',
                },
                de_area_app_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_a_infraca1: {
                    show: true,
                    alias: 'Auto infração',
                },
                de_area_desembargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_desembargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_desembargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_desembargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_desembargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_embargadas_sema_a_infrac: {
                    show: true,
                    alias: 'Auto infração',
                },
                de_area_embargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_embargadas_sema_ano_desma1: {
                    show: true,
                    alias: 'Ano desmatamento',
                },
                de_area_embargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_embargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_embargadas_sema_fonte: {
                    show: true,
                    alias: 'Fonte',
                },
                de_area_embargadas_sema_mes: {
                    show: true,
                    alias: 'Mês',
                },
                de_area_embargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_embargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_embargadas_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_area_embargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_reserva_legal_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_reserva_legal_nativa_sema_tipologia: {
                    show: true,
                    alias: 'Tipologia',
                },
                de_area_uso_antropizado_solo_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_uso_consolidado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_vegetacao_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_autorizacao_desmate_sema_data_da_a1: {
                    show: true,
                    alias: 'Data DA-A1',
                },
                de_autorizacao_desmate_sema_data_do_v1: {
                    show: true,
                    alias: 'Data DO-V1',
                },
                de_autorizacao_desmate_sema_empreendi1: {
                    show: true,
                    alias: 'Empreedimento',
                },
                de_autorizacao_desmate_sema_modelo: {
                    show: true,
                    alias: 'Modelo',
                },
                de_autorizacao_desmate_sema_rid: {
                    show: true,
                    alias: 'Id.',
                },
                de_autorizacao_desmate_sema_numero_do2: {
                    show: true,
                    alias: 'CAR federal',
                },
                de_autorizacao_desmate_sema_numero_do3: {
                    show: false,
                    alias: 'de_autorizacao_desmate_sema_numero_do3',
                },
                de_autorizacao_queima_sema_data_apro1: {
                    show: true,
                    alias: 'Data aprovação',
                },
                de_autorizacao_queima_sema_data_venc1: {
                    show: true,
                    alias: 'Data vencimento',
                },
                de_autorizacao_queima_sema_municipio: {
                    show: true,
                    alias: 'Município',
                },
                de_autorizacao_queima_sema_proprieta1: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_autorizacao_queima_sema_protocolo1: {
                    show: true,
                    alias: 'Protocolo',
                },
                de_autorizacao_queima_sema_razao_soc1: {
                    show: true,
                    alias: 'Razão social',
                },
                de_autorizacao_queima_sema_responsav1: {
                    show: true,
                    alias: 'Responsável',
                },
                de_autorizacao_queima_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_autorizacao_queima_sema_tipo: {
                    show: true,
                    alias: 'Tipo',
                },
                de_autorizacao_queima_sema_titulo_nu1: {
                    show: true,
                    alias: 'Título',
                },
                de_car_validado_sema_area_ha_: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                de_car_validado_sema_cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                de_car_validado_sema_municipio1: {
                    show: true,
                    alias: 'Município',
                },
                de_car_validado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_car_validado_sema_nomepropri: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'I. CAR',
                },
                de_car_validado_sema_situacao_1: {
                    show: true,
                    alias: 'Situação',
                },
                de_terra_indigena_sema_ano_popul1: {
                    show: true,
                    alias: 'Ano população',
                },
                de_terra_indigena_sema_data_inst: {
                    show: true,
                    alias: 'Data inst.',
                },
                de_terra_indigena_sema_etnia: {
                    show: true,
                    alias: 'Etnia',
                },
                de_terra_indigena_sema_inst_lega1: {
                    show: true,
                    alias: 'Inst. legal',
                },
                de_terra_indigena_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_terra_indigena_sema_nome_ti_a1: {
                    show: true,
                    alias: 'Nome TI',
                },
                de_terra_indigena_sema_populacao: {
                    show: true,
                    alias: 'População',
                },
                de_terra_indigena_sema_sit_jurid1: {
                    show: true,
                    alias: 'Situação jurídica',
                },
                de_unidade_cons_sema_area_calc1: {
                    show: false,
                    alias: 'de_unidade_cons_sema_area_calc1',
                },
                de_unidade_cons_sema_area_ofic1: {
                    show: true,
                    alias: 'Área oficial',
                },
                de_unidade_cons_sema_ato_legal: {
                    show: true,
                    alias: 'Ato legal',
                },
                de_unidade_cons_sema_categoria: {
                    show: true,
                    alias: 'Categoria',
                },
                de_unidade_cons_sema_codigo_uc: {
                    show: false,
                    alias: 'de_unidade_cons_sema_codigo_uc',
                },
                de_unidade_cons_sema_data_cada1: {
                    show: true,
                    alias: 'Data cadastro',
                },
                de_unidade_cons_sema_grupo: {
                    show: true,
                    alias: 'Grupo',
                },
                de_unidade_cons_sema_jurisdica1: {
                    show: true,
                    alias: 'Jurísdição',
                },
                de_unidade_cons_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_unidade_cons_sema_operador: {
                    show: true,
                    alias: 'Operador',
                },
                de_unidade_cons_sema_origem: {
                    show: true,
                    alias: 'Origem',
                },
                de_unidade_cons_sema_plano_man1: {
                    show: true,
                    alias: 'Plano manejo',
                },
                de_unidade_cons_sema_versao: {
                    show: true,
                    alias: 'Versão',
                },
                dsfnv: {
                    show: false,
                    alias: 'dsfnv',
                },
                execution_date: {
                    show: true,
                    alias: 'Data',
                },
                fid: {
                    show: false,
                    alias: 'fid',
                },
                fid_new: {
                    show: false,
                    alias: 'fid_new',
                },
                geom: {
                    show: false,
                    alias: 'geom',
                },
                gid: {
                    show: false,
                    alias: 'gid',
                },
                intersect_id: {
                    show: false,
                    alias: 'intersect_id',
                },
                intersection_geom: {
                    show: false,
                    alias: 'intersection_geom',
                },
                julday: {
                    show: false,
                    alias: 'julday',
                },
                linkcolumn: {
                    show: false,
                    alias: 'linkcolumn',
                },
                mainclass: {
                    show: true,
                    alias: 'Classe',
                },
                monitored_id: {
                    show: false,
                    alias: 'monitored_id',
                },
                pathrow: {
                    show: false,
                    alias: 'pathrow',
                },
                pid_a_carprodes: {
                    show: false,
                    alias: 'pid_a_carprodes',
                },
                pid_a_carprodes_app: {
                    show: false,
                    alias: 'pid_a_carprodes_app',
                },
                pid_a_carprodes_desemb: {
                    show: false,
                    alias: 'pid_a_carprodes_desemb',
                },
                pid_a_carprodes_desmate: {
                    show: false,
                    alias: 'pid_a_carprodes_desmate',
                },
                pid_a_carprodes_emb: {
                    show: false,
                    alias: 'pid_a_carprodes_emb',
                },
                pid_a_carprodes_queima: {
                    show: false,
                    alias: 'pid_a_carprodes_queima',
                },
                pid_a_carprodes_reserva: {
                    show: false,
                    alias: 'pid_a_carprodes_reserva',
                },
                pid_a_carprodes_ti: {
                    show: false,
                    alias: 'pid_a_carprodes_ti',
                },
                pid_a_carprodes_uc: {
                    show: false,
                    alias: 'pid_a_carprodes_uc',
                },
                pid_a_carprodes_usoant: {
                    show: false,
                    alias: 'pid_a_carprodes_usoant',
                },
                pid_a_carprodes_veg: {
                    show: false,
                    alias: 'pid_a_carprodes_veg',
                },
                scene_id: {
                    show: false,
                    alias: 'scene_id',
                },
                uf: {
                    show: false,
                    alias: 'uf',
                },
                view_date: {
                    show: true,
                    alias: 'Data',
                },
                [`${ groupView.PRODES.tableOwner }_de_car_validado_sema_geocodigo`]: {
                    show: false,
                    alias: 'Cod. IBGE',
                },
                [`de_car_validado_sema_geocodigo`]: {
                    show: false,
                    alias: 'Cod. IBGE',
                },
                [`${ groupView.PRODES.tableOwner }_dd_prodes_inpe_pathrow`]: {
                    show: false,
                    alias: 'dd_prodes_inpe_pathrow',
                },
                [`dd_prodes_inpe_pathrow`]: {
                    show: false,
                    alias: 'dd_prodes_inpe_pathrow',
                },
            }
            : '',
        BURNED: groupView.BURNED
            ? {
                alerts: {
                    show: true,
                    alias: 'Focos de fogo ativo',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                numero_do2: {
                    show: true,
                    alias: 'CAR Federal',
                },
                numero_do1: {
                    show: true,
                    alias: 'CAR Estadual',
                },
                gid: {
                    show: true,
                    alias: 'Id. CAR',
                },
                rid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                area_ha_sema: {
                    show: false,
                    alias: 'Área do CAR(ha)',
                },
                nome_da_p1: {
                    show: true,
                    alias: 'Propriedade',
                },
                municipio1: {
                    show: true,
                    alias: 'Município',
                },
                situacao_1: {
                    show: false,
                    alias: 'Sit. CAR',
                },
                area_ha_: {
                    show: true,
                    alias: 'Área do CAR(ha)',
                    type: 'decimal',
                },
                nomepropri: {
                    show: true,
                    alias: 'Proprietário(s)',
                },
                cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                    type: 'cpf',
                },
                origem: {
                    show: false,
                    alias: 'origem',
                },

                migracao_i: {
                    show: false,
                    alias: 'migracao_i',
                },
                id_feicao: {
                    show: false,
                    alias: 'id_feicao',
                },
                nomes_prop: {
                    show: false,
                    alias: 'nomes_prop',
                },
                atividade: {
                    show: false,
                    alias: 'atividade',
                },
                apf_numero: {
                    show: false,
                    alias: 'apf_numero',
                },
                numero_art: {
                    show: false,
                    alias: 'numero_art',
                },
                modulos_fi: {
                    show: true,
                    alias: 'Módulos Fiscais',
                },
                cruza_terr: {
                    show: false,
                    alias: 'cruza_terr',
                },
                cruza_area: {
                    show: false,
                    alias: 'cruza_area',
                },
                percentual: {
                    show: false,
                    alias: 'percentual',
                },
                geocodigo: {
                    show: false,
                    alias: 'Cód. IBGE',
                },
                [`${ groupView.BURNED.tableOwner }_dd_focos_inpe_bioma`]: {
                    show: true,
                    alias: 'Bioma',
                },
                [`${ groupView.BURNED.tableOwner }_dd_focos_inpe_id_2`]: {
                    show: false,
                    alias: `${ groupView.BURNED.tableOwner }_dd_focos_inpe_id_2`,
                },
                [`${ groupView.BURNED.tableOwner }_dd_focos_inpe_municipio`]: {
                    show: true,
                    alias: 'Município',
                },
                [`${ groupView.BURNED.tableOwner }_dd_focos_inpe_satelite`]: {
                    show: true,
                    alias: 'Satélite',
                },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_area_ha_`]: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_cpfcnpj`]: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_municipio1`]:
                    {
                        show: true,
                        alias: 'Município',
                    },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_nome_da_p1`]:
                    {
                        show: true,
                        alias: 'Imóvel',
                    },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_nomepropri`]:
                    {
                        show: true,
                        alias: 'Proprietário',
                    },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_gid`]: {
                    show: true,
                    alias: 'Id. CAR',
                },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_numero_do2`]:
                    {
                        show: true,
                        alias: 'CAR federal',
                    },
                [`${ groupView.BURNED.tableOwner }_de_car_validado_sema_situacao_1`]:
                    {
                        show: true,
                        alias: 'Situação',
                    },
                [`${ groupView.BURNED.tableOwner }_id`]: {
                    show: false,
                    alias: `${ groupView.BURNED.tableOwner }_id`,
                },
                bioma: {
                    show: true,
                    alias: 'Bioma',
                },
                bioma_id: {
                    show: false,
                    alias: 'bioma_id',
                },
                calculated_area_ha: {
                    show: true,
                    alias: 'Área da interseção (ha)',
                },
                data_hora_gmt: {
                    show: true,
                    alias: 'Data',
                },
                dd_focos_inpe_bioma: {
                    show: true,
                    alias: 'Bioma',
                },
                dd_focos_inpe_id_2: {
                    show: false,
                    alias: 'dd_focos_inpe_id_2',
                },
                dd_focos_inpe_municipio: {
                    show: true,
                    alias: 'Município',
                },
                dd_focos_inpe_satelite: {
                    show: true,
                    alias: 'Satélite',
                },
                de_area_app_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_a_infraca1: {
                    show: true,
                    alias: 'Auto infração',
                },
                de_area_desembargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_desembargadas_sema_area_1: {
                    show: false,
                    alias: 'de_area_desembargadas_sema_area_1',
                },
                de_area_desembargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_desembargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_desembargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_desembargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_embargadas_sema_a_infrac: {
                    show: true,
                    alias: 'Auto infração',
                },
                de_area_embargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_embargadas_sema_ano_desma1: {
                    show: true,
                    alias: 'Ano desmatamento',
                },
                de_area_embargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_embargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_embargadas_sema_fonte: {
                    show: true,
                    alias: 'Fonte',
                },
                de_area_embargadas_sema_mes: {
                    show: true,
                    alias: 'Mês',
                },
                de_area_embargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_embargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_embargadas_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_area_embargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_reserva_legal_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_uso_antropizado_solo_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_uso_consolidado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_autorizacao_desmate_sema_data_da_a1: {
                    show: true,
                    alias: 'Data DA-A1',
                },
                de_autorizacao_desmate_sema_data_do_v1: {
                    show: true,
                    alias: 'Data DA-V1',
                },
                de_autorizacao_desmate_sema_empreendi1: {
                    show: true,
                    alias: 'Empreendimento',
                },
                de_autorizacao_desmate_sema_modelo: {
                    show: true,
                    alias: 'Modelo',
                },
                de_autorizacao_desmate_sema_rid: {
                    show: false,
                    alias: 'Id.',
                },
                de_autorizacao_desmate_sema_numero_do2: {
                    show: true,
                    alias: 'CAR federal',
                },
                de_autorizacao_desmate_sema_numero_do3: {
                    show: false,
                    alias: 'de_autorizacao_desmate_sema_numero_do3',
                },
                de_autorizacao_queima_sema_data_apro1: {
                    show: true,
                    alias: 'Data aprovação',
                },
                de_autorizacao_queima_sema_data_venc1: {
                    show: true,
                    alias: 'Data vencimento',
                },
                de_autorizacao_queima_sema_municipio: {
                    show: true,
                    alias: 'Município',
                },
                de_autorizacao_queima_sema_proprieta1: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_autorizacao_queima_sema_protocolo1: {
                    show: true,
                    alias: 'Protocolo',
                },
                de_autorizacao_queima_sema_razao_soc1: {
                    show: true,
                    alias: 'Razão social',
                },
                de_autorizacao_queima_sema_responsav1: {
                    show: true,
                    alias: 'Responsável',
                },
                de_autorizacao_queima_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_autorizacao_queima_sema_tipo: {
                    show: true,
                    alias: 'Tipo',
                },
                de_autorizacao_queima_sema_titulo_nu1: {
                    show: true,
                    alias: 'Título',
                },
                de_car_validado_sema_area_ha_: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                de_car_validado_sema_cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                de_car_validado_sema_municipio1: {
                    show: true,
                    alias: 'Município',
                },
                de_car_validado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_car_validado_sema_nomepropri: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Id.',
                },
                de_car_validado_sema_numero_do2: {
                    show: true,
                    alias: 'CAR federal',
                },
                de_car_validado_sema_situacao_1: {
                    show: true,
                    alias: 'Situação',
                },
                de_terra_indigena_sema_ano_popul1: {
                    show: true,
                    alias: 'Ano população',
                },
                de_terra_indigena_sema_area_ha: {
                    show: true,
                    alias: 'Área (ha)',
                },
                de_terra_indigena_sema_data_inst: {
                    show: true,
                    alias: 'Data inst.',
                },
                de_terra_indigena_sema_etnia: {
                    show: true,
                    alias: 'Etnia',
                },
                de_terra_indigena_sema_inst_lega1: {
                    show: true,
                    alias: 'Inst. legal',
                },
                de_terra_indigena_sema_municipio: {
                    show: true,
                    alias: 'Município',
                },
                de_terra_indigena_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_terra_indigena_sema_nome_ti_a1: {
                    show: true,
                    alias: 'Nome TI',
                },
                de_terra_indigena_sema_populacao: {
                    show: true,
                    alias: 'População',
                },
                de_terra_indigena_sema_sit_jurid1: {
                    show: true,
                    alias: 'Situação jurídica',
                },
                de_unidade_cons_sema_area_calc1: {
                    show: false,
                    alias: 'de_unidade_cons_sema_area_calc1',
                },
                de_unidade_cons_sema_area_ofic1: {
                    show: true,
                    alias: 'Oficial',
                },
                de_unidade_cons_sema_ato_legal: {
                    show: true,
                    alias: 'Ato legal',
                },
                de_unidade_cons_sema_categoria: {
                    show: true,
                    alias: 'Categoria',
                },
                de_unidade_cons_sema_codigo_uc: {
                    show: false,
                    alias: 'de_unidade_cons_sema_codigo_uc',
                },
                de_unidade_cons_sema_data_cada1: {
                    show: true,
                    alias: 'Data cadastro',
                },
                de_unidade_cons_sema_grupo: {
                    show: true,
                    alias: 'Grupo',
                },
                de_unidade_cons_sema_jurisdica1: {
                    show: true,
                    alias: 'Jurísdição',
                },
                de_unidade_cons_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_unidade_cons_sema_operador: {
                    show: true,
                    alias: 'Operador',
                },
                de_unidade_cons_sema_origem: {
                    show: true,
                    alias: 'Origem',
                },
                de_unidade_cons_sema_plano_man1: {
                    show: true,
                    alias: 'Plano manejo',
                },
                de_unidade_cons_sema_versao: {
                    show: true,
                    alias: 'Versão',
                },
                estado: {
                    show: true,
                    alias: 'Estado',
                },
                execution_date: {
                    show: true,
                    alias: 'Data',
                },
                foco_id: {
                    show: false,
                    alias: 'foco_id',
                },
                geometria: {
                    show: false,
                    alias: 'geometria',
                },
                id_0: {
                    show: false,
                    alias: 'id_0',
                },
                id_1: {
                    show: false,
                    alias: 'id_1',
                },
                id_2: {
                    show: false,
                    alias: 'id_2',
                },
                intersect_id: {
                    show: false,
                    alias: 'intersect_id',
                },
                intersection_geom: {
                    show: false,
                    alias: 'intersection_geom',
                },
                latitude: {
                    show: true,
                    alias: 'Latitude',
                },
                longitude: {
                    show: false,
                    alias: 'Longitude',
                },
                monitored_id: {
                    show: false,
                    alias: 'monitored_id',
                },
                municipio: {
                    show: true,
                    alias: 'Município',
                },
                pais: {
                    show: true,
                    alias: 'País',
                },
                path_row: {
                    show: false,
                    alias: 'path_row',
                },
                pid_a_carfocos: {
                    show: false,
                    alias: 'pid_a_carfocos',
                },
                pid_a_carfocos_app: {
                    show: false,
                    alias: 'pid_a_carfocos_app',
                },
                pid_a_carfocos_desemb: {
                    show: false,
                    alias: 'pid_a_carfocos_desemb',
                },
                pid_a_carfocos_desmate: {
                    show: false,
                    alias: 'pid_a_carfocos_desmate',
                },
                pid_a_carfocos_emb: {
                    show: false,
                    alias: 'pid_a_carfocos_emb',
                },
                pid_a_carfocos_queima: {
                    show: false,
                    alias: 'pid_a_carfocos_queima',
                },
                pid_a_carfocos_reserva: {
                    show: false,
                    alias: 'pid_a_carfocos_reserva',
                },
                pid_a_carfocos_ti: {
                    show: false,
                    alias: 'pid_a_carfocos_ti',
                },
                pid_a_carfocos_uc: {
                    show: false,
                    alias: 'pid_a_carfocos_uc',
                },
                pid_a_carfocos_usoant: {
                    show: false,
                    alias: 'pid_a_carfocos_usoant',
                },
                pid_a_carfocos_veg: {
                    show: false,
                    alias: 'pid_a_carfocos_veg',
                },
                pid_dd_focos_inpe: {
                    show: false,
                    alias: 'pid_dd_focos_inpe',
                },
                pid_focos_mt: {
                    show: false,
                    alias: 'pid_focos_mt',
                },
                satelite: {
                    show: true,
                    alias: 'Satélite',
                },
            }
            : '',
        BURNED_AREA: groupView.BURNED_AREA
            ? {
                alerts: {
                    show: true,
                    alias: 'Focos de fogo ativo',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                numero_do2: {
                    show: true,
                    alias: 'CAR Federal',
                },
                numero_do1: {
                    show: true,
                    alias: 'CAR Estadual',
                },
                gid: {
                    show: true,
                    alias: 'Id. CAR',
                },
                rid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                area_ha_sema: {
                    show: false,
                    alias: 'Área do CAR(ha)',
                },
                nome_da_p1: {
                    show: true,
                    alias: 'Propriedade',
                },
                municipio1: {
                    show: true,
                    alias: 'Município',
                },
                situacao_1: {
                    show: false,
                    alias: 'Sit. CAR',
                },
                area_ha_: {
                    show: true,
                    alias: 'Área do CAR(ha)',
                    type: 'decimal',
                },
                nomepropri: {
                    show: true,
                    alias: 'Proprietário(s)',
                },
                cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                    type: 'cpf',
                },
                origem: {
                    show: false,
                    alias: 'origem',
                },

                migracao_i: {
                    show: false,
                    alias: 'migracao_i',
                },
                id_feicao: {
                    show: false,
                    alias: 'id_feicao',
                },
                nomes_prop: {
                    show: false,
                    alias: 'nomes_prop',
                },
                atividade: {
                    show: false,
                    alias: 'atividade',
                },
                apf_numero: {
                    show: false,
                    alias: 'apf_numero',
                },
                numero_art: {
                    show: false,
                    alias: 'numero_art',
                },
                modulos_fi: {
                    show: true,
                    alias: 'Módulos Fiscais',
                },
                cruza_terr: {
                    show: false,
                    alias: 'cruza_terr',
                },
                cruza_area: {
                    show: false,
                    alias: 'cruza_area',
                },
                percentual: {
                    show: false,
                    alias: 'percentual',
                },
                geocodigo: {
                    show: false,
                    alias: 'Cód. IBGE',
                },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_data_anter`]:
                    {
                        show: false,
                        alias: [
                            `${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_data_anter`,
                        ],
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_timestamp`]:
                    {
                        show: false,
                        alias: `${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_timestamp`,
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_ha`]: {
                    show: false,
                    alias: `${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_ha`,
                },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_id_cena_an`]:
                    {
                        show: false,
                        alias: [
                            `${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_id_cena_an`,
                        ],
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_km2`]: {
                    show: false,
                    alias: [
                        `${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_km2`,
                    ],
                },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_nome_arq`]:
                    {
                        show: false,
                        alias: [
                            `${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_nome_arq`,
                        ],
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_dd_area_queimada_inpe_orb_pto`]:
                    {
                        show: true,
                        alias: 'Órbita/Ponto',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_area_ha_`]:
                    {
                        show: true,
                        alias: 'Área do imóvel (ha)',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_cpfcnpj`]:
                    {
                        show: true,
                        alias: 'CPF/CNPJ',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_municipio1`]:
                    {
                        show: true,
                        alias: 'Município',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_nome_da_p1`]:
                    {
                        show: true,
                        alias: 'Imóvel',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_nomepropri`]:
                    {
                        show: true,
                        alias: 'Proprietário',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_gid`]: {
                    show: true,
                    alias: 'Id. CAR',
                },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_numero_do2`]:
                    {
                        show: true,
                        alias: 'CAR federal',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_de_car_validado_sema_situacao_1`]:
                    {
                        show: true,
                        alias: 'Situação',
                    },
                [`${ groupView.BURNED_AREA.tableOwner }_id`]: {
                    show: false,
                    alias: `${ groupView.BURNED_AREA.tableOwner }_id`,
                },
                calculated_area_ha: {
                    show: true,
                    alias: 'Área da interseção (ha)',
                },
                active_fire_spots: {
                    show: true,
                    alias: 'Número de focos de fogo ativo',
                },
                dd_area_queimada_inpe_data_anter: {
                    show: false,
                    alias: 'dd_area_queimada_inpe_data_anter',
                },
                dd_area_queimada_inpe_timestamp: {
                    show: false,
                    alias: 'dd_area_queimada_inpe_timestamp',
                },
                dd_area_queimada_inpe_ha: {
                    show: false,
                    alias: 'dd_area_queimada_inpe_ha',
                },
                dd_area_queimada_inpe_id_cena_an: {
                    show: false,
                    alias: 'dd_area_queimada_inpe_id_cena_an',
                },
                dd_area_queimada_inpe_km2: {
                    show: false,
                    alias: 'dd_area_queimada_inpe_km2',
                },
                dd_area_queimada_inpe_nome_arq: {
                    show: false,
                    alias: 'dd_area_queimada_inpe_nome_arq',
                },
                dd_area_queimada_inpe_orb_pto: {
                    show: true,
                    alias: 'Órbita/Ponto',
                },
                de_area_app_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_a_infraca1: {
                    show: false,
                    alias: 'de_area_desembargadas_sema_a_infraca1',
                },
                de_area_desembargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_desembargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_desembargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_desembargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_desembargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_desembargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_embargadas_sema_a_infrac: {
                    show: true,
                    alias: 'Auto infração',
                },
                de_area_embargadas_sema_ano: {
                    show: true,
                    alias: 'Ano',
                },
                de_area_embargadas_sema_ano_desma1: {
                    show: true,
                    alias: 'Ano desmatamento',
                },
                de_area_embargadas_sema_cpf: {
                    show: true,
                    alias: 'CPF',
                },
                de_area_embargadas_sema_dano: {
                    show: true,
                    alias: 'Dano',
                },
                de_area_embargadas_sema_fonte: {
                    show: true,
                    alias: 'FOnte',
                },
                de_area_embargadas_sema_mes: {
                    show: true,
                    alias: 'Mês',
                },
                de_area_embargadas_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_area_embargadas_sema_proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_embargadas_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_area_embargadas_sema_t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                de_area_reserva_legal_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_reserva_legal_nativa_sema_tipologia: {
                    show: true,
                    alias: 'Tipologia',
                },
                de_area_uso_antropizado_solo_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_uso_consolidado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_area_vegetacao_nativa_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_autorizacao_desmate_sema_data_da_a1: {
                    show: true,
                    alias: 'Data DA-A1',
                },
                de_autorizacao_desmate_sema_data_do_v1: {
                    show: true,
                    alias: 'Data DO-V1',
                },
                de_autorizacao_desmate_sema_empreendi1: {
                    show: true,
                    alias: 'Empreendimento',
                },
                de_autorizacao_desmate_sema_modelo: {
                    show: true,
                    alias: 'Modelo',
                },
                de_autorizacao_desmate_sema_rid: {
                    show: true,
                    alias: 'Id.',
                },
                de_autorizacao_desmate_sema_numero_do2: {
                    show: true,
                    alias: 'CAR federal',
                },
                de_autorizacao_desmate_sema_numero_do3: {
                    show: false,
                    alias: 'de_autorizacao_desmate_sema_numero_do3',
                },
                de_autorizacao_queima_sema_data_apro1: {
                    show: true,
                    alias: 'Data aprovação',
                },
                de_autorizacao_queima_sema_data_venc1: {
                    show: true,
                    alias: 'Data vencimento',
                },
                de_autorizacao_queima_sema_municipio: {
                    show: true,
                    alias: 'Município',
                },
                de_autorizacao_queima_sema_proprieta1: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_autorizacao_queima_sema_protocolo1: {
                    show: true,
                    alias: 'Protocolo',
                },
                de_autorizacao_queima_sema_razao_soc1: {
                    show: true,
                    alias: 'Razão social',
                },
                de_autorizacao_queima_sema_responsav1: {
                    show: true,
                    alias: 'Responsável',
                },
                de_autorizacao_queima_sema_situacao: {
                    show: true,
                    alias: 'Situação',
                },
                de_autorizacao_queima_sema_tipo: {
                    show: true,
                    alias: 'Tipo',
                },
                de_autorizacao_queima_sema_titulo_nu1: {
                    show: true,
                    alias: 'Título',
                },
                de_car_validado_sema_area_ha_: {
                    show: true,
                    alias: 'Área do imóvel (ha)',
                },
                de_car_validado_sema_cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                },
                de_car_validado_sema_municipio1: {
                    show: true,
                    alias: 'Município',
                },
                de_car_validado_sema_nome_da_p1: {
                    show: true,
                    alias: 'Imóvel',
                },
                de_car_validado_sema_nomepropri: {
                    show: true,
                    alias: 'Proprietário',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Sequencial do CAR',
                },
                numero_do2: {
                    show: true,
                    alias: 'CAR Federal',
                },
                numero_do1: {
                    show: true,
                    alias: 'CAR Estadual',
                },
                de_car_validado_sema_situacao_1: {
                    show: true,
                    alias: 'Situação',
                },
                de_terra_indigena_sema_ano_popul1: {
                    show: true,
                    alias: 'Ano população',
                },
                de_terra_indigena_sema_area_ha: {
                    show: true,
                    alias: 'Área (ha)',
                },
                de_terra_indigena_sema_data_inst: {
                    show: true,
                    alias: 'Data inst.',
                },
                de_terra_indigena_sema_etnia: {
                    show: true,
                    alias: 'Etnia',
                },
                de_terra_indigena_sema_inst_lega1: {
                    show: true,
                    alias: 'Inst. legal',
                },
                de_terra_indigena_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_terra_indigena_sema_nome_ti_a1: {
                    show: true,
                    alias: 'Nome TI',
                },
                de_terra_indigena_sema_populacao: {
                    show: true,
                    alias: 'População',
                },
                de_terra_indigena_sema_sit_jurid1: {
                    show: true,
                    alias: 'Situação jurídica',
                },
                de_unidade_cons_sema_area_calc1: {
                    show: false,
                    alias: 'de_unidade_cons_sema_area_calc1',
                },
                de_unidade_cons_sema_area_ofic1: {
                    show: false,
                    alias: 'de_unidade_cons_sema_area_ofic1',
                },
                de_unidade_cons_sema_ato_legal: {
                    show: true,
                    alias: 'Ato legal',
                },
                de_unidade_cons_sema_categoria: {
                    show: true,
                    alias: 'Categoria',
                },
                de_unidade_cons_sema_codigo_uc: {
                    show: false,
                    alias: 'de_unidade_cons_sema_codigo_uc',
                },
                de_unidade_cons_sema_data_cada1: {
                    show: true,
                    alias: 'Data cadastro',
                },
                de_unidade_cons_sema_grupo: {
                    show: true,
                    alias: 'Grupo',
                },
                de_unidade_cons_sema_jurisdica1: {
                    show: true,
                    alias: 'Jurísdição',
                },
                de_unidade_cons_sema_nome: {
                    show: true,
                    alias: 'Nome',
                },
                de_unidade_cons_sema_operador: {
                    show: true,
                    alias: 'Operador',
                },
                de_unidade_cons_sema_origem: {
                    show: true,
                    alias: 'Origem',
                },
                de_unidade_cons_sema_plano_man1: {
                    show: true,
                    alias: 'Plano manejo',
                },
                de_unidade_cons_sema_versao: {
                    show: true,
                    alias: 'Versão',
                },
                execution_date: {
                    show: true,
                    alias: 'Data',
                },
                intersect_id: {
                    show: false,
                    alias: 'intersect_id',
                },
                intersection_geom: {
                    show: false,
                    alias: 'intersection_geom',
                },
                monitored_id: {
                    show: false,
                    alias: 'monitored_id',
                },
                pid_a_caraq: {
                    show: false,
                    alias: 'pid_a_caraq',
                },
                pid_a_caraq_app: {
                    show: false,
                    alias: 'pid_a_caraq_app',
                },
                pid_a_caraq_desmate: {
                    show: false,
                    alias: 'pid_a_caraq_desmate',
                },
                pid_a_caraq_emb: {
                    show: false,
                    alias: 'pid_a_caraq_emb',
                },
                pid_a_caraq_queima: {
                    show: false,
                    alias: 'pid_a_caraq_queima',
                },
                pid_a_caraq_reserva: {
                    show: false,
                    alias: 'pid_a_caraq_reserva',
                },
                pid_a_caraq_ti: {
                    show: false,
                    alias: 'pid_a_caraq_ti',
                },
                pid_a_caraq_uc: {
                    show: false,
                    alias: 'pid_a_caraq_uc',
                },
                pid_a_caraq_usoant: {
                    show: false,
                    alias: 'pid_a_caraq_usoant',
                },
                pid_a_caraq_veg: {
                    show: false,
                    alias: 'pid_a_caraq_veg',
                },
            }
            : '',
        STATIC: groupView.STATIC
            ? {
                alerts: {
                    show: true,
                    alias: 'Focos de fogo ativo',
                },
                de_car_validado_sema_gid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                numero_do2: {
                    show: true,
                    alias: 'CAR Federal',
                },
                numero_do1: {
                    show: true,
                    alias: 'CAR Estadual',
                },
                gid: {
                    show: true,
                    alias: 'Id. CAR',
                },
                rid: {
                    show: false,
                    alias: 'Id. CAR',
                },
                area_ha_sema: {
                    show: false,
                    alias: 'Área do CAR(ha)',
                },
                nome_da_p1: {
                    show: true,
                    alias: 'Propriedade',
                },
                municipio1: {
                    show: true,
                    alias: 'Município',
                },
                situacao_1: {
                    show: false,
                    alias: 'Sit. CAR',
                },
                area_ha_: {
                    show: true,
                    alias: 'Área do CAR(ha)',
                    type: 'decimal',
                },
                nomepropri: {
                    show: true,
                    alias: 'Proprietário(s)',
                },
                cpfcnpj: {
                    show: true,
                    alias: 'CPF/CNPJ',
                    type: 'cpf',
                },
                origem: {
                    show: false,
                    alias: 'origem',
                },

                migracao_i: {
                    show: false,
                    alias: 'migracao_i',
                },
                id_feicao: {
                    show: false,
                    alias: 'id_feicao',
                },
                nomes_prop: {
                    show: false,
                    alias: 'nomes_prop',
                },
                atividade: {
                    show: false,
                    alias: 'atividade',
                },
                apf_numero: {
                    show: false,
                    alias: 'apf_numero',
                },
                numero_art: {
                    show: false,
                    alias: 'numero_art',
                },
                modulos_fi: {
                    show: true,
                    alias: 'Módulos Fiscais',
                },
                cruza_terr: {
                    show: false,
                    alias: 'cruza_terr',
                },
                cruza_area: {
                    show: false,
                    alias: 'cruza_area',
                },
                percentual: {
                    show: false,
                    alias: 'percentual',
                },
                geocodigo: {
                    show: false,
                    alias: 'Cód. IBGE',
                },
                a_infrac: {
                    show: false,
                    alias: 'a_infrac',
                },
                a_infraca1: {
                    show: false,
                    alias: 'a_infraca1',
                },
                ano: {
                    show: true,
                    alias: 'Ano',
                },
                ano_desma1: {
                    show: true,
                    alias: 'Ano desmatamento',
                },
                ano_popul1: {
                    show: true,
                    alias: 'Ano população',
                },
                area_1: {
                    show: false,
                    alias: 'area_1',
                },
                area_calc1: {
                    show: false,
                    alias: 'area_calc1',
                },
                area_ha: {
                    show: true,
                    alias: 'Área (ha)',
                },
                area_km2: {
                    show: true,
                    alias: 'Área (km²)',
                },
                area__m2_: {
                    show: true,
                    alias: 'Área (m²)',
                },
                area_ofic1: {
                    show: false,
                    alias: 'area_ofic1',
                },
                ato_legal: {
                    show: true,
                    alias: 'Ato legal',
                },
                bioma: {
                    show: true,
                    alias: 'Bioma',
                },
                categoria: {
                    show: true,
                    alias: 'Categoria',
                },
                cd_bioma: {
                    show: true,
                    alias: 'Bioma',
                },
                cd_geocme: {
                    show: false,
                    alias: 'cd_geocme',
                },
                cd_geocmi: {
                    show: false,
                    alias: 'cd_geocmi',
                },
                cd_geocuf: {
                    show: false,
                    alias: 'cd_geocuf',
                },
                codigo: {
                    show: false,
                    alias: 'codigo',
                },
                codigotipo: {
                    show: false,
                    alias: 'codigotipo',
                },
                codigo_uc: {
                    show: false,
                    alias: 'codigo_uc',
                },
                comarca: {
                    show: true,
                    alias: 'Comarca',
                },
                contato: {
                    show: true,
                    alias: 'Contato',
                },
                coord_x: {
                    show: true,
                    alias: 'Longitude',
                },
                coord_y: {
                    show: true,
                    alias: 'Latitude',
                },
                dano: {
                    show: true,
                    alias: 'Dano',
                },
                data_apro1: {
                    show: true,
                    alias: 'Data aprovação',
                },
                data_cada1: {
                    show: true,
                    alias: 'Data cadastro',
                },
                data_da_a1: {
                    show: true,
                    alias: 'Data DA-A1',
                },
                data_de_a1: {
                    show: true,
                    alias: 'Data DA-A1',
                },
                data_de_e1: {
                    show: true,
                    alias: 'Data DE-E1',
                },
                data_do_v1: {
                    show: true,
                    alias: 'Data DO-V1',
                },
                data_inst: {
                    show: true,
                    alias: 'Data inst.',
                },
                data_venc1: {
                    show: true,
                    alias: 'Data vencimento',
                },
                desc_coinc: {
                    show: false,
                    alias: 'desc_coinc',
                },
                ds_ato_leg: {
                    show: true,
                    alias: 'Ato legal',
                },
                ds_coinc: {
                    show: false,
                    alias: 'ds_coinc',
                },
                ds_jurisdi: {
                    show: true,
                    alias: 'Jurisdição',
                },
                ds_legenda: {
                    show: false,
                    alias: 'ds_legenda',
                },
                ds_local_f: {
                    show: false,
                    alias: 'ds_local_f',
                },
                ds_local_i: {
                    show: false,
                    alias: 'ds_local_i',
                },
                ds_obra: {
                    show: false,
                    alias: 'ds_obra',
                },
                ds_superfi: {
                    show: false,
                    alias: 'ds_superfi',
                },
                ds_sup_fed: {
                    show: false,
                    alias: 'ds_sup_fed',
                },
                ds_tipo_ad: {
                    show: false,
                    alias: 'ds_tipo_ad',
                },
                empreendi1: {
                    show: false,
                    alias: 'empreendi1',
                },
                entrancia: {
                    show: true,
                    alias: 'Entrancia',
                },
                est_coinc: {
                    show: false,
                    alias: 'est_coinc',
                },
                etnia: {
                    show: true,
                    alias: 'Etnia',
                },
                fid_promot: {
                    show: false,
                    alias: 'fid_promot',
                },
                fonte: {
                    show: true,
                    alias: 'Fonte',
                },
                geom: {
                    show: false,
                    alias: 'geom',
                },
                grupo: {
                    show: true,
                    alias: 'Grupo',
                },
                id: {
                    show: false,
                    alias: 'id',
                },
                idcar: {
                    show: false,
                    alias: 'idcar',
                },
                id_trecho_: {
                    show: false,
                    alias: 'id_trecho_',
                },
                id_versao: {
                    show: false,
                    alias: 'id_versao',
                },
                inst_lega1: {
                    show: true,
                    alias: 'Inst. legal',
                },
                jurisdica1: {
                    show: true,
                    alias: 'Jurisdição',
                },
                km: {
                    show: false,
                    alias: 'km',
                },
                lat: {
                    show: false,
                    alias: 'lat',
                },
                leg_multim: {
                    show: false,
                    alias: 'leg_multim',
                },
                licenciam1: {
                    show: false,
                    alias: 'licenciam1',
                },
                lon: {
                    show: false,
                    alias: 'lon',
                },
                marcador: {
                    show: false,
                    alias: 'marcador',
                },
                mes: {
                    show: true,
                    alias: 'Mês',
                },
                modelo: {
                    show: true,
                    alias: 'Modelo',
                },
                modulo_fi1: {
                    show: false,
                    alias: 'modulo_fi1',
                },
                municipio: {
                    show: true,
                    alias: 'Município',
                },
                nm_estado: {
                    show: true,
                    alias: 'Estado',
                },
                nm_meso: {
                    show: true,
                    alias: 'Mesoregião',
                },
                nm_micro: {
                    show: true,
                    alias: 'Microregião',
                },
                nm_regiao: {
                    show: true,
                    alias: 'Região',
                },
                nm_tipo_tr: {
                    show: false,
                    alias: 'nm_tipo_tr',
                },
                nome: {
                    show: true,
                    alias: 'Nome',
                },
                nome_ti_a1: {
                    show: true,
                    alias: 'Nome TI',
                },
                numero_do3: {
                    show: false,
                    alias: 'numero_do3',
                },
                objectid: {
                    show: false,
                    alias: 'objectid',
                },
                operador: {
                    show: true,
                    alias: 'Operador',
                },
                orbita: {
                    show: true,
                    alias: 'Órbita',
                },
                path_row: {
                    show: false,
                    alias: 'path_row',
                },
                pdf_docum1: {
                    show: false,
                    alias: 'pdf_docum1',
                },
                pjbh: {
                    show: false,
                    alias: 'pjbh',
                },
                plano_man1: {
                    show: false,
                    alias: 'plano_man1',
                },
                ponto: {
                    show: true,
                    alias: 'Ponto',
                },
                populacao: {
                    show: true,
                    alias: 'População',
                },
                promotoria: {
                    show: true,
                    alias: 'Promotoria',
                },
                proprieda1: {
                    show: true,
                    alias: 'Imóvel',
                },
                proprieta1: {
                    show: true,
                    alias: 'Proprietário',
                },
                protocolo1: {
                    show: true,
                    alias: 'Protocolo',
                },
                ps1_ar_ha: {
                    show: false,
                    alias: 'ps1_ar_ha',
                },
                ps1_ar_km2: {
                    show: false,
                    alias: 'ps1_ar_km2',
                },
                ps1_cd: {
                    show: false,
                    alias: 'ps1_cd',
                },
                ps1_gm_are: {
                    show: false,
                    alias: 'ps1_gm_are',
                },
                ps1_gm_per: {
                    show: false,
                    alias: 'ps1_gm_per',
                },
                ps1_gm_pol: {
                    show: false,
                    alias: 'ps1_gm_pol',
                },
                ps1_nm: {
                    show: true,
                    alias: 'Nome',
                },
                ps1_rhi_cd: {
                    show: false,
                    alias: 'ps1_rhi_cd',
                },
                razao_soc1: {
                    show: true,
                    alias: 'Razão social',
                },
                responsav1: {
                    show: true,
                    alias: 'Responsável',
                },
                sg_legenda: {
                    show: false,
                    alias: 'sg_legenda',
                },
                sg_tipo_tr: {
                    show: false,
                    alias: 'sg_tipo_tr',
                },
                sg_uf: {
                    show: false,
                    alias: 'sg_uf',
                },
                shape_are1: {
                    show: false,
                    alias: 'shape_are1',
                },
                shape_area: {
                    show: false,
                    alias: 'shape_area',
                },
                shape_le_1: {
                    show: false,
                    alias: 'shape_le_1',
                },
                shape_len1: {
                    show: false,
                    alias: 'shape_len1',
                },
                shape_leng: {
                    show: false,
                    alias: 'shape_leng',
                },
                sit_jurid1: {
                    show: true,
                    alias: 'Situação jurídica',
                },
                situacao: {
                    show: true,
                    alias: 'Situação',
                },
                situacao_1: {
                    show: true,
                    alias: 'Situação',
                },
                sup_est_co: {
                    show: false,
                    alias: 'sup_est_co',
                },
                t_embargo: {
                    show: true,
                    alias: 'T. Embargo',
                },
                tipo: {
                    show: true,
                    alias: 'Tipo',
                },
                tipologia: {
                    show: true,
                    alias: 'Tipologia',
                },
                titulo_nu1: {
                    show: true,
                    alias: 'Título',
                },
                ul: {
                    show: false,
                    alias: 'ul',
                },
                unidade_d1: {
                    show: false,
                    alias: 'ul',
                },
                versao: {
                    show: true,
                    alias: 'Versão',
                },
                versao_snv: {
                    show: false,
                    alias: 'versao_snv',
                },
                vl_br: {
                    show: false,
                    alias: 'vl_br',
                },
                vl_codigo: {
                    show: false,
                    alias: 'vl_codigo',
                },
                vl_extensa: {
                    show: false,
                    alias: 'vl_extensa',
                },
                vl_km_fina: {
                    show: false,
                    alias: 'vl_km_fina',
                },
                cobertura: {
                    show: true,
                    alias: 'Cobertura',
                },
                estrutura_: {
                    show: true,
                    alias: 'Estrutura',
                },
                clima_defi: {
                    show: true,
                    alias: 'clima_defi',
                },
                fisionomia: {
                    show: true,
                    alias: 'Fisionomia',
                },
                fisionom_1: {
                    show: true,
                    alias: 'fisionom_1',
                },
                sigla: {
                    show: true,
                    alias: 'Sigla',
                },
                escala_tra: {
                    show: true,
                    alias: 'escala_tra',
                },
                shape_area: {
                    show: true,
                    alias: 'shape_area',
                },
                shape_len: {
                    show: true,
                    alias: 'shape_len',
                },
            }
            : '',
        DYNAMIC: groupView.DYNAMIC
            ? {
                ano: {
                    show: true,
                    alias: 'Ano',
                },
                areameters: {
                    show: true,
                    alias: 'Área (m²)',
                },
                areamunkm: {
                    show: false,
                    alias: 'areamunkm',
                },
                areatotalk: {
                    show: false,
                    alias: 'areatotalk',
                },
                areauckm: {
                    show: false,
                    alias: 'areauckm',
                },
                bioma: {
                    show: true,
                    alias: 'Bioma',
                },
                bioma_id: {
                    show: false,
                    alias: 'bioma_id',
                },
                class_n_01: {
                    show: false,
                    alias: 'class_n_01',
                },
                classname: {
                    show: true,
                    alias: 'Classe',
                },
                class_name: {
                    show: true,
                    alias: 'Classe',
                },
                county: {
                    show: true,
                    alias: 'Município',
                },
                data_anter: {
                    show: false,
                    alias: 'data_anter',
                },
                data_hora_gmt: {
                    show: true,
                    alias: 'Data',
                },
                timestamp: {
                    show: false,
                    alias: 'timestamp',
                },
                date: {
                    show: true,
                    alias: 'Data',
                },
                date_audit: {
                    show: true,
                    alias: 'Data auditoria',
                },
                dsfnv: {
                    show: false,
                    alias: 'dsfnv',
                },
                estado: {
                    show: true,
                    alias: 'Estado',
                },
                fid: {
                    show: false,
                    alias: 'fid',
                },
                fid_new: {
                    show: false,
                    alias: 'fid_new',
                },
                foco_id: {
                    show: false,
                    alias: 'foco_id',
                },
                geom: {
                    show: false,
                    alias: 'geom',
                },
                geometria: {
                    show: false,
                    alias: 'geometria',
                },
                gid: {
                    show: false,
                    alias: 'gid',
                },
                ha: {
                    show: false,
                    alias: 'ha',
                },
                id: {
                    show: false,
                    alias: 'id',
                },
                id_0: {
                    show: false,
                    alias: 'id_0',
                },
                id_1: {
                    show: false,
                    alias: 'id_1',
                },
                id_2: {
                    show: false,
                    alias: 'id_2',
                },
                id_cena_an: {
                    show: false,
                    alias: 'id_cena_an',
                },
                julday: {
                    show: false,
                    alias: 'julday',
                },
                km2: {
                    show: false,
                    alias: 'km2',
                },
                latitude: {
                    show: false,
                    alias: 'latitude',
                },
                linkcolumn: {
                    show: false,
                    alias: 'linkcolumn',
                },
                longitude: {
                    show: false,
                    alias: 'longitude',
                },
                lot: {
                    show: false,
                    alias: 'lot',
                },
                mainclass: {
                    show: true,
                    alias: 'Classe',
                },
                municipio: {
                    show: true,
                    alias: 'Município',
                },
                nome_arq: {
                    show: false,
                    alias: 'nome_arq',
                },
                ogr_geometry: {
                    show: false,
                    alias: 'ogr_geometry',
                },
                orbitpoint: {
                    show: true,
                    alias: 'Órbita/Ponto',
                },
                orb_pto: {
                    show: true,
                    alias: 'Órbita/Ponto',
                },
                pais: {
                    show: false,
                    alias: 'pais',
                },
                pathrow: {
                    show: false,
                    alias: 'pathrow',
                },
                path_row: {
                    show: false,
                    alias: 'path_row',
                },
                pid_dd_focos_inpe: {
                    show: false,
                    alias: 'pid_dd_focos_inpe',
                },
                pid_focos_mt: {
                    show: false,
                    alias: 'pid_focos_mt',
                },
                quadrant: {
                    show: false,
                    alias: 'quadrant',
                },
                satelite: {
                    show: true,
                    alias: 'Satélite',
                },
                satellite: {
                    show: true,
                    alias: 'Satélite',
                },
                scene_id: {
                    show: false,
                    alias: 'scene_id',
                },
                sensor: {
                    show: true,
                    alias: 'Sensor',
                },
                uc: {
                    show: false,
                    alias: 'uc',
                },
                uf: {
                    show: false,
                    alias: 'uf',
                },
                view_date: {
                    show: true,
                    alias: 'Data',
                },
            }
            : '',
    };
    // }

    return (viewId && viewId !== 'undefined'
        ? infoColumns[viewId]
        : infoColumns);
}
