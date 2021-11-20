/* eslint-disable linebreak-style */
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const molds = sequelizeClient.define(
    "molds",
    {
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kind: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      setid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numberOfTotalGobs: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      statusid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
  molds.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    const { moldsets } = models;
    molds.belongsTo(moldsets);
  };

  return molds;
};
