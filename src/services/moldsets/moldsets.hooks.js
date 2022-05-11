/* eslint-disable indent */
const { authenticate } = require("@feathersjs/authentication").hooks;
const related = async (context) => {
  const sequelize = context.app.get("sequelizeClient");
  const { molds, moldstatus } = sequelize.models;
  context.params.sequelize = {
    include: [
      //{ all: true, nested: true },
      {
        model: molds,
        attributes: ["number"],
        required: false,
        include: [
          {
            model: moldstatus,
            as: "status",
            attributes: ["createdAt", "status", "moldId"],
          },
        ],
        raw: false,

        group: "`moldstatus`.`moldId`",
      },
    ],
    order: [
      [{ model: molds }, "number", "asc"],
      [
        { model: molds },
        { model: moldstatus, as: "status" },
        "createdAt",
        "desc",
      ],
    ],
    raw: false,
  };
  return context;
};

const insertData = async (context) => {
  let data = [];
  //console.log(JSON.stringify(context, null, 4));

  for (let i = 0; i < context.data.moldsData.length; i++) {
    await (data[i] = {
      moldId: context.data.moldsData[i].moldId,
      status: "scrapped",
      startdate: context.data.date_of_scrap,
    });
  }
  //console.log(data);
  return data;
};

const moldStatusSummary = async (context) => {
  context.result.data.map(async (moldset) => {
    moldset.dataValues.moldStatus = {
      available: 0,
      mounted: 0,
      unmounted: 0,
      scrapped: 0,
      inrepairlocal: 0,
      inrepairexternal: 0,
      awaitexpertise: 0,
    };
    await moldset.molds.map((mold) => {
      console.log(mold.dataValues.status[0].dataValues.status);
      switch (
        mold.dataValues.status[0].dataValues.status //mold.status.dataValues.status
      ) {
        case "available":
          moldset.dataValues.moldStatus.available++;
          break;
        case "mounted":
          moldset.dataValues.moldStatus.mounted++;
          break;
        case "unmounted":
          moldset.dataValues.moldStatus.unmounted++;
          break;
        case "scrapped":
          moldset.dataValues.moldStatus.scrapped++;
          break;
        case "in repair local":
          moldset.dataValues.moldStatus.inrepairlocal++;
          break;
        case "in repair external":
          moldset.dataValues.moldStatus.inrepairexternal++;
          break;
        case "await expertise":
          moldset.dataValues.moldStatus.awaitexpertise++;
          break;
        default:
          moldset.dataValues.moldStatus.available++;
          break;
      }
    });
  });
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [
      (context) => {
        related(context);
      },
    ],
    get: [
      (context) => {
        related(context);
      },
    ],
    create: [
      async (context) => {
        const sequelize = context.app.get("sequelizeClient");
        const { molds, moldstatus } = sequelize.models;
        context.params.sequelize = {
          include: [
            {
              model: molds,
              include: [
                {
                  model: moldstatus,
                  as: "status",
                },
              ],
              //raw: false,
              // group: "`moldstatus`.`moldId`",
            },
          ],
          //raw: false,
        };
        return context;
      },
    ],
    update: [],
    patch: [
      async (context) => {
        related(context);
        //to add status of the molds with scrapped status
        if (context.data.status === "scrapped") {
          let data = await insertData(context);
          //console.log("dada", data);
          context.app.service("moldstatus").create(data);
        }

        //console.log(context.result.data);
        return context;
      },
    ],
    remove: [
      (context) => {
        related(context);

        return context;
      },
    ],
  },

  after: {
    all: [],
    find: [(context) => moldStatusSummary(context)],
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
