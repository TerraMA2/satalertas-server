module.exports = function (
    geoserverView,
    workspaceAlertas,
    cod_view,
    // tableOwner = undefined,
    // isPrimary,
    field = undefined,
) {
    let areaCar = field.find((column) => column.secondaryType === 'car_area')
    if (areaCar) {
        areaCar = areaCar["columnName"];
    }
    const baseView = `${ workspaceAlertas }:${ cod_view }`
    return {
        default: {
            view: geoserverView,
        },
        biome: {
            view: `${ baseView }_biome_sql`,
            field: 'gid',
            value: 'gid',
        },
        region: {
            view: `${ baseView }_city_sql`,
            field: `comarca`,
            value: `name`,
        },
        mesoregion: {
            view: `${ baseView }_city_sql`,
            field: `nm_meso`,
            value: `name`,
        },
        microregion: {
            view: `${ baseView }_city_sql`,
            field: `nm_micro`,
            value: `name`,
        },
        immediateregion: {
            view: `${ baseView }_city_sql`,
            field: `nm_rgi`,
            value: `name`,
        },
        intermediateregion: {
            view: `${ baseView }_city_sql`,
            field: `nm_rgint`,
            value: `name`,
        },
        pjbh: {
            view: `${ baseView }_city_sql`,
            field: `pjbh`,
            value: `name`,
        },
        city: {
            view: `${ baseView }_city_sql`,
            field: `gid`,
            value: `gid`,
        },
        uc: {
            view: `${ baseView }_uc_sql`,
            field: `gid`,
            value: `gid`,
        },
        ti: {
            view: `${ baseView }_ti_sql`,
            field: `gid`,
            value: `gid`,
        },
        car: {
            view: geoserverView,
            field: areaCar,
        },
        projus: {
            view: `${ baseView }_projus_sql`,
            field: `gid`,
            value: `gid`,
        },
    };
};
