module.exports = function (headerDocument, reportData, title) {
  return {
    info: {
      title: 'Relatório DETER'
    },
    pageMargins: [30, 90, 30, 30],
    footer(pagenumber, pageCount) {
      return {
        table: {
          body: [
            [
              {
                text: 'Página ' + pagenumber + ' de ' + pageCount,
                fontSize: 6,
                bold: true,
                margin: [483, 0, 30, 0]
              }
            ],
          ]
        },
        layout: 'noBorders'
      };
    },
    header(currentPage, pageCount, pageSize) {
      return {
        columns: headerDocument
      };
    },
    content: [
      {
        text: [
          {
            text: 'SAT:',
            bold: true
          },
          {
            text: ` ${reportData.property.sat ? reportData.property.sat : 'XXXXXXXXXXXXX'}`,
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
            text: ` ${ reportData.property.city}-MT`,
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
            text: ` ${ reportData.property.county}`,
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
        text: `RELATÓRIO TÉCNICO SOBRE ALERTA DE DESMATAMENTO Nº XXXXX/${ reportData.year}`,
        style: 'title',
        margin: [30, 0, 30, 20]
      },
      {
        text: '1. OBJETIVO',
        style: 'listItem'
      },
      {
        text: [
          {
            text: 'Trata-se de relatório técnico sobre desmatamentos ilegais identificados ',
            alignment: 'right',
          },
          {
            text: (
              ' com o uso de Sistema de Informações Geográficas no imóvel rural ' +  reportData.property.name +
              ' (Figura 1), localizado no município de ' +  reportData.property.city +
              '-MT, pertencente a ' +  reportData.property.owner + ', conforme informações declaradas no ' +
              ' Sistema Mato-grossense de Cadastro Ambiental Rural (SIMCAR), protocolo CAR-MT ' +  reportData.property.register
            ),
          },
          {
            text: ' (Anexo 1) ',
            bold: true
          },
          {
            text: (
              '/ acervo fundiário do Instituto Nacional de Colonização e Reforma Agrária (SIGEF/INCRA).'
            )
          }
        ],
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        columns: [
          reportData.images.geoserverImage1,
          reportData.images.geoserverImage2
        ]
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
        fontSize: 10
      },
      {
        text: '2 HISTÓRICO',
        style: 'listItem'
      },
      {
        text: 'As informações sobre os desmatamentos foram integradas no âmbito ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
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
            text: (
              'Dados das áreas desmatadas no Estado de Mato Grosso mapeadas pelo Sistema de Detecção de Desmatamento em Tempo Real (DETER) ' +
              '(alertas de desmatamento em tempo quase real) desenvolvido pelo INPE;'
            ),
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
            text: (
              'Informações e dados geográficos do SIMCAR Parceiros e Público, da Secretaria de Meio Ambiente do Estado de Mato Grosso (SEMA), como: ' +
              'i. Proprietário(s)/posseiro(s); ' +
              'ii. Base de referência do CAR validado; ' +
              'iii. Base de referência do CAR em análise; ' +
              'iv. Base de referência do CAR aguardando complementação; '  +
              'v. Base de referência do CAR cancelado e indeferido; e ' +
              'vi. Base de referência do Programa de Regularização Ambiental (PRA);'
            ),
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
            text: (
              'Dados do Navegador Geográfico da SEMA (SIMGEO): ' +
              'i. Base de referência das áreas embargadas pela SEMA. ' +
              'ii. Base de referência das áreas desembargadas pela SEMA; ' +
              'iii. Base de referência das Autorizações de Exploração (AUTEX); ' +
              'iv. Base de referência das Autorizações de Desmatamento (AD); ' +
              'v. Base de referência das Áreas de Preservação Permanente (APP), Reserva Legal (ARL), Uso Restrito (AUS) e de Uso Consolidado (AUC);'
            ),
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
            text: 'Dados do acervo fundiário do Instituto Nacional de Colonização e Reforma Agrária (SIGEF/INCRA);',
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
            text: (
              'Dados geográficos das Unidades de Conservação (UC) no Estado de Mato Grosso, disponíveis no Cadastro Nacional de Unidades ' +
              'de Conservação do Ministério de Meio Ambiente (MMA);'
            ),
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
            text: (
              'Dados geográficos das Terras Indígenas no Estado de Mato Grosso, disponíveis no sítio eletrônico da Fundação Nacional do Índio (FUNAI);'
            ),
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
            text: (
              'Mapa de vegetação do Projeto RadamBrasil;'
            ),
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'h) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body'
          },
          {
            text: 'Imagens dos Satélites Landsat, SPOT, Planet, Sentinel-2, CBERS-4 e de outras fontes disponíveis;',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body'
          }
        ]
      },
      {
        columns: [
          {
            text: 'i) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body'
          },
          {
            text: 'Dados pessoais dos responsáveis pelo imóvel rural obtidos no Sistema Nacional de Informações de Segurança Pública (SINESP-INFOSEG).',
            margin: [20, 0, 30, 5],
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
        text: 'Todas as informações acima descritas foram integradas utilizando a ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'plataforma computacional TerraMA2. Essa plataforma foi desenvolvida pelo INPE para o monitoramento, ' +
          'análise e emissão de alertas sobre extremos ambientais¹. Assim, utilizando esta base tecnológica inovadora, ' +
          'no domínio de softwares abertos, as tarefas executadas pela plataforma foram definidas para coletar, ' +
          'analisar (intersecção de geometrias dos mapas), visualizar e consultar dados sobre danos ambientais causados ' +
          'por desmatamentos recentes. Para isso, dados dinâmicos e estáticos foram processados para produzirem as informações ' +
          'que foram sistematizadas neste relatório.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Os dados de desmatamentos (polígonos) do Sistema DETER foram cruzados ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'com informações geoespaciais de fontes oficiais para identificação e quantificação ' +
          'dos danos ambientais causados por desmatamentos supostamente ilegais, bem como para ' +
          'identificação dos responsáveis pelo imóvel rural atingido, para fins de responsabilização civil, administrativa ' +
          'e, eventualmente, criminal pelos danos causados.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'As informações sobre o imóvel rural onde incidiu o desmatamento e',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: ' sua titularidade foram coletadas na base de dados do SIMCAR e/ou INCRA.',
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Para qualificação da área desmatada, o tipo de vegetação foi ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'identificado utilizando o mapa de vegetação do Projeto RadamBrasil.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Os dados geoespaciais do SIMGEO, MMA e FUNAI foram cruzados ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'com os dados do INPE para identificação e quantificação dos desmatamentos em áreas protegidas ' +
          '(APP, ARL, AUR, UC e TI), bem como para identificar ilícitos ambientais, mediante o cruzamento ' +
          'com dados das Autorizações de Exploração (AUTEX) e de Desmatamento (AD) emitidas pela SEMA.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: '2.2.1 Sistema de Detecção de Desmatamento em Tempo Real (DETER)',
        style: 'listItem'
      },
      {
        text: 'Os projetos PRODES e DETER, utilizados para identificação e ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'quantificação dos desmatamentos, fazem parte do Programa de Monitoramento da Amazônia e '
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: (
          'Demais Biomas (PAMZ+)' +
          'desenvolvido pela Coordenação-geral de Observação da Terra (CGOBT) e Centro Regional da Amazônia (CRA) do INPE. ' +
          'Além do PRODES e DETER, o PAMZ+ conta também com o Sistema de Mapeamento do Uso e Ocupação da Terra (TerraClass). ' +
          'Estes três projetos são complementares e concebidos para atender diferentes objetivos.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'O objetivo do DETER é identificar as alterações da vegetação natural ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
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
        text: 'O DETER é operado com imagens do sensor WFI do satélite CBERS-4 do INPE/CRESDA ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          '(Brasil/China), com resolução espacial de 64m e quatro bandas espectrais (azul, verde, ' +
          'vermelho e infravermelho próximo). Para isso, as frações de solo, vegetação e sombra em uma ' +
          'imagem são estimadas a partir do Modelo Linear de Mistura Espectral (MLME), a fim de realçar ' +
          'feições de extração seletiva de madeira e de queimadas, que fazem parte do processo de desmatamento.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Assim, no âmbito do DETER, diariamente são escolhidas imagens com ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'menor cobertura de nuvens e feita a composição' +
          'das bandas espectrais mais sensíveis às respostas da contribuição do solo e da vegetação para realçar áreas de ' +
          'desmatamento, que são identificadas por fotointerpretação considerando a tonalidade, textura e contexto da área ' +
          'na imagem de satélite processada. Com essa metodologia, o sistema é capaz de diferenciar impactos naturais de antrópicos, ' +
          'em razão das feições das áreas analisadas. O tempo entre o mapeamento dos alertas, validação e inclusão no banco de dados ' +
          'é de aproximadamente 72 horas.'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: 'Os dados do INPE constituem fonte de acentuada importância para a ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'gestão ambiental, e já embasaram importantes acordos com setores ligados ao agronegócio, como o ' +
          'Termo de Ajustamento de Conduta (TAC) da carne, Moratória da Soja e outros acordos intergovernamentais, como ' +
          'o feito na Conferência das Nações Unidas Sobre Mudanças Climáticas (COP21) para a redução das emissões de gases ' +
          'de efeito estufa por desflorestamento e degradação florestal1. Ainda, a importância e credibilidade dos dados gerados ' +
          'pelo INPE é refletida pelas milhares de publicações científicas que utilizaram essas informações para realização de ' +
          'pesquisas, que podem ser encontrada no Google Scholar².'
        ),
        margin: [30, 0, 30, 5],
        style: 'body'
      },
      {
        text: '3 ANÁLISE TÉCNICA',
        style: 'listItem'
      },
      {
        text: 'A partir do sistema Satélites Alertas foram obtidos os alertas DETER ',
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: (
          'detectados no período entre XX/XX/XXXX a XX/XX/XXXX. ' +
          'Dessa forma, seguem abaixo as informações sobre os desmatamentos.'
        ),
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        text: [
          {
            text: 'Quadro 1 ',
            margin: [30, 0, 30, 0],
            bold: true,
          },
          {
            text: `- Classes e quantitativos de áreas desmatadas e queimadas no imóvel`,
            margin: [30, 0, 30, 0],
            bold: false
          }
        ],
        alignment: 'right',
        style: 'body',
        fontSize: 10
      },
      {
        text: ` rural denominado ${reportData.property.name} a partir da análise do DETER, em ${reportData.currentDate}`,
        margin: [30, 0, 30, 15],
        style: 'body'
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
                colSpan: 2,
                style: 'tableHeader',
                text: 'Área de Uso Consolidado (ha)'
              }
            ],
            [
              {
                colSpan: 2,
                alignment: 'center',
                text: `${reportData.property.areaUsoCon}`
              }
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
            ...reportData.property.tableData.map(rel => {
              return [
                rel.affectedArea,
                rel.pastDeforestation
              ];
            }),
            [
              {
                colSpan: 2,
                style: 'tableHeader',
                text: 'Desmatamento por tipologia vegetal (ha)'
              }
            ],
            [
              {
                alignment: 'center',
                text: `${reportData.property.tableVegRadam.affectedArea}`
              },
              {
                alignment: 'center',
                text: `${reportData.property.tableVegRadam.pastDeforestation}`
              }
            ],
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
                text: `${reportData.property.areaPastDeforestation}`
              }
            ],

          ]
        },
        fontSize: 9
      },
      {
        text: '',
        pageBreak: 'after'
      },
      {
        text: [
          {
            text: 'Observaçoes: ',
            bold: true
          },
          {
            text: `${reportData.property.comments ? reportData.property.comments : 'XXXXXXXXXXXXX'}`,
            bold: false
          }
        ],
        alignment: 'justify',
        margin: [30, 30, 30, 30],
        fontSize: 10
      },
      {
        text: '4 CONCLUSÃO',
        margin: [30, 20, 30, 0],
        style: 'listItem'
      },
      {
        text: `${ reportData.property.foundDeter ? 'Houve' : 'Não houve'} desmatamento ilegal no imóvel rural objeto deste Relatório Técnico, conforme`,
        alignment: 'right',
        margin: [30, 0, 30, 0],
        style: 'body'
      },
      {
        text: 'descrito no Quadro 01 (vide item 3. Análise Técnica).',
        margin: [30, 0, 30, 15],
        style: 'body'
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
            text: ` – Informações sobre o CAR ${reportData.property.register ? reportData.property.register : reportData.property.federalregister};`,
            style: 'body'
          }
        ],
        margin: [30, 0, 30, 0]
      },
      {
        text: [
          {
            text: 'Anexo 2.',
            style: 'body',
            bold: true
          },
          {
            text: ' – Relatório do SINESP-INFOSEG referente aos proprietários/posseiros do imóvel rural. ',
            style: 'body'
          }
        ],
        margin: [30, 0, 30, 0],
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
        text: `Este relatório técnico foi validado em ${ reportData.currentDate} por: `,
        margin: [30, 0, 30, 100],
        alignment: 'center',
        style: 'body'
      },
      {
        text: 'Relatório técnico produzido em parceria com: ',
        margin: [30, 0, 30, 15],
        style: 'body'
      },
      {
        columns: [
          reportData.images.partnerImage1,
          reportData.images.partnerImage2,
          reportData.images.partnerImage3
        ]
      },
      {
        columns: [
          reportData.images.partnerImage4,
          reportData.images.partnerImage5,
          reportData.images.partnerImage6
        ],
      },
      {
        columns: [
          reportData.images.partnerImage7,
          reportData.images.partnerImage8,
          reportData.images.partnerImage9
        ]
      }
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
