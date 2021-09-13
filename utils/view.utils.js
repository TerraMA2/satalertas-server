const ViewService = require("../services/view.service");

module.exports.getGrouped = async () => {
    const groupViews = await ViewService.getGroupViews();
    const views = await ViewService.getViews()
    views.forEach((view) => {
        if (!groupViews[view.groupCode].children) {
            groupViews[view.groupCode].children = [];
        }
    });
    views.forEach((view) => {
        if (view.isPrimary) {
            groupViews[view.groupCode].tableOwner = `${ view.tableName }`;
        }
        groupViews[view.groupCode].children[view.cod] = view;
    });
    return groupViews;
}
