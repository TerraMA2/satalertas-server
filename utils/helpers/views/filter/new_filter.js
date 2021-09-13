module.exports = function (
  geoserverView,
  workspacekAlertas,
  cod_view,
  // tableOwner = undefined,
  // isPrimary,
  field = undefined,
) {
  let areaCar = field.find((column) => column.secondaryType === 'car_area')
  if (areaCar) {
    areaCar = areaCar["columnName"];
  }
  return {
    default: {
      view: geoserverView,
    },
    biome: {
      view: `${workspacekAlertas}:${cod_view}_biome_sql`,
      field: 'gid',
      value: 'gid',
    },
    region: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `comarca`,
      value: `name`,
    },
    mesoregion: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `nm_meso`,
      value: `name`,
    },
    microregion: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `nm_micro`,
      value: `name`,
    },
    immediateregion: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `nm_rgi`,
      value: `name`,
    },
    intermediateregion: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `nm_rgint`,
      value: `name`,
    },
    pjbh: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `pjbh`,
      value: `name`,
    },
    city: {
      view: `${workspacekAlertas}:${cod_view}_city_sql`,
      field: `gid`,
      value: `gid`,
    },
    uc: {
      view: `${workspacekAlertas}:${cod_view}_uc_sql`,
      field: `gid`,
      value: `gid`,
    },
    ti: {
      view: `${workspacekAlertas}:${cod_view}_ti_sql`,
      field: `gid`,
      value: `gid`,
    },
    car: {
      view: geoserverView,
      field: areaCar,
    },
    projus: {
      view: `${workspacekAlertas}:${cod_view}_projus_sql`,
      field: `gid`,
      value: `gid`,
    },
  };
};
