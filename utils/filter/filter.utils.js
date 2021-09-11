const {QueryTypes} = require('sequelize');
const QUERY_TYPES_SELECT = {type: QueryTypes.SELECT};
const config = require(__dirname + '/../../config/config.json');

function addAND(sqlWhere) {
    return sqlWhere.trim() ? `AND ` : '';
}

function isDeter(analyze, view) {
    return ((analyze.type === 'deter') && (view.codgroup === 'DETER'));
}

function isDeforestation(analyze, view) {
    return ((analyze.type && analyze.type === 'deforestation') && (view.codgroup === 'PRODES'));
}

function isBurned(analyze, view) {
    return ((analyze.type && analyze.type === 'burned') && (view.codgroup === 'BURNED'));
}

function isBurnedArea(analyze, view) {
    return ((analyze.type && analyze.type === 'burned_area') && (view.codgroup === 'BURNED_AREA'));
}

function isCarArea(type) {
    return (type === 'car_area');
}

const specificSearch = {
    car: async function (conn, sql, filter, columns, cod, aliasTablePrimary) {
        sql.secondaryTables = '';
        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ${ columns.column1 } like '${ filter.specificSearch.inputValue }' `;
    },
    car_federal: async function (conn, sql, filter, columns, cod, aliasTablePrimary) {
        sql.secondaryTables = '';
        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ${ columns.columnCarFederal } like '${ filter.specificSearch.inputValue }' `;
    },
    cpf: async function (conn, sql, filter, columns, cod, aliasTablePrimary) {
        sql.secondaryTables = '';
        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ${ columns.columnCpfCnpj } like '%${ filter.specificSearch.inputValue }%' `;
    }
};
const themeSelected = {
    biome: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ${ columns.filterColumns.columnsTheme.biomes } like '${ filter.themeSelected.value.name }' `;
            },
            others: async function () {
                sql.secondaryTables += ' , public.de_biomas_mt biome ';

                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_biomas_mt LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'biome.geom' : ` st_transform(biome.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND biome.gid = ${ filter.themeSelected.value.gid } `;
            }
        };

        await codGoup[cod]();
    },
    region: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_municipios_sema county ';
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND county.comarca like '${ filter.themeSelected.value.name }' `;
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = cast(county.geocodigo AS integer) `;
            },
            others: async function () {
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? ' county.geom ' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.comarca = '${ filter.themeSelected.value.name }'  `;
            }
        };

        await codGoup[cod]();
    },
    mesoregion: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_municipios_sema county ';
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND county.nm_meso like '${ filter.themeSelected.value.name }' `;
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = cast(county.geocodigo AS integer) `;
            },
            others: async function () {
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'county.geom' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.nm_meso = '${ filter.themeSelected.value.name }' `;
            }
        };

        await codGoup[cod]();
    },
    immediateregion: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_municipios_sema county ';
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND county.nm_rgi like '${ filter.themeSelected.value.name }' `;
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = cast(county.geocodigo AS integer) `;
            },
            others: async function () {
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'county.geom' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.nm_rgi = '${ filter.themeSelected.value.name }' `;
            }
        };

        await codGoup[cod]();
    },
    intermediateregion: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_municipios_sema county ';
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND county.nm_rgint like '${ filter.themeSelected.value.name }' `;
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = cast(county.geocodigo AS integer) `;
            },
            others: async function () {
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'county.geom' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.nm_rgint = '${ filter.themeSelected.value.name }' `;
            }
        };

        await codGoup[cod]();
    },
    pjbh: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_municipios_sema county ';
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND county.pjbh like '${ filter.themeSelected.value.name }' `;
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = cast(county.geocodigo AS integer) `;
            },
            others: async function () {
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'county.geom' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.pjbh = '${ filter.themeSelected.value.name }'  `;
            }
        };
        await codGoup[cod]();
    },
    microregion: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_municipios_sema county ';
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND county.nm_micro like '${ filter.themeSelected.value.name }' `;
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = cast(county.geocodigo AS integer) `;
            },
            others: async function () {
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};
                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'county.geom' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.nm_micro = '${ filter.themeSelected.value.name }'  `;
            }
        };
        await codGoup[cod]();
    },
    city: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        const codGoup = {
            focos: async function () {
                sql.sqlWhere += ` AND ${ columns.filterColumns.columnsTheme.geocod } = ${ filter.themeSelected.value.geocodigo } `;
            },
            others: async function () {
                sql.secondaryTables += ' , public.de_municipios_sema county ';
                srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};

                const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_municipios_sema LIMIT 1`, QUERY_TYPES_SELECT);
                const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'county.geom' : ` st_transform(county.geom, ${ srid[0].srid }) `;

                sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;
                sql.sqlWhere += ` AND county.gid = ${ filter.themeSelected.value.gid } `;
            }
        };
        await codGoup[cod]();
    },
    uc: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_unidade_cons_sema uc ';
        srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};

        const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_unidade_cons_sema LIMIT 1`, QUERY_TYPES_SELECT);
        const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'uc.geom' : ` st_transform(uc.geom, ${ srid[0].srid }) `;

        sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;

        if (filter.themeSelected.value.gid > 0) {
            sql.sqlWhere += ` AND uc.gid = ${ filter.themeSelected.value.gid } `;
        }
    },
    ti: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_terra_indigena_sema ti ';
        srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};

        const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_terra_indigena_sema LIMIT 1`, QUERY_TYPES_SELECT);
        const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'ti.geom' : ` st_transform(ti.geom, ${ srid[0].srid }) `;

        sql.sqlWhere += ` AND ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;

        if (filter.themeSelected.value.gid > 0) {
            sql.sqlWhere += ` AND ti.gid = ${ filter.themeSelected.value.gid } `;
        }
    },
    projus: async function (conn, sql, filter, columns, cod, aliasTablePrimary, srid) {
        sql.secondaryTables += ' , public.de_projus_bacias_sema projus ';
        srid = srid && srid[0] && srid[0].srid ? srid : {rows: [{srid: config.geoserver.defaultSRID}]};

        const sridSec = await conn.sequelize.query(`SELECT ST_SRID(geom) AS srid FROM public.de_projus_bacias_sema LIMIT 1`, QUERY_TYPES_SELECT);
        const fieldIntersects = (srid[0].srid === sridSec[0].srid) ? 'projus.geom' : ` st_transform(projus.geom, ${ srid[0].srid }) `;

        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ST_Intersects(${ aliasTablePrimary }.intersection_geom, ${ fieldIntersects }) `;

        if (filter.themeSelected.value.gid > 0) {
            sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } projus.gid = ${ filter.themeSelected.value.gid } `;
        }
    }
};

