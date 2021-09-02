'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const {models} = sequelize;

    class RelGroupView extends Model {
        static associate(models) {
        }
    }

    RelGroupView.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            groupId: {
                type: DataTypes.INTEGER,
                references: {
                    model: models.Group,
                    key: 'id',
                },
                allowNull: false,
            },
            viewId: {
                type: DataTypes.INTEGER,
                references: {
                    model: models.view,
                    key: 'id',
                },
            },
            name: {
                type: DataTypes.STRING,
                comment: 'View name',
            },
            shortName: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Short name',
            },
            description: {
                type: DataTypes.TEXT,
                comment: 'View description',
            },
            active: {
                type: DataTypes.BOOLEAN,
                default: true,
                comment: 'It defines view can be used and retrieved. Default is true.',
            },
            private: {
                type: DataTypes.BOOLEAN,
                // allowNull: false,
                default: false,
                comment: 'It defines if the view is private. Default is false.',
            },
            scheduleType: {
                type: DataTypes.INTEGER,
                // allowNull: true,
            },
            sourceType: {
                type: DataTypes.INTEGER,
                // allowNull: false,
                comment:
                    'It defines the type of data source that create the view. Alert, Analysis, Static Data or Dynamic Data',
            },
            isPrimary: {
                type: DataTypes.BOOLEAN,
                // allowNull: false,
                default: false,
                comment: 'It defines if the layer is parent or not. Default is false.',
            },
            isSublayer: {
                type: DataTypes.BOOLEAN,
                default: false,
                comment:
                    'It defines if the layer is a sublayer or not. Default is false.',
            },
            subLayers: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                // allowNull: true,
                comment: 'It defines which layers are sub layers of this layer.',
            },
        },
        {
            sequelize,
            schema: 'terrama2',
            tableName: 'rel_group_views',
            modelName: 'RelGroupView',
            underscored: true,
            underscoredAll: true,
            timestamps: false,
        },
    );
    // RelGroupView.associate = function(models) {
    //   RelGroupView.belongsTo(models.views, {
    //     through: 'views',
    //     onDelete: 'NO ACTION',
    //     foreignKey: 'id_view',
    //     as: 'views',
    //     otherKey: 'id_view'
    //   });
    //   RelGroupView.belongsTo(models.groups, {
    //     through: 'groups',
    //     onDelete: 'CASCADE',
    //     foreignKey: 'id_group',
    //     as: 'groups',
    //     otherKey: 'id_group'
    //   });
    // };
    return RelGroupView;
};
