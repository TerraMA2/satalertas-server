module.exports = function(view_burned, workspacekAlertas, cod_view, tableOwner, isPrimary) {
  return {
    default: {
      view: `${workspacekAlertas}:${cod_view}_sql`
    },
    biome: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: isPrimary ? `dd_focos_inpe_bioma` : `${tableOwner}_dd_focos_inpe_bioma`,
      value: `name`
    },
    region: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: `comarca`,
      value: `name`
    },
    mesoregion: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: `nm_meso`,
      value: `name`
    },
    microregion: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: `nm_micro`,
      value: `name`
    },
    immediateregion: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: `nm_rgi`,
      value: `name`
    },
    intermediateregion: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: `nm_rgint`,
      value: `name`
    },
    pjbh: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: `pjbh`,
      value: `name`
    },
    city: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: isPrimary ? `geocodigo` : `${tableOwner}_dd_focos_inpe_id_2`,
      value: `geocode`
    },
    uc: {
      view: `${workspacekAlertas}:${cod_view}_uc_sql`,
      param: true,
      field: `param`,
      value: `gid`
    },
    ti: {
      view: `${workspacekAlertas}:${cod_view}_ti_sql`,
      param: true,
      field: `param`,
      value: `gid`
    },
    car: {
      view: `${workspacekAlertas}:${cod_view}_sql`,
      field: isPrimary ? `area_ha_` : `${tableOwner}_de_car_validado_sema_area_ha_`
    },
    projus: {
      view: `${workspacekAlertas}:${cod_view}_projus_sql`,
      field: `gid`,
      value: `gid`
    }
  }
};
