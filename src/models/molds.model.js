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
      moldsetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numberOfTotalGobs: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
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
    const { moldsets, moldstatus } = models;
    molds.belongsTo(moldsets, { onDelete: "CASCADE" });
    molds.hasMany(moldstatus, { as: "status", foreignKey: "moldId" });
  };

  return molds;
};
