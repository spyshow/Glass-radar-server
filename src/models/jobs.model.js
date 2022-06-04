// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const jobs = sequelizeClient.define(
    "jobs",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      line: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      speed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lehr_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_ordered: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      job_on: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blank_moldsetid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blow_moldsetid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
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
  jobs.associate = function (models) {
    const { jobs, moldsets } = models;
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    /*TODO : a foreign key "moldsetsId" is generated automatically by sequelize. but it's not needed*/
    jobs.belongsTo(moldsets, {
      as: "blowMoldsetid",
      foreignKey: "blow_moldsetid",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    jobs.belongsTo(moldsets, {
      as: "blankMoldsetid",
      foreignKey: "blank_moldsetid",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  };

  return jobs;
};
