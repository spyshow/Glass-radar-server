const Sequelize = require("sequelize");

module.exports = function (app) {
  //"postgresql://postgres:thespy@localhost:5432/radar"
  const connectionString =
    "postgresql://" +
    process.env.PGUSER +
    ":" +
    process.env.PGPASSWORD +
    "@" +
    process.env.PGHOST +
    ":" +
    process.env.PGPORT +
    "/" +
    process.env.PGDATABASE;
  const sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    logging: false,
    define: {
      freezeTableName: true,
    },
  });
  const oldSetup = app.setup;

  app.set("sequelizeClient", sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach((name) => {
      if ("associate" in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    app.set("sequelizeSync", sequelize.sync({ alter: true }));

    return result;
  };
};
