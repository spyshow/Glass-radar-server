/* eslint-disable linebreak-style */

/* eslint-disable quotes */
const soap = require("soap");
const parseString = require("xml2js").parseString;
const CronJobManager = require("cron-job-manager");
const manager = new CronJobManager();
const pool = require("./../../db");

// function to change string to number
let s2n = (string) => {
  return parseInt(string, 10);
};

const scanMachine = (machine, line_number, app) => {
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
              setTimeout(scanMachine, 60000, machine, line_number, app); // call the function again after 60 second
            } else {
              //calling soap api
              client.Counts({}, function (err, xml) {
                parseString(xml.CountsResult, function (err, result) {
                  if (result == null) {
                    // if the respond is empty
                    setTimeout(scanMachine, 60000, machine, line_number, app); // try again in 60 second
                  } else {
                    let insertQuery;
                    let sensorArray = [];
                    //building the insert statement and array
                    if (typeof result.Mold === Array) {
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
                                sensor.id + "_" + sensor.counter[i].id + ","; //add the name of the sensor_counter
                            }
                            insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )

                            sensorArray[sensorIndex - 5] = s2n(
                              // insert value of counter to sensor array
                              result.Mold.Machine[0].Sensor[index].Counter[i][
                                "$"
                              ].Nb
                            );

                            sensorIndex++; // increase the index by 1
                          }
                        });

                        insertQuery2 += " NOW(), NOW()),";
                      });
                      insertQuery1 += "created_at, updated_at) "; // finishing the insert statement
                      insertQuery = insertQuery1 + insertQuery2.slice(0, -1);
                    } else {
                      //building Insert query
                      console.log("its an object");
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
                        for (var i = 0; i < sensor.counter.length; i++) {
                          //loop through the counters of the sensor
                          insertQuery1 +=
                            sensor.id + "_" + sensor.counter[i].id + ","; //add the name of the sensor_counter

                          insertQuery2 += "$" + sensorIndex + " ,"; //add the number of the value (ex: $22 )

                          sensorArray[sensorIndex - 5] = s2n(
                            // insert value of counter to sensor array
                            result.Mold.Machine[0].Sensor[index].Counter[i]["$"]
                              .Nb
                          );

                          sensorIndex++; // increase the index by 1
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
                    //DONE GATHERING THE INSERT VALUES
                    //INSERT VALUES TO DB
                    console.log(values);
                    pool
                      .query(insertQuery, values)
                      .then((res) => {
                        console.log(res.rows);
                        mahcnieData.emit("created", {
                          type: "created",
                          data: res.rows[0],
                        });
                      })
                      .catch((error) => console.log("!!" + error));
                    //DONE INSERTING VALUES TO DB
                  }
                });
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

function removeMachine(machine, line_number) {
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  console.log(manager.listCrons());
  if (manager.exists(machine_and_line)) {
    console.log(machine_and_line + " deleted!");
    manager.deleteJob(machine_and_line);
    return machine_and_line + " deleted!";
  } else {
    console.log(machine_and_line + " not deleted!");
    return machine_and_line + " not deleted!";
  }
}

const updateMachine = function (machine, line_number, scanTime) {
  let machine_and_line =
    machine.machine_name + "_" + line_number.replace(/[^A-Z0-9]/gi, ""); //make a string for the cron name (name of the machine _ number of line) all in capital letters
  manager.update(machine_and_line, scanTime);
};

exports.updateMachine = updateMachine;
exports.removeMachine = removeMachine;
exports.scanMachine = scanMachine;
