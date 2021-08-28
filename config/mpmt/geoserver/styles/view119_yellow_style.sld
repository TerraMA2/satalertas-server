<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<StyledLayerDescriptor xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       version="1.1.0"
                       xmlns="http://www.opengis.net/sld"
                       xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd">
    <NamedLayer>
        <se:Name>Layer</se:Name>
        <UserStyle>
            <se:Name>Style</se:Name>
            <se:FeatureTypeStyle version="1.1.0">
                <se:Rule>
                    <se:Name>Limite do imóvel</se:Name>
                    <se:PolygonSymbolizer version="1.1.0">
                        <se:Fill>
                            <se:SvgParameter name="fill">
                                <ogc:Literal>#249132</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="fill-opacity">
                                <ogc:Literal>0.0</ogc:Literal>
                            </se:SvgParameter>
                        </se:Fill>
                        <se:Stroke>
                            <se:SvgParameter name="stroke">
                                <ogc:Literal>#FFFF00</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="stroke-opacity">
                                <ogc:Literal>1</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="stroke-width">
                                <ogc:Literal>3</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="stroke-linejoin">
                                <ogc:Literal>mitre</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="stroke-linecap">
                                <ogc:Literal>butt</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="stroke-dasharray">
                                <ogc:Literal>1 0</ogc:Literal>
                            </se:SvgParameter>
                            <se:SvgParameter name="stroke-dashoffset">
                                <ogc:Literal>0.0</ogc:Literal>
                            </se:SvgParameter>
                        </se:Stroke>
                        <se:PerpendicularOffset>
                            <ogc:Literal>0.0</ogc:Literal>
                        </se:PerpendicularOffset>
                    </se:PolygonSymbolizer>
                </se:Rule>
            </se:FeatureTypeStyle>
        </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
