function dinamicFiringAuthText(firingAuthData, formattedFilterDate) {
  const paragraph = [];
  const authNumbers = firingAuthData.firingAuth.map(
    (auth) => `de ${auth.data_apro} a ${auth.data_venc}, AQC n. ${auth['titulo_nu1']}`,
  );
  if (firingAuthData.firingAuth.length === 0) {
    paragraph.push({
      text:
        'Verificou-se que não há autorização de queima controlada emitida ' +
        'para o imóvel rural em análise.',
      alignment: 'left',
      margin: [30, 15, 30, 0],
      style: 'bodyIndentFirst',
    });
  } else {
    paragraph.push({
      text:
        'Verificou-se que há autorização de queima controlada emitida ' +
        `para o imóvel rural em análise para o período ${authNumbers.join(', ')}.`,
      alignment: 'left',
      margin: [30, 15, 30, 0],
      style: 'bodyIndentFirst',
    });
  }
  return paragraph;
}

module.exports = function (headerDocument, reportData, title) {
  return {
    info: {
      title: 'Relatório QUEIMADA',
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
                margin: [483, 0, 30, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
      };
    },
    header(currentPage, pageCount, pageSize) {
      return {
        columns: headerDocument,
      };
    },
    content: [
      {
        text: [
          {
            text: 'SAT: ',
            bold: true,
          },
          {
            text: ` ${
              reportData.property.sat
                ? reportData.property.sat
                : 'XXXXXXXXXXXXX'
            }`,
            bold: false,
          },
        ],
        style: 'headerBody',
      },
      {
        text: [
          {
            text: 'MUNICÍPIO:',
            bold: true,
          },
          {
            text: ` ${reportData.property.city}`,
            bold: false,
          },
        ],
        style: 'headerBody',
      },
      {
        text: [
          {
            text: 'COMARCA:',
            bold: true,
          },
          {
            text: ` ${reportData.property.county}`,
            bold: false,
          },
        ],
        style: 'headerBody',
        margin: [30, 0, 30, 20],
      },
      {
        text: 'SATÉLITES ALERTAS – TCT 30/2018 MPMT/INPE',
        color: 'green',
        style: 'title',
      },
      {
        text: `${title}`,
        style: 'title',
        margin: [30, 0, 30, 20],
      },
      {
        text: `DATA DE EMISSÃO: ${reportData.currentDate}`,
        alignment: 'left',
        style: 'title',
      },
      {
        text: `PERÍODO DE ANÁLISE: ${reportData.formattedFilterDate}`,
        alignment: 'left',
        style: 'title',
        margin: [30, 0, 30, 20],
      },
      {
        text: '1 OBJETO',
        style: 'listItem',
      },
      {
        text: [
          {
            text:
              'Trata-se de relatório técnico sobre incêndio identificado com o ' +
              'uso de Sistema de Informações Geográficas no imóvel rural ' +
              `${reportData.property.city}`,
          },
          {
            text: ' (Figura 1) ',
            bold: true,
          },
          {
            text:
              ' com área igual a ' +
              `${reportData.property.area}` +
              ' hectares localizada no município de ' +
              reportData.property.city +
              '-MT, pertencente a ' +
              `${reportData.property.owner}` +
              ', conforme informações declaradas no ' +
              ' Sistema Sistema Nacional de Cadastro Ambiental Rural (SICAR), protocolo CAR ' +
              reportData.property.register,
          },
          {
            text: ' (Anexo 1) ',
            bold: true,
          },
          {
            text: '.',
          },
        ],
        alignment: 'justify',
        margin: [30, 0, 30, 15],
        style: 'bodyIndentFirst',
      },
      reportData.images.geoserverImage1,
      {
        text: [
          {
            text: 'Figura 1. ',
            bold: true,
          },
          {
            text: 'Mapa de Localização e do Perímetro do Imóvel',
            bold: false,
          },
        ],
        alignment: 'center',
        fontSize: 9,
        margin: [30, 0, 30, 15],
      },
      {
        text: '2 HISTÓRICO',
        style: 'listItem',
      },
      {
        text:
          'As informações sobre os incêndios foram integradas no âmbito ' +
          'do Termo de Cooperação Técnica n. 30/2018 firmado entre Ministério Público do Estado de Mato Grosso ' +
          'e Instituto Nacional de Pesquisas Espaciais (INPE), cujo objeto consiste na ',
        margin: [30, 0, 30, 15],
        style: 'bodyIndentFirst',
      },
      {
        columns: [
          {
            text: `Edifício Sede das Promotorias de Justiça da Capital
                  Av. Desembargador Milton Figueiredo Ferreira Mendes, s/nº
                  Setor D - Centro Político e Administrativo • Cuiabá/MT
                  CEP: 78049-928`,
            fontSize: 7,
            alignment: 'left',
          },
          {
            text: `Telefone: (65) 3611-2664`,
            fontSize: 7,
            alignment: 'center',
          },
          {
            text: `caop@mpmt.mp.br`,
            fontSize: 7,
            alignment: 'right',
          },
        ],
        margin: [30, 0, 30, 15],
      },
      {
        text: '',
        pageBreak: 'after',
      },
      {
        text: '3 Dados utilizados',
        style: 'listItem',
      },
      {
          text:
            'coleta automática, armazenamento ' +
            'e tratamento de dados geoespaciais para interseções entre produtos do PRODES, DETER e Programa Queimadas do ' +
            'INPE, com os dados de fontes estatais ' +
            'oficiais para quantificação e descrição das áreas afetadas por desmatamento ou queimada.',
          margin: [30, 0, 30, 0],
          style: 'body',
      },
      {
        columns: [
          {
            text: 'a) ',
            margin: [50, 0, 0, 15],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Dados históricos dos focos de calor ativos no Estado de Mato Grosso ' +
              'mapeados pelo Programa Queimadas desenvolvido pelo INPE;',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        columns: [
          {
            text: 'b) ',
            margin: [50, 0, 0, 15],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Informações e dados geográficos do SIMCAR Parceiros e Público, da Secretaria de Meio Ambiente do Estado de Mato Grosso (SEMA). Os ' +
              'dados declarados no SIMCAR foram unidos em uma única base, ' +
              'compreendendo os CAR validades, aguardando ' +
              'complementação, em análise e migrados do Sistema de Cadastro ' +
              'Ambiental Rural (SICAR). Foram excluídos da base os CAR com status ' +
              'cancelado e indeferido;',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        columns: [
          {
            text: 'c) ',
            margin: [50, 0, 0, 15],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Dados do Navegador Geográfico da SEMA (SIMGEO): referentes às ' +
              'autorizações de queima controlada (AQC)',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        columns: [
          {
            text: 'd) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Dados geográficos das Unidades de Conservação (UC) no Estado de Mato Grosso, disponíveis no Cadastro Nacional de Unidades ' +
              'de Conservação do Ministério de Meio Ambiente (MMA);',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        columns: [
          {
            text: 'e) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Dados geográficos das Terras Indígenas no Estado de Mato Grosso, disponíveis no sítio eletrônico da Fundação Nacional do Índio (FUNAI);',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        columns: [
          {
            text: 'f) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Imagens dos Satélites Landsat, SPOT, Planet, Sentinel-2, CBERS-4 e de outras fontes que estiverem disponíveis;',
            margin: [20, 0, 30, 5],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        columns: [
          {
            text: 'g) ',
            margin: [50, 0, 0, 5],
            width: 'auto',
            style: 'body',
          },
          {
            text:
              'Dados pessoais dos responsáveis pelo imóvel rural obtidos no Sistema Nacional de Informações de Segurança Pública (SINESP-INFOSEG).',
            margin: [20, 0, 30, 15],
            width: 'auto',
            style: 'body',
          },
        ],
      },
      {
        text: '4 Método utilizado',
        style: 'listItem',
      },
      {
        text: (
          'Todas as informações acima descritas foram integradas utilizando ' +
          'a plataforma computacional TerraMA2. Essa plataforma foi desenvolvida pelo INPE para o monitoramento, ' +
          'análise e emissão de alertas sobre extremos ambientais¹. Assim, ' +
          'utilizando esta base tecnológica inovadora, ' +
          'no domínio de softwares abertos, as tarefas executadas pela plataforma foram definidas para coletar, ' +
          'analisar (intersecção de geometrias ' +
          'dos mapas), visualizar e consultar dados sobre danos ambientais causados ' +
          'por queimadas. Para ' +
          'isso, dados dinâmicos e estáticos foram processados para produzirem as informações ' +
          'que foram sistematizadas neste relatório.'
        ),
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst',
      },
      {
        text: [
          {
            text:
              '1    Informações mais detalhadas sobre o funcionamento do TerraMA² podem ser obtidas em ',
          },
          {
            text: 'http://www.TerraMA2.dpi.inpe.br/sobre',
            link: 'http://www.TerraMA2.dpi.inpe.br/sobre',
            color: 'blue',
          },
          {
            text: '. Acessado em 07.10.2019.',
          },
        ],
        margin: [30, 20, 30, 0],
        fontSize: 8,
      },
      {
        text: '',
        pageBreak: 'after',
      },
      {
        text: (
          'Os dados do Programa Queimadas (pontos representando a ' +
          'área nominal do píxel de fogo), foram cruzados com ' +
          'informações geoespaciais de fontes oficiais para identificação de incêndios ' +
          'florestais em imóveis rurais no Estado de Mato Grosso, bem como para ' +
          'identificação dos responsáveis pelo imóvel rural atingido.'),
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst'
      },
      {
        text: (
          'Para validação dos incêndios ilegais, os focos de calor foram ' +
          'intersectados com os dados geospaciais das autorizações de queima ' +
          'controlada (AQC) emitidas pela SEMA, assim como foi verificada a existência ' +
          'de cicatriz causada pela passagem de fogo na vegetação a partir da ' +
          'interpretação das imagens de satélite após ou durante o período de ' +
          `${reportData.formattedFilterDate}. Ainda, foram elaborados gráficos contendo as séries` +
          'temporais de focos de calor que incidiram no imóvel rural ao longo dos anos ' +
          '(a partir de 1999) e no período de 15 de julho até 15 de setembro desde 2006 ' +
          '(período proibitivo de uso do fogo para limpeza e manejo de áreas conforme ' +
          'Lei Estadual n. 233, de 21 de dezembro de 2005).'
          ),
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst',
      },
      {
        text: '4.1 Programa Queimadas',
        style: 'listItem',
      },
      {
        text:
        'Os projetos PRODES e DETER, utilizados para identificação e ' +
        'quantificação dos desamatentos, fazem parte do Programa de Monitoramento da Amazônia e ' +
        'Demais Biomas (PAMZ+) ' +
        'desenvolvido pela Coordenação-geral de Observação da Terra (CGOBT) e Centro Regional da Amazônia (CRA) do INPE. ' +
        'Além do PRODES e DETER, o PAMZ+ conta também com o Sistema de Mapeamento do Uso e Ocupação da Terra (TerraClass). ' +
        'Estes três projetos são complementares e concebidos para atender diferentes objetivos.',
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst',
      },
      {
        text:
          'Os dados de queimadas possuem características distintas pois ' +
          'os focos representados na forma de um ponto são a indicação do centro de um píxel de uma imagem de um dos ' +
          'satélites recebidos e processados pelo INPE. A quantidade de satélites pode variar ao longo do tempo e por este ' +
          'motivo as comparações interanuais são realizadas apenas pelos dados do satélite AQUA. No entanto, para ' +
          'identificar e confirmar a ocorrência de fogo na vegetação este relatório considera todos os focos dos satélites AQUA,' +
          'TERRA, SNPP e NOAA-20 pelo fato de possuírem uma precisão geométrica maior. Devido a alta frequência de imageamento ' +
          ' os pontos de todos os satélites são utilizados para indicar o primeiro e último dia de ocorrência de fogo numa dada propriedade.',
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst',
      },
      {
        text:
          'As cicatrizes das áreas queimadas são produzidas sistematicamente ' +
          'para o bioma Cerrado com uso das imagens do satélite Landsat-8 ' +
          'e estes dados, com resolução espacial de 30 metros, confirmam a localização e extensão ' +
          'da superfície queimada.',
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst',
      },
      {
        text:
          'Os dados do INPE constituem fonte de acentuada importância ' +
          'para a gestão ambiental, e já embasaram importantes acordos com setores ligados ao agronegócio, como o ' +
          'Termo de Ajustamento de Conduta (TAC) da carne, Moratória da Soja e outros acordos intergovernamentais, como ' +
          'o feito na Conferência das Nações Unidas Sobre Mudanças Climáticas (COP21) para a redução das emissões de gases ' +
          'de efeito estufa por desflorestamento e degradação florestal. Ainda, a importância e credibilidade dos dados gerados ' +
          'pelo INPE é refletida pelas milhares de publicações científicas que utilizaram essas informações para realização de ' +
          'pesquisas, que podem ser encontrada no Google Scholar².',
        margin: [30, 0, 30, 15],
        style: 'bodyIndentFirst',
      },
      {
        text: '5 ANÁLISE TÉCNICA',
        style: 'listItem',
      },
      {
        text:
          'O INPE, a partir dos dados do Programa Queimadas identificou ' +
          `${reportData.property.burnCount['total_focus']} ` +
          ' focos de calor ativos no imóvel rural denominado ' +
          `${reportData.property.name} ` +
          `no período de ${reportData.formattedFilterDate.replace(
            'a',
            'até',
          )}. Na figura 02 é possível ` +
          'observar em imagem de satélite a cicatriz de incêndio na vegetação do ' +
          'imóvel rural causada pela passagem de fogo (feições de cor roxa na imagem ' +
          'de satélite), assim como os focos de calor que incidiram na região do ' +
          'incêndio. Nas figuras 03 e 04 constam os gráficos com as séries temporais de ' +
          'focos de calor que incidiram no imóvel rural ao longo dos anos (a partir de ' +
          '1999) e no período de 15 de julho até 15 de setembro desde o ano 2006 (ano ' +
          'após a vigência da Lei Estadual n. 233, de 21 de dezembro de 2005, que ' +
          'estabelece o período proibitivo de uso do fogo para limpeza e manejo de ' +
          'áreas no Estado de Mato Grosso).',
        margin: [30, 0, 30, 15],
        style: 'bodyIndentFirst',
      },
      reportData.images.geoserverImage2,
      {
        text: [
          {
            text: 'Figura 2 ',
            bold: true,
          },
          {
            text:
              '- imagem de satélite evidenciando as cicatrizes de incêndios e focos de calor ativos na vegetação ' +
              'da ' +
              reportData.property.name +
              ' em ' +
              reportData.property.city +
              '-MT',
            bold: false,
          },
        ],
        margin: [30, 0, 30, 0],
        style: 'body',
        fontSize: 10,
      },
      {
        text:  [
          {
            text: '²Disponível em ',
          },
          {
            text: 'https://scholar.google.com.br',
            link: 'https://scholar.google.com.br',
            color: 'blue',
          },
          {
            text: ', acessado em 13.01.2020.'
          }
        ],
        fontSize: 8,
        margin: [30, 100, 30, 0],
      },
      {
        text: '',
        pageBreak: 'after'
      },
      reportData.FocusChartImage,
      {
        text: [
          {
            text: 'Figura 3 ',
            bold: true,
          },
          {
            text:
              '- Série histórica de focos de calor ativos na ' +
              reportData.property.name +
              ' em ' +
              reportData.property.city +
              '-MT',
            bold: false,
          },
        ],
        margin: [30, 0, 30, 0],
        style: 'body',
        fontSize: 10,
      },
      ...dinamicFiringAuthText(
        reportData.property,
        reportData.formattedFilterDate,
      ),
      {
        text: '6 CONCLUSÃO',
        style: 'listItem',
      },
      {
        text:
          'Foi observada a ocorrência de incêndio na vegetação da ' +
          reportData.property.name +
          ', conforme a identificação de cicatriz de incêndio em imagem de satélite após o período analisado ' +
          'e a incidência de focos de calor no imóvel rural durante esse período.',
        margin: [30, 0, 30, 5],
        style: 'bodyIndentFirst',
      },
      {
        text:
          'Após a análise da série histórica de focos de calor no' +
          'imóvel rural ao longo dos anos e em períodos proibitivos, observou-se que a ' +
          'ocorrência de incêndio é reincidente, sendo recomendada a adoção de ' +
          'medidas preventivas e de combate aos incêndios florestais no local. ',
        margin: [30, 0, 30, 15],
        style: 'bodyIndentFirst',
      },
      {
        text: '7 ANEXOS',
        style: 'listItem',
      },
      {
        text: [
          {
            text: 'Anexo 1.',
            style: 'body',
            bold: true,
          },
          {
            text: ` – Informações sobre o CAR ${
              reportData.property.register
                ? reportData.property.register
                : reportData.property.federalregister
            };`,
            style: 'body',
          },
        ],
        margin: [30, 0, 30, 0],
      },
      {
        text: [
          {
            text: 'Anexo 2.',
            style: 'body',
            bold: true,
          },
          {
            text:
              ' – Relatório do SINESP-INFOSEG referente aos proprietários/posseiros do imóvel rural. ',
            style: 'body',
          },
        ],
        margin: [30, 0, 30, 0],
      },
      {
        text: [
          {
            text: 'Anexo 3.',
            style: 'body',
            bold: true,
          },
          {
            text:
              ' – Relação de propostas de medidas preventivas ' +
              'e de combate aos incêndios florestais para serem implementadas no imóvel ' +
              'rural.',
            style: 'body',
          },
        ],
        margin: [30, 0, 30, 30],
      },
      {
        text: '',
        pageBreak: 'after'
      },
      {
        text: '8 VALIDAÇÃO',
        margin: [30, 15, 30, 0],
        style: 'listItem',
      },
      {
        margin: [30, 30, 30, 250],
        text: `Este relatório técnico foi validado em ${reportData.currentDate} por: `,
        alignment: 'center',
        style: 'body',
      },
      {
        text: 'Relatório técnico produzido em parceria com: ',
        margin: [30, 0, 30, 15],
        style: 'body',
      },
      {
        columns: [
          reportData.images.partnerImage1,
          reportData.images.partnerImage2,
          reportData.images.partnerImage3,
        ],
      },
      {
        columns: [
          reportData.images.partnerImage4,
          reportData.images.partnerImage5,
          reportData.images.partnerImage6,
        ],
      },
      {
        columns: [
          reportData.images.partnerImage7,
          reportData.images.partnerImage8,
          reportData.images.partnerImage9,
        ],
      },
    ],
    styles: {
      tableStyle: {
        alignment: 'center',
        margin: [30, 0, 30, 5],
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 0],
      },
      headerBody: {
        fontSize: 10,
        alignment: 'left',
        margin: [30, 0, 30, 2],
      },
      body: {
        fontSize: 11,
        alignment: 'justify',
        lineHeight: 1.5,
      },
      bodyIndentFirst: {
        fontSize: 11,
        alignment: 'justify',
        lineHeight: 1.5,
        leadingIndent: 176,
      },
      title: {
        bold: true,
        fontSize: 11,
        alignment: 'center',
        margin: [30, 0, 30, 5],
      },
      listItem: {
        bold: true,
        fontSize: 12,
        alignment: 'left',
        margin: [30, 0, 30, 10],
      },
      titleAttachment: {
        fontSize: 25,
        bold: true,
        alignment: 'center',
        margin: [0, 400, 0, 80],
      },
      subTitleAttachment: {
        fontSize: 14,
      },
      lead: {
        leadingIdent: 100,
      },
    },
  };
};
