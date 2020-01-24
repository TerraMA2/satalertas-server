
const view = {
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

        const xml = `   <featureType>
                    <name>${json.name}</name>
                    <nativeName>${json.name}</nativeName>
                    <title>${json.title}</title>
                    <keywords>
                        <string>features</string>
                        <string>${json.title}</string>
                    </keywords>
                    <srs>EPSG:4326</srs>
                    <nativeBoundingBox>
                        <minx>-180</minx>
                        <maxx>180</maxx>
                        <miny>-90</miny>
                        <maxy>90</maxy>
                        <crs>EPSG:4326</crs>
                    </nativeBoundingBox>
                    <latLonBoundingBox>
                        <minx>-180</minx>
                        <maxx>180</maxx>
                        <miny>-90</miny>
                        <maxy>90</maxy>
                        <crs>EPSG:4326</crs>
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

        return xml;
    }
};

module.exports = view;
