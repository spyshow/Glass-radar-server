const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [
      (context) => {

        // Get the Sequelize instance. In the generated application via:
        const sequelize = context.app.get("sequelizeClient");
        const { machines } = sequelize.models;
        sequelize.raw = true;
        context.params.sequelize = {
          include: [{ model: machines, nested: true }],
        };
        Object.assign(context.params.sequelize, { raw: false });
        return context;
      },
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
