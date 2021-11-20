/* eslint-disable linebreak-style */
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const moldsets = sequelizeClient.define(
    "moldsets",
    {
      name: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vendor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      number_of_blanks: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number_of_blows: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_of_reception: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_of_scrap: {
        type: DataTypes.DATE,
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
  moldsets.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    const { molds } = models;
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    moldsets.hasMany(molds);
  };

  return moldsets;
};
