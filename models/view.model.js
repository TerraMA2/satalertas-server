'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class View extends Model {
        static associate(models) {
            const {DataSeries, Group, Project, RegisteredView, DataSet} = models;
            this.belongsToMany(Group, {
                through: 'RelGroupView',
                as: 'relGroupView',
                foreignKey: 'view_id',
                onDelete: 'SET NULL',
                otherKey: 'group_id',
            });
            this.belongsTo(DataSeries, {
                onDelete: 'CASCADE',
                as: 'dataSeries',
                foreignKey: {
                    name: 'data_series_id',
                    allowNull: false,
                },
            });
            this.hasOne(RegisteredView, {
                onDelete: 'CASCADE',
                as: 'registeredView',
                foreignKey: {
                    name: 'view_id',
                    allowNull: false,
                },
            });
            this.hasOne(DataSet, {
                sourceKey: 'data_series_id',
                foreignKey: 'data_series_id',
                as: 'dataSet',
                onDelete: 'NO ACTION'
            })
            this.belongsTo(Project, {
                onDelete: 'CASCADE',
                foreignKey: {
                    name: 'project_id',
                    allowNull: false,
                },
            });
        }
    }

    View.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                comment: 'View identifier',
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'View name',
            },
            description: {
                type: DataTypes.TEXT,
                comment: 'View description',
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: true,
                comment: 'It defines view can be used and retrieved. Default is true.',
            },
            private: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: false,
                comment: 'It defines if the view is private. Default is false.',
            },
            scheduleType: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            sourceType: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment:
                    'It defines the type of data source that create the view. Alert, Analysis, Static Data or Dynamic Data',
            },
            charts: {
                type: DataTypes.JSONB,
                allowNull: true,
                comment: 'Charts',
            },
            code: {
                type: DataTypes.VIRTUAL,
                get() {
                    return `${ this.name.split(' ').join('_').toUpperCase() }`
                },
                set() {
                    throw new Error("[View Model] Do not try to set the 'code' value!")
                }
            }
        },
        {
            sequelize,
            schema: 'terrama2',
            tableName: 'views',
            modelName: 'View',
            underscored: true,
            timestamps: false,
        },
    );
    return View;
};
