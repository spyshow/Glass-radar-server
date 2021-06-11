// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;
const moment = require("moment");

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const linespeed = sequelizeClient.define(
    "linespeed",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      speed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lineId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, default: moment() },
      updatedAt: { type: DataTypes.DATE, default: moment() },
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true;
        },
      },
    }
  );

  // eslint-disable-next-line no-unused-vars
  linespeed.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return linespeed;
};
