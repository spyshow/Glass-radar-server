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

// function to change string to number
let s2n = (string) => {
  return parseInt(string, 10);
};

const scanMMMMachine = (machine, line_number, app) => {
  const mahcnieData = app.service("machine-data");
  //each machine
  let scantime = "*/" + machine.scantime + " * * * *"; // we make a cron time string for the scan time
  //example: MCAL_M22
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters

  if (!manager.exists(machine_and_line)) {
    manager.add(
      //we add a corn job
      machine_and_line,
      scantime,
      () => {
        //the function to loop in every scan time
        soap.createClient(
          //call the soap API
          machine.url,
          function (err, client) {
            if (typeof client === "undefined") {
              //if the first call for the API it will return an empty respond
              setTimeout(scanMMMMachine, 60000, machine, line_number, app); // call the function again after 60 second
            } else {
              //console.log(machine.type);
              //calling soap api
              client.Counts({}, function (err, xml) {
                if (machine.type === "MX4") {
                  if (xml == null || typeof xml.CountsResult === "undefined") {
                    console.log("waiting result ... ");
                    // if the respond is empty
                    setTimeout(scanMMMMachine, 60000, machine, line_number, app); // try again in 60 second
                  } else {
                    let result = xml.CountsResult.Root.Machine;
                    //console.log(result.attributes.Id);
                    let insertQuery;
                    let sensorArray = [];
                    //building the insert statement and array
                    //console.log(machine_and_line, result.Mold);
                    if (
                      Array.isArray(result.Mold) &&
                      result.attributes.Id === "MX" &&
                      typeof result.Mold !== "undefined"
                    ) {
                      //TODO:
                      //if no mold number reader is installed

                      //building Insert query
                      let insertQuery1 =
                        'INSERT INTO "' +
                        machine_and_line +
                        '" (id,machine_id, inspected, rejected, mold ,';
                      //start building the values string
                      let insertQuery2 = " VALUES ";
                      let sensorIndex = 1;

                      result.Mold.map((mold, moldIndex) => {
                        insertQuery2 += " (uuid_generate_v4(),";
                        for (var i = 0; i < 4; i++) {
                          switch (i) {
                            case 0:
                              sensorArray[sensorIndex - 1] = machine.id;

                              break;
                            case 1:
                              sensorArray[sensorIndex - 1] = s2n(
                                mold.Inspected
                              );

                              break;
                            case 2:
                              sensorArray[sensorIndex - 1] = s2n(mold.Rejects);
                              break;
                            case 3:
                              sensorArray[sensorIndex - 1] = s2n(
                                mold.attributes.id
                              );
                              break;
                            default:
                              break;
                          }

                          insertQuery2 += "$" + sensorIndex + ",";
                          sensorIndex++;
                        }

                        machine.sensors.sensors.map((sensor) => {
                          let rejects;
                          //loop through all the sensors

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
                            //   sensorIndex - 1 * i,
                            //   sensorArray[sensorIndex - 1]
                            // );
                            sensorIndex++; // increase the index by 1
                          }
                        });

                        insertQuery2 += " NOW(), NOW()),";
                      });
                      insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                      insertQuery = insertQuery1 + insertQuery2.slice(0, -1);
                      // console.table(sensorArray);
                      // console.log(insertQuery);
                    } else {
                      //building Insert query
                      console.log(machine.type + " its an object");
                      let insertQuery1 =
                        'INSERT INTO "' +
                        // result.Mold.Machine[0].$.id +
                        // "_" +
                        // machine.machine_line.replace(/[^A-Z0-9]/gi, "") +
                        machine_and_line +
                        '" (id,machine_id, inspected, rejected, mold ,';

                      //start building the values string
                      let insertQuery2 =
                        " VALUES (uuid_generate_v4(),$1,$2,$3, $4, ";
                      let sensorIndex = 5; // sensor array offset
                      console.log(machine.sensors);
                      machine.sensors.sensors.map((sensor, index) => {
                        //loop through all the sensors
                        for (var i = 0; i < sensor.counter.length; i++) {
                          //loop through the counters of the sensor
                          insertQuery1 +=
                            sensor.id + "_" + sensor.counter[i].id + ","; //add the name of the sensor_counter

                          insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )
                          console.log(result);
                          if (typeof result.Mold === "undefined") {
                            sensorArray[sensorIndex - 5] = 0;
                          } else {
                            console.log("inside");
                            console.log(result.Mold);
                            sensorArray[sensorIndex - 5] = s2n(
                              // insert value of counter to sensor array
                              result.Mold.Sensor[index].Counter[i]["$"].Nb
                            );
                          }

                          sensorIndex++; // increase the index by 1
                        }
                      });
                      insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                      insertQuery2 += " NOW(), NOW()) RETURNING *;";
                      insertQuery = insertQuery1 + insertQuery2;
                      //DONE BUILDING INSERT QUERY

                      //!!!!!!!!!!!!!!!!!!!!!!!!!!!! !!!!!!!!
                    }
                    //START GATHERING THE INSERT VALUES
                    //DONE GATHERING THE INSERT VALUES
                    //INSERT VALUES TO DB
                    console.log(insertQuery, sensorArray);
                    pool
                      .query(insertQuery, sensorArray)
                      .then((res) => {
                        mahcnieData.emit("created", {
                          type: "created",
                          data: res.rows[0],
                        });
                      })
                      .catch((error) => console.log("!!" + error));
                    //DONE INSERTING VALUES TO DB
                  }
                } else {
                  //if not MX4
                  if (xml == null || typeof xml === "undefined") {
                    console.log("waiting result ... ");
                    // if the respond is empty
                    setTimeout(scanMMMMachine, 60000, machine, line_number, app); // try again in 60 second
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
                        let insertQuery;
                        let sensorArray = [];
                        //building the insert statement and array
                        if (Array.isArray(result.Mold)) {
                          //building Insert query
                          let insertQuery1 =
                            'INSERT INTO "' +
                            machine_and_line +
                            '" (id,machine_id, inspected, rejected, mold ,';
                          //start building the values string
                          let insertQuery2 = " VALUES ";
                          let sensorIndex = 1;

                          result.Mold.map((mold, moldIndex) => {
                            insertQuery2 += " (uuid_generate_v4(),";
                            for (var i = 0; i < 4; i++) {
                              insertQuery2 += "$" + sensorIndex + ",";
                              sensorIndex++;
                            }
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

                            insertQuery2 += " NOW(), NOW()),";
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
                            '" (id,machine_id, inspected, rejected, mold ,';

                          //start building the values string
                          let insertQuery2 =
                            " VALUES (uuid_generate_v4(),$1,$2,$3, $4, ";
                          let sensorIndex = 5; // sensor array offset

                          machine.sensors.sensors.map((sensor, index) => {
                            //loop through all the sensors
                            if (sensor.counter.length === 1) {
                              insertQuery1 += sensor.id + ",";
                              insertQuery2 += "$" + sensorIndex + " ,";

                              sensorArray[sensorIndex - 5] = s2n(
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

                                sensorArray[sensorIndex - 5] = s2n(
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
                          insertQuery2 += " NOW(), NOW()) RETURNING *;";
                          insertQuery = insertQuery1 + insertQuery2;
                          //DONE BUILDING INSERT QUERY

                          //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        }
                        //START GATHERING THE INSERT VALUES
                        let values = [
                          machine.id,
                          s2n(result.Mold.Machine[0].Inspected),
                          s2n(result.Mold.Machine[0].Rejects),
                          s2n(result.Mold.$.id),
                          ...sensorArray,
                        ];
                        console.log(insertQuery, values);
                        //DONE GATHERING THE INSERT VALUES
                        //INSERT VALUES TO DB
                        //console.log(values);
                        pool
                          .query(insertQuery, values)
                          .then((res) => {
                            //console.log(res.rows);
                            mahcnieData.emit("created", {
                              type: "created",
                              data: res.rows[0],
                            });
                          })
                          .catch((error) => console.log("!!" + error));
                        //DONE INSERTING VALUES TO DB
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
};

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

const updateMMMMachine = function (machine, line_number, scanTime) {
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  manager.update(machine_and_line, scanTime);
};

exports.updateMMMMachine = updateMMMMachine;
exports.removeMMMMachine = removeMMMMachine;
exports.scanMachine = scanMMMMachine;
