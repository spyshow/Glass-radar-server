/* eslint-disable no-unused-vars */
const { scanMolds } = require("./scanMolds");
const pool = require("./../../db");

exports.Molds = class Molds {
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
    console.log(id);
    let returnedData;
    await pool
      .query({
        text: "SELECT * FROM machines WHERE id=$1",
        values: [id],
      })
      .then((result) => {
        let machine = result.rows[0];
        console.log(machine);
        returnedData = scanMolds(machine, this.app).then((data) => {
          return {
            mountedMolds: data.mountedMolds.value,
            rejectedMolds: data.rejectedMolds.value,
          };
        });
      });

    console.log(returnedData);
    return returnedData;
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)));
    }

    return data;
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
