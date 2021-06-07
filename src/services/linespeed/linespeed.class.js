/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { Service } = require("feathers-sequelize");
const moment = require("moment");

exports.Linespeed = class Linespeed extends Service {
  setup(app) {
    this.app = app;
  }

  async find(params) {
    this.app
      .service("lines")
      .find()
      .then(async (lines) => {
        console.log(lines.data[0].dataValues.line_number);
        for (let i = 0; i < lines.data.length; i++) {
          await this.app
            .service("jobs")
            .find({
              query: {
                active: true,
                line: lines.data[i].dataValues.line_number,
                $limit: 1,
                $sort: {
                  createdAt: -1,
                },
              },
            })
            .then(async (job) => {
              console.log(job);
              if (job.data.length > 0) {
                console.log(lines.data[i].dataValues.id, job.data[0].speed);
                //add speed for each line to linespeed table
                await this.app.service("linespeed").create({
                  lineId: lines.data[i].dataValues.id,
                  speed: job.data[0].speed,
                });
              }
            })
            .catch((error) => console.log("jobs: ", error));
        }
        //delete rows older than 2 hours
        console.log(moment().subtract(2, "hours").format());
        this.app
          .service("linespeed")
          .remove(null, {
            query: {
              createdAt: { $lte: moment().subtract(2, "hours").format() },
            },
            multi: true,
          })
          .catch((error) => console.log("remove: ", error));
      })
      .catch((error) => console.log("lines: ", error));

    return super.find(params);
  }
};
