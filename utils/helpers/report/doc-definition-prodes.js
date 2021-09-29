// noinspection JSOctalInteger

const superscripts = {
    0: '\u2070',
    1: '\u00B9',
    2: '\u00B2',
    3: '\u00B3',
    4: '\u2074',
    5: '\u2075',
    6: '\u2076',
    7: '\u2077',
    8: '\u2078',
    9: '\u2079',
};

getInformationVegRadam = function (vegRadam) {
    let textRadam = '';
    vegRadam.forEach((veg) => {
        if (textRadam.length === 0) {
            textRadam = `${ veg.area_ha_car_vegradam } ha em área da fisionomia ${ veg.fisionomia }`;
        } else {
            textRadam += `, ${ veg.area_ha_car_vegradam } ha em área da fisionomia ${ veg.fisionomia }`;
        }
    });
    return !vegRadam ? '0 ha de desmatamento' : textRadam;
};

module.exports = function (headerDocument, reportData, title) {
    return {
        info: {
            title: 'Relatório PRODES',
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
                                bold: true,
                                margin: [483, 0, 30, 0]
                            }
                        ]
                    ]
                },
                layout: 'noBorders'
            };
        },
        header: {
          columns: headerDocument
        },
        content: [
            {
                text: [
                    {
                        text: 'SAT:',
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
                        text: ` ${ reportData.property.city }-MT`,
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
                        text: ` ${ reportData.property.county }`,
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
                text: `${ title }`,
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
                text: '1 OBJETIVO',
                style: 'listItem',
            },
            {
                text: [
                    {
                        text:
                            'Trata-se de relatório técnico sobre desmatamentos ilegais identificados ' +
                            ` com o uso de Sistema de Informações Geográficas no imóvel rural ` +
                            `${ reportData.property.name } (Figura 1), ` +
                            `com área igual a ${ reportData.property.area } ha ` +
                            `(sendo ${ getInformationVegRadam(
                                reportData.property.vegRadam,
                            ) } segundo Mapa da vegetação ` +
                            `do Projeto RadamBrasil), localizado no município de ${ reportData.property.city }-MT, ` +
                            `de coordenada central longitude = ${ reportData.property.long } e ` +
                            `latitude = ${ reportData.property.lat }, pertencente a ${ reportData.property.owner }, ` +
                            `conforme informações declaradas no ${
                                reportData.property.stateRegister
                                    ? 'Sistema Mato-grossense de Cadastro Ambiental Rural (SIMCAR), protocolo CAR ' +
                                    reportData.property.stateRegister
                                    : 'Sistema Nacional de Cadastro Ambiental Rural, protocolo CAR ' +
                                    reportData.property.federalregister
                            }`,
                    },
                    {
                        text: ' (Anexo 1)',
                        bold: true,
                    },
                    {
                        text: '.',
                    },
                ],
                alignment: 'justify',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                columns: [
                    reportData.images.geoserverImage1,
                    reportData.images.geoserverImage2,
                ],
                margin: [30, 0, 30, 10],
            },
            {
                text: [
                    {
                        text: 'Figura 1. ',
                        bold: true,
                    },
                    {
                        text: `Mapa de Localização e do Perímetro do Imóvel, imagem Planet de ${ reportData.currentYear }.`,
                        bold: false,
                    },
                ],
                alignment: 'center',
                fontSize: 9,
                margin: [30, 0, 30, 10],
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
                margin: [30, 10, 30, 15],
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text: '2 HISTÓRICO',
                style: 'listItem',
            },
            {
                text:
                    'As informações sobre os desmatamentos foram integradas no âmbito' +
                    'do Termo de Cooperação Técnica n. 30/2018 firmado entre Ministério Público do Estado de Mato Grosso ' +
                    'e Instituto Nacional de Pesquisas Espaciais (INPE), cujo objeto consiste na coleta automática, armazenamento ' +
                    'e tratamento de dados geoespaciais para interseções entre produtos do PRODES, DETER e Programa Queimadas do ' +
                    'INPE, com os dados de fontes estatais oficiais para quantificação e descrição das áreas afetadas por desmatamento ou queimada.',
                alignment: 'justify',
                margin: [30, 0, 30, 15],
                style: 'bodyIndentFirst',
            },
            {
                text: '2.1 Dados utilizados',
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
                            'Dados das áreas desmatadas no Estado de Mato Grosso mapeadas pelo Programa de Monitoramento da Floresta ' +
                            'Amazônica Brasileira por Satélite (PRODES) (desmatamento anual) desenvolvido pelo INPE;',
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
                            'Informações e dados geográficos do SIMCAR Parceiros e Público, da Secretaria de Meio Ambiente do Estado de Mato Grosso (SEMA), como: ' +
                            'i. Proprietário(s)/posseiro(s); ' +
                            'ii. Base de referência do CAR validado; ' +
                            'iii. Base de referência do CAR em análise; ' +
                            'iv. Base de referência do CAR aguardando complementação; ' +
                            'v. Base de referência do CAR cancelado e indeferido; ' +
                            'vi. Base de referência do Programa de Regularização Ambiental (PRA);',
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
                            'Dados do Navegador Geográfico da SEMA (SIMGEO): ' +
                            'i. Base de referência das áreas embargadas pela SEMA. ' +
                            'ii. Base de referência das áreas desembargadas pela SEMA; ' +
                            'iii. Base de referência das Autorizações de Exploração (AUTEX); ' +
                            'iv. Base de referência das Autorizações de Desmatamento (AD); ' +
                            'v. Base de referência das Áreas de Preservação Permanente (APP), Reserva Legal (ARL), Uso Restrito (AUS) e de Uso Consolidado (AUC);',
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
                            'Dados do acervo fundiário do Instituto Nacional de Colonização e Reforma Agrária (SIGEF/INCRA);',
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
                        text: 'f) ',
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
                        text: 'g) ',
                        margin: [50, 0, 0, 5],
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text: 'Mapa de vegetação do Projeto RadamBrasil;',
                        margin: [20, 0, 30, 5],
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                columns: [
                    {
                        text: 'h) ',
                        margin: [50, 0, 0, 5],
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            'Perfil histórico dos índices de vegetação NDVI e EVI obtidos Land Processes Distributed Active Center (LP-DAAC);',
                        margin: [20, 0, 30, 5],
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                columns: [
                    {
                        text: 'i) ',
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
                        text: 'j) ',
                        margin: [50, 0, 0, 5],
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            'Dados pessoais dos responsáveis pelo imóvel rural obtidos no Sistema Nacional de Informações de Segurança Pública (SINESP-INFOSEG).',
                        margin: [20, 0, 30, 5],
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                text:
                    'Todas as informações acima descritas foram integradas utilizando a ' +
                    'plataforma computacional TerraMA². Essa plataforma foi desenvolvida pelo INPE para o monitoramento, ' +
                    'análise e emissão de alertas sobre extremos ambientais¹. Assim, utilizando esta base tecnológica inovadora, ' +
                    'no domínio de softwares abertos, as tarefas executadas pela plataforma foram definidas para coletar, ' +
                    'analisar (intersecção de geometrias dos mapas), visualizar e consultar dados sobre danos ambientais causados ' +
                    'por desmatamentos e queimadas. Para isso, dados dinâmicos e estáticos foram processados para produzirem as informações ' +
                    'que foram sistematizadas neste relatório.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'Os dados de desmatamentos (polígonos) do PRODES foram cruzados ' +
                    'com informações geoespaciais de fontes oficiais para identificação e quantificação ' +
                    'dos danos ambientais causados por desmatamentos supostamente ilegais, bem como para ' +
                    'identificação dos responsáveis pelo imóvel rural atingido, para fins de responsabilização civil, administrativa ' +
                    'e, eventualmente, criminal pelos danos causados.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'As formações sobre o imóvel rural onde incidiu o desmatamento e' +
                    ' sua titularidade foram coletadas na base de dados do SIMCAR e/ou INCRA.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'Para qualificação da área desmatada, o tipo de vegetação foi' +
                    ' identificado utilizando o mapa de vegetação do Projeto RadamBrasil.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'Os dados geoespaciais do SIMGEO, MMA e FUNAI foram cruzados ' +
                    'com os dados do INPE para identificação e quantificação dos desmatamentos ao longo dos anos ' +
                    'em áreas protegidas (APP, ARL, AUR, UC e TI), bem como para identificar ilícitos ambientais, mediante ' +
                    'o cruzamento com dados das Autorizações de Exploração (AUTEX) e de Desmatamento (AD) emitidas pela SEMA. ' +
                    'Ainda, verificou-se se as áreas desmatadas já haviam sido autuadas ou embargadas pela SEMA.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'Por fim, foi gerado um relatório com o histórico de imagens de satélites' +
                    ' e dos desmatamentos e queimadas ocorridos no imóvel rural, contendo ainda, o perfil ' +
                    'histórico de NDVI e EVI dos 5 (cinco) maiores polígonos de desmatamento detectados, a fim de melhorar a interpretação das intervenções ' +
                    'antrópicas ocorridas. As séries temporais de índices vegetativos representam as variações de vigor da vegetação, sendo ' +
                    'que o perfil ao longo de um ciclo hidrológico varia dependendo do tipo de vegetação, impactos ou uso alternativo da área.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text: [
                    {
                        text: `1    Informações mais detalhadas sobre o funcionamento do TerraMA² podem ser obtidas em `,
                    },
                    {
                        text: 'http://www.TerraMA2.dpi.inpe.br/sobre. ',
                        link: 'http://www.TerraMA2.dpi.inpe.br/sobre',
                        color: 'blue',
                    },
                    {
                        text: 'Acessado em 07.10.2019.',
                    },
                ],
                fontSize: 8,
                margin: [30, 20, 30, 0],
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text:
                    'De acordo com o Sistema de Análise Temporal da Vegetação (SATVeg)' +
                    ' da Empresa Brasileira de Pesquisa Agropecuária (EMBRAPA), os índices vegetativos ' +
                    'NDVI e EVI são derivados das imagens do sensor MODIS, a bordo dos satélites Terra e Aqua. ' +
                    'As imagens são adquiridas do Land Processes Distributed Active Center (LP-DAAC), que está ' +
                    "vinculada a NASA's Earth Observing System (NASA EOS). As séries temporais dos índices vegetativos " +
                    'fazem parte da coleção 6 dos produtos MOD13Q1 (satélite Terra, com início em 18/02/2000) ' +
                    'e MYD13Q1 (satélite Aqua, com início em 04/07/2002). Nestes produtos, o NDVI e o EVI são disponibilizados ' +
                    'em composições máximas de 16 dias, com resolução espacial de aproximadamente 250m. Como exemplo, nas figuras ' +
                    'abaixo podem ser observados os padrões gráficos do NDVI para floresta ombrófila densa, cerrado e quando da ' +
                    'ocorrência de desmatamento. Mais informações sobre os padrões de perfis gráficos dos índices de vegetação, incluindo ' +
                    'os padrões de culturas agrícolas, podem ser consultadas no sítio eletrônico do SATVeg(2).',
                margin: [30, 0, 30, 0],
                style: 'bodyIndentFirst',
            },
            reportData.images.chartImage1,
            {
                text: [
                    {
                        text: 'Figura 2. ',
                        bold: true,
                    },
                    {
                        text:
                            'Floresta Ombrófila Densa - Em função do clima predominantemente úmido, essa cobertura vegetal apresenta pouca variação ' +
                            'nos valores dos índices de vegetação ao longo do ano. Além disso, esta cobertura apresenta valores elevados dos índices ' +
                            'de vegetação durante o ano, em função da grande biomassa vegetal presente.',
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 0],
                fontSize: 9,
                style: 'body',
            },
            reportData.images.chartImage2,
            {
                text: [
                    {
                        text: 'Figura 3. ',
                        bold: true,
                    },
                    {
                        text:
                            'Cerrado - Em função do clima sazonal, com verões chuvosos e invernos mais secos, essa cobertura vegetal apresenta ' +
                            'oscilações significativas nos valores dos índices de vegetação ao longo do ano e, geralmente, apresenta valores intermediários ' +
                            'no período chuvoso. Durante o inverno, com a queda das precipitações e a redução da biomassa vegetal ativa, os índices de vegetação ' +
                            'declinam significativamente, retomando seu vigor apenas com a volta do período de chuvas.',
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 0],
                fontSize: 9,
                style: 'body',
            },
            reportData.images.chartImage3,
            {
                text: [
                    {
                        text: 'Figura 4. ',
                        bold: true,
                    },
                    {
                        text:
                            'Desmatamento - Como as florestas apresentam valores de índice de vegetação mais elevados, com ' +
                            'ou sem a presença de alguma variação pela sazonalidade, a depender do clima ao qual estão sujeitas, o ' +
                            'fenômeno do desflorestamento é bastante evidente, pois define uma quebra brusca do padrão dessa variação ao longo do tempo.',
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 15],
                fontSize: 9,
                style: 'body',
            },
            {
                text: '2.2.1 PRODES',
                style: 'listItem',
            },
            {
                text:
                    'Os projetos PRODES e DETER, utilizados para identificação e ' +
                    'quantificação dos desmatamentos, fazem parte do Programa de Monitoramento da Amazônia e Demais Biomas (PAMZ+) ' +
                    'desenvolvido pela Coordenação-geral de Observação da Terra (CGOBT) e Centro Regional da Amazônia (CRA) do INPE. ' +
                    'Além do PRODES e DETER, o PAMZ+ conta também com o Sistema de Mapeamento do Uso e Ocupação da Terra (TerraClass). ' +
                    'Estes três projetos são complementares e concebidos para atender diferentes objetivos.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'O objetivo do PRODES é estimar a taxa anual de desmatamento por ' +
                    'corte raso da floresta primária, excluídas as áreas de “não florestas”. Importante ressaltar que ' +
                    'o termo “desmatamento” é definido como “a supressão de áreas de fisionomia florestal primária por ações ' +
                    'antropogênicas” (SOUZA et al., 2019)³, ou seja, tratam-se de áreas sem histórico de intervenções pelo Homem ' +
                    'que foram suprimidas a partir de 1988 por ação antrópica.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'O PRODES  utiliza  imagens  de  satélite  geradas  pela  série Landsat da ' +
                    'NASA/USGS (EUA), caracterizadas por apresentarem resolução espacial de cerca de 30m e pelo ' +
                    'menos três bandas espectrais. Atualmente, também são utilizadas imagens dos satélites Sentinel-2 ' +
                    '(União Europeia) ou CBERS-4 (Brasil/China). As imagens desses satélites são disponibilizadas pelos ' +
                    'seus provedores já ortorretificadas, com correção geométrica de sistema refinada pelo uso de pontos de ' +
                    'controle e de modelos digitais de elevação do terreno, o que confere um nível mais alto de qualidade das ' +
                    'informações, em concordância com as normas cartográficas vigentes. A avaliação da acurácia da metodologia ' +
                    'do PRODES foi feita por Adami ' +
                    'et al. (2017)' + superscripts[4] + ' para o Estado de Mato Grosso e por Maurano et al. (2019)(5) para a Amazônia ' +
                    'Legal, ambas para o ano 2014, resultando em uma precisão global de 94,5%±2,05 e exatidão global de 93%, respectivamente.',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            {
                text:
                    'O detalhamento da metodologia PRODES pode ser consultado em ' +
                    'Souza et al. (2019)(6). Em suma, a metodologia do PRODES parte dos seguintes pressupostos: ',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },
            [
                {
                    text: [
                        {
                            text:
                                '3    SOUZA, A. et al. Metodologia utilizada nos Projetos PRODES e DETER. Instituto Nacional de Pesquisas Espaciais – INPE, 2019. Disponível em: ',
                        },
                        {
                            text: `http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/Metodologia_Prodes_Deter_revisada.pdf`,
                            link:
                                'text: `http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/Metodologia_Prodes_Deter_revisada.pdf',
                            color: 'blue',
                        },
                        {
                            text: '. Acessado em 13.10.2019.',
                        },
                    ],
                    fontSize: 8,
                    margin: [30, 30, 30, 0],
                },
                {
                    text: `4    ADAMI, M. et al. A confiabilidade do PRODES: estimativa da acurácia do mapeamento do desmatamento no estado de Mato Grosso. Anais do XVIII Simpósio Brasileiro de Sensoriamento Remoto – SBSR, 2017.`,
                    fontSize: 8,
                    margin: [30, 5, 30, 0],
                },
                {
                    text: '5    MAURANO, L.E.P.; ESCADA, M.I.S.; RENNO, C.D. Padrões espaciais de desmatamento e a estimativa da exatidão dos mapas do PRODES para Amazônia Legal Brasileira. Ciência Florestal, Santa Maria-RS, v.29, n.4, p.1763-1775, 2019.',
                    fontSize: 8,
                    margin: [30, 5, 30, 0],
                },
                {
                    text: [
                        {
                            text: '6    SOUZA, A. et al. Metodologia utilizada nos Projetos PRODES e DETER. Instituto Nacional de Pesquisas Espaciais – INPE, 2019. Disponível em: ',
                        },
                        {
                            text: 'http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/Metodologia_Prodes_Deter_revisada.pdf',
                            link: 'http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/Metodologia_Prodes_Deter_revisada.pdf',
                            color: 'blue',
                        },
                        {
                            text: '. Acessado em 13.10.2019.',
                        },
                    ],
                    fontSize: 8,
                    margin: [30, 5, 30, 0],
                },
                {
                    text: '',
                    pageBreak: 'after',
                },
            ],
            {
                columns: [
                    {
                        text: '1) ',
                        margin: [50, 0, 0, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            '“O PRODES só identifica polígonos de desmatamento por corte raso (remoção completa da cobertura florestal primária) ' +
                            'cuja área for superior a 6,25 ha. O PRODES só identifica polígonos de desmatamento por corte raso (remoção completa da ' +
                            'cobertura florestal primária) cuja área for superior a 6,25 ha.',
                        margin: [20, 0, 30, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                columns: [
                    {
                        text: '2) ',
                        margin: [50, 0, 0, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            'As imagens utilizadas são da classe Landsat, ou seja, apresentam resolução espacial da ordem de 30 metros, ' +
                            'taxa de revisita da ordem de 10 – 26 dias, 3 ou mais bandas espectrais, como por exemplo imagens do ' +
                            'satélite Landsat-8, CBERS-4 ou similares.',
                        margin: [20, 0, 30, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                columns: [
                    {
                        text: '3) ',
                        margin: [50, 0, 0, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            'Numa imagem a ser analisada pode haver áreas não-observadas devido a cobertura de nuvens. ' +
                            'Em casos de alta cobertura de nuvem, imagens de múltiplos satélites (ou datas) podem ser usadas para compor uma localização.',
                        margin: [20, 0, 30, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                columns: [
                    {
                        text: '4) ',
                        margin: [50, 0, 0, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            'O PRODES realiza o mapeamento dos incrementos de desmatamento através de fotointerpretação ' +
                            'por especialistas. O PRODES adota uma metodologia de mapeamento incremental.',
                        margin: [20, 0, 30, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                columns: [
                    {
                        text: '5) ',
                        margin: [50, 0, 0, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                    {
                        text:
                            'Na produção do mapeamento incremental, o PRODES usa uma máscara de exclusão, que encobre as áreas desmatadas nos ' +
                            'anos anteriores. O trabalho de interpretação é feito apenas no pedaço da imagem do ano de referência que ainda ' +
                            'contém floresta primária. Esta máscara é usada para eliminar a possibilidade de que desmatamentos antigos sejam ' +
                            'mapeados novamente. A máscara de exclusão também inclui as áreas onde não há ocorrência natural de florestas, ' +
                            'chamadas no PRODES de ‘não floresta’, além de áreas de hidrografia, sejam mapeadas como desmatamento”',
                        margin: [20, 0, 30, 5],
                        italics: true,
                        width: 'auto',
                        style: 'body',
                    },
                ],
            },
            {
                text:
                    'Os dados do INPE constituem fonte de acentuada importância para a ' +
                    'gestão ambiental, e já embasaram importantes acordos com setores ligados ao agronegócio, como o ' +
                    'Termo de Ajustamento de Conduta (TAC) da carne, Moratória da Soja e outros acordos intergovernamentais, como ' +
                    'o feito na Conferência das Nações Unidas Sobre Mudanças Climáticas (COP21) para a redução das emissões de gases ' +
                    'de efeito estufa por desflorestamento e degradação florestal(7). Ainda, a importância e credibilidade dos dados gerados pelo INPE é refletida pelas milhares de publicações científicas ' +
                    'que utilizaram essas informações para realização de ' +
                    'pesquisas, que podem ser encontrada no Google Scholar(8)',
                margin: [30, 0, 30, 5],
                style: 'bodyIndentFirst',
            },

            {
                text: '7    ADAMI, M. et al. A confiabilidade do PRODES: estimativa da acurácia do mapeamento do desmatamento no estado de Mato Grosso. Anais do XVIII Simpósio Brasileiro de Sensoriamento Remoto – SBSR, 2017.',
                fontSize: 8,
                margin: [30, 65, 30, 0],
            },
            {
                text: [
                    {text: '8     Disponível em '},
                    {
                        text: 'https://scholar.google.com.br/',
                        link: 'https://scholar.google.com.br/',
                        color: 'blue',
                    },
                    {
                        text: ', acessado em 13.01.2020.',
                    },
                ],
                fontSize: 8,
                margin: [30, 5, 30, 0],
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text: '3 ANÁLISE TÉCNICA',
                style: 'listItem',
            },
            {
                text:
                    'O INPE, a partir dos dados do PRODES, identificou desmatamento de ' +
                    reportData.property.prodesArea +
                    ' hectares no imóvel rural denominado ' +
                    reportData.property.name +
                    ' no período de ' +
                    reportData.formattedFilterDate +
                    ', conforme desmatamento explicitado ' +
                    'no Quadro 1 (quantificação e descrição das áreas desmatadas que ' +
                    'foram identificadas com o cruzamento dos dados descritos no histórico desse relatório) ' +
                    'e no histórico de imagens de satélite e desmatamentos no imóvel rural. ' +
                    'O proprietário/posseiro do imóvel rural foi identificado com base nos dados do SIMCAR / INCRA.',
                margin: [30, 0, 30, 15],
                style: 'bodyIndentFirst',
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
                                text: '',
                            },
                            {
                                border: [false, false, false, false],
                                text: '',
                            },
                        ],
                        [
                            {
                                colSpan: 2,
                                style: 'tableHeader',
                                text: 'Área de Uso Consolidado (ha)',
                            },
                        ],
                        [
                            {
                                colSpan: 2,
                                alignment: 'center',
                                text: `${ reportData.property.areaUsoCon }`,
                            },
                        ],
                        [
                            {
                                text: 'Área atingida',
                                style: 'tableHeader',
                            },
                            {
                                text: 'Desmatamento no período (ha)',
                                style: 'tableHeader',
                            },
                        ],
                        ...reportData.property.tableData.map((rel) => {
                            return [rel.affectedArea, rel.pastDeforestation];
                        }),
                        [
                            {
                                colSpan: 2,
                                style: 'tableHeader',
                                text: 'Desmatamento por tipologia vegetal (ha)',
                            },
                        ],
                        [
                            {
                                alignment: 'center',
                                text: `${ reportData.property.tableVegRadam.affectedArea }`,
                            },
                            {
                                alignment: 'center',
                                text: `${ reportData.property.tableVegRadam.pastDeforestation }`,
                            },
                        ],
                        [
                            {
                                colSpan: 2,
                                style: 'tableHeader',
                                text: 'Desmatamento Total (ha)',
                            },
                        ],
                        [
                            {
                                colSpan: 2,
                                alignment: 'center',
                                text: `${ reportData.property.areaPastDeforestation }`,
                            },
                        ],
                    ],
                },
                fontSize: 9,
            },
            {
                text: [
                    {
                        text: 'Quadro 1 ',
                        bold: true,
                    },
                    {
                        text:
                            ' - Classes e quantitativos de áreas desmatadas e queimadas no imóvel rural denominado ' +
                            reportData.property.name +
                            ' a  partir da análise do PRODES, no período ' +
                            reportData.formattedFilterDate +
                            '.',
                    },
                ],
                margin: [30, 0, 30, 5],
                style: 'body',
                fontSize: 9,
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text:
                    'A Figura 5 apresenta a dinâmica de desmatamento em todos os anos do PRODES disponível da base do INPE.',
                margin: [30, 0, 30, 15],
                style: 'body',
            },
            {
                columns: [
                    reportData.images.geoserverLegend,
                    reportData.images.geoserverImage3,
                ],
            },
            {
                style: 'tableStyle',
                table: {
                    widths: ['*', '*'],
                    headerRows: 1,
                    body: [
                        [
                            {
                                text: 'Ano',
                                style: 'tableHeader',
                            },
                            {
                                text: 'Área (ha)',
                                style: 'tableHeader',
                            },
                        ],
                        ...reportData.prodesTableData.map((rel) => {
                            return [rel.date, rel.area];
                        }),
                    ],
                },
                fontSize: 12,
            },
            {
                text: [
                    {
                        text: 'Figura 5. ',
                        bold: true,
                    },
                    {
                        text:
                            'Dinâmica de desmatamento - ' +
                            reportData.prodesTableData[0].date +
                            '/' +
                            reportData.currentYear,
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 5],
                alignment: 'center',
                fontSize: 9,
                style: 'body',
            },
            {
                text: '',
                pageBreak: 'after',
            },
            {
                text:
                    'Anota-se que os dados acima indicam extreme de dúvidas, ' +
                    'com grau de acurácia superior a 90% de acerto, no entanto, alterações nos valores poderão ocorrer ' +
                    'em decorrência de trabalhos de campo, pelo uso de outras imagens de satélite com diferentes ' +
                    'resoluções espaciais, radiométricas e temporais, bem como pela fotointerpretação do analista durante a vetorização das áreas.',
                margin: [30, 0, 30, 15],
                style: 'bodyIndentFirst',
            },
            {
                text: [
                    {
                        text: 'Na  representação  cartográfica  abaixo ',
                    },
                    {
                        text: '(Figura 6)',
                        bold: true,
                    },
                    {
                        text:
                            ' é  possível  visualizar, ' +
                            'com imagens de alta resolução (Spot-2,5m, Landsat-30m, Sentinel-10m e Planet-3m) como estava a cobertura ' +
                            'do imóvel em 2008 e como se encontra atualmente (' +
                            reportData.currentYear +
                            '), indicando ' +
                            'a ocorrência de desmatamento ilegal no imóvel rural.',
                    },
                ],
                margin: [30, 0, 30, 0],
                style: 'bodyIndentFirst',
            },
            {
                columns: [
                    reportData.images.geoserverImage4,
                    reportData.images.geoserverImage6,
                ],
                margin: [30, 0, 30, 0],
            },
            {
                columns: [
                    {
                        text: 'a',
                        style: 'body',
                        alignment: 'center',
                    },
                    {
                        text: 'b',
                        style: 'body',
                        alignment: 'center',
                    },
                ],
                margin: [30, 0, 30, 0],
            },
            {
                columns: [
                    reportData.images.geoserverImage5,
                    reportData.images.geoserverImage7,
                ],
                margin: [30, 0, 30, 0],
            },
            {
                columns: [
                    {
                        text: 'c',
                        style: 'body',
                        alignment: 'center',
                    },
                    {
                        text: 'd',
                        style: 'body',
                        alignment: 'center',
                    },
                ],
                margin: [30, 0, 30, 0],
            },
            {
                text: [
                    {
                        text: 'Figura 6. ',
                        bold: true,
                    },
                    {
                        text: `Comparativo de imagens de satélite (a) Spot de 2008, (b) Landsat de 2018, (c) Sentinel de 2019 e (d) Planet de ${ reportData.currentYear }`,
                        bold: false,
                    },
                ],
                margin: [30, 0, 30, 0],
                alignment: 'center',
                fontSize: 9,
            },
            {
                text: 'NDVIGraphs',
            },
            {
                text: '4 CONCLUSÃO',
                margin: [30, 20, 30, 0],
                style: 'listItem',
            },
            {
                text: '5 ANEXOS',
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
                text: '6 VALIDAÇÃO',
                margin: [30, 20, 30, 0],
                style: 'listItem',
            },
            {
                text: `Este relatório técnico foi validado em ${ reportData.currentDate } por: `,
                margin: [30, 0, 30, 60],
                alignment: 'center',
                style: 'body',
            },
            {
                text: 'Relatório técnico produzido em parceria com: ',
                margin: [30, 100, 30, 15],
                alignment: 'center',
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
                    reportData.images.partnerImage10,
                ],
            },
            {
                columns: [reportData.images.partnerImage9],
            },
        ],
        styles: {
            tableStyle: {
                alignment: 'center',
                fontSize: 9,
                margin: [30, 0, 30, 5],
            },
            tableHeader: {
                fontSize: 10,
                fillColor: '#eeeeff',
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
        },
    };
};
