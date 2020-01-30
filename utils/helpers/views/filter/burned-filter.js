module.exports = function(view_focos, workspacekAlertas, cod_view, tableOwner, isPrimary) {
  return {
    default: {
      view: view_focos
    },
    biome: {
      view: view_focos,
      field: isPrimary ? `dd_focos_inpe_bioma` : `${tableOwner}_dd_focos_inpe_bioma`,
      value: `name`
    },
    region: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `comarca`,
      value: `name`
    },
    mesoregion: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `nm_meso`,
      value: `name`
    },
    microregion: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `nm_micro`,
      value: `name`
    },
    city: {
      view: view_focos,
      field: isPrimary ? `dd_focos_inpe_id_2` : `${tableOwner}_dd_focos_inpe_id_2`,
      value: `geocode`
    },
    uc: {
      view: `${workspacekAlertas}:${cod_view}_uc_sql`,
      field: `gid`,
      value: `gid`
    },
    ti: {
      view: `${workspacekAlertas}:${cod_view}_ti_sql`,
      field: `gid`,
      value: `gid`
    },
    car: {
      view: view_focos,
      field: isPrimary ? `de_car_validado_sema_area_ha` : `${tableOwner}_de_car_validado_sema_area_ha`
    },
    projus: {
      view: `${workspacekAlertas}:${cod_view}_projus_sql`,
      field: `gid`,
      value: `gid`
    }
  }
};
