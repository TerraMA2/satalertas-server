const LAYERS_CHILDREN = {
  DETER: {
    label: 'Análise DETER',
    parent: true,
    viewGraph: true,
    activearea: true,
    isPrivate: true
  },
  PRODES: {
    label: 'Análise PRODES',
    parent: true,
    viewGraph: true,
    activearea: false,
    isPrivate: true
  },
  BURNED: {
    label: 'Análise FOCOS',
    shortLabel: '',
    parent: true,
    viewGraph: true,
    activearea: false,
    isPrivate: true
  },
  BURNED_AREA: {
    label: 'Análise área queimada',
    parent: true,
    viewGraph: true,
    activearea: false,
    isPrivate: true
  },
  STATIC_DATA: {
    label: 'Dados estáticos',
    parent: true,
    viewGraph: false,
    activearea: false,
    isPrivate: false
  },
  DYNAMIC_DATA: {
    label: 'Dados dinâmicos',
    parent: true,
    viewGraph: false,
    activearea: false,
    isPrivate: false
  }
}

module.exports = LAYERS_CHILDREN;
