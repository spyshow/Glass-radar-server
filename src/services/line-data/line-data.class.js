/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { machineD } = require("./machineData");
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

    if (params.query.newStartDate !== undefined) {
      let line_number;
      let options = [];
      await this.app
        .service("machines")
        .find({
          query: {
            lineId: id,
            $sort: {
              sequence: 1,
            },
          },
        })
        .then(async ({ data }) => {
          line_number = data[0]["line.line_number"];

          const colorList = [
            "#9E87FF",
            "#73DDFF",
            "#fe9a8b",
            "#F56948",
            "#9E87FF",
          ];
          for (const [index, value] of data.entries()) {
            // console.log("line data params:", params);
            options.push(
              await machineD(
                value,
                params,
                colorList[index],
                colorList[index + 1]
              )
            );
          }
          return options;
        });
      return {
        id: line_number,
        options,
        text: `A new message with ID: ${id}!`,
      };
    }
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
