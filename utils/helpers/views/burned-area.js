const FILTER = require('./filter/burned-area.filter');

module.exports = {
  CAR_X_AREA_Q: {
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_APP: {
    shortLabel: 'APP',
    carRegisterColumn: 'de_car_validado_sema_numero_do1',
    isChild: true
  },
  CAR_AQ_X_DESEMB: {
    shortLabel: 'Área Desembargada',
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_DESMATE: {
    shortLabel: 'Aut. Desmate',
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_EMB: {
    shortLabel: 'Áreas Embargadas',
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_QUEIMA: {
    shortLabel: 'Aut. Queimada',
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_RESERVA: {
    shortLabel: 'Reserva Legal',
    carRegisterColumn: 'de_car_validado_sema_numero_do1',
    isChild: true
  },
  CAR_AQ_X_TI: {
    shortLabel: 'Terra Indígena',
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_UC: {
    shortLabel: 'Unidade de Conservação',
    carRegisterColumn: 'de_car_validado_sema_numero_do1'
  },
  CAR_AQ_X_USOANT: {
    shortLabel: 'Uso Antropizado',
    carRegisterColumn: 'de_car_validado_sema_numero_do1',
    isChild: true
  },
  CAR_AQ_X_USOCON: {
    shortLabel: 'Uso Consolidado',
    carRegisterColumn: 'de_car_validado_sema_numero_do1',
    isChild: true
  },
  CAR_AQ_X_VEGNAT: {
    shortLabel: 'Vegetação Nativa',
    carRegisterColumn: 'de_car_validado_sema_numero_do1',
    isChild: true
  },
  filter: FILTER
};
