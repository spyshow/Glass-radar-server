/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { machineData } = require("./machineData");
exports.LineData = class LineData {
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
    /* we need :
      id : id of line  - integer

    */
    let line_number;
    let options = [];
    await this.app
      .service("machines")
      .find({
        query: {
          lineId: id,
        },
      })
      .then(async ({ data }) => {
        line_number = data[0]["line.line_number"];
        // let lineSpeed = await this.app
        //   .service("jobs")
        //   .find({
        //     query: {
        //       line: line_number,
        //       active: true,
        //     },
        //   })
        //   .then((row) => {
        //     console.log("linespeed:", row);
        //     return row.data[0].speed;
        //   });
        for (let machine of data) {
          options.push(await machineData(machine, params, "green"));
        }
        return options;
      });
    return {
      line_number,
      options,
      text: `A new message with ID: ${id}!`,
    };
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
