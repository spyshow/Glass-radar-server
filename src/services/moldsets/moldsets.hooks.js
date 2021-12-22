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
        attributes: ["number", "statusId"],
        required: false,
        order: [[{ model: molds }, "number", "ASC"]],
        include: [
          {
            model: moldstatus,
            as: "status",
            required: false,
            attributes: ["status", "moldId"],
            order: [[moldstatus, "created_at", "DESC"]],
          },
        ],
        raw: false,
        group: "`moldstatus`.`moldId`",
      },
    ],
    raw: false,
  };
  return context;
};

const moldStatusSummary = async (context) => {
  context.result.data.map(async (moldset) => {
    moldset.dataValues.moldStatus = {
      available: 0,
      mounted: 0,
      unmounted: 0,
      scraped: 0,
      inRepairLocal: 0,
      inRepairExternal: 0,
      awaitExpertise: 0,
    };
    console.log(moldset.dataValues.molds);
    await moldset.molds.map((mold) => {
      console.log("moldsss", mold);
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
        case "scraped":
          moldset.dataValues.moldStatus.scraped++;
          break;
        case "in repair local":
          moldset.dataValues.moldStatus.inRepairLocal++;
          break;
        case "in repair external":
          moldset.dataValues.moldStatus.inRepairExternal++;
          break;
        case "await expertise":
          moldset.dataValues.moldStatus.awaitExpertise++;
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
    all: [
      authenticate("jwt"),
      (context) => {
        related(context);
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [moldStatusSummary],
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
