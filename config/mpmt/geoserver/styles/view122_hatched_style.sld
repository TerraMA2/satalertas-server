<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       version="1.0.0"
                       xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
                       xmlns="http://www.opengis.net/sld">
    <NamedLayer>
        <Name>Uso consolidado</Name>
        <UserStyle>
            <Title>Uso consolidado</Title>
            <FeatureTypeStyle>
                <Rule>
                    <Title>Uso consolidado</Title>
                    <PolygonSymbolizer>
                        <Fill>
                            <GraphicFill>
                                <Graphic>
                                    <Mark>
                                        <WellKnownName>shape://slash</WellKnownName>
                                        <Stroke>
                                            <CssParameter name="stroke">#dddddd</CssParameter>
                                            <CssParameter name="stroke-width">1</CssParameter>
                                        </Stroke>
                                    </Mark>
                                    <Size>4</Size>
                                </Graphic>
                            </GraphicFill>
                        </Fill>
                    </PolygonSymbolizer>
                </Rule>
            </FeatureTypeStyle>
        </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>
