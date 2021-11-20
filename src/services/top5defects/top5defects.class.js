/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */

const pool = require("./../../db");
const moment = require("moment");

exports.Top5Defects = class Top5Defects {
  constructor(options) {
    this.options = options || {};
  }
  setup(app) {
    this.app = app;
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    //find the machines with in the line
    let insertQuery = "";
    let columns = [];
    let machineScanTime = [];
    let machineSensors = {};
    let allResults = {};
    let result = {};
    
    const machines = await this.app.service("machines").find({
      query: {
        lineId: id,
      },
    });
    //get list of all the sensors

    const sensors = await machines.data.map((machine, index) => {
      machineScanTime[index] = machine.scantime;

      machine.sensors.sensors.forEach((sensor) => {
        sensor.counter.forEach((defect) => {
          machineSensors[
            `${sensor.id.toLowerCase()}_${defect.id.toLowerCase()}`
          ] = machine.machine_name;
        });
      });
      columns[index] = "SELECT linespeed,COUNT(linespeed),";
      machine.sensors.sensors.forEach((sensor) => {
        sensor.counter.forEach((defect) => {
          columns[
            index
          ] += `SUM(public."${machine.machine_name}_${machine["line.line_number"]}".${sensor.id}_${defect.id}) as ${sensor.id}_${defect.id},`;
        });
      });

      columns[index] = columns[index].slice(0, -1);
      columns[
        index
      ] += ` FROM public."${machine.machine_name}_${machine["line.line_number"]}" WHERE created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}' GROUP BY  public."${machine.machine_name}_${machine["line.line_number"]}".linespeed`;
      insertQuery = columns.join(";");
    });

    await pool
      .query({ text: insertQuery }) //{ text: insertQuery, rowMode: "array" })
      .then((res) => {
        let sumOfLineSpeed = {};
        let sumOfDefected = {};
        res.forEach((row, index) => {
          for (let i = 0; i < row.rows.length; i++) {
            for (const defect in row.rows[i]) {
              if (defect !== "linespeed" && defect !== "count") {
                if (!sumOfLineSpeed[defect]) {
                  sumOfLineSpeed[defect] = 0;
                  sumOfDefected[defect] = 0;
                }
                sumOfLineSpeed[defect] +=
                  row.rows[i]["linespeed"] *
                  machineScanTime[index] *
                  parseInt(row.rows[i]["count"]);
                sumOfDefected[defect] += parseInt(row.rows[i][defect]);
              }
            }
          }
          for (let i = 0; i < res.length; i++) {
            for (const defect in res[i].rows[0]) {
              if (defect !== "linespeed" && defect !== "count") {
                allResults[defect] = (
                  (sumOfDefected[defect] * 100) /
                  sumOfLineSpeed[defect]
                ).toPrecision(3);
                result = Object.assign(
                  // collect all objects into a single obj
                  ...Object.entries(allResults) // spread the final array as parameters // key a list of key/ value pairs
                    .sort(({ 1: a }, { 1: b }) => b - a) // sort DESC by index 1
                    .slice(0, 5) // get first three items of array
                    .map(([k, v]) => ({ [k]: v })) // map an object with a destructured
                );
              }
            }
          }

          //allResults = { ...allResults, ...row.rows[0] };
        });
      })
      .catch((error) => console.log(error));
    let data = [];
    Object.entries(result).forEach(([key, value], index) => {
      let temp = {
        machine: machineSensors[key],
        defect: key,
        value: value,
        key: index,
      };
      data[index] = { ...temp };
    });
    
    return {
      data,
      code: "200",
    };
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)));
    }

    return data;
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
  }
};
