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
  const machines = sequelizeClient.define(
    "machines",
    {
      machine_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lineId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      speed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      scantime: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sensors: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      sequence: {
        type: DataTypes.INTEGER,
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
  machines.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    const { lines } = models;
    machines.belongsTo(lines);
  };

  return machines;
};
