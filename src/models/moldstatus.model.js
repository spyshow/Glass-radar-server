// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const moldstatus = sequelizeClient.define(
    "moldstatus",
    {
      moldId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      startdate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      enddate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      lineId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      section: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      defect: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      numberOfGobs: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      operatorId: {
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
  moldstatus.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    const { molds } = models;
    moldstatus.belongsTo(molds, { onDelete: "CASCADE" });
  };

  return moldstatus;
};
