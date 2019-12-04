'use strict';
module.exports = {
  setXml: (featureType) => {
    return
    `<featureType>
        <name>requestStaticBounding3</name>
        <nativeName>requestStaticBounding3</nativeName>
        <namespace>
            <name>mpmt_alertas</name>
            <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://arizona-umh.cs.umn.edu:8080/geoserver/rest/namespaces/cite.xml" type="application/xml"/>
        </namespace>
        <title>requestStaticBounding3</title>
        <keywords>
            <string>features</string>
            <string>requestStaticBounding3</string>
        </keywords>
        <srs>EPSG:4326</srs>
        <nativeBoundingBox>
            <minx>-1</minx>
            <maxx>0</maxx>
            <miny>-1</miny>
            <maxy>0</maxy>
            <crs>EPSG:4326</crs>
        </nativeBoundingBox>
        <latLonBoundingBox>
            <minx>-1</minx>
            <maxx>0</maxx>
            <miny>-1</miny>
            <maxy>0</maxy>
            <crs>EPSG:4326</crs>
        </latLonBoundingBox>
        <projectionPolicy>FORCE_DECLARED</projectionPolicy>
        <enabled>true</enabled>
        <metadata>
            <entry key="cachingEnabled">false</entry>
            <entry key="JDBC_VIRTUAL_TABLE">
                <virtualTable>
                    <name>requestStaticBounding3</name>
                    <sql>SELECT main_table.*, secondary_table.gid
                        FROM public.apv_car_deter_28 AS main_table
                             ,public.de_biomas_mt secondary_table
                        WHERE  ST_Intersects(ST_CollectionExtract(intersection_geom, 3), st_transform(secondary_table.geom, 4326))</sql>
                    <escapeSql>false</escapeSql>
                    <keyColumn>gid</keyColumn>
                    <geometry>
                        <name>intersection_geom</name>
                        <type>Geometry</type>
                        <srid>-1</srid>
                    </geometry>
                </virtualTable>
            </entry>
        </metadata>
        <store class="dataStore">
            <name>mpmt_alertas</name>
            <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://arizona-umh.cs.umn.edu:8080/geoserver/rest/workspaces/cite/datastores/AlwaysShen.xml" type="application/xml"/>
        </store>
        <maxFeatures>0</maxFeatures>
        <numDecimals>0</numDecimals>
      </featureType>`;
  }
};
