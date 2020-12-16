/* eslint-disable quotes */

const pool = require("./../../db");
const { scanMachine, removeMachine, updateMachine } = require("./scanMachine");

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
    pool.query("SELECT * FROM machines").then((res) => {
      let result = "";
      res.rows.map((machine) => {
        result += scanMachine(machine);
      });
    });
    return "done find";
  }

  // start scanning for a specific machines
  async get(id, params) {
    const lines = this.app.service("lines");
    console.log(params);
    pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [id] })
      .then((res) => {
        let machine = res.rows[0];
        lines.get(machine.lineId).then((line) => {
          console.log(line);
          scanMachine(machine, line.line_number, this.app);
        });
        return "scanning";
      })
      .catch((error) => console.log(error));
  }
  // in use right now
  async create(data, params) {
    console.log(data.id);
    const lines = this.app.service("lines");
    await pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [data.id] })
      .then((res) => {
        let machine = res.rows[0];
        lines.get(machine.lineId).then((line) => {
          console.log(line);
          scanMachine(machine, line.line_number, this.app);
        });
      })
      .catch((error) => console.log(error));
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
          console.log(line, data);
          updateMachine(machine, line.line_number, data.scanTime);
        });
        return "done update";
      })
      .catch((error) => console.log(error));
  }
  // Not in use right now
  async patch(id, data, params) {}
  // stop the scanning for a specific machines
  async remove(data, params) {
    const lines = this.app.service("lines");
    await pool
      .query({ text: "SELECT * FROM machines WHERE id=$1", values: [data] })
      .then((res) => {
        let machine = res.rows[0];
        lines.get(machine.lineId).then((line) => {
          console.log(line);
          removeMachine(machine, line.line_number);
        });
      })
      .catch((error) => console.log(error));
    return "done remove";
  }
};
