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
    create: [
      async (context) => {
        // to add line.id and line.line_number to the returned added row after the creation
        const line = await context.app
          .service("lines")
          .get(context.arguments[0].lineId);
        context.result["line.id"] = line.id;
        context.result["line.line_number"] = line.line_number;

        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [
      async (context) => {
        const sequelize = context.app.get("sequelizeClient");
        const line = await context.app
          .service("lines")
          .get(context.result.lineId);
        //const queryInterface = sequelize.getQueryInterface();
        console.log(
          `DROP TABLE ${context.result[
            "machine_name"
          ].toUpperCase()}_${line.line_number.toUpperCase()}`
        );
        await sequelize.query(
          `DROP TABLE public."${context.result[
            "machine_name"
          ].toUpperCase()}_${line.line_number.toUpperCase()}" ;`
        );
        // await queryInterface
        //   .dropTable()
        //   .then(() => {
        //     console.log("done deleteing table");
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      },
    ],
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
