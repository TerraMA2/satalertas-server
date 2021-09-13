
module.exports = function(view_burned_area, workspaceAlertas, cod_view, tableOwner, isPrimary) {
  return {
    default: {
      view: view_burned_area
    },
    biome: {
      view: `${workspaceAlertas}:${cod_view}_biome_sql`,
      field: 'gid',
      value: 'gid'
    },
    region: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `comarca`,
      value: `name`
    },
    mesoregion: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `nm_meso`,
      value: `name`
    },
    microregion: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `nm_micro`,
      value: `name`
    },
    immediateregion: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `nm_rgi`,
      value: `name`
    },
    intermediateregion: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `nm_rgint`,
      value: `name`
    },
    pjbh: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `pjbh`,
      value: `name`
    },
    city: {
      view: `${workspaceAlertas}:${cod_view}_city_sql`,
      field: `gid`,
      value: `gid`
    },
    uc: {
      view: `${workspaceAlertas}:${cod_view}_uc_sql`,
      field: `gid`,
      value: `gid`
    },
    ti: {
      view: `${workspaceAlertas}:${cod_view}_ti_sql`,
      field: `gid`,
      value: `gid`
    },
    car: {
      view: view_burned_area,
      field: isPrimary ? `de_car_validado_sema_area_ha_` : `${tableOwner}_de_car_validado_sema_area_ha_`
    },
    projus: {
      view: `${workspaceAlertas}:${cod_view}_projus_sql`,
      field: `gid`,
      value: `gid`
    }
  }
};
