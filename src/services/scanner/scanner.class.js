/* eslint-disable indent */
/* eslint-disable quotes */

const pool = require("./../../db");
const dayjs = require('dayjs');
const {
  scanMMMMachine,
  removeMMMMachine,
  updateMMMMachine,
} = require("./scanMMMMachine");
const { scanSensor, removeSensor, updateSensor } = require("./scanSensors");
/* eslint-disable no-unused-vars */
exports.Scanner = class Scanner {
  constructor(options) {
    this.options = options || {};
  }
  setup(app) {
    this.app = app;
  }

  // start scanning for all the machines
  async find(params) {
    const lines = this.app.service("lines");
    pool.query("SELECT * FROM machines").then((res) => {
      let result = "";
      res.rows
        .map((machine) => {
          result += lines.get(machine.lineId).then((line) => {
            const lehrTime = this.app
              .service("jobs")
              .find({
                query: {
                  active: true,
                  line: line.line_number,
                },
              })
              .then((job) => {
                return job.lehr_time;
              });
            console.log("scanner:39:", lehrTime);
            
            return scanMMMMachine(
              machine,
              line.line_number,
              this.app,
              machine.lineId,
              lehrTime
            );
          });
        })
        .catch((error) => console.log(error));
    });

    return "done find";
  }

  // start scanning for a specific machines
  async get(id, params) {
    const lines = this.app.service("lines");

    pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [id] })
      .then((res) => {
        let machine = res.rows[0];

        lines.get(machine.lineId).then((line) => {
          const lehrTime = this.app
            .service("jobs")
            .find({
              query: {
                active: true,
                line: line.line_number,
              },
            })
            .then((job) => {
              return job.lehr_time;
            });
          scanMMMMachine(
            machine,
            line.line_number,
            this.app,
            machine.lineId,
            lehrTime
          );
        });
        return "scanning";
      })
      .catch((error) => console.log(error));
  }
  // in use right now
  async create(data, params) {
    const lines = this.app.service("lines");

    await pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [data.id] })
      .then((res) => {
        let machine = res.rows[0];

        let lehrTime;
        lines.get(machine.lineId).then(async (line) => {
          await this.app
            .service("jobs")
            .find({
              query: {
                active: true,
                line: line.line_number,
              },
            })
            .then(async (job) => {
              lehrTime = job.data[0].lehr_time;
              let machine_and_line =
                machine.machine_name +
                "_" +
                line.line_number.replace(/[^A-Z0-9]/gi, "");
              await pool
                .query({
                  text: `SELECT * FROM public.scanner WHERE active=$1 AND machine_id=$2`,
                  values: [true, data.id],
                })
                .then(async (res) => {
                  console.log(res);
                  if (res.rows.length === 0) {
                    await pool
                      .query({
                        text: `INSERT INTO public.scanner (name ,active,machine_id,"createdAt","updatedAt") VALUES ( $1,$2,$3,$4,$5 )`,
                        values: [
                          machine_and_line,
                          true,
                          data.id,
                          dayjs(),
                          dayjs(),
                        ],
                      })
                      .catch((error) => console.log("insert ", error));
                  }
                })
                .catch((error) => console.log("select scanner ", error));

              switch (machine.type) {
                case "MX4":
                case "MULTI4":
                case "MCAL4":
                  scanMMMMachine(
                    machine,
                    line.line_number,
                    this.app,
                    machine.lineId
                  );
                  break;
                case "LI":
                case "VI":
                case "PALLETIZER":
                  scanSensor(
                    machine,
                    line.line_number,
                    this.app,
                    machine.lineId,
                    lehrTime //we should get the lehr time inside scanSensor
                  );
              }
            })
            .catch((err) => {
              console.log("lehrtime: ", err);
            });
        });
      });

    return "scanning";
  }

  // update the scanning time of a specific machines
  async update(id, data, params) {
    console.log("update" + id, data);
    const lines = this.app.service("lines");
    pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [id] })
      .then((res) => {
        let machine = res.rows[0];
        lines.get(machine.lineId).then((line) => {
          switch (machine.type) {
            case "MX4":
            case "MULTI4":
            case "MCAL4":
              updateMMMMachine(machine, line.line_number, data.scanTime);
              break;
            case "LI":
            case "VI":
            case "PALLETIZER":
              updateSensor(machine, line.line_number, data.scanTime);
          }
        });
        return "done update";
      })
      .catch((error) => console.log(error));
  }
  // Not in use right now
  async patch(id, data, params) {}
  // stop the scanning for a specific machines
  async remove(data, params) {
    let machine_and_line;
    const lines = this.app.service("lines");
    await pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [data.id] })
      .then((res) => {
        let machine = res.rows[0];
        lines.get(machine.lineId).then(async (line) => {
          machine_and_line =
            machine.machine_name +
            "_" +
            line.line_number.replace(/[^A-Z0-9]/gi, "");
          await pool
            .query({
              text: "DELETE FROM scanner WHERE machine_id= $1 AND active = $2",
              values: [data.id, true],
            })
            .catch((error) => console.log(error));
          switch (machine.type) {
            case "MX4":
            case "MULTI4":
            case "MCAL4":
              removeMMMMachine(machine, line.line_number);
              break;
            case "LI":
            case "VI":
            case "PALLETIZER":
              removeSensor(machine, line.line_number);
          }
        });
      })
      .catch((error) => console.log(error));

    return "done removing " + machine_and_line + " scanner. ";
  }
};
