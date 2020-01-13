import layersChildren from '@/utils/helpers/layers/layers-chieldren.js';

const LAYERS_GROUP = {
  layers: [
    {
      cod: 'DETER',
      label: 'Análise DETER',
      parent: true,
      viewGraph: true,
      activearea: true,
      isPrivate: true,
      children: layersChildren['DETER']
    },
    {
      cod: 'PRODES',
      label: 'Análise PRODES',
      parent: true,
      viewGraph: true,
      activearea: false,
      isPrivate: true,
      children: layersChildren['PRODES']
    },
    {
      cod: 'FOCOS',
      label: 'Análise FOCOS',
      parent: true,
      viewGraph: true,
      activearea: false,
      isPrivate: true,
      children: layersChildren['FOCOS']
    },
    {
      cod: 'AREA_QUEIMADA',
      label: 'Análise área queimada',
      parent: true,
      viewGraph: true,
      activearea: false,
      isPrivate: true,
      children: layersChildren['AREA_QUEIMADA']
    },
    {
      cod: 'DADOS_ESTATICOS',
      label: 'Dados estáticos',
      parent: true,
      viewGraph: false,
      activearea: false,
      isPrivate: false,
      children: layersChildren['DADOS_ESTATICOS']
    },
    {
      cod: 'DADOS_DINAMICOS',
      label: 'Dados dinâmicos',
      parent: true,
      viewGraph: false,
      activearea: false,
      isPrivate: false,
      children: layersChildren['DADOS_DINAMICOS']
    }
  ]
};

export default  {
  LAYERS_GROUP : LAYERS_GROUP
};
