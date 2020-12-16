const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [
      (context) => {
        // Get the Sequelize instance. In the generated application via:
        const sequelize = context.app.get("sequelizeClient");
        const { lines } = sequelize.models;
        sequelize.raw = true;
        context.params.sequelize = { include: [{ model: lines }] };
        // [
        //   {
        //     association: lines.id,
        //     include: [lines.line_number],
        //   },
        // ];

        return context;
      },
    ],
    get: [
      (context) => {
        // Get the Sequelize instance. In the generated application via:
        const sequelize = context.app.get("sequelizeClient");
        const { lines } = sequelize.models;
        sequelize.raw = true;
        context.params.sequelize = {
          include: [{ model: lines }],
        };

        return context;
      },
    ],
    create: [],
    update: [],
    patch: [
      async (context) => {
        // Get the Sequelize instance. In the generated application via:
        const sequelize = context.app.get("sequelizeClient");
        const { lines } = sequelize.models;
        sequelize.raw = true;
        context.params.sequelize = { include: [{ model: lines }] };
        const dataBefore = await context.app
          .service("machines")
          .get(context.id);
        if (dataBefore.scantime !== context.data.scantime) {
          console.log(context.id, context.data.scantime);
          context.data.lineId = dataBefore.lineId;
          context.app.service("scanner").update(context.id, context.data);
        }
        return context;
      },
    ],
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
