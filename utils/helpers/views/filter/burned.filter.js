module.exports = function(view_burned, workspaceAlertas, cod_view, tableOwner, isPrimary) {
  return {
    default: {
      view: `${workspaceAlertas}:${cod_view}_sql`
    },
    biome: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: isPrimary ? `dd_focos_inpe_bioma` : `${tableOwner}_dd_focos_inpe_bioma`,
      value: `name`
    },
    region: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: `comarca`,
      value: `name`
    },
    mesoregion: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: `nm_meso`,
      value: `name`
    },
    microregion: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: `nm_micro`,
      value: `name`
    },
    immediateregion: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: `nm_rgi`,
      value: `name`
    },
    intermediateregion: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: `nm_rgint`,
      value: `name`
    },
    pjbh: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: `pjbh`,
      value: `name`
    },
    city: {
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: isPrimary ? `geocodigo` : `${tableOwner}_dd_focos_inpe_id_2`,
      value: `geocode`
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
      view: `${workspaceAlertas}:${cod_view}_sql`,
      field: isPrimary ? `area_ha_` : `${tableOwner}_de_car_validado_sema_area_ha_`
    },
    projus: {
      view: `${workspaceAlertas}:${cod_view}_projus_sql`,
      field: `gid`,
      value: `gid`
    }
  }
};