function setClassSearch(classSearch, sql, aliasTablePrimary, view) {
    if (classSearch && (classSearch.radioValue === 'SELECTION') && (classSearch.analyzes.length > 0)) {
        classSearch.analyzes.forEach(analyze => {
            if (analyze.valueOption && analyze.type) {
                const setClass = {
                    deter() {
                        if (view.groupCode === 'DETER') {
                            const columnName = view.isPrimary ? `dd_deter_inpe_classname` : `${ view.tableOwner }_dd_deter_inpe_classname`;
                            sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ${ aliasTablePrimary }.${ columnName } like '%${ analyze.valueOption.name }%' `
                        }
                    }
                }

                setClass[analyze.type]();
            }
        });
    }
}

function setAlertType(alertType, sql, columns, aliasTablePrimary, view) {
    if (alertType && (alertType.radioValue !== 'ALL') && (alertType.analyzes.length > 0)) {
        alertType.analyzes.forEach(analyze => {
            if (analyze.valueOption && analyze.valueOption.value && analyze.type) {
                const values = getValues(analyze);
                const alertType = {
                    burned() {
                        sql.sqlHaving += ` HAVING count(1) ${ values.columnValueFocos } `;
                    },
                    car_area() {
                        sql.secondaryTables += ' , public.de_car_validado_sema car ';
                        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } car.area_ha_ ${ values.columnValue } `;
                        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } car.numero_do1 = ${ columns.column1 } `;
                    },
                    others() {
                        sql.sqlWhere += ` ${ addAND(sql.sqlWhere) } ${ aliasTablePrimary }.calculated_area_ha ${ values.columnValue } `;
                    }
                };

                if (isDeter(analyze, view) || isBurnedArea(analyze, view) || isDeforestation(analyze, view)) {
                    alertType['others']();
                }

                if (isBurned(analyze, view)) {
                    alertType[analyze.type]();
                }

                if (isCarArea(analyze.type)) {
                    alertType[analyze.type]();
                }
            }
        });
    }
}

const setFilter = {
    specificSearch: async function (conn, sql, filter, columns, cod, table, view) {
        await specificSearch[filter.specificSearch.CarCPF.toLowerCase()](conn, sql, filter, columns, table.alias);
    },
    others: async function (conn, sql, filter, columns, cod, table, view) {
        if (filter.themeSelected && filter.themeSelected.type) {
            const srid = await conn.sequelize.query(
                ` SELECT ST_SRID(${table.alias}.intersection_geom) AS srid FROM public.${table.name} AS ${table.alias} LIMIT 1`,
                QUERY_TYPES_SELECT);

            await themeSelected[filter.themeSelected.type](conn, sql, filter, columns, cod, table.alias, srid);
        }
        setAlertType(filter.alertType, sql, columns, table.alias, view);
        setClassSearch(filter.classSearch, sql, table.alias, view);
    }
};

function getValues(analyze) {
    const values = {columnValue: '', columnValueFocos: ''};
    const setValue = {
        1() {
            values.columnValue = ` <= 5 `;
            values.columnValueFocos = ` BETWEEN 0 AND 10 `;
        },
        2() {
            values.columnValue = ` BETWEEN 5 AND 25 `;
            values.columnValueFocos = ` BETWEEN 10 AND 20 `;
        },
        3() {
            values.columnValue = ` BETWEEN 25 AND 50 `;
            values.columnValueFocos = ` BETWEEN 20 AND 50 `;
        },
        4() {
            values.columnValue = ` BETWEEN 50 AND 100 `;
            values.columnValueFocos = ` BETWEEN 50 AND 100 `;
        },
        5() {
            values.columnValue = ` >= 100 `;
            values.columnValueFocos = ` > 100 `;
        },
        6() {
            values.columnValue = ` > ${ analyze.valueOptionBiggerThen } `;
            values.columnValueFocos = ` > ${ analyze.valueOptionBiggerThen } `;
        }
    };

    setValue[analyze.valueOption.value.toString()]();
    return values;
}

const filterUtils = {
    async getFilter(conn, table, params, view, columns) {
        const filter = params.filter && params.filter !== 'null' ? JSON.parse(params.filter) : {};
        params.sortColumn = params.sortField ? params.sortField : params.sortColumn;

        const sql = {
            sqlWhere: '',
            secondaryTables: '',
            sqlHaving: '',
            order: '',
            limit: '',
            offset: ''
        };

        if (view.isAnalysis) {
            if (params.date && params.date !== "null") {
                const dateFrom = params.date[0];
                const dateTo = params.date[1];
                sql.sqlWhere += ` WHERE ${ table.alias }.execution_date BETWEEN '${ dateFrom }' AND '${ dateTo }' `
            }

            if (filter) {
                const filtered = filter.specificSearch && filter.specificSearch.isChecked ? 'specificSearch' : 'others';

                const cod = (view.groupCode === 'BURNED') ? 'focos' : 'others';
                await setFilter[filtered](conn, sql, filter, columns, cod, table, view);
            }
        }
        sql.order = (params.sortColumn && params.sortOrder) ? ` ORDER BY ${ params.sortColumn } ${ params.sortOrder === '1' ? 'ASC' : 'DESC' } ` : ``;
        sql.limit = (params.limit) ? ` LIMIT ${ params.limit } ` : ``;
        sql.offset = (params.offset) ? ` OFFSET ${ params.offset } ` : ``;

        return sql;
    },
    async getColumns(view, tableOwner, aliasTablePrimary) {
        let column1 = '';
        let column2 = '';
        let column3 = '';
        let column4 = '';
        let column5 = '';

        const columnCpfCnpj =
            (view.isAnalysis && view.isPrimary) ?
                ` ${ aliasTablePrimary }.de_car_validado_sema_cpfcnpj ` :
                ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_cpfcnpj `;
        const columnCarFederal =
            (view.isAnalysis && view.isPrimary) ?
                ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do2 ` :
                ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do2 `;

        const columnArea = `${ aliasTablePrimary }.calculated_area_ha`;

        const filterColumns = {
            columnDate: `${ aliasTablePrimary }.execution_date`,
            columnsTheme: {
                biomes: (view.isAnalysis && view.isPrimary) ? ` ${ aliasTablePrimary }.dd_focos_inpe_bioma ` : ` ${ aliasTablePrimary }.${ tableOwner }_dd_focos_inpe_bioma `,
                geocod: (view.isAnalysis && view.isPrimary) ? ` ${ aliasTablePrimary }.dd_focos_inpe_id_2 ` : ` ${ aliasTablePrimary }.${ tableOwner }_dd_focos_inpe_id_2 `,
                mesoregion: 'de_mesoregiao_ibge_gid',
                microregion: 'de_microregiao_ibge_gid',
                region: 'de_comarca_ibge_gid'
            }
        };

        if (view.groupCode && view.groupCode === 'BURNED') {
            if (view.isAnalysis && view.isPrimary) {
                column1 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do2 `;
                column2 = ` ${ aliasTablePrimary }.dd_focos_inpe_bioma `;
                column3 = '1';
                column4 = ` ${ aliasTablePrimary }.dd_focos_inpe_bioma `;
            } else {
                column1 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do2 `;
                column2 = ` ${ aliasTablePrimary }.${ tableOwner }_dd_focos_inpe_bioma `;
                column3 = '1';
                column4 = ` ${ aliasTablePrimary }.${ tableOwner }_dd_focos_inpe_bioma `;
            }
        } else if (view.groupCode && view.groupCode === 'DETER') {
            if (view.isAnalysis && view.isPrimary) {
                column1 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do2 `;
                column2 = ` ${ aliasTablePrimary }.dd_deter_inpe_classname `;
            } else {
                column1 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do2 `;
                column2 = ` ${ aliasTablePrimary }.${ tableOwner }_dd_deter_inpe_classname `;
            }

            column3 = view.activearea ? ` ${ aliasTablePrimary }.calculated_area_ha ` : '1';
        } else if (view.groupCode && view.groupCode === 'PRODES') {
            if (view.isAnalysis && view.isPrimary) {
                column1 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do2 `;
                column2 = ` ${ aliasTablePrimary }.dd_prodes_inpe_mainclass `;
            } else {
                column1 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do2 `;
                column2 = ` ${ aliasTablePrimary }.${ tableOwner }_dd_prodes_inpe_mainclass `;
            }

            column3 = view.activearea ? ` ${ aliasTablePrimary }.calculated_area_ha ` : '1';

        } else if (view.groupCode && view.groupCode === 'BURNED_AREA') {
            if (view.isAnalysis && view.isPrimary) {
                column1 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do1 `;
                column2 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.de_car_validado_sema_numero_do2 `;
            } else {
                column1 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do1 `;
                column2 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do1 `;
                column5 = ` ${ aliasTablePrimary }.${ tableOwner }_de_car_validado_sema_numero_do2 `;
            }

            column3 = view.activearea ? ` ${ aliasTablePrimary }.calculated_area_ha ` : '1';
        }

        return {
            column1,
            column2,
            column3,
            column4,
            column5,
            filterColumns,
            columnArea,
            columnCpfCnpj,
            columnCarFederal
        };
    },
    async setFilter(conn, params, table, view) {
        const columns = await this.getColumns(view, table.owner, table.alias);

        let paramsFilter = {};
        if (params.specificParameters) {
            paramsFilter = JSON.parse(params.specificParameters);
            paramsFilter['date'] = params.date;
            paramsFilter['filter'] = params.filter;
        } else {
            paramsFilter = params;
        }

        return await this.getFilter(conn, table, paramsFilter, view, columns);
    }
};

module.exports = filterUtils;
