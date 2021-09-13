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
    return {
        default: {
            view: geoserverView,
        },
        biome: {
            view: `${ workspaceAlertas }:${ cod_view }_biome_sql`,
            field: 'gid',
            value: 'gid',
        },
        region: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `comarca`,
            value: `name`,
        },
        mesoregion: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `nm_meso`,
            value: `name`,
        },
        microregion: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `nm_micro`,
            value: `name`,
        },
        immediateregion: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `nm_rgi`,
            value: `name`,
        },
        intermediateregion: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `nm_rgint`,
            value: `name`,
        },
        pjbh: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `pjbh`,
            value: `name`,
        },
        city: {
            view: `${ workspaceAlertas }:${ cod_view }_city_sql`,
            field: `gid`,
            value: `gid`,
        },
        uc: {
            view: `${ workspaceAlertas }:${ cod_view }_uc_sql`,
            field: `gid`,
            value: `gid`,
        },
        ti: {
            view: `${ workspaceAlertas }:${ cod_view }_ti_sql`,
            field: `gid`,
            value: `gid`,
        },
        car: {
            view: geoserverView,
            field: areaCar,
        },
        projus: {
            view: `${ workspaceAlertas }:${ cod_view }_projus_sql`,
            field: `gid`,
            value: `gid`,
        },
    };
};
