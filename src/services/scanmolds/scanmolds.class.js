/* eslint-disable no-unused-vars */
const { scanMolds } = require("./scanMolds");
const pool = require("../../db");

exports.ScanMolds = class ScanMolds {
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
    let returnedData;
    await pool
      .query({
        text: "SELECT * FROM machines WHERE id=$1",
        values: [id],
      })
      .then((result) => {
        let machine = result.rows[0];
        returnedData = scanMolds(machine, this.app).then((data) => {
          return {
            mountedMolds: data.mountedMolds.value,
            rejectedMolds: data.rejectedMolds.value,
          };
        });
      });

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
