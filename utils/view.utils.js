const models = require('../models');
const { View, sequelize } = models;

const { QueryTypes } = require('sequelize');
const QUERY_TYPES_SELECT = { type: QueryTypes.SELECT };

const ViewUtils = {
    setXml(json) {
        const parameter =
          json.addParameter
            ? `    <parameter>
                        <name>min</name>
                        <defaultValue>0</defaultValue>
                        <regexpValidator>^[\\d]+$</regexpValidator>
                   </parameter>
                   <parameter>
                        <name>max</name>
                        <defaultValue>99999999999</defaultValue>
                        <regexpValidator>^[\\d]+$</regexpValidator>
                   </parameter>`
            : ``;

        return `   <featureType>
                    <name>${json.name}</name>
                    <nativeName>${json.name}</nativeName>
                    <title>${json.title}</title>
                    <keywords>
                        <string>features</string>
                        <string>${json.title}</string>
                    </keywords>
                    <srs>EPSG:${confGeoServer.sridTerraMa}</srs>
                    <nativeBoundingBox>
                        <minx>-180</minx>
                        <maxx>180</maxx>
                        <miny>-90</miny>
                        <maxy>90</maxy>
                        <crs>EPSG:${confGeoServer.sridTerraMa}</crs>
                    </nativeBoundingBox>
                    <latLonBoundingBox>
                        <minx>-180</minx>
                        <maxx>180</maxx>
                        <miny>-90</miny>
                        <maxy>90</maxy>
                        <crs>EPSG:${confGeoServer.sridTerraMa}</crs>
                    </latLonBoundingBox>
                    <projectionPolicy>FORCE_DECLARED</projectionPolicy>
                    <enabled>true</enabled>
                    <metadata>
                        <entry key="cachingEnabled">false</entry>
                        <entry key="JDBC_VIRTUAL_TABLE">
                            <virtualTable>
                                <name>${json.name}</name>
                                <sql>${json.sql}</sql>
                                <escapeSql>false</escapeSql>
                                <keyColumn>${json.keyColumn}</keyColumn>
                                <geometry>
                                    <name>${json.geometry.name}</name>
                                    <type>${json.geometry.type}</type>
                                    <srid>${json.geometry.srid}</srid>
                                </geometry>
                                ${parameter}
                            </virtualTable>
                        </entry>
                        <entry key="time">
                            <dimensionInfo>
                                <enabled>true</enabled>
                                <attribute>execution_date</attribute>
                                <presentation>CONTINUOUS_INTERVAL</presentation>
                                <units>ISO8601</units>
                                <defaultValue>
                                    <strategy>MAXIMUM</strategy>
                                </defaultValue>
                            </dimensionInfo>
                        </entry>
                    </metadata>
                    <maxFeatures>0</maxFeatures>
                    <numDecimals>0</numDecimals>
                </featureType>`;
    },
    async getGrouped() {
        const sqlGroupViews = `
            SELECT (CASE
                        WHEN view.source_type = 1 THEN 'STATIC'
                        WHEN view.source_type = 2 THEN 'DYNAMIC'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN 'DETER'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN 'PRODES'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN 'BURNED'
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN 'BURNED_AREA'
                    END)        AS cod,
            
                   (CASE
                        WHEN view.source_type = 1 THEN 'Dados estáticos'
                        WHEN view.source_type = 2 THEN 'Dados dinâmicos'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN 'Análise DETER'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN 'Análise PRODES'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN 'Análise FOCOS'
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN 'Análise área queimada'
                       END) AS label,
            
                   (CASE
                        WHEN view.source_type = 1 THEN true
                        WHEN view.source_type = 2 THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN true
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
                       END) AS parent,
            
                   (CASE
                        WHEN view.source_type = 1 THEN false
                        WHEN view.source_type = 2 THEN false
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN true
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
                       END) AS view_graph,
            
                   (CASE
                        WHEN view.source_type = 1 THEN false
                        WHEN view.source_type = 2 THEN false
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN false
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN false
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN false
                       END) AS active_area,
            
                   (CASE
                        WHEN view.source_type = 1 THEN false
                        WHEN view.source_type = 2 THEN false
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN true
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN true
                       END) AS is_private,
                   null     AS children
            
            FROM terrama2.views AS view
            GROUP BY cod, label, parent, view_graph, active_area, is_private`;
        const sql = `
            SELECT (CASE
                        WHEN view.source_type = 1 THEN 'STATIC'
                        WHEN view.source_type = 2 THEN 'DYNAMIC'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'DETER') IS NOT NULL) THEN 'DETER'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'PRODES') IS NOT NULL) THEN 'PRODES'
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'FOCOS') IS NOT NULL) THEN 'BURNED'
                        WHEN ((SUBSTRING(UPPER(TRIM(view.name)), 'AQ') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA_Q') IS NOT NULL) OR
                              (SUBSTRING(UPPER(TRIM(view.name)), 'AREA Q') IS NOT NULL)) THEN 'BURNED_AREA'
                        ELSE UPPER(REPLACE(translate(REPLACE(TRIM(view.name), '  ', ' '),
                                                     'áàâãäåaaaÁÂÃÄÅAAAÀéèêëeeeeeEEEÉEEÈìíîïìiiiÌÍÎÏÌIIIóôõöoooòÒÓÔÕÖOOOùúûüuuuuÙÚÛÜUUUUçÇñÑýÝ',
                                                     'aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY'
                                               ), ' ', '_'))
                   END)                       AS cod_group,
                   (UPPER(REPLACE(REPLACE(REPLACE(translate(TRIM(view.name),
                                                            '  áàâãäåaaaÁÂÃÄÅAAAÀéèêëeeeeeEEEÉEEÈìíîïìiiiÌÍÎÏÌIIIóôõöoooòÒÓÔÕÖOOOùúûüuuuuÙÚÛÜUUUUçÇñÑýÝ',
                                                            ' aaaaaaaaaAAAAAAAAAeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIooooooooOOOOOOOOuuuuuuuuUUUUUUUUcCnNyY'
                                                      ), ' ', '_'), '__', '_'), '-', '_'))
                       )                   AS cod,
                   TRIM(view.name)         AS label,
                   view.id                 AS value,
                   (CASE
                        WHEN r_view.workspace is null THEN CONCAT('terrama2_', view.id)
                        ELSE r_view.workspace
                       END)                AS workspace,
                   concat('view', view.id) AS view,
                   (CASE
                        WHEN view.source_type = 3 THEN concat(TRIM(dsf.value), '_', ana.id)
                        ELSE dsf.value
                       END)                AS table_name,
                   (CASE
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X DETER') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X PRODES') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X FOCOS') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR X AREA Q') IS NOT NULL) THEN true
                        WHEN (SUBSTRING(UPPER(TRIM(view.name)), 'CAR VALIDADO') IS NOT NULL) THEN true
                        ELSE false
                       END)                AS is_primary
            FROM terrama2.data_sets AS ds
                     INNER JOIN terrama2.data_set_formats AS dsf ON ds.id = dsf.data_set_id
                     INNER JOIN terrama2.views AS view ON ds.data_series_id = view.data_series_id
                     LEFT JOIN terrama2.registered_views AS r_view ON view.id = r_view.view_id
                     LEFT JOIN terrama2.analysis AS ana ON dsf.data_set_id = ana.dataset_output
            WHERE dsf.key = 'table_name'`;
        try {
            const dataset_views = await sequelize.query(sql, QUERY_TYPES_SELECT);
            const dataset_group_views = await sequelize.query(sqlGroupViews, QUERY_TYPES_SELECT);

            let groupViews = {};
            dataset_group_views.forEach(group => {
                groupViews[group.cod] = group;
                groupViews[group.cod].children = {}
            });

            dataset_views.forEach(dataView => {
                if(dataView.is_primary) {
                    groupViews[dataView.cod_group].tableOwner = `${dataView.table_name}`;
                }

                groupViews[dataView.cod_group].children[dataView.cod] = dataView
            });

            return groupViews
        } catch (e) {
            return {}
        }
    }
};

module.exports = ViewUtils;
