/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable quotes */

const pool = require("./../../db");
const { learnMMMSensors } = require("./learnMMMsensors");

// const feathers = require("@feathersjs/feathers");
// const lines = app.service("lines");

/* eslint-disable no-unused-vars */
exports.MachineInit = class MachineInit {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }
  setup(app) {
    this.app = app;
  }

  async get(id, params) {
    let machine = null;
    let errorMsg;
    console.log("id: " + id);
    await pool
      .query("SELECT * FROM machines WHERE id=$1", [id])
      .then((data) => {
        if (data.rows.length > 0) {
          machine = data;
        }
      })
      .catch((error) => {
        console.log(error);
        errorMsg = error;
      });
    if (machine) {
      return {
        status: "exist",
      };
    } else if (errorMsg) {
      return {
        status: "error",
        message: errorMsg,
      };
    } else {
      return {
        status: "dos't exist",
      };
    }
  }

  async create(data, params) {
    const lineData = await this.app.service("lines").get(data.lineId);
    let insertQuery;
    console.log(data);
    let machine_and_line =
      data.machine_name + "_" + lineData.line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters

    console.log(data.type !== "MCAL4");

    switch (data.type) {
      case "MX4":
      case "MCAL4":
      case "MULTI4":
        console.log("mmm");
        learnMMMSensors(data.url, machine_and_line, data.id, data);
        break;
      default:
        console.log("not mmm");
        insertQuery =
          'CREATE TABLE IF NOT EXISTS "' +
          machine_and_line +
          '" ( id uuid NOT NULL, machine_id integer, inspected integer,linepct integer, linespeed integer, created_at timestamp with time zone,updated_at timestamp with time zone, ' +
          "CONSTRAINT " +
          machine_and_line +
          "_pkey PRIMARY KEY (id), " +
          "CONSTRAINT " +
          machine_and_line +
          "_machine_id_fkey FOREIGN KEY (machine_id) " +
          "REFERENCES public.machines (id) MATCH SIMPLE " +
          "ON UPDATE CASCADE " +
          "ON DELETE CASCADE);";
        console.log(insertQuery);
        pool.query(insertQuery).catch((error) => console.log(error));
        break;
    }

    return "done";
  }

  async update(id, data, params) {
    return data;
  }

  // async patch(id, data, params) {
  //   return data;
  // }

  // async remove(id, params) {
  //   return { id };
  // }
};
