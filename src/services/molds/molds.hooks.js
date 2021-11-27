const { authenticate } = require("@feathersjs/authentication").hooks;
const { populate } = require("feathers-graph-populate");

const populates = {
  moldsets: {
    service: "moldsets",
    nameAs: "moldsets",
    keyHere: "setid",
    keyThere: "id",
    asArray: false,
    params: {},
  },
};
const namedQueries = {
  moldsWithMoldsets: {
    moldsets: {},
  },
};



module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [
      populate({
        populates,
        namedQueries,
        defaultQueryName: "moldsWithMoldsets",
      }),
    ],
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
