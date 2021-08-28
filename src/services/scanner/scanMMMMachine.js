/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
const sensorIds = {
  16: "LNM",
  40: "Plug",
  41: "Leak",
  42: "Check",
  46: "Thickness",
  121: "unknow",
};
/* eslint-disable quotes */
const soap = require("soap");
const parseString = require("xml2js").parseString;
const CronJobManager = require("cron-job-manager");
const manager = new CronJobManager();
const pool = require("../../db");
const moment = require("moment");

// function to change string to number
let s2n = (string) => {
  return parseInt(string, 10);
};

async function scanMMMMachine(machine, line_number, app, lineId) {
  const machineData = app.service("machine-data");
  const lineData = app.service("line-data");
  let scantime = "*/" + machine.scantime + " * * * *"; // we make a cron time string for the scan time
  //example: MCAL_M22
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  console.log("32: manager ", manager.exists(machine_and_line));
  if (!manager.exists(machine_and_line)) {
    manager.add(
      //we add a corn job
      machine_and_line,
      scantime,
      async () => {
        let lineSpeed, lehrTime;
        await app
          .service("jobs")
          .find({
            query: {
              active: true,
              line: line_number,
            },
          })
          .then((job) => {
            lehrTime = job.data[0].lehr_time;
          });
        await app
          .service("linespeed")
          .find({
            query: {
              lineId: lineId,
              createdAt: {
                $lt: moment().add(60 * 1000 - lehrTime * 60 * 1000),
                $gt: moment().subtract(60 * 1000 + lehrTime * 60 * 1000),
              },
              $limit: 1,
              $sort: {
                createdAt: -1,
              },
            },
          })
          .then(async (job) => {
            // console.log("67", job, lehrTime);

            if (job.data.length < 1) {
              console.log("les than lehr time");
              await app
                .service("jobs")
                .find({
                  query: {
                    line: line_number,
                    active: true,
                    $limit: 1,
                    $sort: {
                      createdAt: -1,
                    },
                  },
                })
                .then((job) => {
                  lineSpeed = job.data[0].speed;
                });
            } else {
              lineSpeed = job.data[0].speed;
            }
          });
        //console.log("89", lineSpeed);
        //the function to loop in every scan time
        soap.createClient(
          //call the soap API
          machine.url,
          function (err, client) {
            if (err) console.log(err);
            if (typeof client === "undefined") {
              //if the first call for the API it will return an empty respond
              console.log("99:undefined");
              setTimeout(
                scanMMMMachine,
                60000,
                machine,
                line_number,
                app,
                lineId
              ); // call the function again after 60 second
            } else {
              console.log(machine.type);
              //calling soap api
              client.Counts({}, function (err, xml) {
                if (machine.type === "MX4") {
                  if (
                    xml == null ||
                    typeof xml.CountsResult === "undefined" ||
                    typeof xml.CountsResult.Root.Machine.Inspected ===
                      "undefined" // to check if the machine returned nothing
                  ) {
                    console.log("waiting result ... ");
                    // if the respond is empty
                    setTimeout(
                      scanMMMMachine,
                      60000,
                      machine,
                      line_number,
                      app,
                      lineId
                    ); // try again in 60 second
                  } else {
                    let result = xml.CountsResult.Root.Machine;
                    //console.log(result.attributes.Id);
                    let insertQuery;
                    let sensorArray = [];
                    //building the insert statement and array
                    //calculate the line precentage ( if below 200 is ok )
                    console.log(
                      result.Inspected,
                      result.Rejects,
                      lineSpeed,
                      machine.scantime
                    );

                    const linepctCheck = s2n(
                      (100 * (result.Inspected - result.Rejects)) /
                        (lineSpeed * machine.scantime)
                    );

                    //if machine is MX4 with mold number reader installed
                    if (
                      Array.isArray(result.Mold) &&
                      result.attributes.Id === "MX" &&
                      typeof result.Mold !== "undefined"
                    ) {
                      //console.log("14o", lineId, lehrTime, lineSpeed);
                      //building Insert query
                      let insertQuery1 =
                        'INSERT INTO "' +
                        machine_and_line +
                        '" (id,machine_id, inspected, rejected,machinepct,linepct,linespeed, mold ,';
                      //start building the values string
                      let insertQuery2 = " VALUES ";
                      let sensorIndex = 1;
                      //console.log(result);
                      result.Mold.map((mold, moldIndex) => {
                        insertQuery2 += " (uuid_generate_v4(),";
                        for (let i = 1; i < 8; i++) {
                          switch (i) {
                            case 1:
                              sensorArray[sensorIndex - 1] = machine.id;

                              break;
                            case 2:
                              sensorArray[sensorIndex - 1] = s2n(
                                result.Inspected
                              );

                              break;
                            case 3:
                              sensorArray[sensorIndex - 1] = s2n(
                                result.Rejects
                              );
                              break;

                            case 4:
                              sensorArray[sensorIndex - 1] = s2n(
                                ((result.Inspected - result.Rejects) * 100) /
                                  result.Inspected
                              );
                              break;
                            case 5:
                              sensorArray[sensorIndex - 1] = s2n(
                                (100 * (result.Inspected - result.Rejects)) /
                                  (lineSpeed * machine.scantime)
                              );
                              break;
                            case 6:
                              //console.log("119:linespeed ", lineSpeed);
                              sensorArray[sensorIndex - 1] = s2n(lineSpeed);

                              break;
                            case 7:
                              sensorArray[sensorIndex - 1] = s2n(
                                mold.attributes.id
                              );
                              break;
                            default:
                              break;
                          }

                          insertQuery2 += "$" + sensorIndex + ",";
                          sensorIndex++; // increase the index by 1
                        }

                        machine.sensors.sensors.map((sensor) => {
                          let rejects;
                          //loop through all the sensors
                          // console.log(
                          //   "193",
                          //   sensor.counter.length,
                          //   mold.Sensor.length
                          // );
                          //here is error
                          for (var i = 1; i < sensor.counter.length + 1; i++) {
                            for (var l = 0; l < mold.Sensor.length; l++) {
                              if (
                                sensor.counter[i - 1].id ===
                                sensorIds[mold.Sensor[l].attributes.id]
                              ) {
                                rejects = mold.Sensor[l].Rejects;
                                //console.log(rejects, sensor.counter[i - 1].id);
                              }
                            }
                            //loop through the counters of the sensor
                            if (moldIndex == 0) {
                              //loop only at the first time ( to write the sensor_counter names )
                              insertQuery1 +=
                                "MX4_" + sensor.counter[i - 1].id + ","; //add the name of the sensor_counter
                            }
                            insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )

                            sensorArray[sensorIndex - 1] = s2n(
                              // insert value of counter to sensor array
                              rejects
                            );
                            // console.log(
                            //   sensorIndex,
                            //   rejects,
                            //   sensorArray[sensorIndex - 1]
                            // );
                            sensorIndex++; // increase the index by 1
                          }
                        });

                        insertQuery2 +=
                          "  DATE_TRUNC('minute', NOW()::timestamp),  DATE_TRUNC('minute', NOW()::timestamp)),";
                      });
                      insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                      insertQuery = insertQuery1 + insertQuery2.slice(0, -1);
                      // console.table(sensorArray);
                      // console.log(insertQuery);
                    } else {
                      //TODO to be checked online
                      //if machine has no mold number reader
                      //building Insert query
                      // console.log("246", lineId, lehrTime, lineSpeed);
                      // console.log(machine.type + " its an object");
                      // console.log(result);
                      let insertQuery1 =
                        'INSERT INTO "' +
                        // result.Mold.Machine[0].$.id +
                        // "_" +
                        // machine.machine_line.replace(/[^A-Z0-9]/gi, "") +
                        machine_and_line +
                        '" (id,machine_id, inspected, rejected,machinepct,linepct,linespeed, mold ,';

                      //start building the values string
                      let insertQuery2 = " VALUES ";
                      // let insertQuery2 =
                      //   " VALUES (uuid_generate_v4(),$1,$2,$3, $4, $5,$6,$7,";
                      insertQuery2 += " (uuid_generate_v4(),";
                      var sensorIndex;
                      for (sensorIndex = 1; sensorIndex < 8; sensorIndex++) {
                        switch (sensorIndex) {
                          case 1:
                            sensorArray[sensorIndex - 1] = machine.id;

                            break;
                          case 2:
                            sensorArray[sensorIndex - 1] = 0;

                            break;
                          case 3:
                            sensorArray[sensorIndex - 1] = s2n(result.Rejects);
                            break;

                          case 4:
                            sensorArray[sensorIndex - 1] = s2n(
                              ((result.Inspected - result.Rejects) * 100) /
                                result.Inspected
                            );
                            break;
                          case 5:
                            sensorArray[sensorIndex - 1] = linepctCheck;
                            break;
                          case 6:
                            //console.log("119:linespeed ", lineSpeed);
                            sensorArray[sensorIndex - 1] = s2n(lineSpeed);

                            break;
                          case 7:
                            sensorArray[sensorIndex - 1] = s2n(
                              result.Mold.attributes.id
                            );
                            break;
                          default:
                            break;
                        }

                        insertQuery2 += "$" + sensorIndex + ",";
                      }

                      // let sensorIndex = 7; // sensor array offset
                      //console.log(machine.sensors);
                      machine.sensors.sensors.map((sensor, index) => {
                        let rejects;
                        //loop through all the sensors
                        // console.log(
                        //   "193",
                        //   sensor.counter.length,
                        //   mold.Sensor.length
                        // );
                        //here is error
                        console.log("331", sensor.counter);
                        for (var i = 1; i < sensor.counter.length + 1; i++) {
                          for (var l = 0; l < result.Mold.Sensor.length; l++) {
                            if (
                              sensor.counter[i - 1].id ===
                              sensorIds[result.Mold.Sensor[l].attributes.id]
                            ) {
                              rejects = result.Mold.Sensor[l].Rejects;
                              //console.log(rejects, sensor.counter[i - 1].id);
                            }
                          }
                          //loop through the counters of the sensor
                          if (index == 0) {
                            //loop only at the first time ( to write the sensor_counter names )
                            insertQuery1 +=
                              "MX4_" + sensor.counter[i - 1].id + ","; //add the name of the sensor_counter
                          }
                          insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )

                          sensorArray[sensorIndex - 1] = s2n(
                            // insert value of counter to sensor array
                            rejects
                          );
                          // console.log(
                          //   sensorIndex,
                          //   rejects,
                          //   sensorArray[sensorIndex - 1]
                          // );
                          sensorIndex++; // increase the index by 1
                        }
                      });
                      insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                      insertQuery2 +=
                        "  DATE_TRUNC('minute', NOW()::timestamp),  DATE_TRUNC('minute', NOW()::timestamp)) RETURNING *;";
                      insertQuery = insertQuery1 + insertQuery2;
                      //DONE BUILDING INSERT QUERY

                      //!!!!!!!!!!!!!!!!!!!!!!!!!!!! !!!!!!!!
                    }
                    //START GATHERING THE INSERT VALUES
                    //DONE GATHERING THE INSERT VALUES
                    //INSERT VALUES TO DB

                    //check if linepct is more than 200 % and ignore it

                    console.log("347", linepctCheck, insertQuery, sensorArray);
                    if (linepctCheck < 200) {
                      pool
                        .query(insertQuery, sensorArray)
                        .then((res) => {
                          machineData.emit("created", {
                            type: "created",
                            data: res.rows[0],
                          });
                          lineData.emit("created", {
                            type: "created",
                            data: lineData.get(lineId),
                          });
                        })
                        .catch((error) => console.log("!!" + error));
                      //DONE INSERTING VALUES TO DB
                    }
                  }
                } else {
                  console.log("mmm");
                  //if not MX4
                  if (xml == null || typeof xml === "undefined") {
                    console.log("waiting result ... ");
                    // if the respond is empty
                    setTimeout(
                      scanMMMMachine,
                      60000,
                      machine,
                      line_number,
                      app
                    ); // try again in 60 second
                  } else {
                    parseString(xml.CountsResult, function (err, result) {
                      if (result == null) {
                        console.log(
                          "waiting result " + machine_and_line + "... "
                        );
                        // if the respond is empty
                        setTimeout(
                          scanMMMMachine,
                          60000,
                          machine,
                          line_number,
                          app
                        ); // try again in 60 second
                      } else {
                        //console.log(result);
                        console.log("321", lineId, lehrTime, lineSpeed);
                        let insertQuery;
                        let sensorArray = [];
                        //building the insert statement and array
                        if (Array.isArray(result.Mold)) {
                          //building Insert query
                          let insertQuery1 =
                            'INSERT INTO "' +
                            machine_and_line +
                            '" (id,machine_id, inspected, rejected,machinepct,linepct, linespeed, mold ,';
                          //start building the values string
                          let insertQuery2 = " VALUES ";
                          let sensorIndex = 1;

                          result.Mold.map((mold, moldIndex) => {
                            insertQuery2 +=
                              " (uuid_generate_v4(),$1,$2,$3,$4,$5,$6,$7,";

                            machine.sensors.sensors.map((sensor, index) => {
                              //loop through all the sensors
                              for (var i = 0; i < sensor.counter.length; i++) {
                                //loop through the counters of the sensor
                                if (moldIndex == 0) {
                                  //loop only at the first time ( to write the sensor_counter names )
                                  insertQuery1 +=
                                    sensor.id +
                                    "_" +
                                    sensor.counter[i].id +
                                    ","; //add the name of the sensor_counter
                                }
                                insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )

                                sensorArray[sensorIndex - 5] = s2n(
                                  // insert value of counter to sensor array
                                  result.Mold.Machine[0].Sensor[index].Counter[
                                    i
                                  ]["$"].Nb
                                );

                                sensorIndex++; // increase the index by 1
                              }
                            });

                            insertQuery2 +=
                              "  DATE_TRUNC('minute', NOW()::timestamp), DATE_TRUNC('minute', NOW()::timestamp)),";
                          });
                          insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                          insertQuery =
                            insertQuery1 + insertQuery2.slice(0, -1);
                        } else {
                          //building Insert query
                          console.log(machine.type + " its an object");
                          let insertQuery1 =
                            'INSERT INTO "' +
                            // result.Mold.Machine[0].$.id +
                            // "_" +
                            // machine.machine_line.replace(/[^A-Z0-9]/gi, "") +
                            machine_and_line +
                            '" (id,machine_id, inspected, rejected,machinepct,linepct,linespeed, mold ,';

                          //start building the values string
                          let insertQuery2 =
                            " VALUES (uuid_generate_v4(),$1,$2,$3,$4, $5,$6,$7, ";
                          let sensorIndex = 8; // sensor array offset

                          machine.sensors.sensors.map((sensor, index) => {
                            //loop through all the sensors
                            if (sensor.counter.length === 1) {
                              insertQuery1 += sensor.id + ",";
                              insertQuery2 += "$" + sensorIndex + " ,";

                              sensorArray[sensorIndex - 8] = s2n(
                                // insert value of counter to sensor array
                                result.Mold.Machine[0].Sensor[index]["Rejects"]
                              );
                              sensorIndex++;
                            } else {
                              for (var i = 0; i < sensor.counter.length; i++) {
                                //loop through the counters of the sensor
                                insertQuery1 +=
                                  sensor.id + "_" + sensor.counter[i].id + ","; //add the name of the sensor_counter
                                insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )

                                sensorArray[sensorIndex - 8] = s2n(
                                  // insert value of counter to sensor array
                                  result.Mold.Machine[0].Sensor[index].Counter[
                                    i
                                  ]["$"].Nb
                                );

                                sensorIndex++; // increase the index by 1
                              }
                            }
                          });
                          insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                          insertQuery2 +=
                            " DATE_TRUNC('minute', NOW()::timestamp), DATE_TRUNC('minute', NOW()::timestamp)) RETURNING *;";
                          insertQuery = insertQuery1 + insertQuery2;
                          //DONE BUILDING INSERT QUERY

                          //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        }
                        //START GATHERING THE INSERT VALUES
                        // console.log(
                        //   "result:",
                        //   result.Mold.Machine[0].Inspected[0],
                        //   result.Mold.Machine[0].Rejects[0],
                        //   lineSpeed,
                        //   machine.scantime
                        // );
                        //calculate machinepct and linepct
                        let machinepct =
                          result.Mold.Machine[0].Inspected[0] > 0
                            ? s2n(
                                ((result.Mold.Machine[0].Inspected[0] -
                                  result.Mold.Machine[0].Rejects[0]) *
                                  100) /
                                  result.Mold.Machine[0].Inspected[0]
                              )
                            : 0;
                        let linepct = s2n(
                          (100 *
                            (result.Mold.Machine[0].Inspected[0] -
                              result.Mold.Machine[0].Rejects[0])) /
                            (lineSpeed * machine.scantime)
                        );

                        let values = [
                          machine.id,
                          s2n(result.Mold.Machine[0].Inspected[0]),
                          s2n(result.Mold.Machine[0].Rejects[0]),
                          machinepct,
                          linepct,
                          s2n(lineSpeed),
                          s2n(result.Mold.$.id),
                          ...sensorArray,
                        ];
                        //console.log(insertQuery, values);
                        //DONE GATHERING THE INSERT VALUES
                        //INSERT VALUES TO DB
                        //console.log(values);
                        if (linepct < 200) {
                          //if precentage less than 200 ( to skip first scan )
                          pool
                            .query(insertQuery, values)
                            .then((res) => {
                              //console.log(res.rows);
                              machineData.emit("created", {
                                type: "created",
                                data: res.rows[0],
                              });
                              lineData.emit("created", {
                                type: "created",
                                data: lineData.get(lineId),
                              });
                            })
                            .catch((error) => console.log("!!" + error));

                          //DONE INSERTING VALUES TO DB
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        );
      },
      { start: true } // start the cron job immediately
    );
    console.log(machine_and_line + " added!");
    return machine_and_line + " added!";
  } else {
    console.log(machine_and_line + " not added!");
    return machine_and_line + " not added!";
  }

  //each machine
}

function removeMMMMachine(machine, line_number) {
  //console.log(1);
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
}

function updateMMMMachine(machine, line_number, scanTime) {
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  manager.update(machine_and_line, scanTime);
}

exports.updateMMMMachine = updateMMMMachine;
exports.removeMMMMachine = removeMMMMachine;
exports.scanMMMMachine = scanMMMMachine;
