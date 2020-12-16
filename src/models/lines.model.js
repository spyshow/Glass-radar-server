// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

/************************************************************************/
/* TODO:                                                                */
/*   [ ] replace created_at and updated_at with createdAt and updatedAt */
/************************************************************************/

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const lines = sequelizeClient.define(
    "lines",
    {
      line_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
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
  lines.associate = function (models) {
    const { machines } = models;
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    lines.hasMany(machines);
  };

  return lines;
};
