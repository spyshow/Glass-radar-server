/* eslint-disable indent */
/* eslint-disable quotes */
const soap = require("soap");
const parseString = require("xml2js").parseString;
const pool = require("./../../db");
const { mx4Init } = require("./mx4Init");
const { mm4Init } = require("./mm4Init");
// const feathers = require("@feathersjs/feathers");
// const lines = app.service("lines");
function learnMMMSensors(url, machine_name, id, data) {
  let insertQuery =
    'CREATE TABLE IF NOT EXISTS "' +
    machine_name +
    '" ( id uuid NOT NULL, machine_id integer, inspected integer, rejected integer,linespeed integer, mold integer, ';
  console.log(url);
  soap.createClient(
    url,
    //"http://192.168.0.191/webservice/cwebservice.asmx?wsdl",
    function (err, client) {
      if (err) console.log("20:", err);
      console.log(client);
      if (typeof client === "undefined" || client === null) {
        console.log("waiting Client ... ");
        setTimeout(learnMMMSensors, 60000, url, machine_name, id, data);
      } else {
        console.log("S", data.type);
        //calling soap api

        client.Counts({}, function (err, xml) {
          //check if machine type is Mcal, Multi or MX4
          if (data.type === "MX4") {
            if (xml.CountsResult === null) {
              console.log("waiting result ... ");
              setTimeout(learnMMMSensors, 60000, url, machine_name, id, data);
            } else {
              mx4Init(xml, insertQuery, machine_name, id, pool);
            }
          } else {
            parseString(xml.CountsResult, function (err, result) {
              console.log(xml);
              if (result === null) {
                console.log("waiting result ... ");
                setTimeout(learnMMMSensors, 60000, url, machine_name, id, data);
              } else {
                console.log("multi");
                mm4Init(result, insertQuery, machine_name, id, pool);
              }
            });
          }
        });
      }
    }
  );
}
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
    console.log(data);
    let machine_and_line =
      data.machine_name + "_" + lineData.line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters

    console.log(data.type !== "MCAL4");
    let insertQuery =
      'CREATE TABLE IF NOT EXISTS "' +
      machine_and_line +
      '" ( id uuid NOT NULL, machine_id integer, inspected integer, linespeed integer, created_at timestamp with time zone,updated_at timestamp with time zone, ' +
      "CONSTRAINT " +
      machine_and_line +
      "_pkey PRIMARY KEY (id), " +
      "CONSTRAINT " +
      machine_and_line +
      "_machine_id_fkey FOREIGN KEY (machine_id) " +
      "REFERENCES public.machines (id) MATCH SIMPLE " +
      "ON UPDATE CASCADE " +
      "ON DELETE CASCADE);";
    switch (data.type) {
      case "MX4":
      case "MCAL4":
      case "MULTI4":
        console.log("mmm");
        console.log(insertQuery);
        learnMMMSensors(data.url, machine_and_line, data.id, data);
        break;
      default:
        console.log("not mmm");
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
