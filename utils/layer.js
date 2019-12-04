
const layer={
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
                    <name>${json.title}</name>
                    <nativeName>${json.title}</nativeName>
                    <namespace>
                        <name>${json.workspace}</name>
                        <atom:link  xmlns:atom="http://www.w3.org/2005/Atom"
                                    rel="alternate"
                                    href="http://arizona-umh.cs.umn.edu:8080/geoserver/rest/namespaces/cite.xml"
                                    type="application/xml"/>
                    </namespace>
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
                                <name>${json.title}</name>
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
                    </metadata>
                    <store class="dataStore">
                        <name>${json.dataStore}</name>
                        <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://arizona-umh.cs.umn.edu:8080/geoserver/rest/workspaces/cite/datastores/AlwaysShen.xml" type="application/xml"/>
                    </store>
                    <maxFeatures>0</maxFeatures>
                    <numDecimals>0</numDecimals>
                </featureType>`;

        return xml;
    }
};

module.exports = layer;
