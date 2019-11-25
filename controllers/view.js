const models = require('../models')
    View = models.View
    RegisteredView = models.RegisteredViews
    DataSet = models.DataSet
    DataSetFormat = models.DataSetFormat
    LayerType = require('../enum/layerType')

exports.get = (req, res, next) => {
    const viewId = req.params.id
    if(viewId){
        RegisteredView.findOne({include: ['view'], where: {'view_id': viewId}}).then(view => {
            res.json(view)
        })
    }else{
        RegisteredView.findAll({include: ['view']}).then(registeredViews => {
            const layerType = {
                1: 'static',
                2: 'dynamic',
                3: 'analysis',
                4: 'alert'
            }
            registeredViews = registeredViews.map(registeredView => {
                const view = registeredView.view
                const viewId = view.id
                const viewName = view.dataValues.name
                const isPrivate = view.dataValues.private
                const sourceType = view.dataValues.source_type
                const uri = registeredView.dataValues.uri
                const geoserverUrl = `http://${uri.substr(uri.lastIndexOf("@")+1)}/wms`
                const workspace = registeredView.dataValues.workspace
                const layerId = `${workspace}:view${viewId}`
                let cod = '';
                let codgroup = '';

                if (sourceType === LayerType.ANALYSIS) {
                    cod = viewName.replace(/ /g, '_').toUpperCase()
                    codgroup = cod.substr(cod.lastIndexOf("_")+1)
                }

                const layerData = {
                    url: `${geoserverUrl}`,
                    layers: `${layerId}`,
                    transparent: true,
                    format: "image/png",
                    version: "1.1.0",
                    time: "P1Y/PRESENT"
                }

                const legend = {
                    title: `${viewName}`,
                    url: `${geoserverUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=forceLabels:on&LAYER=${layerId}`
                }

                const layer = {
                    cod: `${cod}`,
                    codgroup: `${codgroup}`,
                    label: `${viewName}`,
                    shortLabel: `${viewName}`,
                    value: `${viewId}`,
                    carRegisterColumn: "de_car_validado_sema_numero_do1",
                    type: `${layerType[sourceType]}`,
                    isPrivate: `${isPrivate}`,
                    isPrimary: false,
                    layerData: layerData,
                    legend: legend
                }
                return layer
            })

            registeredViews = registeredViews.reduce((r, a) => {
                r[a.type] = [...r[a.type] || [], a];
                return r;
            }, {});

            let staticLayers = registeredViews['static']
            let dynamicLayers = registeredViews['dynamic']
            let analysisLayers = registeredViews['analysis']

            analysisLayers = analysisLayers.reduce((r, a) => {
                let viewName = a.cod
                viewName = viewName.substr(viewName.replace(/ /g, '_').lastIndexOf("_")+1).toUpperCase()
                r[viewName] = [...r[viewName] || [], a];
                return r;
            }, {});

            analysisLayers['DETER'][0]['isPrimary'] = true
            analysisLayers['PRODES'][0]['isPrimary'] = true
            analysisLayers['FOCOS'][0]['isPrimary'] = true

            const viewsJSON = [
                {
                    cod: "DETER",
                    label: "Análise DETER",
                    parent: true,
                    viewGraph: true,
                    activearea: true,
                    isPrivate: true,
                    children: analysisLayers['DETER']
                },
                {
                    cod: "PRODES",
                    label: "Análise PRODES",
                    parent: true,
                    viewGraph: true,
                    activearea: false,
                    isPrivate: true,
                    children: analysisLayers['PRODES']
                },
                {
                    cod: "FOCOS",
                    label: "Análise FOCOS",
                    parent: true,
                    viewGraph: true,
                    activearea: false,
                    isPrivate: true,
                    children: analysisLayers['FOCOS']
                },
                {
                    label: "Dados estáticos",
                    parent: true,
                    viewGraph: false,
                    activearea: false,
                    isPrivate: false,
                    children: staticLayers
                },
                {
                    label: "Dados dinâmicos",
                    parent: true,
                    viewGraph: false,
                    activearea: false,
                    isPrivate: false,
                    children: dynamicLayers
                }
            ]
            return viewsJSON
        }).then(viewsJSON => {
            res.json(viewsJSON)
        })
    }
}