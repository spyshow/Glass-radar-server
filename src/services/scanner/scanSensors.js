/* eslint-disable linebreak-style */
/* eslint-disable quotes */
const CronJobManager = require("cron-job-manager");
const manager = new CronJobManager();
const pool = require("../../db");
const axios = require("axios").default;

let s2n = (string) => {
  return parseInt(string, 10);
};

const scanSensor = async (machine, line_number, app, lineId, lehrTime) => {
  const machineData = app.service("machine-data");
  const lineData = app.service("line-data");
  const top5Defects = app.service("top-5-defects");
  console.log("!!" + lineId);
  await console.log("1234", lehrTime, 60 * 1000 - lehrTime * 60 * 1000);
  const mahcnieData = app.service("machine-data");
  let lineSpeed;

  await app
    .service("linespeed")
    .find({
      query: {
        lineId: lineId,
        createdAt: {
          $lt: new Date().getTime() + (60 * 1000 - lehrTime * 60 * 1000),
          $gt: new Date().getTime() - (60 * 1000 + lehrTime * 60 * 1000),
        },
        $limit: 1,
        $sort: {
          createdAt: -1,
        },
      },
    })
    .then((linespeed) => {
      console.log("linespeed", linespeed);
      lineSpeed = linespeed.data[0] ? linespeed.data[0].speed : 200;
      console.log("linespeed", lineSpeed);
    });
  //each machine
  let scantime = "*/" + machine.scantime + " * * * *"; // we make a cron time string for the scan time
  //example: LI_M22
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  console.log(scantime);
  if (!manager.exists(machine_and_line)) {
    manager.add(
      //we add a corn job
      machine_and_line,
      scantime,
      () => {
        console.log("start ");
        axios
          .get(`${machine.url}/di_value/slot_0/ch_${machine.channel}`, {
            // Axios looks for the `auth` option, and, if it is set, formats a
            // basic auth header for you automatically.
            auth: {
              username: "admin",
              password: "thespy",
            },
          })
          .then((response) => {
            let linepct = s2n(
              (100 * response.data.Val) / (lineSpeed * machine.scantime)
            );
            //building Insert query
            let insertQuery = `INSERT INTO "${machine_and_line}" (id,machine_id,linespeed ,inspected ,linepct,created_at, updated_at)  VALUES (uuid_generate_v4(),${machine.id},${lineSpeed},${response.data.Val},${linepct}, DATE_TRUNC('minute', NOW()::timestamp),  DATE_TRUNC('minute', NOW()::timestamp)) RETURNING *;`;
            console.log(insertQuery);
            pool.query(insertQuery).then((res) => {
              mahcnieData.emit("created", {
                type: "created",
                data: res.rows[0],
              });
              lineData.emit("created", {
                type: "created",
                data: lineData.get(lineId),
              });
              top5Defects.emit("created", {
                type: "created",
                data: top5Defects.get(lineId),
              });
            });
          })
          .then(() => {
            axios.post(
              `${machine.url}/di_value/slot_0/ch_${machine.channel}`,
              {
                Ch: 0,
                ClrCnt: 1,
              },
              {
                // Axios looks for the `auth` option, and, if it is set, formats a
                // basic auth header for you automatically.
                auth: {
                  username: "root",
                  password: "thespy",
                },
              }
            );
          })
          .catch((error) => console.log(error));
      },
      { start: true } // start the cron job immediately
    );
  }
};

const removeSensor = function (machine, line_number) {
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  console.log(machine_and_line, manager.listCrons());
  if (manager.exists(machine_and_line)) {
    manager.deleteJob(machine_and_line);
    console.log(machine_and_line + " deleted!");
    return machine_and_line + " deleted!";
  } else {
    console.log(machine_and_line + " not deleted!");
    return machine_and_line + " not deleted!";
  }
};

const updateSensor = function (machine, line_number, scanTime) {
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  manager.update(machine_and_line, scanTime);
};

exports.scanSensor = scanSensor;
exports.removeSensor = removeSensor;
exports.updateSensor = updateSensor;
