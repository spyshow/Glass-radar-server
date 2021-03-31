const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [
      async (context) => {
        //console.log(context);

        // Get the Sequelize instance. In the generated application via:
        const line_number = await context.app
          .service("lines")
          .get(context.params.query.lineId);
        //console.log(line_number.line_number);
        context.params.query.line_number = line_number.line_number;
        return context;
      },
    ],
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
