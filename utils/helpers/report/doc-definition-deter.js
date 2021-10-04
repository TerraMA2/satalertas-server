const reportUtil = require("../../report.utils");

module.exports = function (reportData) {
  const deforestationAlerts = reportData.deforestationAlerts;
  const staticImages = reportUtil.getStaticImages();
  return {
    info: {
      title: 'Relatório DETER'
    },
    pageMargins: [30, 90, 30, 30],
    footer: function (pagenumber, pageCount) {
      return {
        table: {
          body: [
            [
              {
                text: 'Página ' + pagenumber + ' de ' + pageCount,
                fontSize: 8,
                margin: [483, 0, 30, 0]
              }
            ]
          ]
        },
        layout: 'noBorders'
      }
    },
    header: {
      columns: staticImages.headerImages
    },
    content: [
      {
        text: [
          {
            text: 'SAT:',
            bold: true
          },
          {
            text: ` ${ reportData.sat }`,
            bold: false
          }
        ],
        style: 'headerBody'
      },
      {
        text: [
          {
            text: 'MUNICÍPIO:',
            bold: true
          },
          {
            text: ` ${ reportData.cityName }-MT`,
            bold: false
          }
        ],
        style: 'headerBody'
      },
      {
        text: [
          {
            text: 'COMARCA:',
            bold: true
          },
          {
            text: ` ${ reportData.county }`,
            bold: false
          }
        ],
        style: 'headerBody',
        margin: [30, 0, 30, 20]
      },
      {
        text: 'SATÉLITES ALERTAS – TCT 30/2018 MPMT/INPE',
        color: 'green',
        style: 'title'
      },
      {
        text: `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº ${ reportData.code }`,
        style: 'title',
        margin: [30, 0, 30, 20]
      },
      {
        text: `DATA DE EMISSÃO: ${ reportData.currentDate }`,
        alignment: 'left',
        style: 'title'
      },
      {
        text: `PERÍODO DE ANÁLISE: ${ reportData.formattedFilterDate }`,
        alignment: 'left',
        style: 'title',
        margin: [30, 0, 30, 20]
      },
      {
        text: '1. OBJETO',
        style: 'listItem'
      },
      {
        text: 'Trata-se de relatório técnico sobre desmatamentos ilegais identificados',
        alignment: 'right',
        margin: [152, 0, 30, 0],
        style: 'body'
      },
      {
        text: [
          {
            text: (
                ` com o uso de Sistema de Informações Geográficas no imóvel rural ${ reportData.name } (Figura 1) com área igual a ${ reportData.area }, localizado no município de ${ reportData.cityName }-MT, de coordenada central longitude = ${ reportData.long } e latitude = ${ reportData.lat }, pertencente a ${ reportData.ownerName }, conforme informações declaradas no ${ reportData.stateRegistry ? 'Sistema Mato-grossense de Cadastro Ambiental Rural (SIMCAR), protocolo CAR ' + reportData.stateRegistry : 'Sistema Nacional de Cadastro Ambiental Rural, protocolo CAR ' + reportData.federalRegistry }`
            ),
          },
          {
            text: ' (Anexo 1)',
            bold: true
          },
          {
            text: (
                '.'
            )
          }
        ],
        alignment: 'justify',
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        columns: [
          reportData.images.propertyLocationImage,
          reportData.images.propertyLimitImage
        ],
        margin: [30, 0, 30, 15]
      },
      {
        text: [
          {
            text: 'Figura 1. ',
            bold: true
          },
          {
            text: 'Mapa de Localização e do Perímetro do Imóvel',
            bold: false
          }
        ],
        alignment: 'center',
        fontSize: 9,
        margin: [30, 0, 30, 15]
      },
      {
        columns: [
          {
            text: `Edifício Sede das Promotorias de Justiça da Capital
                  Av. Desembargador Milton Figueiredo Ferreira Mendes, s/nº
                  Setor D - Centro Político e Administrativo • Cuiabá/MT
                  CEP: 78049-928`,
            fontSize: 7,
            alignment: 'left'
          },
          {
            text: `Telefone: (65) 3611-2664`,
            fontSize: 7,
            alignment: 'center'
          },
          {
            text: `caop@mpmt.mp.br`,
            fontSize: 7,
            alignment: 'right'
          }
        ],
        margin: [30, 25, 30, 15]
      },
      {
        text: '',
        pageBreak: 'after'
      },
      {
        text: '2 HISTÓRICO',
        style: 'listItem'
      },
      {
        text: 'As informações  sobre os desmatamentos  foram integradas no âmbito',
        alignment: 'right',
        margin: [0, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
            'do Termo de Cooperação Técnica n. 30/2018 firmado entre Ministério Público do Estado de Mato Grosso ' +
            'e Instituto Nacional de Pesquisas Espaciais (INPE), cujo objeto consiste na coleta automática, armazenamento ' +
            'e tratamento de dados geoespaciais para interseções entre produtos do PRODES, DETER e Programa Queimadas do ' +
            'INPE, com os dados de fontes estatais oficiais para quantificação e descrição das áreas afetadas por desmatamento ou queimada.'
        ),
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: '2.1 Dados utilizados',
        style: 'listItem'
      },
      {
        columns: [
          {
            text: 'a) ',
            margin: [50, 0, 0, 15],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Dados das áreas desmatadas no Estado de Mato Grosso mapeadas pelo Sistema de Detecção de Desmatamento em Tempo Real (DETER) (alertas de desmatamento em tempo quase real) desenvolvido pelo INPE;`,
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'b) ',
            margin: [50, 0, 0, 15],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Informações e dados geográficos do SIMCAR, disponibilizadas pela Secretaria de Meio Ambiente do Estado de Mato Grosso (SEMA). Os dados declarados no SIMCAR foram unidos em uma única base, compreendendo os CAR validados, aguardando complementação, em análise e migrados do Sistema de Cadastro Ambiental Rural (SICAR). Foram excluídos da base os CAR com status cancelado e indeferido;`,
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'c) ',
            margin: [50, 0, 0, 15],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Dados do Navegador Geográfico da SEMA (SIMGEO): i. Base das áreas embargadas pela SEMA. ii. Base das áreas desembargadas pela SEMA; iii. Base das Autorizações de Exploração (AUTEX); iv. Base das Autorizações de Desmatamento (AD); v. Base das Áreas de Preservação Permanente (APP) e Áreas de Reserva Legal (ARL) (estas informações se referem as áreas declaradas no SIMCAR que se encontram em análise, aguardando complementação ou validadas, além daquelas retificadas após a migração do SICAR para o SIMCAR); vi. Base de referência de Áreas de Uso Restrito (AUR), disponibilizada pela SEMA; e vii. Base de referência de Uso Consolidado (AUC) adotada pela SEMA;`,
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'd) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Dados geográficos das Unidades de Conservação (UC) no Estado de Mato Grosso, disponíveis no Cadastro Nacional de Unidades de Conservação do Ministério de Meio Ambiente (MMA);`,
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'e) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Dados geográficos das Terras Indígenas no Estado de Mato Grosso, disponíveis no sítio eletrônico da Fundação Nacional do Índio (FUNAI);`,
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'f) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Imagens dos Satélites Landsat, SPOT, Planet, Sentinel-2, CBERS-4 e de outras fontes disponíveis;`,
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'g) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body'
          },
          {
            text: `Dados pessoais dos responsáveis pelo imóvel rural obtidos no Sistema Nacional de Informações de Segurança Pública (SINESP-INFOSEG).`,
            margin: [20, 0, 30, 15],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        text: '2.2 Método utilizado',
        style: 'listItem'
      },
      {
        text: 'Todas as  informações acima  descritas foram  integradas  utilizando a ',
        alignment: 'right',
        margin: [0, 0, 30, 0],
        style: 'body'
      },
      {
        text: `plataforma computacional TerraMA². Essa plataforma foi desenvolvida pelo INPE para o monitoramento, análise e emissão de alertas sobre extremos ambientais¹. Assim, utilizando esta base tecnológica inovadora, no domínio de softwares abertos, as tarefas executadas pela plataforma foram definidas para coletar, analisar (intersecção de geometrias dos mapas), visualizar e consultar dados sobre danos ambientais causados por desmatamentos recentes. Para isso, dados dinâmicos e estáticos foram processados para produzirem as informações que foram sistematizadas neste relatório.`,
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Os  dados de  desmatamentos (polígonos)  do DETER  foram  cruzados',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `com informações geoespaciais de fontes oficiais para identificação e quantificação dos danos ambientais causados por desmatamentos ilegais, bem como para identificação dos responsáveis pelo imóvel rural detectado, para fins de responsabilização civil, administrativa e, eventualmente, criminal pelos danos causados.`,
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'As  informações  sobre  o imóvel  rural onde incidiu  o desmatamento e',
        alignment: 'right',
        margin: [152, 0, 30, 0],
        style: 'body'
      },
      {
        text: ' sua titularidade foram coletadas na base de dados do SIMCAR e/ou INCRA.',
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Para qualificação  da área desmatada, os  polígonos dos desmatamen-',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `mentos foram intersectados com dados geoespaciais de áreas protegidas (APP, ARL, AUR, UC e TI).`,
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Para  identificar  ilícitos ambientais, os  polígonos dos  desmatamentos',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `foram intersectados com dados geospaciais das Autorizações de Exploração (AUTEX) e de Desmatamento (AD) emitidas pela SEMA. Ainda, verificou-se se as áreas desmatadas se encontram ou haviam sido embargadas pela SEMA. Os poligonos de desmatento detectados externos às áreas com supressão de vegetação autorizada foram considerados como áreas de ilicitos ambientais.`,
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: '2.2.1 Sistema de Detecção de Desmatamento em Tempo Real (DETER)',
        style: 'listItem'
      },
      {
        text: 'Os projetos  PRODES e  DETER, utilizados para identificação  e quantifi-',
        alignment: 'justify',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `cação dos desmatamentos, fazem parte do Programa de Monitoramento da Amazônia e Demais Biomas (PAMZ+) desenvolvido pela Coordenação-geral de Observação da Terra (CGOBT) e Centro Regional da Amazônia (CRA) do INPE. Além do PRODES e DETER, o PAMZ+ conta também com o Sistema de Mapeamento do Uso e Ocupação da Terra (TerraClass). Estes três projetos são complementares e concebidos para atender diferentes objetivos.`,
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: `1    Informações mais detalhadas sobre o funcionamento do TerraMA² podem ser obtidas em http://www.TerraMA2.dpi.inpe.br/sobre. Acessado em 07.10.2019.`,
        fontSize: 8,
        margin: [30, 20, 30, 0]
      },
      {
        text: 'O objetivo  do DETER  é  identificar  as alterações  da vegetação natural ',
        alignment: 'justify',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
            'em biomas da Amazônia Legal (Amazônia e Cerrado), em áreas acima de 3 ha, com a emissão de alertas para apoio ' +
            'à fiscalização em tempo quase real. Para fisionomias florestais no bioma Amazônia, os alertas indicam áreas que ' +
            'sofreram corte raso ou intervenções pela exploração madeireira, mineração ou queimadas, ou seja, identificam e ' +
            'mapeiam áreas desflorestadas e degradadas, enquanto para o bioma Cerrado, é identificada apenas o corte raso da vegetação natural.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'O DETER é  operado  com  imagens do sensor WFI do  satélite CBERS-4',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: ` do INPE/CRESDA (Brasil/China), com resolução espacial de 64m e quatro bandas espectrais (azul, verde, vermelho e infravermelho próximo). Para isso, as frações de solo, vegetação e sombra em uma imagem são estimadas a partir do Modelo Linear de Mistura Espectral (MLME), a fim de realçar feições de extração seletiva de madeira e de queimadas, que fazem parte do processo de desmatamento.`,
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Assim, no âmbito do DETER, diariamente  são escolhidas imagens com',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `menor cobertura de nuvens e feita a composição das bandas espectrais mais sensíveis às respostas da contribuição do solo e da vegetação para realçar áreas de desmatamento, que são identificadas por fotointerpretação considerando a tonalidade, textura e contexto da área na imagem de satélite processada. Com essa metodologia, o sistema é capaz de diferenciar impactos naturais de antrópicos, em razão das feições das áreas analisadas. O tempo entre o mapeamento dos alertas, validação e inclusão no banco de dados é de aproximadamente 72 horas.`,
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Os dados do INPE constituem fonte de acentuada importância para a',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `gestão ambiental, e já embasaram importantes acordos com setores ligados ao agronegócio, como o Termo de Ajustamento de Conduta (TAC) da carne, Moratória da Soja e outros acordos intergovernamentais, como o feito na Conferência das Nações Unidas Sobre Mudanças Climáticas (COP21) para a redução das emissões de gases de efeito estufa por desflorestamento e degradação florestal. Ainda, a importância e credibilidade dos dados gerados pelo INPE é refletida pelas milhares de publicações científicas que utilizaram essas informações para realização de pesquisas, que podem ser encontrada no Google Scholar².`,
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: `2    Disponível em http://scholar.google.com.br. Acessado em 13.01.2020.`,
        fontSize: 8,
        margin: [30, 110, 30, 0]
      },
      {
        text: '3 ANÁLISE TÉCNICA',
        style: 'listItem'
      },
      {
        text: 'O  INPE, a  partir  dos  dados do  DETER,  identificou  desmatamento de',
        alignment: 'left',
        margin: [157, 0, 30, 0],
        style: 'body'
      },
      {
        text: `${ reportData.areaPastDeforestation } no imóvel rural denominado ${ reportData.name } no período de ${ reportData.formattedFilterDate }, conforme desmatamento explicitado no Quadro 1 (quantificação e descrição das áreas desmatadas que foram identificadas com o cruzamento dos dados descritos no histórico desse relatório).`,
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: [
          {
            text: 'Quadro 1 ',
            bold: true
          },
          {
            text: ' - Classes e quantitativos de áreas desmatadas e queimadas no imóvel rural denominado ' + reportData.name + ' a  partir da análise do DETER, no período ' + reportData.formattedFilterDate + '.'
          },
        ],
        margin: [30, 0, 30, 5],
        style: 'body',
        fontSize: 9
      },
      {
        style: 'tableStyle',
        table: {
          widths: ['*', '*'],
          headerRows: 1,
          body: [
            [
              {
                border: [false, false, false, false],
                text: ''

              },
              {
                border: [false, false, false, false],
                text: ''

              },
            ],
            [
              {
                text: 'Área atingida',
                style: 'tableHeader'
              },
              {
                text: 'Desmatamento no período (ha)',
                style: 'tableHeader'
              }
            ],
            ...reportData.deforestationPerClass.map(rel => {
              return [
                rel.className,
                rel.area
              ];
            }),
            [
              {
                colSpan: 2,
                style: 'tableHeader',
                text: 'Desmatamento Total (ha)'
              }
            ],
            [
              {
                colSpan: 2,
                alignment: 'center',
                text: `${ reportData.totalDeforestationArea }`
              }
            ],

          ]
        },
        fontSize: 9
      },
      {
        text: `Anota-se  que os  dados  acima indicam extreme de  dúvidas, com grau`,
        alignment: 'right',
        margin: [30, 15, 30, 0],
        style: 'body'
      },
      {
        text: 'de acurácia com mais de 90% de acerto, no entanto, alterações nos valores poderão ocorrer em decorrência de trabalhos de campo, pelo uso de outras imagens de satélite com diferentes resoluções espaciais, radiométricas e temporais, bem como pela fotointerpretação do analista durante a vetorização das áreas.',
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: `Na  representação  cartográfica  abaixo (Figura 2) é  possível visualizar,`,
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: `com imagens satelitais(Spot-2,5m, Landsat-30m, Sentinel-10m e Planet-3m) a situação da cobertura vegetal do imóvel rural no período de 2008 até ${ reportData.currentYear }.`,
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: '',
        pageBreak: 'after'
      },
      {
        columns: [
          reportData.images.spotPropertyLimitImage,
          reportData.images.landsatPropertyLimitImage,
        ],
        margin: [30, 0, 30, 0]
      },
      {
        columns: [
          {
            text: "a",
            style: "body",
            alignment: "center"
          },
          {
            text: "b",
            style: "body",
            alignment: "center"
          }
        ],
        margin: [30, 0, 30, 0]
      },
      {
        columns: [
          reportData.images.sentinelPropertyLimitImage,
          reportData.images.planetPropertyLimitImage
        ],
        margin: [30, 0, 30, 0]
      },
      {
        columns: [
          {
            text: "c",
            style: "body",
            alignment: "center"
          },
          {
            text: "d",
            style: "body",
            alignment: "center"
          }
        ],
        margin: [30, 0, 30, 0]
      },
      {
        text: [
          {
            text: 'Figura 2. ',
            bold: true
          },
          {
            text: `Comparativo de imagens de satélite (a) Spot de 2008, (b) Landsat de 2018 , (c) Sentinel de 2019 e (d) Planet de ${ reportData.currentYear }`,
            bold: false
          }
        ],
        margin: [30, 0, 30, 0],
        alignment: 'center',
        fontSize: 9
      },
      {
        text: '',
        pageBreak: 'after'
      },
      reportUtil.getDeforestationAlertsImages(deforestationAlerts),
      {
        text: '',
        pageBreak: 'after'
      },
      {
        text: '4 CONCLUSÃO',
        margin: [30, 20, 30, 0],
        style: 'listItem'
      },
      {
        text: '5 ANEXOS',
        style: 'listItem'
      },
      {
        text: [
          {
            text: 'Anexo 1.',
            style: 'body',
            bold: true
          },
          {
            text: '– Informações complementares;',
            style: 'body'
          }
        ],
        margin: [30, 0, 30, 0]
      },
      {
        text: '',
        pageBreak: 'after'
      },
      {
        text: '6 VALIDAÇÃO',
        margin: [30, 20, 30, 0],
        style: 'listItem'
      },
      {
        text: `Este relatório técnico foi validado em ${ reportData.currentDate } por: `,
        margin: [30, 0, 30, 180],
        alignment: 'center',
        style: 'body'
      },
      {
        text: 'Relatório técnico produzido em parceria com: ',
        margin: [30, 150, 30, 0],
        style: 'body'
      },
      staticImages.partnerImages,
    ],
    styles: {
      tableStyle: {
        alignment: 'center',
        fontSize: 9,
        margin: [30, 0, 30, 5]
      },
      tableHeader: {
        fontSize: 10,
        fillColor: '#eeeeff',
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 0]
      },
      headerBody: {
        fontSize: 10,
        alignment: 'left',
        margin: [30, 0, 30, 2]
      },
      body: {
        fontSize: 11,
        alignment: 'justify',
        lineHeight: 1.5
      },
      bodyIndentFirst: {
        fontSize: 11,
        alignment: 'justify',
        lineHeight: 1.5,
        leadingIndent: 120,
      },
      title: {
        bold: true,
        fontSize: 11,
        alignment: 'center',
        margin: [30, 0, 30, 5]
      },
      listItem: {
        bold: true,
        fontSize: 12,
        alignment: 'left',
        margin: [30, 0, 30, 10]
      }
    }
  };
};
