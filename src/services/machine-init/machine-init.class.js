/* eslint-disable quotes */
const soap = require("soap");
const parseString = require("xml2js").parseString;
const pool = require("./../../db");
const { mx4Init } = require("./mx4Init");
const { mm4Init } = require("./mm4Init");
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
    console.log(lineData.line_number);
    let machine_and_line =
      data.machine_name + "_" + lineData.line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters

    function learnSensors(url, machine_name, id) {
      let insertQuery =
        'CREATE TABLE IF NOT EXISTS "' +
        machine_name +
        '" ( id uuid NOT NULL, machine_id integer, inspected integer, rejected integer, mold integer, ';
      console.log(url);
      soap.createClient(
        url,
        //"http://192.168.0.191/webservice/cwebservice.asmx?wsdl",
        function (err, client) {
          if (typeof client === "undefined") {
            console.log("waiting Client ... ");
            setTimeout(learnSensors, 60000, url, machine_name, id);
          } else {
            console.log("S", data.type);
            //calling soap api

            client.Counts({}, function (err, xml) {
              //check if machine type is Mcal, Multi or MX4
              if (data.type === "MX4") {
                if (xml.CountsResult === null) {
                  console.log("waiting result ... ");
                  setTimeout(learnSensors, 60000, url, machine_name, id);
                } else {
                  mx4Init(xml, insertQuery, machine_name, id, pool);
                }
              } else {
                parseString(xml.CountsResult, function (err, result) {
                  console.log(result);
                  if (result === null) {
                    console.log("waiting result ... ");
                    setTimeout(learnSensors, 60000, url, machine_name, id);
                  } else {
                    mm4Init(result, insertQuery, machine_name, id, pool);
                  }
                });
              }
            });
          }
        }
      );
    }
    learnSensors(data.url, machine_and_line, data.id);
    return "done";
  }

  // async update(id, data, params) {
  //   return data;
  // }

  // async patch(id, data, params) {
  //   return data;
  // }

  // async remove(id, params) {
  //   return { id };
  // }
};
