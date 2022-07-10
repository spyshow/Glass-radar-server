/* eslint-disable quotes */
const { data } = require("../../logger");

/* eslint-disable no-unused-vars */
exports.Init = class Init {
  constructor(options) {
    this.options = options || {};
  }
  setup(app) {
    this.app = app;
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    return {
      id,
      text: `A new message with ID: ${id}!`,
    };
  }

  async create(defaultUser) {
    console.log("default user", defaultUser);
    await this.app
      .service("users")
      .find()
      .then(({ data }) => {
        console.log("data", data);
        if (data.length < 1) {
          console.log("less than one user");
          this.app.service("users").create(defaultUser);
        }
      });

    return "initlized";
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
  }
};
