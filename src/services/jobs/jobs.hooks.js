const { authenticate } = require("@feathersjs/authentication").hooks;
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
/********************/
/* TODO: return error when file not exist before delete */
/********************/
module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [
      (hook) => {
        return (
          hook.app
            .service("jobs")
            .get(hook.id)
            // removeImages (should return a promise)
            .then(
              async (job) =>
                await unlinkAsync(
                  require("path").resolve(
                    __dirname,
                    "../../../public/uploads/"
                  ) +
                    "/" +
                    job.job_on
                )
            )
            // Always return the `hook` object in the end
            .then(() => hook)
        );
      },
    ],
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
