'use strict';

function getXml(json) {
    return
        `
            <featureType>
                <name>${json.tite}</name>
                <nativeName>${json.tite}</nativeName>
                <namespace>
                    <name>${json.workspace}</name>
                    <atom:link  xmlns:atom="http://www.w3.org/2005/Atom"
                                rel="alternate"
                                href="http://arizona-umh.cs.umn.edu:8080/geoserver/rest/namespaces/cite.xml"
                                type="application/xml"/>
                </namespace>
                <title>${json.tite}</title>
                <keywords>
                    <string>features</string>
                    <string>${json.tite}</string>
                </keywords>
                <srs>EPSG:4326</srs>
                <projectionPolicy>FORCE_DECLARED</projectionPolicy>
                <enabled>true</enabled>
                <metadata>
                    <entry key="cachingEnabled">false</entry>
                    <entry key="JDBC_VIRTUAL_TABLE">
                        <virtualTable>
                            <name>${json.tite}</name>
                            <sql>${json.sql}</sql>
                            <escapeSql>false</escapeSql>
                            <keyColumn>${json.keyColumn}</keyColumn>
                            <geometry>
                                <name>${json.geometry.name}</name>
                                <type>${json.geometry.type}</type>
                                <srid>${json.geometry.srid}</srid>
                            </geometry>
                        </virtualTable>
                    </entry>
                </metadata>
                <store class="dataStore">
                    <name>${json.dataStore}</name>
                    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://arizona-umh.cs.umn.edu:8080/geoserver/rest/workspaces/cite/datastores/AlwaysShen.xml" type="application/xml"/>
                </store>
                <maxFeatures>0</maxFeatures>
                <numDecimals>0</numDecimals>
            </featureType>
        `
}