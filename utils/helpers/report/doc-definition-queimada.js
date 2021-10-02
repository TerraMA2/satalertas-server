const reportUtil = require("../../report.utils");

function getBurningAuthorizationText(burningAuthorization) {
  let text = '';
  if (burningAuthorization.length === 0) {
    text = 'Verificou-se que não há autorização de queima controlada emitida ' +
            'para o imóvel rural em análise.'
  } else {
    const authorizationPeriod = burningAuthorization.map(auth => `de ${ auth.approvalDate } a ${ auth.expirationDate }, AQC n. ${ auth.authorizationNumber }`);
    text = `'Verificou-se que há autorização de queima controlada emitida ' +
            para o imóvel rural em análise para o período ${ authorizationPeriod.join(', ') }.`
  }
  return[{
    text,
    alignment: 'left',
    margin: [30, 0, 30, 5],
    style: 'bodyIndentFirst'
    }];
}

module.exports = function (reportData) {
    const registerToUse = reportData.stateRegister
        ? reportData.stateRegister
        : reportData.federalregister;
    const staticImages = reportUtil.getStaticImages();
    return {
        info: {
            title: 'Relatório QUEIMADA',
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
                        text: 'SAT: ',
                        bold: true,
                    },
                    {
                        text: ` ${
                            reportData.sat
                                ? reportData.sat
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
                        text: ` ${ reportData.cityName }`,
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
                        text: ` ${ reportData.county }`,
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
                text: `RELATÓRIO DE FOCOS DE CALOR Nº ${ reportData.code }`,
                style: 'title',
                margin: [30, 0, 30, 20],
            },
            {
                text: `DATA DE EMISSÃO: ${ reportData.currentDate }`,
                alignment: 'left',
                style: 'title',
            },
            {
                text: `PERÍODO DE ANÁLISE: ${ reportData.formattedFilterDate }`,
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
                            'Trata-se de relatório técnico sobre focos de calor identificado com o ' +
                            'uso de Sistema de Informações Geográficas no imóvel rural ' +
                            `${ reportData.name }`,
                    },
                    {
                        text: ' (Figura 1) ',
                        bold: true,
                    },
                    {
                        text:
                            ' com área igual a ' +
                            `${ reportData.area }` +
                            ' hectares localizada no município de ' +
                            reportData.cityName +
                            '-MT, pertencente a ' +
                            `${ reportData.ownerName }` +
                            ', conforme informações declaradas no ' +
                            ' Sistema Sistema Nacional de Cadastro Ambiental Rural (SICAR), protocolo CAR ' +
                            `${ registerToUse }`,
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
                margin: [30, 0, 30, 0],
                style: 'bodyIndentFirst',
            },
            reportData.images.propertyLimitImage,
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
                    'As informações sobre os focos de calor foram integradas no âmbito ' +
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
                text:
                    'coleta automática, armazenamento ' +
                    'e tratamento de dados geoespaciais para interseções entre produtos do PRODES, DETER e Programa Queimadas do ' +
                    'INPE, com os dados de fontes estatais ' +
                    'oficiais para quantificação e descrição das áreas afetadas por desmatamento ou queimada.',
                margin: [30, 0, 30, 15],
                style: 'body',
            },
            {
                text: '3 Dados utilizados',
                style: 'listItem',
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
                            'mapeados pelo Programa Queimadas dados de desmatamentos mapeados ' +
                            'pelo PRODES e dados de desmatamentos e degradações florestais ' +
                            'mapeados pelo DETER, todos desenvolvidos pelo INPE',
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
                            'Informações e dados geográficos do SIMCAR Parceiros e Público, ' +
                            'da Secretaria de Meio Ambiente do Estado de Mato Grosso (SEMA). Os ' +
                            'dados declarados no SIMCAR foram unidos em uma única base, ' +
                            'compreendendo os CAR validados, aguardando ' +
                            'complementação, em análise e migrados do Sistema de Cadastro ' +
                            'Ambiental Rural (SICAR).',
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
                        text: 'Dados geográficos das Terras Indígenas no Estado de Mato Grosso, disponíveis no sítio eletrônico da Fundação Nacional do Índio (FUNAI);',
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
                        text: 'Imagens dos Satélites Landsat, SPOT, Planet, Sentinel-2, CBERS-4 e de outras fontes que estiverem disponíveis;',
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
                        text: 'Dados pessoais dos responsáveis pelo imóvel rural obtidos no Sistema Nacional de Informações de Segurança Pública (SINESP-INFOSEG).',
                        margin: [20, 0, 30, 10],
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
                text:
                    'Todas as informações acima descritas foram integradas utilizando ' +
                    'a plataforma computacional TerraMA². Essa plataforma foi desenvolvida pelo INPE para o monitoramento, ' +
                    'análise e emissão de alertas sobre extremos ambientais¹. Assim, ' +
                    'utilizando esta base tecnológica inovadora, ' +
                    'no domínio de softwares abertos, as tarefas executadas pela plataforma foram definidas para coletar, ' +
                    'analisar (intersecção de geometrias ' +
                    'dos mapas), visualizar e consultar dados sobre danos ambientais causados ' +
                    'por queimadas. Para ' +
                    'isso, dados dinâmicos e estáticos foram processados para produzirem as informações ' +
                    'que foram sistematizadas neste relatório.',
                margin: [30, 0, 30, 0],
                style: 'bodyIndentFirst',
            },
            {
                text: [
                    {
                        text: '1    Informações mais detalhadas sobre o funcionamento do TerraMA² podem ser obtidas em ',
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
                margin: [30, 0, 30, 0],
                fontSize: 8,
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text:
                    'Os dados do Programa Queimadas (pontos representando a ' +
                    'área nominal do píxel de fogo), foram cruzados com ' +
                    'informações geoespaciais de fontes oficiais para identificação de focos ' +
                    'de calor em imóveis rurais no Estado de Mato Grosso, bem como para ' +
                    'identificação dos responsáveis pelo imóvel rural atingido.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'Os focos de calor foram ' +
                    'intersectados com os dados geospaciais das autorizações de queima ' +
                    'controlada (AQC) emitidas pela SEMA ' +
                    'durante o período de ' +
                    `${ reportData.formattedFilterDate }, permitindo a elaboração de gráficos contendo as séries ` +
                    'temporais de focos de calor que incidiram no imóvel rural ao longo dos anos ' +
                    'e no período proibitivo de uso do fogo para limpeza e manejo de áreas conforme ' +
                    'Lei Estadual n. 233, de 21 de dezembro de 2005.',
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
                    'Os dados do programa Queimadas possuem características distintas pois ' +
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
                    'Os dados do INPE constituem fonte de acentuada importância ' +
                    'para a gestão ambiental, e já embasaram importantes acordos com setores ligados ao agronegócio, como o ' +
                    'Termo de Ajustamento de Conduta (TAC) da carne, Moratória da Soja e outros acordos intergovernamentais, como ' +
                    'o feito na Conferência das Nações Unidas Sobre Mudanças Climáticas (COP21) para a redução das emissões de gases ' +
                    'de efeito estufa por desflorestamento e degradação florestal. Ainda, a importância e credibilidade dos dados gerados ' +
                    'pelo INPE é refletida pelas milhares de publicações científicas que utilizaram essas informações para realização de ' +
                    'pesquisas, que podem ser encontrada no Google Scholar².',
                margin: [30, 0, 30, 0],
                style: 'bodyIndentFirst',
            },
            {
                text: [
                    {
                        text: '²Disponível em ',
                    },
                    {
                        text: 'https://scholar.google.com.br',
                        link: 'https://scholar.google.com.br',
                        color: 'blue',
                    },
                    {
                        text: ', acessado em 13.01.2020.',
                    },
                ],
                fontSize: 8,
                margin: [30, 30, 30, 30],
            },
            {
                text: '4.2 Os sistemas de mapeamento dos desmatamentos e degradações florestais PRODES e DETER',
                style: 'listItem',
            },
            {
                text:
                    'Os projetos PRODES e DETER, utilizados para identificação e quantificação ' +
                    'dos desmatamentos, fazem parte do Programa de Monitoramento da Amazônia ' +
                    'e Demais Biomas (PAMZ +) desenvolvido pela Coordenação Feral de Observação ' +
                    'da Terra (CGOBT) e Centro Regional da Amazônia (CRA) do INPE. ' +
                    'Além do PRODES e DETER, o PAMZ + conta também com o Sistema de ' +
                    'Mapeamento do Uso e Ocupação da Terra (TerraClass). Estes três ' +
                    'projetos são complementares e concebidos para atender diferentes objetivos.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'O objetivo do PRODES é estimar a taxa anual de desmatamento por corte ' +
                    'raso da floresta primária, excluídas as áreas de “não florestas”. ' +
                    'Importante ressaltar que o termo “desmatamento” é definido como ' +
                    '“a supressão de áreas de fisionomia florestal primária por ações ' +
                    'antropogênicas” (SOUZA et al., 2019)³, ou seja, tratam-se de áreas ' +
                    'sem histórico de intervenções pelo Homem que foram suprimidas a partir de 1988 por ação antrópica.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'O objetivo do DETER é identificar as alterações da vegetação natural ' +
                    'em biomas da Amazônia Legal (Amazônia e Cerrado), em áreas acima de 3 ha, ' +
                    'com a emissão de alertas para apoio à fiscalização em tempo quase real. ' +
                    'Para fisionomias florestais no bioma Amazônia, os alertas indicam ' +
                    'áreas que sofreram corte raso ou intervenções pela exploração madeireira, ' +
                    'mineração ou queimadas, ou seja, identificam e mapeiam áreas ' +
                    'desflorestadas e degradadas, enquanto para o bioma Cerrado, ' +
                    'é identificada apenas o corte raso da vegetação natural.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text: '5 ANÁLISE TÉCNICA',
                style: 'listItem',
            },
            {
                text:
                    'O INPE, a partir dos dados do Programa Queimadas identificou ' +
                    `${ reportData.fireSpotHistory.total } ` +
                    ' focos de calor ativos no imóvel rural denominado ' +
                    `${ reportData.name } ` +
                    `no período de ${ reportData.formattedFilterDate.replace(
                        'a',
                        'até',
                    ) }. Na figura 02 é possível ` +
                    'observar em imagem de satélite os focos de calor que incidiram na ' +
                    'propriedade. Na figura 03 consta o gráfico com a série temporal de ' +
                    'focos de calor que incidiram no imóvel rural ao longo dos anos (a partir de ' +
                    '1999) e no período de 15 de julho até 15 de setembro desde o ano 2006 (ano ' +
                    'após a vigência da Lei Estadual n. 233, de 21 de dezembro de 2005, que ' +
                    'estabelece o período proibitivo de uso do fogo para limpeza e manejo de ' +
                    'áreas no Estado de Mato Grosso).',
                margin: [30, 0, 30, 15],
                style: 'bodyIndentFirst',
            },
            {
                text: [
                    {
                        text: '3    SOUZA, A. et al. Metodologia utilizada nos Projetos PRODES e DETER. Instituto Nacional de Pesquisas Espaciais – INPE, 2019. Disponível em: ',
                    },
                    {
                        text: `http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/Metodologia_Prodes_Deter_revisada.pdf`,
                        link: 'text: `http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/Metodologia_Prodes_Deter_revisada.pdf',
                        color: 'blue',
                    },
                    {
                        text: '. Acessado em 13.10.2019.',
                    },
                ],
                fontSize: 8,
                margin: [30, 80, 30, 0],
            },
            reportData.images.propertyFireSpotsImage,
            {
                text: [
                    {
                        text: 'Figura 2 ',
                        bold: true,
                    },
                    {
                        text:
                            '- imagem de satélite evidenciando os focos de calor ativos na vegetação ' +
                            'da ' +
                            reportData.name +
                            ' em ' +
                            reportData.cityName +
                            '-MT',
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 0],
                style: 'body',
                fontSize: 10,
            },
            reportData.images.charts.fireSpotHistoryChart,
            {
                text: [
                    {
                        text: 'Figura 3 ',
                        bold: true,
                    },
                    {
                        text:
                            '- Série histórica de focos de calor ativos na ' +
                            reportData.name +
                            ' em ' +
                            reportData.cityName +
                            '-MT',
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 0],
                style: 'body',
                fontSize: 10,
            },
            ...getBurningAuthorizationText(reportData.burningAuthorization),
            {
                text:
                    'A fim de verificar a relação entre focos de calor e desmatamento ' +
                    'abaixo é apresentado gráfico de desmatamentos e degradações florestais ' +
                    'mapeados pelo PRODES e DETER',
                margin: [30, 0, 30, 0],
                style: 'bodyIndentFirst',
            },
            reportData.images.charts.fireSpotDeforestationChart,
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text: '6 CONCLUSÃO',
                style: 'listItem',
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
                        text: '– Informações complementares;',
                        style: 'body',
                    },
                ],
                margin: [30, 0, 30, 0],
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text: '8 VALIDAÇÃO',
                margin: [30, 15, 30, 0],
                style: 'listItem',
            },
            {
                margin: [30, 30, 30, 250],
                text: `Este relatório técnico foi validado em ${ reportData.currentDate } por: `,
                alignment: 'center',
                style: 'body',
            },
            {
                text: 'Relatório técnico produzido em parceria com: ',
                margin: [30, 0, 30, 15],
                style: 'body',
            },
            staticImages.partnerImages,
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
                leadingIndent: 120,
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
