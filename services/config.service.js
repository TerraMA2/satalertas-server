const models = require(`../models`)
// const View = models.views
// const RegisteredView = models.registered_views
// const env = process.env.NODE_ENV || `development`
const Result = require(__dirname + `/../utils/result`)
// const confDb = require(__dirname + `/../config/config.json`)[env]
// const confGeoServer = require(__dirname + `/../geoserver-conf/config.json`)[env]
// const GROUP_VIEWS  = require(`../utils/helpers/group-view`)
// const VIEWS = require(__dirname + `/../utils/helpers/views/view`)
// const confView = require(__dirname + `/../config/conf-view.json`)
//
// const QUERY_TYPES_SELECT = { type: `SELECT` };

module.exports = ConfigService = {
  async getSynthesisConfig(groupView) {
    const synthesis = {
      visionslegends: [
        {
          title: `Estado`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_5:view5`
        },
        {
          title: `APP`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_7:view7`
        },
        {
          title: `Uso Antropizado`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_10:view10`
        },
        {
          title: `Reserva legal`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_22:view22`
        },
        {
          title: `Vegetação Nativa`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_21:view21`
        },
        {
          title: `Uso consolidado`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_9:view9`
        },
        {
          title: `CAR x DETER`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_73:view73`
        },
        {
          title: `CAR x PRODES`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_86:view86`
        },
        {
          title: `CAR x TI`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_80:view80`
        },
        {
          title: `Imóvel`,
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&legend_options=forceLabels:on&LAYER=terrama2_6:view6`
        }
      ],
      propertyData: {
        url: `/api/report/getCarData`,
          viewId: `6`
      },
      visions: [
        {
          title: `Visão do Estado`,
          description: null,
          carRegisterColumn: null,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_5:view5,terrama2_5:view5,terrama2_6:view6`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `id_munic>0;{cityCqlFilter}`,
            bbox: `-61.6904258728027,-18.0950622558594,-50.1677627563477,-7.29556512832642`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Visão do Município`,
          description: null,
          carRegisterColumn: `numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_5:view5,terrama2_6:view6`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{cityCqlFilter}`,
            bbox: `{citybbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Visão do alerta no Imóvel`,
          description: null,
          carRegisterColumn: 'numero_do1;a_cardeter_49_de_car_validado_sema_numero_do1;a_carprodes_62_de_car_validado_sema_numero_do1;a_cardeter_49_de_car_validado_sema_numero_do1;a_cardeter_49_de_car_validado_sema_numero_do1;a_cardeter_49_de_car_validado_sema_numero_do1;a_cardeter_49_de_car_validado_sema_numero_do1;a_cardeter_49_de_car_validado_sema_numero_do1',
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_80:view80,terrama2_93:view93,terrama2_76:view76,terrama2_74:view74,terrama2_79:view79,terrama2_75:view75,terrama2_77:view77`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter};{propertyCqlFilter};{propertyCqlFilter};{propertyCqlFilter};{propertyCqlFilter};{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Degradação Ambiental{break}{filterDate}`,
          description: null,
          carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_73:view73`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter} AND dd_deter_inpe_classname='DEGRADACAO'`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Desmatamento{break}{filterDate}`,
          description: null,
          carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_73:view73`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Queimadas{break}{filterDate}`,
          description: null,
          carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_86:view86`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        }
      ],
      detailedVisions: [
        {
          title: `Terra Indígena`,
          description: {
            text: ``,
            value: `{indigenousLand}`
          },
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_92:view92`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Unidade de Conservação`,
          description: {
            text: ``,
            value: `{conservationUnit}`
          },
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_93:view93`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Reserva Legal`,
          description: {
            text: ``,
            value: `{legalReserve}`
          },
          carRegisterColumn: `numero_do1;a_carprodes_62_de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_89:view89`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `APP`,
          description: {
            text: ``,
            value: `{app}`
          },
          carRegisterColumn: `numero_do1;a_carprodes_62_de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_87:view87`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Área Consolidada`,
          description: {
            text: ``,
            value: `{consolidatedArea}`
          },
          carRegisterColumn: `numero_do1;a_carprodes_62_de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_91:view91`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Uso antropizado`,
          description: {
            text: ``,
            value: `{anthropizedUse}`
          },
          carRegisterColumn: `numero_do1;a_carprodes_62_de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_88:view88`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        },
        {
          title: `Vegetação nativa`,
          description: {
            text: ``,
            value: `{nativeVegetation}`
          },
          carRegisterColumn: `numero_do1;a_carprodes_62_de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_90:view90`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{filterDate}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4674`
          }
        }
      ],
      deforestations: [
        {
          title: `Desmatamento DETER sobre imagem SPOT 2008`,
          description: null,
          carRegisterColumn: `numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:MosaicSpot2008_car_validado`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `2008/P1Y`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            cql_filter: `{propertyCqlFilter}`,
            srs: `EPSG:4326`
          }
        },
        {
          title: `Desmatamento DETER sobre imagem 2019`,
          description: null,
          carRegisterColumn: `numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:MosaicSpot2008_car_validado`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `P1Y/2019`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            cql_filter: `{propertyCqlFilter}`,
            srs: `EPSG:4326`
          }
        }
      ],
      deforestationHistoryDeters: [
        {
          title: `DETER {year}`,
          description: {
            text: `Total de Área Desmatada em {year}: `,
            value: `{area}`
          },
          carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
          layerData: {
            url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
            layers: `terrama2_6:view6,terrama2_73:view73`,
            transparent: true,
            format: `image/png`,
            version: `1.1.0`,
            time: `{dateYear}/{year}`,
            cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
            bbox: `{bbox}`,
            width: `404`,
            height: `431`,
            srs: `EPSG:4326`
          }
        }
      ],
      deforestationHistoryProdes: [
      {
        title: `PRODES {year}`,
        description: {
          text: `Total de Área Desmatada em {year}: `,
          value: `{area}`
        },
        carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
        layerData: {
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
          layers: `terrama2_6:view6,terrama2_86:view86`,
          transparent: true,
          format: `image/png`,
          version: `1.1.0`,
          time: `{dateYear}/{year}`,
          cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
          bbox: `{bbox}`,
          width: `404`,
          height: `431`,
          srs: `EPSG:4326`
        }
      }
    ],
      burningSpotlights: [
      {
        title: `{year}`,
        description: {
          text:``,
          value: `{spotlights}`
        },
        carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
        layerData: {
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
          layers: `terrama2_6:view6,terrama2_103:view103`,
          transparent: true,
          format: `image/png`,
          version: `1.1.0`,
          time: `{dateYear}/{year}`,
          cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
          bbox: `{bbox}`,
          width: `404`,
          height: `431`,
          srs: `EPSG:4674`
        }
      }
    ],
      burnedAreas: [
      {
        title: `{year}`,
        description: {
          text:``,
          value: `{burnedAreas}`
        },
        carRegisterColumn: `numero_do1;de_car_validado_sema_numero_do1`,
        layerData: {
          url: `http://www.terrama2.dpi.inpe.br/mpmt/geoserver/wms?service=WMS&version=1.1.0&request=GetMap`,
          layers: `terrama2_6:view6,terrama2_110:view110`,
          transparent: true,
          format: `image/png`,
          version: `1.1.0`,
          time: `{dateYear}/{year}`,
          cql_filter: `{propertyCqlFilter};{propertyCqlFilter}`,
          bbox: `{bbox}`,
          width: `404`,
          height: `431`,
          srs: `EPSG:4674`
        }
      }
    ]
    };
    try {
      return await Result.ok(synthesis);
    } catch (e) {
      return Result.err(e);
    }
  },

  async getInfoColumns (codGroup) {
    /*{
      DETER: {
        ${groupView[codGroup].tableOwner}_dd_deter_inpe_classname: {
          show: true,
          alias: `Classe`
        },
        ${groupView[codGroup].tableOwner}_dd_deter_inpe_orbitpoint: {
          show: true,
          alias: `Órbita/Ponto`
        },
        ${groupView[codGroup].tableOwner}_dd_deter_inpe_satellite: {
          show: true,
          alias: `Satélite`
        },
        ${groupView[codGroup].tableOwner}_dd_deter_inpe_sensor: {
          show: true,
          alias: `Sensor`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_area_ha_: {
          show: true,
          alias: `Área do imóvel (ha)`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_cpfcnpj: {
          show: true,
          alias: `CPF/CNPJ`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_municipio1: {
          show: true,
            alias: `Município`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_nome_da_p1: {
          show: true,
          alias: `Imóvel`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_nomepropri: {
          show: true,
          alias: `Proprietário`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_numero_do1: {
          show: true,
          alias: `CAR estadual`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_numero_do2: {
          show: true,
          alias: `CAR federal`
        },
        ${groupView[codGroup].tableOwner}_de_car_validado_sema_situacao_1: {
          show: true,
           alias: `Situação`
        },
        ${groupView[codGroup].tableOwner}_id: {
          show: false,
          alias: `${groupView[codGroup].tableOwner}_id`
        },
        ${groupView[codGroup][cod].tableOwner}_id: {
          show: false,
          alias: `${groupView[codGroup][cod].tableOwner}_id`
        },
        ${groupView[codGroup][cod].tableOwner}_id: {
          show: false,
            alias: `${groupView[codGroup][cod].tableOwner}_id`
        },
        ${groupView[codGroup][cod].tableOwner}_id: {
          show: false,
            alias: `${groupView[codGroup][cod].tableOwner}_id`
        },
        ${groupView[codGroup][cod].tableOwner}_id: {
          show: false,
          alias: ${groupView[codGroup][cod].tableOwner}_id
        },
        ${groupView[codGroup][cod].tableOwner}_id: {
          show: false,
          alias: `${groupView[codGroup][cod].tableOwner}_id`
        },
        ${groupView[codGroup][cod].tableOwner}_id: {
          show: false,
          alias: `${groupView[codGroup][cod].tableOwner}_id`
        },
        a_cardeter_ti_56_id: {
          show: false,
          alias: `a_cardeter_ti_56_id`
        },
        a_cardeter_uc_57_id: {
          show: false,
          alias: `a_cardeter_uc_57_id`
        },
        a_cardeter_usoant_51_id: {
          show: false,
          alias: `a_cardeter_usoant_51_id`
        },
        a_cardeter_usocon_55_id`: {
          show: false,
            alias: `a_cardeter_usocon_55_id`
        },
        `a_cardeter_veg_53_id`: {
          show: false,
            alias: `a_cardeter_veg_53_id`
        },
        `areamunkm`: {
          show: true,
            alias: `Área (km²)`
        },
        `areatotalk`: {
          show: false,
            alias: `areatotalk`
        },
        `areauckm`: {
          show: false,
            alias: `areauckm`
        },
        `calculated_area_ha`: {
          show: true,
            alias: `Área da interseção (ha)`
        },
        `classname`: {
          show: true,
            alias: `Classe`
        },
        `county`: {
          show: true,
            alias: `Município`
        },
        `date`: {
          show: true,
            alias: `Data`
        },
        `date_audit`: {
          show: true,
            alias: `Data auditoria`
        },
        `dd_deter_inpe_classname`: {
          show: true,
            alias: `Classe`
        },
        `dd_deter_inpe_orbitpoint`: {
          show: true,
            alias: `Órbita/Ponto`
        },
        `dd_deter_inpe_satellite`: {
          show: true,
            alias: `Satélite`
        },
        `dd_deter_inpe_sensor`: {
          show: true,
            alias: `Sensor`
        },
        `de_area_app_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_a_infraca1`: {
          show: false,
            alias: `de_area_desembargadas_sema_a_infraca1`
        },
        `de_area_desembargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_desembargadas_sema_area_1`: {
          show: true,
            alias: `Área (ha)`
        },
        `de_area_desembargadas_sema_coord_x`: {
          show: true,
            alias: `Longitude`
        },
        `de_area_desembargadas_sema_coord_y`: {
          show: true,
            alias: `Latitude`
        },
        `de_area_desembargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_desembargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_desembargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_desembargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_embargadas_sema_a_infrac`: {
          show: true,
            alias: `Auto infração`
        },
        `de_area_embargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_embargadas_sema_ano_desma1`: {
          show: true,
            alias: `Ano desmatamento`
        },
        `de_area_embargadas_sema_coord_x`: {
          show: true,
            alias: `Longitude`
        },
        `de_area_embargadas_sema_coord_y`: {
          show: true,
            alias: `Latitude`
        },
        `de_area_embargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_embargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_embargadas_sema_fonte`: {
          show: true,
            alias: `Fonte`
        },
        `de_area_embargadas_sema_mes`: {
          show: true,
            alias: `Mês`
        },
        `de_area_embargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_embargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_embargadas_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_area_embargadas_sema_t_embargo`: {
          show: true,
            alias: `T Embargo`
        },
        `de_area_reserva_legal_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_reserva_legal_nativa_sema_tipologia`: {
          show: true,
            alias: `Tipologia`
        },
        `de_area_uso_antropizado_solo_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_uso_consolidado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_vegetacao_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_autorizacao_desmate_sema_data_da_a1`: {
          show: true,
            alias: `Data DA-A1`
        },
        `de_autorizacao_desmate_sema_data_do_v1`: {
          show: true,
            alias: `Data DO-V1`
        },
        `de_autorizacao_desmate_sema_empreendi1`: {
          show: true,
            alias: `Empreedimento`
        },
        `de_autorizacao_desmate_sema_modelo`: {
          show: true,
            alias: `Modelo`
        },
        `de_autorizacao_desmate_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_autorizacao_desmate_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_autorizacao_desmate_sema_numero_do3`: {
          show: false,
            alias: `de_autorizacao_desmate_sema_numero_do3`
        },
        `de_autorizacao_queima_sema_data_apro1`: {
          show: true,
            alias: `Data aprovação`
        },
        `de_autorizacao_queima_sema_data_venc1`: {
          show: true,
            alias: `Vencimento`
        },
        `de_autorizacao_queima_sema_municipio`: {
          show: true,
            alias: `Município`
        },
        `de_autorizacao_queima_sema_proprieta1`: {
          show: true,
            alias: `Proprietário`
        },
        `de_autorizacao_queima_sema_protocolo1`: {
          show: true,
            alias: `Protocolo`
        },
        `de_autorizacao_queima_sema_razao_soc1`: {
          show: true,
            alias: `Razão social`
        },
        `de_autorizacao_queima_sema_responsav1`: {
          show: true,
            alias: `Responsável`
        },
        `de_autorizacao_queima_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_autorizacao_queima_sema_tipo`: {
          show: true,
            alias: `Tipo`
        },
        `de_autorizacao_queima_sema_titulo_nu1`: {
          show: true,
            alias: `Título`
        },
        `de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `de_terra_indigena_sema_ano_popul1`: {
          show: true,
            alias: `Ano população`
        },
        `de_terra_indigena_sema_data_inst`: {
          show: true,
            alias: `Data inst`
        },
        `de_terra_indigena_sema_etnia`: {
          show: true,
            alias: `Etnia`
        },
        `de_terra_indigena_sema_inst_lega1`: {
          show: true,
            alias: `Inst. legal`
        },
        `de_terra_indigena_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_terra_indigena_sema_nome_ti_a1`: {
          show: true,
            alias: `Nome TI`
        },
        `de_terra_indigena_sema_populacao`: {
          show: true,
            alias: `População`
        },
        `de_terra_indigena_sema_sit_jurid1`: {
          show: true,
            alias: `Situação jurídica`
        },
        `de_unidade_cons_sema_area_calc1`: {
          show: false,
            alias: `de_unidade_cons_sema_area_calc1`
        },
        `de_unidade_cons_sema_area_ofic1`: {
          show: true,
            alias: `Àrea oficial`
        },
        `de_unidade_cons_sema_ato_legal`: {
          show: true,
            alias: `Ato legal`
        },
        `de_unidade_cons_sema_categoria`: {
          show: true,
            alias: `Categoria`
        },
        `de_unidade_cons_sema_codigo_uc`: {
          show: false,
            alias: `de_unidade_cons_sema_codigo_uc`
        },
        `de_unidade_cons_sema_data_cada1`: {
          show: true,
            alias: `Data cadastro`
        },
        `de_unidade_cons_sema_grupo`: {
          show: true,
            alias: `Grupo`
        },
        `de_unidade_cons_sema_jurisdica1`: {
          show: true,
            alias: `Jurisdição`
        },
        `de_unidade_cons_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_unidade_cons_sema_operador`: {
          show: true,
            alias: `Operador`
        },
        `de_unidade_cons_sema_origem`: {
          show: true,
            alias: `Origem`
        },
        `de_unidade_cons_sema_plano_man1`: {
          show: true,
            alias: `Plano manejo`
        },
        `de_unidade_cons_sema_versao`: {
          show: true,
            alias: `Versão`
        },
        `execution_date`: {
          show: true,
            alias: `Data`
        },
        `geom`: {
          show: false,
            alias: `geom`
        },
        `gid`: {
          show: false,
            alias: `gid`
        },
        `intersect_id`: {
          show: false,
            alias: `intersect_id`
        },
        `intersection_geom`: {
          show: false,
            alias: `intersection_geom`
        },
        `lot`: {
          show: false,
            alias: `lot`
        },
        `monitored_id`: {
          show: false,
            alias: `monitored_id`
        },
        `orbitpoint`: {
          show: true,
            alias: `Órbita/Ponto`
        },
        `pid_a_cardeter`: {
          show: false,
            alias: `pid_a_cardeter`
        },
        `pid_a_cardeter_app`: {
          show: false,
            alias: `pid_a_cardeter_app`
        },
        `pid_a_cardeter_desemb`: {
          show: false,
            alias: `pid_a_cardeter_desemb`
        },
        `pid_a_cardeter_desmate`: {
          show: false,
            alias: `pid_a_cardeter_desmate`
        },
        `pid_a_cardeter_emb`: {
          show: false,
            alias: `pid_a_cardeter_emb`
        },
        `pid_a_cardeter_queima`: {
          show: false,
            alias: `pid_a_cardeter_queima`
        },
        `pid_a_cardeter_reserva`: {
          show: false,
            alias: `pid_a_cardeter_reserva`
        },
        `pid_a_cardeter_ti`: {
          show: false,
            alias: `pid_a_cardeter_ti`
        },
        `pid_a_cardeter_usoant`: {
          show: false,
            alias: `pid_a_cardeter_usoant`
        },
        `pid_a_cardeter_usocon`: {
          show: false,
            alias: `pid_a_cardeter_usocon`
        },
        `pid_a_cardeter_veg`: {
          show: false,
            alias: `pid_a_cardeter_veg`
        },
        `quadrant`: {
          show: false,
            alias: `quadrant`
        },
        `satellite`: {
          show: true,
            alias: `Satélite`
        },
        `sensor`: {
          show: true,
            alias: `Sensor`
        },
        `uc`: {
          show: false,
            alias: `uc`
        },
        `uf`: {
          show: false,
            alias: `uf`
        }
      },
      PRODES: {
        `a_carprodes_62_dd_prodes_inpe_class_name`: {
          show: true,
            alias: `Classe`
        },
        `a_carprodes_62_dd_prodes_inpe_mainclass`: {
          show: true,
            alias: `Classe`
        },
        `dd_prodes_inpe_ano`: {
          show: false,
            alias: `Ano`
        },
        `a_carprodes_62_de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `a_carprodes_62_de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `a_carprodes_62_de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `a_carprodes_62_de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `a_carprodes_62_de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `a_carprodes_62_de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `a_carprodes_62_de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `a_carprodes_62_de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `a_carprodes_62_id`: {
          show: false,
            alias: `a_carprodes_62_id`
        },
        `a_carprodes_app_63_id`: {
          show: false,
            alias: `a_carprodes_app_63_id`
        },
        `a_carprodes_desemb_71_id`: {
          show: false,
            alias: `a_carprodes_desemb_71_id`
        },
        `a_carprodes_desmate_72_id`: {
          show: false,
            alias: `a_carprodes_desmate_72_id`
        },
        `a_carprodes_emb_70_id`: {
          show: false,
            alias: `a_carprodes_emb_70_id`
        },
        `a_carprodes_queima_73_id`: {
          show: false,
            alias: `a_carprodes_queima_73_id`
        },
        `a_carprodes_reserva_65_id`: {
          show: false,
            alias: `a_carprodes_reserva_65_id`
        },
        `a_carprodes_ti_68_id`: {
          show: false,
            alias: `a_carprodes_ti_68_id`
        },
        `a_carprodes_uc_69_id`: {
          show: false,
            alias: `a_carprodes_uc_69_id`
        },
        `a_carprodes_usoant_64_id`: {
          show: false,
            alias: `a_carprodes_usoant_64_id`
        },
        `a_carprodes_usocon_67_id`: {
          show: false,
            alias: `a_carprodes_usocon_67_id`
        },
        `a_carprodes_veg_66_id`: {
          show: false,
            alias: `a_carprodes_veg_66_id`
        },
        `ano`: {
          show: true,
            alias: `Ano`
        },
        `areameters`: {
          show: true,
            alias: `Área (m²)`
        },
        `calculated_area_ha`: {
          show: true,
            alias: `Área da interseção (ha)`
        },
        `class_n_01`: {
          show: false,
            alias: `class_n_01`
        },
        `class_name`: {
          show: false,
            alias: `class_name`
        },
        `dd_prodes_inpe_class_name`: {
          show: true,
            alias: `Classe`
        },
        `dd_prodes_inpe_mainclass`: {
          show: true,
            alias: `Classe`
        },
        `de_area_app_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_a_infraca1`: {
          show: true,
            alias: `Auto infração`
        },
        `de_area_desembargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_desembargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_desembargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_desembargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_desembargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_embargadas_sema_a_infrac`: {
          show: true,
            alias: `Auto infração`
        },
        `de_area_embargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_embargadas_sema_ano_desma1`: {
          show: true,
            alias: `Ano desmatamento`
        },
        `de_area_embargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_embargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_embargadas_sema_fonte`: {
          show: true,
            alias: `Fonte`
        },
        `de_area_embargadas_sema_mes`: {
          show: true,
            alias: `Mês`
        },
        `de_area_embargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_embargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_embargadas_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_area_embargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_reserva_legal_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_reserva_legal_nativa_sema_tipologia`: {
          show: true,
            alias: `Tipologia`
        },
        `de_area_uso_antropizado_solo_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_uso_consolidado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_vegetacao_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_autorizacao_desmate_sema_data_da_a1`: {
          show: true,
            alias: `Data DA-A1`
        },
        `de_autorizacao_desmate_sema_data_do_v1`: {
          show: true,
            alias: `Data DO-V1`
        },
        `de_autorizacao_desmate_sema_empreendi1`: {
          show: true,
            alias: `Empreedimento`
        },
        `de_autorizacao_desmate_sema_modelo`: {
          show: true,
            alias: `Modelo`
        },
        `de_autorizacao_desmate_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_autorizacao_desmate_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_autorizacao_desmate_sema_numero_do3`: {
          show: false,
            alias: `de_autorizacao_desmate_sema_numero_do3`
        },
        `de_autorizacao_queima_sema_data_apro1`: {
          show: true,
            alias: `Data aprovação`
        },
        `de_autorizacao_queima_sema_data_venc1`: {
          show: true,
            alias: `Data vencimento`
        },
        `de_autorizacao_queima_sema_municipio`: {
          show: true,
            alias: `Município`
        },
        `de_autorizacao_queima_sema_proprieta1`: {
          show: true,
            alias: `Proprietário`
        },
        `de_autorizacao_queima_sema_protocolo1`: {
          show: true,
            alias: `Protocolo`
        },
        `de_autorizacao_queima_sema_razao_soc1`: {
          show: true,
            alias: `Razão social`
        },
        `de_autorizacao_queima_sema_responsav1`: {
          show: true,
            alias: `Responsável`
        },
        `de_autorizacao_queima_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_autorizacao_queima_sema_tipo`: {
          show: true,
            alias: `Tipo`
        },
        `de_autorizacao_queima_sema_titulo_nu1`: {
          show: true,
            alias: `Título`
        },
        `de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `de_terra_indigena_sema_ano_popul1`: {
          show: true,
            alias: `Ano população`
        },
        `de_terra_indigena_sema_data_inst`: {
          show: true,
            alias: `Data inst.`
        },
        `de_terra_indigena_sema_etnia`: {
          show: true,
            alias: `Etnia`
        },
        `de_terra_indigena_sema_inst_lega1`: {
          show: true,
            alias: `Inst. legal`
        },
        `de_terra_indigena_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_terra_indigena_sema_nome_ti_a1`: {
          show: true,
            alias: `Nome TI`
        },
        `de_terra_indigena_sema_populacao`: {
          show: true,
            alias: `População`
        },
        `de_terra_indigena_sema_sit_jurid1`: {
          show: true,
            alias: `Situação jurídica`
        },
        `de_unidade_cons_sema_area_calc1`: {
          show: false,
            alias: `de_unidade_cons_sema_area_calc1`
        },
        `de_unidade_cons_sema_area_ofic1`: {
          show: true,
            alias: `Área oficial`
        },
        `de_unidade_cons_sema_ato_legal`: {
          show: true,
            alias: `Ato legal`
        },
        `de_unidade_cons_sema_categoria`: {
          show: true,
            alias: `Categoria`
        },
        `de_unidade_cons_sema_codigo_uc`: {
          show: false,
            alias: `de_unidade_cons_sema_codigo_uc`
        },
        `de_unidade_cons_sema_data_cada1`: {
          show: true,
            alias: `Data cadastro`
        },
        `de_unidade_cons_sema_grupo`: {
          show: true,
            alias: `Grupo`
        },
        `de_unidade_cons_sema_jurisdica1`: {
          show: true,
            alias: `Jurísdição`
        },
        `de_unidade_cons_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_unidade_cons_sema_operador`: {
          show: true,
            alias: `Operador`
        },
        `de_unidade_cons_sema_origem`: {
          show: true,
            alias: `Origem`
        },
        `de_unidade_cons_sema_plano_man1`: {
          show: true,
            alias: `Plano manejo`
        },
        `de_unidade_cons_sema_versao`: {
          show: true,
            alias: `Versão`
        },
        `dsfnv`: {
          show: false,
            alias: `dsfnv`
        },
        `execution_date`: {
          show: true,
            alias: `Data`
        },
        `fid`: {
          show: false,
            alias: `fid`
        },
        `fid_new`: {
          show: false,
            alias: `fid_new`
        },
        `geom`: {
          show: false,
            alias: `geom`
        },
        `gid`: {
          show: false,
            alias: `gid`
        },
        `intersect_id`: {
          show: false,
            alias: `intersect_id`
        },
        `intersection_geom`: {
          show: false,
            alias: `intersection_geom`
        },
        `julday`: {
          show: false,
            alias: `julday`
        },
        `linkcolumn`: {
          show: false,
            alias: `linkcolumn`
        },
        `mainclass`: {
          show: true,
            alias: `Classe`
        },
        `monitored_id`: {
          show: false,
            alias: `monitored_id`
        },
        `pathrow`: {
          show: false,
            alias: `pathrow`
        },
        `pid_a_carprodes`: {
          show: false,
            alias: `pid_a_carprodes`
        },
        `pid_a_carprodes_app`: {
          show: false,
            alias: `pid_a_carprodes_app`
        },
        `pid_a_carprodes_desemb`: {
          show: false,
            alias: `pid_a_carprodes_desemb`
        },
        `pid_a_carprodes_desmate`: {
          show: false,
            alias: `pid_a_carprodes_desmate`
        },
        `pid_a_carprodes_emb`: {
          show: false,
            alias: `pid_a_carprodes_emb`
        },
        `pid_a_carprodes_queima`: {
          show: false,
            alias: `pid_a_carprodes_queima`
        },
        `pid_a_carprodes_reserva`: {
          show: false,
            alias: `pid_a_carprodes_reserva`
        },
        `pid_a_carprodes_ti`: {
          show: false,
            alias: `pid_a_carprodes_ti`
        },
        `pid_a_carprodes_uc`: {
          show: false,
            alias: `pid_a_carprodes_uc`
        },
        `pid_a_carprodes_usoant`: {
          show: false,
            alias: `pid_a_carprodes_usoant`
        },
        `pid_a_carprodes_usocon`: {
          show: false,
            alias: `pid_a_carprodes_usocon`
        },
        `pid_a_carprodes_veg`: {
          show: false,
            alias: `pid_a_carprodes_veg`
        },
        `scene_id`: {
          show: false,
            alias: `scene_id`
        },
        `uf`: {
          show: false,
            alias: `uf`
        },
        view_date: {
          show: true,
            alias: `Data`
        }
      },
      BURNED: {
        `a_carfocos_74_dd_focos_inpe_bioma`: {
          show: true,
            alias: `Bioma`
        },
        `a_carfocos_74_dd_focos_inpe_id_2`: {
          show: false,
            alias: `a_carfocos_74_dd_focos_inpe_id_2`
        },
        `a_carfocos_74_dd_focos_inpe_municipio`: {
          show: true,
            alias: `Município`
        },
        `a_carfocos_74_dd_focos_inpe_satelite`: {
          show: true,
            alias: `Satélite`
        },
        `a_carfocos_74_de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `a_carfocos_74_de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `a_carfocos_74_de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `a_carfocos_74_de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `a_carfocos_74_de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `a_carfocos_74_de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `a_carfocos_74_de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `a_carfocos_74_de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `a_carfocos_74_id`: {
          show: false,
            alias: `a_carfocos_74_id`
        },
        `a_carfocos_app_75_id`: {
          show: false,
            alias: `a_carfocos_app_75_id`
        },
        `a_carfocos_desemb_83_id`: {
          show: false,
            alias: `a_carfocos_desemb_83_id`
        },
        `a_carfocos_desmate_84_id`: {
          show: false,
            alias: `a_carfocos_desmate_84_id`
        },
        `a_carfocos_emb_82_id`: {
          show: false,
            alias: `a_carfocos_emb_82_id`
        },
        `a_carfocos_queima_85_id`: {
          show: false,
            alias: `a_carfocos_queima_85_id`
        },
        `a_carfocos_reserva_77_id`: {
          show: false,
            alias: `a_carfocos_reserva_77_id`
        },
        `a_carfocos_ti_80_id`: {
          show: false,
            alias: `a_carfocos_ti_80_id`
        },
        `a_carfocos_uc_81_id`: {
          show: false,
            alias: `a_carfocos_uc_81_id`
        },
        `a_carfocos_usoant_76_id`: {
          show: false,
            alias: `a_carfocos_usoant_76_id`
        },
        `a_carfocos_usocon_79_id`: {
          show: false,
            alias: `a_carfocos_usocon_79_id`
        },
        `a_carfocos_veg_78_id`: {
          show: false,
            alias: `a_carfocos_veg_78_id`
        },
        `bioma`: {
          show: true,
            alias: `Bioma`
        },
        `bioma_id`: {
          show: false,
            alias: `bioma_id`
        },
        `calculated_area_ha`: {
          show: true,
            alias: `Área da interseção (ha)`
        },
        `data_hora_gmt`: {
          show: true,
            alias: `Data`
        },
        `dd_focos_inpe_bioma`: {
          show: true,
            alias: `Bioma`
        },
        `dd_focos_inpe_id_2`: {
          show: false,
            alias: `dd_focos_inpe_id_2`
        },
        `dd_focos_inpe_municipio`: {
          show: true,
            alias: `Município`
        },
        `dd_focos_inpe_satelite`: {
          show: true,
            alias: `Satélite`
        },
        `de_area_app_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_a_infraca1`: {
          show: true,
            alias: `Auto infração`
        },
        `de_area_desembargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_desembargadas_sema_area_1`: {
          show: false,
            alias: `de_area_desembargadas_sema_area_1`
        },
        `de_area_desembargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_desembargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_desembargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_desembargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_embargadas_sema_a_infrac`: {
          show: true,
            alias: `Auto infração`
        },
        `de_area_embargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_embargadas_sema_ano_desma1`: {
          show: true,
            alias: `Ano desmatamento`
        },
        `de_area_embargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_embargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_embargadas_sema_fonte`: {
          show: true,
            alias: `Fonte`
        },
        `de_area_embargadas_sema_mes`: {
          show: true,
            alias: `Mês`
        },
        `de_area_embargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_embargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_embargadas_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_area_embargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_reserva_legal_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_uso_antropizado_solo_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_uso_consolidado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_autorizacao_desmate_sema_data_da_a1`: {
          show: true,
            alias: `Data DA-A1`
        },
        `de_autorizacao_desmate_sema_data_do_v1`: {
          show: true,
            alias: `Data DA-V1`
        },
        `de_autorizacao_desmate_sema_empreendi1`: {
          show: true,
            alias: `Empreendimento`
        },
        `de_autorizacao_desmate_sema_modelo`: {
          show: true,
            alias: `Modelo`
        },
        `de_autorizacao_desmate_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_autorizacao_desmate_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_autorizacao_desmate_sema_numero_do3`: {
          show: false,
            alias: `de_autorizacao_desmate_sema_numero_do3`
        },
        `de_autorizacao_queima_sema_data_apro1`: {
          show: true,
            alias: `Data aprovação`
        },
        `de_autorizacao_queima_sema_data_venc1`: {
          show: true,
            alias: `Data vencimento`
        },
        `de_autorizacao_queima_sema_municipio`: {
          show: true,
            alias: `Município`
        },
        `de_autorizacao_queima_sema_proprieta1`: {
          show: true,
            alias: `Proprietário`
        },
        `de_autorizacao_queima_sema_protocolo1`: {
          show: true,
            alias: `Protocolo`
        },
        `de_autorizacao_queima_sema_razao_soc1`: {
          show: true,
            alias: `Razão social`
        },
        `de_autorizacao_queima_sema_responsav1`: {
          show: true,
            alias: `Responsável`
        },
        `de_autorizacao_queima_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_autorizacao_queima_sema_tipo`: {
          show: true,
            alias: `Tipo`
        },
        `de_autorizacao_queima_sema_titulo_nu1`: {
          show: true,
            alias: `Título`
        },
        `de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `de_terra_indigena_sema_ano_popul1`: {
          show: true,
            alias: `Ano população`
        },
        `de_terra_indigena_sema_area_ha`: {
          show: true,
            alias: `Área (ha)`
        },
        `de_terra_indigena_sema_data_inst`: {
          show: true,
            alias: `Data inst.`
        },
        `de_terra_indigena_sema_etnia`: {
          show: true,
            alias: `Etnia`
        },
        `de_terra_indigena_sema_inst_lega1`: {
          show: true,
            alias: `Inst. legal`
        },
        `de_terra_indigena_sema_municipio`: {
          show: true,
            alias: `Município`
        },
        `de_terra_indigena_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_terra_indigena_sema_nome_ti_a1`: {
          show: true,
            alias: `Nome TI`
        },
        `de_terra_indigena_sema_populacao`: {
          show: true,
            alias: `População`
        },
        `de_terra_indigena_sema_sit_jurid1`: {
          show: true,
            alias: `Situação jurídica`
        },
        `de_unidade_cons_sema_area_calc1`: {
          show: false,
            alias: `de_unidade_cons_sema_area_calc1`
        },
        `de_unidade_cons_sema_area_ofic1`: {
          show: true,
            alias: `Oficial`
        },
        `de_unidade_cons_sema_ato_legal`: {
          show: true,
            alias: `Ato legal`
        },
        `de_unidade_cons_sema_categoria`: {
          show: true,
            alias: `Categoria`
        },
        `de_unidade_cons_sema_codigo_uc`: {
          show: false,
            alias: `de_unidade_cons_sema_codigo_uc`
        },
        `de_unidade_cons_sema_data_cada1`: {
          show: true,
            alias: `Data cadastro`
        },
        `de_unidade_cons_sema_grupo`: {
          show: true,
            alias: `Grupo`
        },
        `de_unidade_cons_sema_jurisdica1`: {
          show: true,
            alias: `Jurísdição`
        },
        `de_unidade_cons_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_unidade_cons_sema_operador`: {
          show: true,
            alias: `Operador`
        },
        `de_unidade_cons_sema_origem`: {
          show: true,
            alias: `Origem`
        },
        `de_unidade_cons_sema_plano_man1`: {
          show: true,
            alias: `Plano manejo`
        },
        `de_unidade_cons_sema_versao`: {
          show: true,
            alias: `Versão`
        },
        `estado`: {
          show: true,
            alias: `Estado`
        },
        `execution_date`: {
          show: true,
            alias: `Data`
        },
        `foco_id`: {
          show: false,
            alias: `foco_id`
        },
        `geometria`: {
          show: false,
            alias: `geometria`
        },
        `id_0`: {
          show: false,
            alias: `id_0`
        },
        `id_1`: {
          show: false,
            alias: `id_1`
        },
        `id_2`: {
          show: false,
            alias: `id_2`
        },
        `intersect_id`: {
          show: false,
            alias: `intersect_id`
        },
        `intersection_geom`: {
          show: false,
            alias: `intersection_geom`
        },
        `latitude`: {
          show: true,
            alias: `Latitude`
        },
        `longitude`: {
          show: false,
            alias: `Longitude`
        },
        `monitored_id`: {
          show: false,
            alias: `monitored_id`
        },
        `municipio`: {
          show: true,
            alias: `Município`
        },
        `pais`: {
          show: true,
            alias: `País`
        },
        `path_row`: {
          show: false,
            alias: `path_row`
        },
        `pid_a_carfocos`: {
          show: false,
            alias: `pid_a_carfocos`
        },
        `pid_a_carfocos_app`: {
          show: false,
            alias: `pid_a_carfocos_app`
        },
        `pid_a_carfocos_desemb`: {
          show: false,
            alias: `pid_a_carfocos_desemb`
        },
        `pid_a_carfocos_desmate`: {
          show: false,
            alias: `pid_a_carfocos_desmate`
        },
        `pid_a_carfocos_emb`: {
          show: false,
            alias: `pid_a_carfocos_emb`
        },
        `pid_a_carfocos_queima`: {
          show: false,
            alias: `pid_a_carfocos_queima`
        },
        `pid_a_carfocos_reserva`: {
          show: false,
            alias: `pid_a_carfocos_reserva`
        },
        `pid_a_carfocos_ti`: {
          show: false,
            alias: `pid_a_carfocos_ti`
        },
        `pid_a_carfocos_uc`: {
          show: false,
            alias: `pid_a_carfocos_uc`
        },
        `pid_a_carfocos_usoant`: {
          show: false,
            alias: `pid_a_carfocos_usoant`
        },
        `pid_a_carfocos_usocon`: {
          show: false,
            alias: `pid_a_carfocos_usocon`
        },
        `pid_a_carfocos_veg`: {
          show: false,
            alias: `pid_a_carfocos_veg`
        },
        `pid_dd_focos_inpe`: {
          show: false,
            alias: `pid_dd_focos_inpe`
        },
        `pid_focos_mt`: {
          show: false,
            alias: `pid_focos_mt`
        },
        `satelite`: {
          show: true,
            alias: `Satélite`
        }
      },
      BURNED_AREA: {
        `a_caraq_86_dd_area_queimada_inpe_data_anter`: {
          show: false,
            alias: `a_caraq_86_dd_area_queimada_inpe_data_anter`
        },
        `a_caraq_86_dd_area_queimada_inpe_data_pas`: {
          show: false,
            alias: `a_caraq_86_dd_area_queimada_inpe_data_pas`
        },
        `a_caraq_86_dd_area_queimada_inpe_ha`: {
          show: false,
            alias: `a_caraq_86_dd_area_queimada_inpe_ha`
        },
        `a_caraq_86_dd_area_queimada_inpe_id_cena_an`: {
          show: false,
            alias: `a_caraq_86_dd_area_queimada_inpe_id_cena_an`
        },
        `a_caraq_86_dd_area_queimada_inpe_km2`: {
          show: false,
            alias: `a_caraq_86_dd_area_queimada_inpe_km2`
        },
        `a_caraq_86_dd_area_queimada_inpe_nome_arq`: {
          show: false,
            alias: `a_caraq_86_dd_area_queimada_inpe_nome_arq`
        },
        `a_caraq_86_dd_area_queimada_inpe_orb_pto`: {
          show: true,
            alias: `Órbita/Ponto`
        },
        `a_caraq_86_de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `a_caraq_86_de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `a_caraq_86_de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `a_caraq_86_de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `a_caraq_86_de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `a_caraq_86_de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `a_caraq_86_de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `a_caraq_86_de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `a_caraq_86_id`: {
          show: false,
            alias: `a_caraq_86_id`
        },
        `a_caraq_app_87_id`: {
          show: false,
            alias: `a_caraq_app_87_id`
        },
        `a_caraq_desemb_95_id`: {
          show: false,
            alias: `a_caraq_desemb_95_id`
        },
        `a_caraq_desmate_96_id`: {
          show: false,
            alias: `a_caraq_desmate_96_id`
        },
        `a_caraq_emb_94_id`: {
          show: false,
            alias: `a_caraq_emb_94_id`
        },
        `a_caraq_queima_97_id`: {
          show: false,
            alias: `a_caraq_queima_97_id`
        },
        `a_caraq_reserva_89_id`: {
          show: false,
            alias: `a_caraq_reserva_89_id`
        },
        `a_caraq_ti_92_id`: {
          show: false,
            alias: `a_caraq_ti_92_id`
        },
        `a_caraq_uc_93_id`: {
          show: false,
            alias: `a_caraq_uc_93_id`
        },
        `a_caraq_usoant_88_id`: {
          show: false,
            alias: `a_caraq_usoant_88_id`
        },
        `a_caraq_usocon_91_id`: {
          show: false,
            alias: `a_caraq_usocon_91_id`
        },
        `a_caraq_veg_90_id`: {
          show: false,
            alias: `a_caraq_veg_90_id`
        },
        `calculated_area_ha`: {
          show: true,
            alias: `Área da interseção (ha)`
        },
        `dd_area_queimada_inpe_data_anter`: {
          show: false,
            alias: `dd_area_queimada_inpe_data_anter`
        },
        `dd_area_queimada_inpe_data_pas`: {
          show: false,
            alias: `dd_area_queimada_inpe_data_pas`
        },
        `dd_area_queimada_inpe_ha`: {
          show: false,
            alias: `dd_area_queimada_inpe_ha`
        },
        `dd_area_queimada_inpe_id_cena_an`: {
          show: false,
            alias: `dd_area_queimada_inpe_id_cena_an`
        },
        `dd_area_queimada_inpe_km2`: {
          show: false,
            alias: `dd_area_queimada_inpe_km2`
        },
        `dd_area_queimada_inpe_nome_arq`: {
          show: false,
            alias: `dd_area_queimada_inpe_nome_arq`
        },
        `dd_area_queimada_inpe_orb_pto`: {
          show: true,
            alias: `Órbita/Ponto`
        },
        `de_area_app_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_a_infraca1`: {
          show: false,
            alias: `de_area_desembargadas_sema_a_infraca1`
        },
        `de_area_desembargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_desembargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_desembargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_desembargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_desembargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_desembargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_embargadas_sema_a_infrac`: {
          show: true,
            alias: `Auto infração`
        },
        `de_area_embargadas_sema_ano`: {
          show: true,
            alias: `Ano`
        },
        `de_area_embargadas_sema_ano_desma1`: {
          show: true,
            alias: `Ano desmatamento`
        },
        `de_area_embargadas_sema_cpf`: {
          show: true,
            alias: `CPF`
        },
        `de_area_embargadas_sema_dano`: {
          show: true,
            alias: `Dano`
        },
        `de_area_embargadas_sema_fonte`: {
          show: true,
            alias: `FOnte`
        },
        `de_area_embargadas_sema_mes`: {
          show: true,
            alias: `Mês`
        },
        `de_area_embargadas_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_area_embargadas_sema_proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_embargadas_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_area_embargadas_sema_t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `de_area_reserva_legal_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_reserva_legal_nativa_sema_tipologia`: {
          show: true,
            alias: `Tipologia`
        },
        `de_area_uso_antropizado_solo_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_uso_consolidado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_area_vegetacao_nativa_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_autorizacao_desmate_sema_data_da_a1`: {
          show: true,
            alias: `Data DA-A1`
        },
        `de_autorizacao_desmate_sema_data_do_v1`: {
          show: true,
            alias: `Data DO-V1`
        },
        `de_autorizacao_desmate_sema_empreendi1`: {
          show: true,
            alias: `Empreendimento`
        },
        `de_autorizacao_desmate_sema_modelo`: {
          show: true,
            alias: `Modelo`
        },
        `de_autorizacao_desmate_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_autorizacao_desmate_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_autorizacao_desmate_sema_numero_do3`: {
          show: false,
            alias: `de_autorizacao_desmate_sema_numero_do3`
        },
        `de_autorizacao_queima_sema_data_apro1`: {
          show: true,
            alias: `Data aprovação`
        },
        `de_autorizacao_queima_sema_data_venc1`: {
          show: true,
            alias: `Data vencimento`
        },
        `de_autorizacao_queima_sema_municipio`: {
          show: true,
            alias: `Município`
        },
        `de_autorizacao_queima_sema_proprieta1`: {
          show: true,
            alias: `Proprietário`
        },
        `de_autorizacao_queima_sema_protocolo1`: {
          show: true,
            alias: `Protocolo`
        },
        `de_autorizacao_queima_sema_razao_soc1`: {
          show: true,
            alias: `Razão social`
        },
        `de_autorizacao_queima_sema_responsav1`: {
          show: true,
            alias: `Responsável`
        },
        `de_autorizacao_queima_sema_situacao`: {
          show: true,
            alias: `Situação`
        },
        `de_autorizacao_queima_sema_tipo`: {
          show: true,
            alias: `Tipo`
        },
        `de_autorizacao_queima_sema_titulo_nu1`: {
          show: true,
            alias: `Título`
        },
        `de_car_validado_sema_area_ha_`: {
          show: true,
            alias: `Área do imóvel (ha)`
        },
        `de_car_validado_sema_cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `de_car_validado_sema_municipio1`: {
          show: true,
            alias: `Município`
        },
        `de_car_validado_sema_nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `de_car_validado_sema_nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `de_car_validado_sema_numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `de_car_validado_sema_numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `de_car_validado_sema_situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `de_terra_indigena_sema_ano_popul1`: {
          show: true,
            alias: `Ano população`
        },
        `de_terra_indigena_sema_area_ha`: {
          show: true,
            alias: `Área (ha)`
        },
        `de_terra_indigena_sema_data_inst`: {
          show: true,
            alias: `Data inst.`
        },
        `de_terra_indigena_sema_etnia`: {
          show: true,
            alias: `Etnia`
        },
        `de_terra_indigena_sema_inst_lega1`: {
          show: true,
            alias: `Inst. legal`
        },
        `de_terra_indigena_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_terra_indigena_sema_nome_ti_a1`: {
          show: true,
            alias: `Nome TI`
        },
        `de_terra_indigena_sema_populacao`: {
          show: true,
            alias: `População`
        },
        `de_terra_indigena_sema_sit_jurid1`: {
          show: true,
            alias: `Situação jurídica`
        },
        `de_unidade_cons_sema_area_calc1`: {
          show: false,
            alias: `de_unidade_cons_sema_area_calc1`
        },
        `de_unidade_cons_sema_area_ofic1`: {
          show: false,
            alias: `de_unidade_cons_sema_area_ofic1`
        },
        `de_unidade_cons_sema_ato_legal`: {
          show: true,
            alias: `Ato legal`
        },
        `de_unidade_cons_sema_categoria`: {
          show: true,
            alias: `Categoria`
        },
        `de_unidade_cons_sema_codigo_uc`: {
          show: false,
            alias: `de_unidade_cons_sema_codigo_uc`
        },
        `de_unidade_cons_sema_data_cada1`: {
          show: true,
            alias: `Data cadastro`
        },
        `de_unidade_cons_sema_grupo`: {
          show: true,
            alias: `Grupo`
        },
        `de_unidade_cons_sema_jurisdica1`: {
          show: true,
            alias: `Jurísdição`
        },
        `de_unidade_cons_sema_nome`: {
          show: true,
            alias: `Nome`
        },
        `de_unidade_cons_sema_operador`: {
          show: true,
            alias: `Operador`
        },
        `de_unidade_cons_sema_origem`: {
          show: true,
            alias: `Origem`
        },
        `de_unidade_cons_sema_plano_man1`: {
          show: true,
            alias: `Plano manejo`
        },
        `de_unidade_cons_sema_versao`: {
          show: true,
            alias: `Versão`
        },
        `execution_date`: {
          show: true,
            alias: `Data`
        },
        `intersect_id`: {
          show: false,
            alias: `intersect_id`
        },
        `intersection_geom`: {
          show: false,
            alias: `intersection_geom`
        },
        `monitored_id`: {
          show: false,
            alias: `monitored_id`
        },
        `pid_a_caraq`: {
          show: false,
            alias: `pid_a_caraq`
        },
        `pid_a_caraq_app`: {
          show: false,
            alias: `pid_a_caraq_app`
        },
        `pid_a_caraq_desmate`: {
          show: false,
            alias: `pid_a_caraq_desmate`
        },
        `pid_a_caraq_emb`: {
          show: false,
            alias: `pid_a_caraq_emb`
        },
        `pid_a_caraq_queima`: {
          show: false,
            alias: `pid_a_caraq_queima`
        },
        `pid_a_caraq_reserva`: {
          show: false,
            alias: `pid_a_caraq_reserva`
        },
        `pid_a_caraq_ti`: {
          show: false,
            alias: `pid_a_caraq_ti`
        },
        `pid_a_caraq_uc`: {
          show: false,
            alias: `pid_a_caraq_uc`
        },
        `pid_a_caraq_usoant`: {
          show: false,
            alias: `pid_a_caraq_usoant`
        },
        `pid_a_caraq_usocon`: {
          show: false,
            alias: `pid_a_caraq_usocon`
        },
        `pid_a_caraq_veg`: {
          show: false,
            alias: `pid_a_caraq_veg`
        }
      },
      STATIC: {
        `a_infrac`: {
          show: false,
            alias: `a_infrac`
        },
        `a_infraca1`: {
          show: false,
            alias: `a_infraca1`
        },
        `ano`: {
          show: true,
            alias: `Ano`
        },
        `ano_desma1`: {
          show: true,
            alias: `Ano desmatamento`
        },
        `ano_popul1`: {
          show: true,
            alias: `Ano população`
        },
        `area_1`: {
          show: false,
            alias: `area_1`
        },
        `area_calc1`: {
          show: false,
            alias: `area_calc1`
        },
        `area_ha`: {
          show: true,
            alias: `Área (ha)`
        },
        `area_ha_`: {
          show: true,
            alias: `Área (ha)`
        },
        `area_km2`: {
          show: true,
            alias: `Área (km²)`
        },
        `area__m2_`: {
          show: true,
            alias: `Área (m²)`
        },
        `area_ofic1`: {
          show: false,
            alias: `area_ofic1`
        },
        `ato_legal`: {
          show: true,
            alias: `Ato legal`
        },
        `bioma`: {
          show: true,
            alias: `Bioma`
        },
        `categoria`: {
          show: true,
            alias: `Categoria`
        },
        `cd_bioma`: {
          show: true,
            alias: `Bioma`
        },
        `cd_geocme`: {
          show: false,
            alias: `cd_geocme`
        },
        `cd_geocmi`: {
          show: false,
            alias: `cd_geocmi`
        },
        `cd_geocuf`: {
          show: false,
            alias: `cd_geocuf`
        },
        `codigo`: {
          show: false,
            alias: `codigo`
        },
        `codigotipo`: {
          show: false,
            alias: `codigotipo`
        },
        `codigo_uc`: {
          show: false,
            alias: `codigo_uc`
        },
        `comarca`: {
          show: true,
            alias: `Comarca`
        },
        `contato`: {
          show: true,
            alias: `Contato`
        },
        `coord_x`: {
          show: true,
            alias: `Longitude`
        },
        `coord_y`: {
          show: true,
            alias: `Latitude`
        },
        `cpf`: {
          show: true,
            alias: `CPF`
        },
        `cpfcnpj`: {
          show: true,
            alias: `CPF/CNPJ`
        },
        `dano`: {
          show: true,
            alias: `Dano`
        },
        `data_apro1`: {
          show: true,
            alias: `Data aprovação`
        },
        `data_cada1`: {
          show: true,
            alias: `Data cadastro`
        },
        `data_da_a1`: {
          show: true,
            alias: `Data DA-A1`
        },
        `data_de_a1`: {
          show: true,
            alias: `Data DA-A1`
        },
        `data_de_e1`: {
          show: true,
            alias: `Data DE-E1`
        },
        `data_do_v1`: {
          show: true,
            alias: `Data DO-V1`
        },
        `data_inst`: {
          show: true,
            alias: `Data inst.`
        },
        `data_venc1`: {
          show: true,
            alias: `Data vencimento`
        },
        `desc_coinc`: {
          show: false,
            alias: `desc_coinc`
        },
        `ds_ato_leg`: {
          show: true,
            alias: `Ato legal`
        },
        `ds_coinc`: {
          show: false,
            alias: `ds_coinc`
        },
        `ds_jurisdi`: {
          show: true,
            alias: `Jurisdição`
        },
        `ds_legenda`: {
          show: false,
            alias: `ds_legenda`
        },
        `ds_local_f`: {
          show: false,
            alias: `ds_local_f`
        },
        `ds_local_i`: {
          show: false,
            alias: `ds_local_i`
        },
        `ds_obra`: {
          show: false,
            alias: `ds_obra`
        },
        `ds_superfi`: {
          show: false,
            alias: `ds_superfi`
        },
        `ds_sup_fed`: {
          show: false,
            alias: `ds_sup_fed`
        },
        `ds_tipo_ad`: {
          show: false,
            alias: `ds_tipo_ad`
        },
        `empreendi1`: {
          show: false,
            alias: `empreendi1`
        },
        `entrancia`: {
          show: true,
            alias: `Entrancia`
        },
        `est_coinc`: {
          show: false,
            alias: `est_coinc`
        },
        `etnia`: {
          show: true,
            alias: `Etnia`
        },
        `fid_promot`: {
          show: false,
            alias: `fid_promot`
        },
        `fonte`: {
          show: true,
            alias: `Fonte`
        },
        `geocodigo`: {
          show: false,
            alias: `geocodigo`
        },
        `geom`: {
          show: false,
            alias: `geom`
        },
        `gid`: {
          show: false,
            alias: `gid`
        },
        `grupo`: {
          show: true,
            alias: `Grupo`
        },
        `id`: {
          show: false,
            alias: `id`
        },
        `idcar`: {
          show: false,
            alias: `idcar`
        },
        `id_munic`: {
          show: false,
            alias: `id_munic`
        },
        `id_trecho_`: {
          show: false,
            alias: `id_trecho_`
        },
        `id_versao`: {
          show: false,
            alias: `id_versao`
        },
        `inst_lega1`: {
          show: true,
            alias: `Inst. legal`
        },
        `jurisdica1`: {
          show: true,
            alias: `Jurisdição`
        },
        `km`: {
          show: false,
            alias: `km`
        },
        `lat`: {
          show: false,
            alias: `lat`
        },
        `leg_multim`: {
          show: false,
            alias: `leg_multim`
        },
        `licenciam1`: {
          show: false,
            alias: `licenciam1`
        },
        `lon`: {
          show: false,
            alias: `lon`
        },
        `marcador`: {
          show: false,
            alias: `marcador`
        },
        `mes`: {
          show: true,
            alias: `Mês`
        },
        `modelo`: {
          show: true,
            alias: `Modelo`
        },
        `modulo_fi1`: {
          show: false,
            alias: `modulo_fi1`
        },
        `municipio`: {
          show: true,
            alias: `Município`
        },
        `municipio1`: {
          show: true,
            alias: `Município`
        },
        `nm_estado`: {
          show: true,
            alias: `Estado`
        },
        `nm_meso`: {
          show: true,
            alias: `Mesoregião`
        },
        `nm_micro`: {
          show: true,
            alias: `Microregião`
        },
        `nm_regiao`: {
          show: true,
            alias: `Região`
        },
        `nm_tipo_tr`: {
          show: false,
            alias: `nm_tipo_tr`
        },
        `nome`: {
          show: true,
            alias: `Nome`
        },
        `nome_da_p1`: {
          show: true,
            alias: `Imóvel`
        },
        `nomepropri`: {
          show: true,
            alias: `Proprietário`
        },
        `nome_ti_a1`: {
          show: true,
            alias: `Nome TI`
        },
        `numero_do1`: {
          show: true,
            alias: `CAR estadual`
        },
        `numero_do2`: {
          show: true,
            alias: `CAR federal`
        },
        `numero_do3`: {
          show: false,
            alias: `numero_do3`
        },
        `objectid`: {
          show: false,
            alias: `objectid`
        },
        `operador`: {
          show: true,
            alias: `Operador`
        },
        `orbita`: {
          show: true,
            alias: `Órbita`
        },
        `origem`: {
          show: true,
            alias: `Origem`
        },
        `path_row`: {
          show: false,
            alias: `path_row`
        },
        `pdf_docum1`: {
          show: false,
            alias: `pdf_docum1`
        },
        `pjbh`: {
          show: false,
            alias: `pjbh`
        },
        `plano_man1`: {
          show: false,
            alias: `plano_man1`
        },
        `ponto`: {
          show: true,
            alias: `Ponto`
        },
        `populacao`: {
          show: true,
            alias: `População`
        },
        `promotoria`: {
          show: true,
            alias: `Promotoria`
        },
        `proprieda1`: {
          show: true,
            alias: `Imóvel`
        },
        `proprieta1`: {
          show: true,
            alias: `Proprietário`
        },
        `protocolo1`: {
          show: true,
            alias: `Protocolo`
        },
        `ps1_ar_ha`: {
          show: false,
            alias: `ps1_ar_ha`
        },
        `ps1_ar_km2`: {
          show: false,
            alias: `ps1_ar_km2`
        },
        `ps1_cd`: {
          show: false,
            alias: `ps1_cd`
        },
        `ps1_gm_are`: {
          show: false,
            alias: `ps1_gm_are`
        },
        `ps1_gm_per`: {
          show: false,
            alias: `ps1_gm_per`
        },
        `ps1_gm_pol`: {
          show: false,
            alias: `ps1_gm_pol`
        },
        `ps1_nm`: {
          show: true,
            alias: `Nome`
        },
        `ps1_rhi_cd`: {
          show: false,
            alias: `ps1_rhi_cd`
        },
        `razao_soc1`: {
          show: true,
            alias: `Razão social`
        },
        `responsav1`: {
          show: true,
            alias: `Responsável`
        },
        `sg_legenda`: {
          show: false,
            alias: `sg_legenda`
        },
        `sg_tipo_tr`: {
          show: false,
            alias: `sg_tipo_tr`
        },
        `sg_uf`: {
          show: false,
            alias: `sg_uf`
        },
        `shape_are1`: {
          show: false,
            alias: `shape_are1`
        },
        `shape_area`: {
          show: false,
            alias: `shape_area`
        },
        `shape_le_1`: {
          show: false,
            alias: `shape_le_1`
        },
        `shape_len1`: {
          show: false,
            alias: `shape_len1`
        },
        `shape_leng`: {
          show: false,
            alias: `shape_leng`
        },
        `sit_jurid1`: {
          show: true,
            alias: `Situação jurídica`
        },
        `situacao`: {
          show: true,
            alias: `Situação`
        },
        `situacao_1`: {
          show: true,
            alias: `Situação`
        },
        `sup_est_co`: {
          show: false,
            alias: `sup_est_co`
        },
        `t_embargo`: {
          show: true,
            alias: `T. Embargo`
        },
        `tipo`: {
          show: true,
            alias: `Tipo`
        },
        `tipologia`: {
          show: true,
            alias: `Tipologia`
        },
        `titulo_nu1`: {
          show: true,
            alias: `Título`
        },
        `ul`: {
          show: false,
            alias: `ul`
        },
        `unidade_d1`: {
          show: false,
            alias: `ul`
        },
        `versao`: {
          show: true,
            alias: `Versão`
        },
        `versao_snv`: {
          show: false,
            alias: `versao_snv`
        },
        `vl_br`: {
          show: false,
            alias: `vl_br`
        },
        `vl_codigo`: {
          show: false,
            alias: `vl_codigo`
        },
        `vl_extensa`: {
          show: false,
            alias: `vl_extensa`
        },
        `vl_km_fina`: {
          show: false,
            alias: `vl_km_fina`
        },
        `vl_km_inic`: {
          show: false,
            alias: `vl_km_inic`
        }
      },
      DYNAMIC: {
        `ano`: {
          show: true,
            alias: `Ano`
        },
        `areameters`: {
          show: true,
            alias: `Área (m²)`
        },
        `areamunkm`: {
          show: false,
            alias: `areamunkm`
        },
        `areatotalk`: {
          show: false,
            alias: `areatotalk`
        },
        `areauckm`: {
          show: false,
            alias: `areauckm`
        },
        `bioma`: {
          show: true,
            alias: `Bioma`
        },
        `bioma_id`: {
          show: false,
            alias: `bioma_id`
        },
        `class_n_01`: {
          show: false,
            alias: `class_n_01`
        },
        `classname`: {
          show: true,
            alias: `Classe`
        },
        `class_name`: {
          show: true,
            alias: `Classe`
        },
        `county`: {
          show: true,
            alias: `Município`
        },
        `data_anter`: {
          show: false,
            alias: `data_anter`
        },
        `data_hora_gmt`: {
          show: true,
            alias: `Data`
        },
        `data_pas`: {
          show: false,
            alias: `data_pas`
        },
        `date`: {
          show: true,
            alias: `Data`
        },
        `date_audit`: {
          show: true,
            alias: `Data auditoria`
        },
        `dsfnv`: {
          show: false,
            alias: `dsfnv`
        },
        `estado`: {
          show: true,
            alias: `Estado`
        },
        `fid`: {
          show: false,
            alias: `fid`
        },
        `fid_new`: {
          show: false,
            alias: `fid_new`
        },
        `foco_id`: {
          show: false,
            alias: `foco_id`
        },
        `geom`: {
          show: false,
            alias: `geom`
        },
        `geometria`: {
          show: false,
            alias: `geometria`
        },
        `gid`: {
          show: false,
            alias: `gid`
        },
        `ha`: {
          show: false,
            alias: `ha`
        },
        `id`: {
          show: false,
            alias: `id`
        },
        `id_0`: {
          show: false,
            alias: `id_0`
        },
        `id_1`: {
          show: false,
            alias: `id_1`
        },
        `id_2`: {
          show: false,
            alias: `id_2`
        },
        `id_cena_an`: {
          show: false,
            alias: `id_cena_an`
        },
        `julday`: {
          show: false,
            alias: `julday`
        },
        `km2`: {
          show: false,
            alias: `km2`
        },
        `latitude`: {
          show: false,
            alias: `latitude`
        },
        `linkcolumn`: {
          show: false,
            alias: `linkcolumn`
        },
        `longitude`: {
          show: false,
            alias: `longitude`
        },
        `lot`: {
          show: false,
            alias: `lot`
        },
        `mainclass`: {
          show: true,
            alias: `Classe`
        },
        `municipio`: {
          show: true,
            alias: `Município`
        },
        `nome_arq`: {
          show: false,
            alias: `nome_arq`
        },
        `ogr_geometry`: {
          show: false,
            alias: `ogr_geometry`
        },
        `orbitpoint`: {
          show: true,
            alias: `Órbita/Ponto`
        },
        `orb_pto`: {
          show: true,
            alias: `Órbita/Ponto`
        },
        `pais`: {
          show: false,
            alias: `pais`
        },
        `pathrow`: {
          show: false,
            alias: `pathrow`
        },
        `path_row`: {
          show: false,
            alias: `path_row`
        },
        `pid_dd_focos_inpe`: {
          show: false,
            alias: `pid_dd_focos_inpe`
        },
        `pid_focos_mt`: {
          show: false,
            alias: `pid_focos_mt`
        },
        `quadrant`: {
          show: false,
            alias: `quadrant`
        },
        `satelite`: {
          show: true,
            alias: `Satélite`
        },
        `satellite`: {
          show: true,
            alias: `Satélite`
        },
        `scene_id`: {
          show: false,
            alias: `scene_id`
        },
        `sensor`: {
          show: true,
            alias: `Sensor`
        },
        `uc`: {
          show: false,
            alias: `uc`
        },
        uf: {
          show: false,
            alias: `uf`
        },
        view_date: {
          show: true,
          alias: `Data`
        }
      }*/
    const infoColumns ={
      'DETER': {
        'a_cardeter_49_dd_deter_inpe_classname': {
          'show': true,
          'alias': 'Classe'
        },
        'a_cardeter_49_dd_deter_inpe_orbitpoint': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'a_cardeter_49_dd_deter_inpe_satellite': {
          'show': true,
          'alias': 'Satélite'
        },
        'a_cardeter_49_dd_deter_inpe_sensor': {
          'show': true,
          'alias': 'Sensor'
        },
        'a_cardeter_49_de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'a_cardeter_49_de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'a_cardeter_49_de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'a_cardeter_49_de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'a_cardeter_49_de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'a_cardeter_49_de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'a_cardeter_49_de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'a_cardeter_49_de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'a_cardeter_49_id': {
          'show': false,
          'alias': 'a_cardeter_49_id'
        },
        'a_cardeter_app_50_id': {
          'show': false,
          'alias': 'a_cardeter_app_50_id'
        },
        'a_cardeter_desemb_59_id': {
          'show': false,
          'alias': 'a_cardeter_desemb_59_id'
        },
        'a_cardeter_desmate_60_id': {
          'show': false,
          'alias': 'a_cardeter_desmate_60_id'
        },
        'a_cardeter_emb_58_id': {
          'show': false,
          'alias': 'a_cardeter_emb_58_id'
        },
        'a_cardeter_queima_61_id': {
          'show': false,
          'alias': 'a_cardeter_queima_61_id'
        },
        'a_cardeter_reserva_52_id': {
          'show': false,
          'alias': 'a_cardeter_reserva_52_id'
        },
        'a_cardeter_ti_56_id': {
          'show': false,
          'alias': 'a_cardeter_ti_56_id'
        },
        'a_cardeter_uc_57_id': {
          'show': false,
          'alias': 'a_cardeter_uc_57_id'
        },
        'a_cardeter_usoant_51_id': {
          'show': false,
          'alias': 'a_cardeter_usoant_51_id'
        },
        'a_cardeter_usocon_55_id': {
          'show': false,
          'alias': 'a_cardeter_usocon_55_id'
        },
        'a_cardeter_veg_53_id': {
          'show': false,
          'alias': 'a_cardeter_veg_53_id'
        },
        'areamunkm': {
          'show': true,
          'alias': 'Área (km²)'
        },
        'areatotalk': {
          'show': false,
          'alias': 'areatotalk'
        },
        'areauckm': {
          'show': false,
          'alias': 'areauckm'
        },
        'calculated_area_ha': {
          'show': true,
          'alias': 'Área da interseção (ha)'
        },
        'classname': {
          'show': true,
          'alias': 'Classe'
        },
        'county': {
          'show': true,
          'alias': 'Município'
        },
        'date': {
          'show': true,
          'alias': 'Data'
        },
        'date_audit': {
          'show': true,
          'alias': 'Data auditoria'
        },
        'dd_deter_inpe_classname': {
          'show': true,
          'alias': 'Classe'
        },
        'dd_deter_inpe_orbitpoint': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'dd_deter_inpe_satellite': {
          'show': true,
          'alias': 'Satélite'
        },
        'dd_deter_inpe_sensor': {
          'show': true,
          'alias': 'Sensor'
        },
        'de_area_app_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_a_infraca1': {
          'show': false,
          'alias': 'de_area_desembargadas_sema_a_infraca1'
        },
        'de_area_desembargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_desembargadas_sema_area_1': {
          'show': true,
          'alias': 'Área (ha)'
        },
        'de_area_desembargadas_sema_coord_x': {
          'show': true,
          'alias': 'Longitude'
        },
        'de_area_desembargadas_sema_coord_y': {
          'show': true,
          'alias': 'Latitude'
        },
        'de_area_desembargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_desembargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_desembargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_desembargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_embargadas_sema_a_infrac': {
          'show': true,
          'alias': 'Auto infração'
        },
        'de_area_embargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_embargadas_sema_ano_desma1': {
          'show': true,
          'alias': 'Ano desmatamento'
        },
        'de_area_embargadas_sema_coord_x': {
          'show': true,
          'alias': 'Longitude'
        },
        'de_area_embargadas_sema_coord_y': {
          'show': true,
          'alias': 'Latitude'
        },
        'de_area_embargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_embargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_embargadas_sema_fonte': {
          'show': true,
          'alias': 'Fonte'
        },
        'de_area_embargadas_sema_mes': {
          'show': true,
          'alias': 'Mês'
        },
        'de_area_embargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_embargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_embargadas_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_area_embargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T Embargo'
        },
        'de_area_reserva_legal_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_reserva_legal_nativa_sema_tipologia': {
          'show': true,
          'alias': 'Tipologia'
        },
        'de_area_uso_antropizado_solo_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_uso_consolidado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_vegetacao_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_autorizacao_desmate_sema_data_da_a1': {
          'show': true,
          'alias': 'Data DA-A1'
        },
        'de_autorizacao_desmate_sema_data_do_v1': {
          'show': true,
          'alias': 'Data DO-V1'
        },
        'de_autorizacao_desmate_sema_empreendi1': {
          'show': true,
          'alias': 'Empreedimento'
        },
        'de_autorizacao_desmate_sema_modelo': {
          'show': true,
          'alias': 'Modelo'
        },
        'de_autorizacao_desmate_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_autorizacao_desmate_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_autorizacao_desmate_sema_numero_do3': {
          'show': false,
          'alias': 'de_autorizacao_desmate_sema_numero_do3'
        },
        'de_autorizacao_queima_sema_data_apro1': {
          'show': true,
          'alias': 'Data aprovação'
        },
        'de_autorizacao_queima_sema_data_venc1': {
          'show': true,
          'alias': 'Vencimento'
        },
        'de_autorizacao_queima_sema_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'de_autorizacao_queima_sema_proprieta1': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_autorizacao_queima_sema_protocolo1': {
          'show': true,
          'alias': 'Protocolo'
        },
        'de_autorizacao_queima_sema_razao_soc1': {
          'show': true,
          'alias': 'Razão social'
        },
        'de_autorizacao_queima_sema_responsav1': {
          'show': true,
          'alias': 'Responsável'
        },
        'de_autorizacao_queima_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_autorizacao_queima_sema_tipo': {
          'show': true,
          'alias': 'Tipo'
        },
        'de_autorizacao_queima_sema_titulo_nu1': {
          'show': true,
          'alias': 'Título'
        },
        'de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'de_terra_indigena_sema_ano_popul1': {
          'show': true,
          'alias': 'Ano população'
        },
        'de_terra_indigena_sema_data_inst': {
          'show': true,
          'alias': 'Data inst'
        },
        'de_terra_indigena_sema_etnia': {
          'show': true,
          'alias': 'Etnia'
        },
        'de_terra_indigena_sema_inst_lega1': {
          'show': true,
          'alias': 'Inst. legal'
        },
        'de_terra_indigena_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_terra_indigena_sema_nome_ti_a1': {
          'show': true,
          'alias': 'Nome TI'
        },
        'de_terra_indigena_sema_populacao': {
          'show': true,
          'alias': 'População'
        },
        'de_terra_indigena_sema_sit_jurid1': {
          'show': true,
          'alias': 'Situação jurídica'
        },
        'de_unidade_cons_sema_area_calc1': {
          'show': false,
          'alias': 'de_unidade_cons_sema_area_calc1'
        },
        'de_unidade_cons_sema_area_ofic1': {
          'show': true,
          'alias': 'Àrea oficial'
        },
        'de_unidade_cons_sema_ato_legal': {
          'show': true,
          'alias': 'Ato legal'
        },
        'de_unidade_cons_sema_categoria': {
          'show': true,
          'alias': 'Categoria'
        },
        'de_unidade_cons_sema_codigo_uc': {
          'show': false,
          'alias': 'de_unidade_cons_sema_codigo_uc'
        },
        'de_unidade_cons_sema_data_cada1': {
          'show': true,
          'alias': 'Data cadastro'
        },
        'de_unidade_cons_sema_grupo': {
          'show': true,
          'alias': 'Grupo'
        },
        'de_unidade_cons_sema_jurisdica1': {
          'show': true,
          'alias': 'Jurisdição'
        },
        'de_unidade_cons_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_unidade_cons_sema_operador': {
          'show': true,
          'alias': 'Operador'
        },
        'de_unidade_cons_sema_origem': {
          'show': true,
          'alias': 'Origem'
        },
        'de_unidade_cons_sema_plano_man1': {
          'show': true,
          'alias': 'Plano manejo'
        },
        'de_unidade_cons_sema_versao': {
          'show': true,
          'alias': 'Versão'
        },
        'execution_date': {
          'show': true,
          'alias': 'Data'
        },
        'geom': {
          'show': false,
          'alias': 'geom'
        },
        'gid': {
          'show': false,
          'alias': 'gid'
        },
        'intersect_id': {
          'show': false,
          'alias': 'intersect_id'
        },
        'intersection_geom': {
          'show': false,
          'alias': 'intersection_geom'
        },
        'lot': {
          'show': false,
          'alias': 'lot'
        },
        'monitored_id': {
          'show': false,
          'alias': 'monitored_id'
        },
        'orbitpoint': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'pid_a_cardeter': {
          'show': false,
          'alias': 'pid_a_cardeter'
        },
        'pid_a_cardeter_app': {
          'show': false,
          'alias': 'pid_a_cardeter_app'
        },
        'pid_a_cardeter_desemb': {
          'show': false,
          'alias': 'pid_a_cardeter_desemb'
        },
        'pid_a_cardeter_desmate': {
          'show': false,
          'alias': 'pid_a_cardeter_desmate'
        },
        'pid_a_cardeter_emb': {
          'show': false,
          'alias': 'pid_a_cardeter_emb'
        },
        'pid_a_cardeter_queima': {
          'show': false,
          'alias': 'pid_a_cardeter_queima'
        },
        'pid_a_cardeter_reserva': {
          'show': false,
          'alias': 'pid_a_cardeter_reserva'
        },
        'pid_a_cardeter_ti': {
          'show': false,
          'alias': 'pid_a_cardeter_ti'
        },
        'pid_a_cardeter_usoant': {
          'show': false,
          'alias': 'pid_a_cardeter_usoant'
        },
        'pid_a_cardeter_usocon': {
          'show': false,
          'alias': 'pid_a_cardeter_usocon'
        },
        'pid_a_cardeter_veg': {
          'show': false,
          'alias': 'pid_a_cardeter_veg'
        },
        'quadrant': {
          'show': false,
          'alias': 'quadrant'
        },
        'satellite': {
          'show': true,
          'alias': 'Satélite'
        },
        'sensor': {
          'show': true,
          'alias': 'Sensor'
        },
        'uc': {
          'show': false,
          'alias': 'uc'
        },
        'uf': {
          'show': false,
          'alias': 'uf'
        }
      },
      'PRODES': {
        'a_carprodes_62_dd_prodes_inpe_class_name': {
          'show': true,
          'alias': 'Classe'
        },
        'a_carprodes_62_dd_prodes_inpe_mainclass': {
          'show': true,
          'alias': 'Classe'
        },
        'dd_prodes_inpe_ano': {
          'show': false,
          'alias': 'Ano'
        },
        'a_carprodes_62_de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'a_carprodes_62_de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'a_carprodes_62_de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'a_carprodes_62_de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'a_carprodes_62_de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'a_carprodes_62_de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'a_carprodes_62_de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'a_carprodes_62_de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'a_carprodes_62_id': {
          'show': false,
          'alias': 'a_carprodes_62_id'
        },
        'a_carprodes_app_63_id': {
          'show': false,
          'alias': 'a_carprodes_app_63_id'
        },
        'a_carprodes_desemb_71_id': {
          'show': false,
          'alias': 'a_carprodes_desemb_71_id'
        },
        'a_carprodes_desmate_72_id': {
          'show': false,
          'alias': 'a_carprodes_desmate_72_id'
        },
        'a_carprodes_emb_70_id': {
          'show': false,
          'alias': 'a_carprodes_emb_70_id'
        },
        'a_carprodes_queima_73_id': {
          'show': false,
          'alias': 'a_carprodes_queima_73_id'
        },
        'a_carprodes_reserva_65_id': {
          'show': false,
          'alias': 'a_carprodes_reserva_65_id'
        },
        'a_carprodes_ti_68_id': {
          'show': false,
          'alias': 'a_carprodes_ti_68_id'
        },
        'a_carprodes_uc_69_id': {
          'show': false,
          'alias': 'a_carprodes_uc_69_id'
        },
        'a_carprodes_usoant_64_id': {
          'show': false,
          'alias': 'a_carprodes_usoant_64_id'
        },
        'a_carprodes_usocon_67_id': {
          'show': false,
          'alias': 'a_carprodes_usocon_67_id'
        },
        'a_carprodes_veg_66_id': {
          'show': false,
          'alias': 'a_carprodes_veg_66_id'
        },
        'ano': {
          'show': true,
          'alias': 'Ano'
        },
        'areameters': {
          'show': true,
          'alias': 'Área (m²)'
        },
        'calculated_area_ha': {
          'show': true,
          'alias': 'Área da interseção (ha)'
        },
        'class_n_01': {
          'show': false,
          'alias': 'class_n_01'
        },
        'class_name': {
          'show': false,
          'alias': 'class_name'
        },
        'dd_prodes_inpe_class_name': {
          'show': true,
          'alias': 'Classe'
        },
        'dd_prodes_inpe_mainclass': {
          'show': true,
          'alias': 'Classe'
        },
        'de_area_app_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_a_infraca1': {
          'show': true,
          'alias': 'Auto infração'
        },
        'de_area_desembargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_desembargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_desembargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_desembargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_desembargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_embargadas_sema_a_infrac': {
          'show': true,
          'alias': 'Auto infração'
        },
        'de_area_embargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_embargadas_sema_ano_desma1': {
          'show': true,
          'alias': 'Ano desmatamento'
        },
        'de_area_embargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_embargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_embargadas_sema_fonte': {
          'show': true,
          'alias': 'Fonte'
        },
        'de_area_embargadas_sema_mes': {
          'show': true,
          'alias': 'Mês'
        },
        'de_area_embargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_embargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_embargadas_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_area_embargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_reserva_legal_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_reserva_legal_nativa_sema_tipologia': {
          'show': true,
          'alias': 'Tipologia'
        },
        'de_area_uso_antropizado_solo_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_uso_consolidado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_vegetacao_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_autorizacao_desmate_sema_data_da_a1': {
          'show': true,
          'alias': 'Data DA-A1'
        },
        'de_autorizacao_desmate_sema_data_do_v1': {
          'show': true,
          'alias': 'Data DO-V1'
        },
        'de_autorizacao_desmate_sema_empreendi1': {
          'show': true,
          'alias': 'Empreedimento'
        },
        'de_autorizacao_desmate_sema_modelo': {
          'show': true,
          'alias': 'Modelo'
        },
        'de_autorizacao_desmate_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_autorizacao_desmate_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_autorizacao_desmate_sema_numero_do3': {
          'show': false,
          'alias': 'de_autorizacao_desmate_sema_numero_do3'
        },
        'de_autorizacao_queima_sema_data_apro1': {
          'show': true,
          'alias': 'Data aprovação'
        },
        'de_autorizacao_queima_sema_data_venc1': {
          'show': true,
          'alias': 'Data vencimento'
        },
        'de_autorizacao_queima_sema_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'de_autorizacao_queima_sema_proprieta1': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_autorizacao_queima_sema_protocolo1': {
          'show': true,
          'alias': 'Protocolo'
        },
        'de_autorizacao_queima_sema_razao_soc1': {
          'show': true,
          'alias': 'Razão social'
        },
        'de_autorizacao_queima_sema_responsav1': {
          'show': true,
          'alias': 'Responsável'
        },
        'de_autorizacao_queima_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_autorizacao_queima_sema_tipo': {
          'show': true,
          'alias': 'Tipo'
        },
        'de_autorizacao_queima_sema_titulo_nu1': {
          'show': true,
          'alias': 'Título'
        },
        'de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'de_terra_indigena_sema_ano_popul1': {
          'show': true,
          'alias': 'Ano população'
        },
        'de_terra_indigena_sema_data_inst': {
          'show': true,
          'alias': 'Data inst.'
        },
        'de_terra_indigena_sema_etnia': {
          'show': true,
          'alias': 'Etnia'
        },
        'de_terra_indigena_sema_inst_lega1': {
          'show': true,
          'alias': 'Inst. legal'
        },
        'de_terra_indigena_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_terra_indigena_sema_nome_ti_a1': {
          'show': true,
          'alias': 'Nome TI'
        },
        'de_terra_indigena_sema_populacao': {
          'show': true,
          'alias': 'População'
        },
        'de_terra_indigena_sema_sit_jurid1': {
          'show': true,
          'alias': 'Situação jurídica'
        },
        'de_unidade_cons_sema_area_calc1': {
          'show': false,
          'alias': 'de_unidade_cons_sema_area_calc1'
        },
        'de_unidade_cons_sema_area_ofic1': {
          'show': true,
          'alias': 'Área oficial'
        },
        'de_unidade_cons_sema_ato_legal': {
          'show': true,
          'alias': 'Ato legal'
        },
        'de_unidade_cons_sema_categoria': {
          'show': true,
          'alias': 'Categoria'
        },
        'de_unidade_cons_sema_codigo_uc': {
          'show': false,
          'alias': 'de_unidade_cons_sema_codigo_uc'
        },
        'de_unidade_cons_sema_data_cada1': {
          'show': true,
          'alias': 'Data cadastro'
        },
        'de_unidade_cons_sema_grupo': {
          'show': true,
          'alias': 'Grupo'
        },
        'de_unidade_cons_sema_jurisdica1': {
          'show': true,
          'alias': 'Jurísdição'
        },
        'de_unidade_cons_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_unidade_cons_sema_operador': {
          'show': true,
          'alias': 'Operador'
        },
        'de_unidade_cons_sema_origem': {
          'show': true,
          'alias': 'Origem'
        },
        'de_unidade_cons_sema_plano_man1': {
          'show': true,
          'alias': 'Plano manejo'
        },
        'de_unidade_cons_sema_versao': {
          'show': true,
          'alias': 'Versão'
        },
        'dsfnv': {
          'show': false,
          'alias': 'dsfnv'
        },
        'execution_date': {
          'show': true,
          'alias': 'Data'
        },
        'fid': {
          'show': false,
          'alias': 'fid'
        },
        'fid_new': {
          'show': false,
          'alias': 'fid_new'
        },
        'geom': {
          'show': false,
          'alias': 'geom'
        },
        'gid': {
          'show': false,
          'alias': 'gid'
        },
        'intersect_id': {
          'show': false,
          'alias': 'intersect_id'
        },
        'intersection_geom': {
          'show': false,
          'alias': 'intersection_geom'
        },
        'julday': {
          'show': false,
          'alias': 'julday'
        },
        'linkcolumn': {
          'show': false,
          'alias': 'linkcolumn'
        },
        'mainclass': {
          'show': true,
          'alias': 'Classe'
        },
        'monitored_id': {
          'show': false,
          'alias': 'monitored_id'
        },
        'pathrow': {
          'show': false,
          'alias': 'pathrow'
        },
        'pid_a_carprodes': {
          'show': false,
          'alias': 'pid_a_carprodes'
        },
        'pid_a_carprodes_app': {
          'show': false,
          'alias': 'pid_a_carprodes_app'
        },
        'pid_a_carprodes_desemb': {
          'show': false,
          'alias': 'pid_a_carprodes_desemb'
        },
        'pid_a_carprodes_desmate': {
          'show': false,
          'alias': 'pid_a_carprodes_desmate'
        },
        'pid_a_carprodes_emb': {
          'show': false,
          'alias': 'pid_a_carprodes_emb'
        },
        'pid_a_carprodes_queima': {
          'show': false,
          'alias': 'pid_a_carprodes_queima'
        },
        'pid_a_carprodes_reserva': {
          'show': false,
          'alias': 'pid_a_carprodes_reserva'
        },
        'pid_a_carprodes_ti': {
          'show': false,
          'alias': 'pid_a_carprodes_ti'
        },
        'pid_a_carprodes_uc': {
          'show': false,
          'alias': 'pid_a_carprodes_uc'
        },
        'pid_a_carprodes_usoant': {
          'show': false,
          'alias': 'pid_a_carprodes_usoant'
        },
        'pid_a_carprodes_usocon': {
          'show': false,
          'alias': 'pid_a_carprodes_usocon'
        },
        'pid_a_carprodes_veg': {
          'show': false,
          'alias': 'pid_a_carprodes_veg'
        },
        'scene_id': {
          'show': false,
          'alias': 'scene_id'
        },
        'uf': {
          'show': false,
          'alias': 'uf'
        },
        'view_date': {
          'show': true,
          'alias': 'Data'
        }
      },
      'BURNED': {
        'a_carfocos_74_dd_focos_inpe_bioma': {
          'show': true,
          'alias': 'Bioma'
        },
        'a_carfocos_74_dd_focos_inpe_id_2': {
          'show': false,
          'alias': 'a_carfocos_74_dd_focos_inpe_id_2'
        },
        'a_carfocos_74_dd_focos_inpe_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'a_carfocos_74_dd_focos_inpe_satelite': {
          'show': true,
          'alias': 'Satélite'
        },
        'a_carfocos_74_de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'a_carfocos_74_de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'a_carfocos_74_de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'a_carfocos_74_de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'a_carfocos_74_de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'a_carfocos_74_de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'a_carfocos_74_de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'a_carfocos_74_de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'a_carfocos_74_id': {
          'show': false,
          'alias': 'a_carfocos_74_id'
        },
        'a_carfocos_app_75_id': {
          'show': false,
          'alias': 'a_carfocos_app_75_id'
        },
        'a_carfocos_desemb_83_id': {
          'show': false,
          'alias': 'a_carfocos_desemb_83_id'
        },
        'a_carfocos_desmate_84_id': {
          'show': false,
          'alias': 'a_carfocos_desmate_84_id'
        },
        'a_carfocos_emb_82_id': {
          'show': false,
          'alias': 'a_carfocos_emb_82_id'
        },
        'a_carfocos_queima_85_id': {
          'show': false,
          'alias': 'a_carfocos_queima_85_id'
        },
        'a_carfocos_reserva_77_id': {
          'show': false,
          'alias': 'a_carfocos_reserva_77_id'
        },
        'a_carfocos_ti_80_id': {
          'show': false,
          'alias': 'a_carfocos_ti_80_id'
        },
        'a_carfocos_uc_81_id': {
          'show': false,
          'alias': 'a_carfocos_uc_81_id'
        },
        'a_carfocos_usoant_76_id': {
          'show': false,
          'alias': 'a_carfocos_usoant_76_id'
        },
        'a_carfocos_usocon_79_id': {
          'show': false,
          'alias': 'a_carfocos_usocon_79_id'
        },
        'a_carfocos_veg_78_id': {
          'show': false,
          'alias': 'a_carfocos_veg_78_id'
        },
        'bioma': {
          'show': true,
          'alias': 'Bioma'
        },
        'bioma_id': {
          'show': false,
          'alias': 'bioma_id'
        },
        'calculated_area_ha': {
          'show': true,
          'alias': 'Área da interseção (ha)'
        },
        'data_hora_gmt': {
          'show': true,
          'alias': 'Data'
        },
        'dd_focos_inpe_bioma': {
          'show': true,
          'alias': 'Bioma'
        },
        'dd_focos_inpe_id_2': {
          'show': false,
          'alias': 'dd_focos_inpe_id_2'
        },
        'dd_focos_inpe_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'dd_focos_inpe_satelite': {
          'show': true,
          'alias': 'Satélite'
        },
        'de_area_app_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_a_infraca1': {
          'show': true,
          'alias': 'Auto infração'
        },
        'de_area_desembargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_desembargadas_sema_area_1': {
          'show': false,
          'alias': 'de_area_desembargadas_sema_area_1'
        },
        'de_area_desembargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_desembargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_desembargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_desembargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_embargadas_sema_a_infrac': {
          'show': true,
          'alias': 'Auto infração'
        },
        'de_area_embargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_embargadas_sema_ano_desma1': {
          'show': true,
          'alias': 'Ano desmatamento'
        },
        'de_area_embargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_embargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_embargadas_sema_fonte': {
          'show': true,
          'alias': 'Fonte'
        },
        'de_area_embargadas_sema_mes': {
          'show': true,
          'alias': 'Mês'
        },
        'de_area_embargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_embargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_embargadas_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_area_embargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_reserva_legal_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_uso_antropizado_solo_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_uso_consolidado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_autorizacao_desmate_sema_data_da_a1': {
          'show': true,
          'alias': 'Data DA-A1'
        },
        'de_autorizacao_desmate_sema_data_do_v1': {
          'show': true,
          'alias': 'Data DA-V1'
        },
        'de_autorizacao_desmate_sema_empreendi1': {
          'show': true,
          'alias': 'Empreendimento'
        },
        'de_autorizacao_desmate_sema_modelo': {
          'show': true,
          'alias': 'Modelo'
        },
        'de_autorizacao_desmate_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_autorizacao_desmate_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_autorizacao_desmate_sema_numero_do3': {
          'show': false,
          'alias': 'de_autorizacao_desmate_sema_numero_do3'
        },
        'de_autorizacao_queima_sema_data_apro1': {
          'show': true,
          'alias': 'Data aprovação'
        },
        'de_autorizacao_queima_sema_data_venc1': {
          'show': true,
          'alias': 'Data vencimento'
        },
        'de_autorizacao_queima_sema_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'de_autorizacao_queima_sema_proprieta1': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_autorizacao_queima_sema_protocolo1': {
          'show': true,
          'alias': 'Protocolo'
        },
        'de_autorizacao_queima_sema_razao_soc1': {
          'show': true,
          'alias': 'Razão social'
        },
        'de_autorizacao_queima_sema_responsav1': {
          'show': true,
          'alias': 'Responsável'
        },
        'de_autorizacao_queima_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_autorizacao_queima_sema_tipo': {
          'show': true,
          'alias': 'Tipo'
        },
        'de_autorizacao_queima_sema_titulo_nu1': {
          'show': true,
          'alias': 'Título'
        },
        'de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'de_terra_indigena_sema_ano_popul1': {
          'show': true,
          'alias': 'Ano população'
        },
        'de_terra_indigena_sema_area_ha': {
          'show': true,
          'alias': 'Área (ha)'
        },
        'de_terra_indigena_sema_data_inst': {
          'show': true,
          'alias': 'Data inst.'
        },
        'de_terra_indigena_sema_etnia': {
          'show': true,
          'alias': 'Etnia'
        },
        'de_terra_indigena_sema_inst_lega1': {
          'show': true,
          'alias': 'Inst. legal'
        },
        'de_terra_indigena_sema_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'de_terra_indigena_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_terra_indigena_sema_nome_ti_a1': {
          'show': true,
          'alias': 'Nome TI'
        },
        'de_terra_indigena_sema_populacao': {
          'show': true,
          'alias': 'População'
        },
        'de_terra_indigena_sema_sit_jurid1': {
          'show': true,
          'alias': 'Situação jurídica'
        },
        'de_unidade_cons_sema_area_calc1': {
          'show': false,
          'alias': 'de_unidade_cons_sema_area_calc1'
        },
        'de_unidade_cons_sema_area_ofic1': {
          'show': true,
          'alias': 'Oficial'
        },
        'de_unidade_cons_sema_ato_legal': {
          'show': true,
          'alias': 'Ato legal'
        },
        'de_unidade_cons_sema_categoria': {
          'show': true,
          'alias': 'Categoria'
        },
        'de_unidade_cons_sema_codigo_uc': {
          'show': false,
          'alias': 'de_unidade_cons_sema_codigo_uc'
        },
        'de_unidade_cons_sema_data_cada1': {
          'show': true,
          'alias': 'Data cadastro'
        },
        'de_unidade_cons_sema_grupo': {
          'show': true,
          'alias': 'Grupo'
        },
        'de_unidade_cons_sema_jurisdica1': {
          'show': true,
          'alias': 'Jurísdição'
        },
        'de_unidade_cons_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_unidade_cons_sema_operador': {
          'show': true,
          'alias': 'Operador'
        },
        'de_unidade_cons_sema_origem': {
          'show': true,
          'alias': 'Origem'
        },
        'de_unidade_cons_sema_plano_man1': {
          'show': true,
          'alias': 'Plano manejo'
        },
        'de_unidade_cons_sema_versao': {
          'show': true,
          'alias': 'Versão'
        },
        'estado': {
          'show': true,
          'alias': 'Estado'
        },
        'execution_date': {
          'show': true,
          'alias': 'Data'
        },
        'foco_id': {
          'show': false,
          'alias': 'foco_id'
        },
        'geometria': {
          'show': false,
          'alias': 'geometria'
        },
        'id_0': {
          'show': false,
          'alias': 'id_0'
        },
        'id_1': {
          'show': false,
          'alias': 'id_1'
        },
        'id_2': {
          'show': false,
          'alias': 'id_2'
        },
        'intersect_id': {
          'show': false,
          'alias': 'intersect_id'
        },
        'intersection_geom': {
          'show': false,
          'alias': 'intersection_geom'
        },
        'latitude': {
          'show': true,
          'alias': 'Latitude'
        },
        'longitude': {
          'show': false,
          'alias': 'Longitude'
        },
        'monitored_id': {
          'show': false,
          'alias': 'monitored_id'
        },
        'municipio': {
          'show': true,
          'alias': 'Município'
        },
        'pais': {
          'show': true,
          'alias': 'País'
        },
        'path_row': {
          'show': false,
          'alias': 'path_row'
        },
        'pid_a_carfocos': {
          'show': false,
          'alias': 'pid_a_carfocos'
        },
        'pid_a_carfocos_app': {
          'show': false,
          'alias': 'pid_a_carfocos_app'
        },
        'pid_a_carfocos_desemb': {
          'show': false,
          'alias': 'pid_a_carfocos_desemb'
        },
        'pid_a_carfocos_desmate': {
          'show': false,
          'alias': 'pid_a_carfocos_desmate'
        },
        'pid_a_carfocos_emb': {
          'show': false,
          'alias': 'pid_a_carfocos_emb'
        },
        'pid_a_carfocos_queima': {
          'show': false,
          'alias': 'pid_a_carfocos_queima'
        },
        'pid_a_carfocos_reserva': {
          'show': false,
          'alias': 'pid_a_carfocos_reserva'
        },
        'pid_a_carfocos_ti': {
          'show': false,
          'alias': 'pid_a_carfocos_ti'
        },
        'pid_a_carfocos_uc': {
          'show': false,
          'alias': 'pid_a_carfocos_uc'
        },
        'pid_a_carfocos_usoant': {
          'show': false,
          'alias': 'pid_a_carfocos_usoant'
        },
        'pid_a_carfocos_usocon': {
          'show': false,
          'alias': 'pid_a_carfocos_usocon'
        },
        'pid_a_carfocos_veg': {
          'show': false,
          'alias': 'pid_a_carfocos_veg'
        },
        'pid_dd_focos_inpe': {
          'show': false,
          'alias': 'pid_dd_focos_inpe'
        },
        'pid_focos_mt': {
          'show': false,
          'alias': 'pid_focos_mt'
        },
        'satelite': {
          'show': true,
          'alias': 'Satélite'
        }
      },
      'BURNED_AREA': {
        'a_caraq_86_dd_area_queimada_inpe_data_anter': {
          'show': false,
          'alias': 'a_caraq_86_dd_area_queimada_inpe_data_anter'
        },
        'a_caraq_86_dd_area_queimada_inpe_data_pas': {
          'show': false,
          'alias': 'a_caraq_86_dd_area_queimada_inpe_data_pas'
        },
        'a_caraq_86_dd_area_queimada_inpe_ha': {
          'show': false,
          'alias': 'a_caraq_86_dd_area_queimada_inpe_ha'
        },
        'a_caraq_86_dd_area_queimada_inpe_id_cena_an': {
          'show': false,
          'alias': 'a_caraq_86_dd_area_queimada_inpe_id_cena_an'
        },
        'a_caraq_86_dd_area_queimada_inpe_km2': {
          'show': false,
          'alias': 'a_caraq_86_dd_area_queimada_inpe_km2'
        },
        'a_caraq_86_dd_area_queimada_inpe_nome_arq': {
          'show': false,
          'alias': 'a_caraq_86_dd_area_queimada_inpe_nome_arq'
        },
        'a_caraq_86_dd_area_queimada_inpe_orb_pto': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'a_caraq_86_de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'a_caraq_86_de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'a_caraq_86_de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'a_caraq_86_de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'a_caraq_86_de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'a_caraq_86_de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'a_caraq_86_de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'a_caraq_86_de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'a_caraq_86_id': {
          'show': false,
          'alias': 'a_caraq_86_id'
        },
        'a_caraq_app_87_id': {
          'show': false,
          'alias': 'a_caraq_app_87_id'
        },
        'a_caraq_desemb_95_id': {
          'show': false,
          'alias': 'a_caraq_desemb_95_id'
        },
        'a_caraq_desmate_96_id': {
          'show': false,
          'alias': 'a_caraq_desmate_96_id'
        },
        'a_caraq_emb_94_id': {
          'show': false,
          'alias': 'a_caraq_emb_94_id'
        },
        'a_caraq_queima_97_id': {
          'show': false,
          'alias': 'a_caraq_queima_97_id'
        },
        'a_caraq_reserva_89_id': {
          'show': false,
          'alias': 'a_caraq_reserva_89_id'
        },
        'a_caraq_ti_92_id': {
          'show': false,
          'alias': 'a_caraq_ti_92_id'
        },
        'a_caraq_uc_93_id': {
          'show': false,
          'alias': 'a_caraq_uc_93_id'
        },
        'a_caraq_usoant_88_id': {
          'show': false,
          'alias': 'a_caraq_usoant_88_id'
        },
        'a_caraq_usocon_91_id': {
          'show': false,
          'alias': 'a_caraq_usocon_91_id'
        },
        'a_caraq_veg_90_id': {
          'show': false,
          'alias': 'a_caraq_veg_90_id'
        },
        'calculated_area_ha': {
          'show': true,
          'alias': 'Área da interseção (ha)'
        },
        'dd_area_queimada_inpe_data_anter': {
          'show': false,
          'alias': 'dd_area_queimada_inpe_data_anter'
        },
        'dd_area_queimada_inpe_data_pas': {
          'show': false,
          'alias': 'dd_area_queimada_inpe_data_pas'
        },
        'dd_area_queimada_inpe_ha': {
          'show': false,
          'alias': 'dd_area_queimada_inpe_ha'
        },
        'dd_area_queimada_inpe_id_cena_an': {
          'show': false,
          'alias': 'dd_area_queimada_inpe_id_cena_an'
        },
        'dd_area_queimada_inpe_km2': {
          'show': false,
          'alias': 'dd_area_queimada_inpe_km2'
        },
        'dd_area_queimada_inpe_nome_arq': {
          'show': false,
          'alias': 'dd_area_queimada_inpe_nome_arq'
        },
        'dd_area_queimada_inpe_orb_pto': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'de_area_app_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_a_infraca1': {
          'show': false,
          'alias': 'de_area_desembargadas_sema_a_infraca1'
        },
        'de_area_desembargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_desembargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_desembargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_desembargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_desembargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_desembargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_embargadas_sema_a_infrac': {
          'show': true,
          'alias': 'Auto infração'
        },
        'de_area_embargadas_sema_ano': {
          'show': true,
          'alias': 'Ano'
        },
        'de_area_embargadas_sema_ano_desma1': {
          'show': true,
          'alias': 'Ano desmatamento'
        },
        'de_area_embargadas_sema_cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'de_area_embargadas_sema_dano': {
          'show': true,
          'alias': 'Dano'
        },
        'de_area_embargadas_sema_fonte': {
          'show': true,
          'alias': 'FOnte'
        },
        'de_area_embargadas_sema_mes': {
          'show': true,
          'alias': 'Mês'
        },
        'de_area_embargadas_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_area_embargadas_sema_proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_embargadas_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_area_embargadas_sema_t_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'de_area_reserva_legal_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_reserva_legal_nativa_sema_tipologia': {
          'show': true,
          'alias': 'Tipologia'
        },
        'de_area_uso_antropizado_solo_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_uso_consolidado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_area_vegetacao_nativa_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_autorizacao_desmate_sema_data_da_a1': {
          'show': true,
          'alias': 'Data DA-A1'
        },
        'de_autorizacao_desmate_sema_data_do_v1': {
          'show': true,
          'alias': 'Data DO-V1'
        },
        'de_autorizacao_desmate_sema_empreendi1': {
          'show': true,
          'alias': 'Empreendimento'
        },
        'de_autorizacao_desmate_sema_modelo': {
          'show': true,
          'alias': 'Modelo'
        },
        'de_autorizacao_desmate_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_autorizacao_desmate_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_autorizacao_desmate_sema_numero_do3': {
          'show': false,
          'alias': 'de_autorizacao_desmate_sema_numero_do3'
        },
        'de_autorizacao_queima_sema_data_apro1': {
          'show': true,
          'alias': 'Data aprovação'
        },
        'de_autorizacao_queima_sema_data_venc1': {
          'show': true,
          'alias': 'Data vencimento'
        },
        'de_autorizacao_queima_sema_municipio': {
          'show': true,
          'alias': 'Município'
        },
        'de_autorizacao_queima_sema_proprieta1': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_autorizacao_queima_sema_protocolo1': {
          'show': true,
          'alias': 'Protocolo'
        },
        'de_autorizacao_queima_sema_razao_soc1': {
          'show': true,
          'alias': 'Razão social'
        },
        'de_autorizacao_queima_sema_responsav1': {
          'show': true,
          'alias': 'Responsável'
        },
        'de_autorizacao_queima_sema_situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'de_autorizacao_queima_sema_tipo': {
          'show': true,
          'alias': 'Tipo'
        },
        'de_autorizacao_queima_sema_titulo_nu1': {
          'show': true,
          'alias': 'Título'
        },
        'de_car_validado_sema_area_ha_': {
          'show': true,
          'alias': 'Área do imóvel (ha)'
        },
        'de_car_validado_sema_cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'de_car_validado_sema_municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'de_car_validado_sema_nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'de_car_validado_sema_nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'de_car_validado_sema_numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'de_car_validado_sema_numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'de_car_validado_sema_situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'de_terra_indigena_sema_ano_popul1': {
          'show': true,
          'alias': 'Ano população'
        },
        'de_terra_indigena_sema_area_ha': {
          'show': true,
          'alias': 'Área (ha)'
        },
        'de_terra_indigena_sema_data_inst': {
          'show': true,
          'alias': 'Data inst.'
        },
        'de_terra_indigena_sema_etnia': {
          'show': true,
          'alias': 'Etnia'
        },
        'de_terra_indigena_sema_inst_lega1': {
          'show': true,
          'alias': 'Inst. legal'
        },
        'de_terra_indigena_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_terra_indigena_sema_nome_ti_a1': {
          'show': true,
          'alias': 'Nome TI'
        },
        'de_terra_indigena_sema_populacao': {
          'show': true,
          'alias': 'População'
        },
        'de_terra_indigena_sema_sit_jurid1': {
          'show': true,
          'alias': 'Situação jurídica'
        },
        'de_unidade_cons_sema_area_calc1': {
          'show': false,
          'alias': 'de_unidade_cons_sema_area_calc1'
        },
        'de_unidade_cons_sema_area_ofic1': {
          'show': false,
          'alias': 'de_unidade_cons_sema_area_ofic1'
        },
        'de_unidade_cons_sema_ato_legal': {
          'show': true,
          'alias': 'Ato legal'
        },
        'de_unidade_cons_sema_categoria': {
          'show': true,
          'alias': 'Categoria'
        },
        'de_unidade_cons_sema_codigo_uc': {
          'show': false,
          'alias': 'de_unidade_cons_sema_codigo_uc'
        },
        'de_unidade_cons_sema_data_cada1': {
          'show': true,
          'alias': 'Data cadastro'
        },
        'de_unidade_cons_sema_grupo': {
          'show': true,
          'alias': 'Grupo'
        },
        'de_unidade_cons_sema_jurisdica1': {
          'show': true,
          'alias': 'Jurísdição'
        },
        'de_unidade_cons_sema_nome': {
          'show': true,
          'alias': 'Nome'
        },
        'de_unidade_cons_sema_operador': {
          'show': true,
          'alias': 'Operador'
        },
        'de_unidade_cons_sema_origem': {
          'show': true,
          'alias': 'Origem'
        },
        'de_unidade_cons_sema_plano_man1': {
          'show': true,
          'alias': 'Plano manejo'
        },
        'de_unidade_cons_sema_versao': {
          'show': true,
          'alias': 'Versão'
        },
        'execution_date': {
          'show': true,
          'alias': 'Data'
        },
        'intersect_id': {
          'show': false,
          'alias': 'intersect_id'
        },
        'intersection_geom': {
          'show': false,
          'alias': 'intersection_geom'
        },
        'monitored_id': {
          'show': false,
          'alias': 'monitored_id'
        },
        'pid_a_caraq': {
          'show': false,
          'alias': 'pid_a_caraq'
        },
        'pid_a_caraq_app': {
          'show': false,
          'alias': 'pid_a_caraq_app'
        },
        'pid_a_caraq_desmate': {
          'show': false,
          'alias': 'pid_a_caraq_desmate'
        },
        'pid_a_caraq_emb': {
          'show': false,
          'alias': 'pid_a_caraq_emb'
        },
        'pid_a_caraq_queima': {
          'show': false,
          'alias': 'pid_a_caraq_queima'
        },
        'pid_a_caraq_reserva': {
          'show': false,
          'alias': 'pid_a_caraq_reserva'
        },
        'pid_a_caraq_ti': {
          'show': false,
          'alias': 'pid_a_caraq_ti'
        },
        'pid_a_caraq_uc': {
          'show': false,
          'alias': 'pid_a_caraq_uc'
        },
        'pid_a_caraq_usoant': {
          'show': false,
          'alias': 'pid_a_caraq_usoant'
        },
        'pid_a_caraq_usocon': {
          'show': false,
          'alias': 'pid_a_caraq_usocon'
        },
        'pid_a_caraq_veg': {
          'show': false,
          'alias': 'pid_a_caraq_veg'
        }
      },
      'STATIC': {
        'a_infrac': {
          'show': false,
          'alias': 'a_infrac'
        },
        'a_infraca1': {
          'show': false,
          'alias': 'a_infraca1'
        },
        'ano': {
          'show': true,
          'alias': 'Ano'
        },
        'ano_desma1': {
          'show': true,
          'alias': 'Ano desmatamento'
        },
        'ano_popul1': {
          'show': true,
          'alias': 'Ano população'
        },
        'area_1': {
          'show': false,
          'alias': 'area_1'
        },
        'area_calc1': {
          'show': false,
          'alias': 'area_calc1'
        },
        'area_ha': {
          'show': true,
          'alias': 'Área (ha)'
        },
        'area_ha_': {
          'show': true,
          'alias': 'Área (ha)'
        },
        'area_km2': {
          'show': true,
          'alias': 'Área (km²)'
        },
        'area__m2_': {
          'show': true,
          'alias': 'Área (m²)'
        },
        'area_ofic1': {
          'show': false,
          'alias': 'area_ofic1'
        },
        'ato_legal': {
          'show': true,
          'alias': 'Ato legal'
        },
        'bioma': {
          'show': true,
          'alias': 'Bioma'
        },
        'categoria': {
          'show': true,
          'alias': 'Categoria'
        },
        'cd_bioma': {
          'show': true,
          'alias': 'Bioma'
        },
        'cd_geocme': {
          'show': false,
          'alias': 'cd_geocme'
        },
        'cd_geocmi': {
          'show': false,
          'alias': 'cd_geocmi'
        },
        'cd_geocuf': {
          'show': false,
          'alias': 'cd_geocuf'
        },
        'codigo': {
          'show': false,
          'alias': 'codigo'
        },
        'codigotipo': {
          'show': false,
          'alias': 'codigotipo'
        },
        'codigo_uc': {
          'show': false,
          'alias': 'codigo_uc'
        },
        'comarca': {
          'show': true,
          'alias': 'Comarca'
        },
        'contato': {
          'show': true,
          'alias': 'Contato'
        },
        'coord_x': {
          'show': true,
          'alias': 'Longitude'
        },
        'coord_y': {
          'show': true,
          'alias': 'Latitude'
        },
        'cpf': {
          'show': true,
          'alias': 'CPF'
        },
        'cpfcnpj': {
          'show': true,
          'alias': 'CPF/CNPJ'
        },
        'dano': {
          'show': true,
          'alias': 'Dano'
        },
        'data_apro1': {
          'show': true,
          'alias': 'Data aprovação'
        },
        'data_cada1': {
          'show': true,
          'alias': 'Data cadastro'
        },
        'data_da_a1': {
          'show': true,
          'alias': 'Data DA-A1'
        },
        'data_de_a1': {
          'show': true,
          'alias': 'Data DA-A1'
        },
        'data_de_e1': {
          'show': true,
          'alias': 'Data DE-E1'
        },
        'data_do_v1': {
          'show': true,
          'alias': 'Data DO-V1'
        },
        'data_inst': {
          'show': true,
          'alias': 'Data inst.'
        },
        'data_venc1': {
          'show': true,
          'alias': 'Data vencimento'
        },
        'desc_coinc': {
          'show': false,
          'alias': 'desc_coinc'
        },
        'ds_ato_leg': {
          'show': true,
          'alias': 'Ato legal'
        },
        'ds_coinc': {
          'show': false,
          'alias': 'ds_coinc'
        },
        'ds_jurisdi': {
          'show': true,
          'alias': 'Jurisdição'
        },
        'ds_legenda': {
          'show': false,
          'alias': 'ds_legenda'
        },
        'ds_local_f': {
          'show': false,
          'alias': 'ds_local_f'
        },
        'ds_local_i': {
          'show': false,
          'alias': 'ds_local_i'
        },
        'ds_obra': {
          'show': false,
          'alias': 'ds_obra'
        },
        'ds_superfi': {
          'show': false,
          'alias': 'ds_superfi'
        },
        'ds_sup_fed': {
          'show': false,
          'alias': 'ds_sup_fed'
        },
        'ds_tipo_ad': {
          'show': false,
          'alias': 'ds_tipo_ad'
        },
        'empreendi1': {
          'show': false,
          'alias': 'empreendi1'
        },
        'entrancia': {
          'show': true,
          'alias': 'Entrancia'
        },
        'est_coinc': {
          'show': false,
          'alias': 'est_coinc'
        },
        'etnia': {
          'show': true,
          'alias': 'Etnia'
        },
        'fid_promot': {
          'show': false,
          'alias': 'fid_promot'
        },
        'fonte': {
          'show': true,
          'alias': 'Fonte'
        },
        'geocodigo': {
          'show': false,
          'alias': 'geocodigo'
        },
        'geom': {
          'show': false,
          'alias': 'geom'
        },
        'gid': {
          'show': false,
          'alias': 'gid'
        },
        'grupo': {
          'show': true,
          'alias': 'Grupo'
        },
        'id': {
          'show': false,
          'alias': 'id'
        },
        'idcar': {
          'show': false,
          'alias': 'idcar'
        },
        'id_munic': {
          'show': false,
          'alias': 'id_munic'
        },
        'id_trecho_': {
          'show': false,
          'alias': 'id_trecho_'
        },
        'id_versao': {
          'show': false,
          'alias': 'id_versao'
        },
        'inst_lega1': {
          'show': true,
          'alias': 'Inst. legal'
        },
        'jurisdica1': {
          'show': true,
          'alias': 'Jurisdição'
        },
        'km': {
          'show': false,
          'alias': 'km'
        },
        'lat': {
          'show': false,
          'alias': 'lat'
        },
        'leg_multim': {
          'show': false,
          'alias': 'leg_multim'
        },
        'licenciam1': {
          'show': false,
          'alias': 'licenciam1'
        },
        'lon': {
          'show': false,
          'alias': 'lon'
        },
        'marcador': {
          'show': false,
          'alias': 'marcador'
        },
        'mes': {
          'show': true,
          'alias': 'Mês'
        },
        'modelo': {
          'show': true,
          'alias': 'Modelo'
        },
        'modulo_fi1': {
          'show': false,
          'alias': 'modulo_fi1'
        },
        'municipio': {
          'show': true,
          'alias': 'Município'
        },
        'municipio1': {
          'show': true,
          'alias': 'Município'
        },
        'nm_estado': {
          'show': true,
          'alias': 'Estado'
        },
        'nm_meso': {
          'show': true,
          'alias': 'Mesoregião'
        },
        'nm_micro': {
          'show': true,
          'alias': 'Microregião'
        },
        'nm_regiao': {
          'show': true,
          'alias': 'Região'
        },
        'nm_tipo_tr': {
          'show': false,
          'alias': 'nm_tipo_tr'
        },
        'nome': {
          'show': true,
          'alias': 'Nome'
        },
        'nome_da_p1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'nomepropri': {
          'show': true,
          'alias': 'Proprietário'
        },
        'nome_ti_a1': {
          'show': true,
          'alias': 'Nome TI'
        },
        'numero_do1': {
          'show': true,
          'alias': 'CAR estadual'
        },
        'numero_do2': {
          'show': true,
          'alias': 'CAR federal'
        },
        'numero_do3': {
          'show': false,
          'alias': 'numero_do3'
        },
        'objectid': {
          'show': false,
          'alias': 'objectid'
        },
        'operador': {
          'show': true,
          'alias': 'Operador'
        },
        'orbita': {
          'show': true,
          'alias': 'Órbita'
        },
        'origem': {
          'show': true,
          'alias': 'Origem'
        },
        'path_row': {
          'show': false,
          'alias': 'path_row'
        },
        'pdf_docum1': {
          'show': false,
          'alias': 'pdf_docum1'
        },
        'pjbh': {
          'show': false,
          'alias': 'pjbh'
        },
        'plano_man1': {
          'show': false,
          'alias': 'plano_man1'
        },
        'ponto': {
          'show': true,
          'alias': 'Ponto'
        },
        'populacao': {
          'show': true,
          'alias': 'População'
        },
        'promotoria': {
          'show': true,
          'alias': 'Promotoria'
        },
        'proprieda1': {
          'show': true,
          'alias': 'Imóvel'
        },
        'proprieta1': {
          'show': true,
          'alias': 'Proprietário'
        },
        'protocolo1': {
          'show': true,
          'alias': 'Protocolo'
        },
        'ps1_ar_ha': {
          'show': false,
          'alias': 'ps1_ar_ha'
        },
        'ps1_ar_km2': {
          'show': false,
          'alias': 'ps1_ar_km2'
        },
        'ps1_cd': {
          'show': false,
          'alias': 'ps1_cd'
        },
        'ps1_gm_are': {
          'show': false,
          'alias': 'ps1_gm_are'
        },
        'ps1_gm_per': {
          'show': false,
          'alias': 'ps1_gm_per'
        },
        'ps1_gm_pol': {
          'show': false,
          'alias': 'ps1_gm_pol'
        },
        'ps1_nm': {
          'show': true,
          'alias': 'Nome'
        },
        'ps1_rhi_cd': {
          'show': false,
          'alias': 'ps1_rhi_cd'
        },
        'razao_soc1': {
          'show': true,
          'alias': 'Razão social'
        },
        'responsav1': {
          'show': true,
          'alias': 'Responsável'
        },
        'sg_legenda': {
          'show': false,
          'alias': 'sg_legenda'
        },
        'sg_tipo_tr': {
          'show': false,
          'alias': 'sg_tipo_tr'
        },
        'sg_uf': {
          'show': false,
          'alias': 'sg_uf'
        },
        'shape_are1': {
          'show': false,
          'alias': 'shape_are1'
        },
        'shape_area': {
          'show': false,
          'alias': 'shape_area'
        },
        'shape_le_1': {
          'show': false,
          'alias': 'shape_le_1'
        },
        'shape_len1': {
          'show': false,
          'alias': 'shape_len1'
        },
        'shape_leng': {
          'show': false,
          'alias': 'shape_leng'
        },
        'sit_jurid1': {
          'show': true,
          'alias': 'Situação jurídica'
        },
        'situacao': {
          'show': true,
          'alias': 'Situação'
        },
        'situacao_1': {
          'show': true,
          'alias': 'Situação'
        },
        'sup_est_co': {
          'show': false,
          'alias': 'sup_est_co'
        },
        't_embargo': {
          'show': true,
          'alias': 'T. Embargo'
        },
        'tipo': {
          'show': true,
          'alias': 'Tipo'
        },
        'tipologia': {
          'show': true,
          'alias': 'Tipologia'
        },
        'titulo_nu1': {
          'show': true,
          'alias': 'Título'
        },
        'ul': {
          'show': false,
          'alias': 'ul'
        },
        'unidade_d1': {
          'show': false,
          'alias': 'ul'
        },
        'versao': {
          'show': true,
          'alias': 'Versão'
        },
        'versao_snv': {
          'show': false,
          'alias': 'versao_snv'
        },
        'vl_br': {
          'show': false,
          'alias': 'vl_br'
        },
        'vl_codigo': {
          'show': false,
          'alias': 'vl_codigo'
        },
        'vl_extensa': {
          'show': false,
          'alias': 'vl_extensa'
        },
        'vl_km_fina': {
          'show': false,
          'alias': 'vl_km_fina'
        },
        'vl_km_inic': {
          'show': false,
          'alias': 'vl_km_inic'
        }
      },
      'DYNAMIC': {
        'ano': {
          'show': true,
          'alias': 'Ano'
        },
        'areameters': {
          'show': true,
          'alias': 'Área (m²)'
        },
        'areamunkm': {
          'show': false,
          'alias': 'areamunkm'
        },
        'areatotalk': {
          'show': false,
          'alias': 'areatotalk'
        },
        'areauckm': {
          'show': false,
          'alias': 'areauckm'
        },
        'bioma': {
          'show': true,
          'alias': 'Bioma'
        },
        'bioma_id': {
          'show': false,
          'alias': 'bioma_id'
        },
        'class_n_01': {
          'show': false,
          'alias': 'class_n_01'
        },
        'classname': {
          'show': true,
          'alias': 'Classe'
        },
        'class_name': {
          'show': true,
          'alias': 'Classe'
        },
        'county': {
          'show': true,
          'alias': 'Município'
        },
        'data_anter': {
          'show': false,
          'alias': 'data_anter'
        },
        'data_hora_gmt': {
          'show': true,
          'alias': 'Data'
        },
        'data_pas': {
          'show': false,
          'alias': 'data_pas'
        },
        'date': {
          'show': true,
          'alias': 'Data'
        },
        'date_audit': {
          'show': true,
          'alias': 'Data auditoria'
        },
        'dsfnv': {
          'show': false,
          'alias': 'dsfnv'
        },
        'estado': {
          'show': true,
          'alias': 'Estado'
        },
        'fid': {
          'show': false,
          'alias': 'fid'
        },
        'fid_new': {
          'show': false,
          'alias': 'fid_new'
        },
        'foco_id': {
          'show': false,
          'alias': 'foco_id'
        },
        'geom': {
          'show': false,
          'alias': 'geom'
        },
        'geometria': {
          'show': false,
          'alias': 'geometria'
        },
        'gid': {
          'show': false,
          'alias': 'gid'
        },
        'ha': {
          'show': false,
          'alias': 'ha'
        },
        'id': {
          'show': false,
          'alias': 'id'
        },
        'id_0': {
          'show': false,
          'alias': 'id_0'
        },
        'id_1': {
          'show': false,
          'alias': 'id_1'
        },
        'id_2': {
          'show': false,
          'alias': 'id_2'
        },
        'id_cena_an': {
          'show': false,
          'alias': 'id_cena_an'
        },
        'julday': {
          'show': false,
          'alias': 'julday'
        },
        'km2': {
          'show': false,
          'alias': 'km2'
        },
        'latitude': {
          'show': false,
          'alias': 'latitude'
        },
        'linkcolumn': {
          'show': false,
          'alias': 'linkcolumn'
        },
        'longitude': {
          'show': false,
          'alias': 'longitude'
        },
        'lot': {
          'show': false,
          'alias': 'lot'
        },
        'mainclass': {
          'show': true,
          'alias': 'Classe'
        },
        'municipio': {
          'show': true,
          'alias': 'Município'
        },
        'nome_arq': {
          'show': false,
          'alias': 'nome_arq'
        },
        'ogr_geometry': {
          'show': false,
          'alias': 'ogr_geometry'
        },
        'orbitpoint': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'orb_pto': {
          'show': true,
          'alias': 'Órbita/Ponto'
        },
        'pais': {
          'show': false,
          'alias': 'pais'
        },
        'pathrow': {
          'show': false,
          'alias': 'pathrow'
        },
        'path_row': {
          'show': false,
          'alias': 'path_row'
        },
        'pid_dd_focos_inpe': {
          'show': false,
          'alias': 'pid_dd_focos_inpe'
        },
        'pid_focos_mt': {
          'show': false,
          'alias': 'pid_focos_mt'
        },
        'quadrant': {
          'show': false,
          'alias': 'quadrant'
        },
        'satelite': {
          'show': true,
          'alias': 'Satélite'
        },
        'satellite': {
          'show': true,
          'alias': 'Satélite'
        },
        'scene_id': {
          'show': false,
          'alias': 'scene_id'
        },
        'sensor': {
          'show': true,
          'alias': 'Sensor'
        },
        'uc': {
          'show': false,
          'alias': 'uc'
        },
        'uf': {
          'show': false,
          'alias': 'uf'
        },
        'view_date': {
          'show': true,
          'alias': 'Data'
        }
      }
    }

    try {
      return await Result.ok(codGroup && codGroup !== 'undefined' ? infoColumns[codGroup] : infoColumns);
    } catch (e) {
      return Result.err(e);
    }
  }
};
