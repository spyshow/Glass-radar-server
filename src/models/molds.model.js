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
      statusId: {
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
    console.log(models);
    const { moldsets, moldstatus } = models;
    molds.belongsTo(moldsets);
    molds.hasMany(moldstatus, { as: "status" });
  };

  return molds;
};
