/* eslint-disable semi */
/* eslint-disable no-unused-vars */
const { presetPalettes } = require("@ant-design/colors");
const pool = require("./../../db");
const { separateObject } = require("../../utils/separateObject");
const { removeA } = require("../../utils/removeA");
var moment = require("moment");
const {
  blue,
  red,
  yellow,
  lime,
  volcano,
  cyan,
  purple,
} = require("@ant-design/colors");
const { round } = require("./../../utils/round");

exports.MachineData = class MachineData {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    let totalwidth = 0;
    let previousDate = "Previous time";
    let selectedDate = "selected date";
    let newResult = {};
    let widthSensor = [];
    let oldResult = {};
    let oldMachineData, newMachineData;
    let data = { xData: [], yData: [], y1Data: [] };
    let option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      // title: {
      //   text: params.query.machine_name.replace(/_/g, " "),
      //   textStyle: {
      //     fontSize: 24,
      //   },
      //   left: "40%",
      // },
      legend: {
        top: 20,
        right: 150,
        orient: "vertical",
        data: [previousDate, selectedDate],
        formatter:
          "{name} (" +
          moment(params.query.newStartDate).from(params.query.oldStartDate) +
          ")",
      },
      grid: [
        {
          top: 100,
          bottom: 201,
        },
        {
          height: 160,
          bottom: 40,
        },
      ],
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      xAxis: [
        {
          type: "category",
          data: data.xData,
          gridIndex: 0,
          axisLabel: {
            show: true,
            rotate: 90,
            align: "right",
            verticalAlign: "middle",
            position: "insideBottom",
            padding: [0, 0, 0, 0],
            backgroundColor: "red",
            color: "#333",
            fontSize: 16,
            rich: {
              name: {},
            },
          },
          axisLine: {
            lineStyle: {
              color: "#e7e7e7",
            },
          },
          axisTick: {
            lineStyle: {
              color: "#e7e7e7",
            },
          },
          zlevel: 2,
        },
        {
          type: "category",
          gridIndex: 1,
          axisLine: {
            show: false,
          },
          zlevel: 1,
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          axisLabel: {
            color: "#333",
          },
          splitLine: {
            lineStyle: {
              type: "dashed",
            },
          },
          axisLine: {
            lineStyle: {
              color: "#ccc",
            },
          },
          textStyle: {},
          axisTick: {
            lineStyle: {
              color: "#ccc",
            },
          },
        },
        {
          type: "value",
          gridIndex: 1,
          axisLabel: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: previousDate,
          data: data.yData,
          type: "bar",
          label: {
            show: true,
            position: "top",
            textStyle: {
              verticalAlign: "bottom",
              align: "center",
              color: "#555",
            },
          },
          itemStyle: {
            normal: {
              color: (params) => {
                let colors = [
                  "#b6c2ff",
                  "#96edc1",
                  "#fcb75b",
                  "#b6c2ff",
                  "#96edc1",
                  "#fcb75b",
                  "#b6c2ff",
                  "#96edc1",
                  "#fcb75b",
                  "#b6c2ff",
                  "#96edc1",
                  "#fcb75b",
                ];
                return colors[params.dataIndex];
              },
            },
          },
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: selectedDate,
          data: data.y1Data,
          type: "bar",
          label: {
            show: true,
            position: "top",
            textStyle: {
              verticalAlign: "middle",
              align: "center",
              color: "#555",
            },
          },
          itemStyle: {
            normal: {
              color: (params) => {
                let colors = [
                  "#4150d8",
                  "#28bf7e",
                  "#ed7c2f",
                  "#4150d8",
                  "#28bf7e",
                  "#ed7c2f",
                  "#4150d8",
                  "#28bf7e",
                  "#ed7c2f",
                  "#4150d8",
                  "#28bf7e",
                  "#ed7c2f",
                ];
                return colors[params.dataIndex];
              },
            },
          },
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
      ],
    };

    /********************/
    /* TODO: merge two queries into one */
    // select DISTINCT ON (created_at)
    // created_at,sum(MX4_LNM)
    // from public."MX4_M22"
    // group by created_at
    // let query = `select DISTINCT ON (created_at) created_at,`;
    // params.query.machine_sensors.sensors.map((sensor, i) => {
    //   sensor.counter.map((counter) => {
    //     query += sensor.id + "_" + counter.id+",";
    //   });
    //   // to esqape inspected, rejected and mold fields
    // });
    /********************/

    //querying old data

    await pool
      .query(
        `SELECT * FROM public."${params.query.machine_name}" WHERE created_at BETWEEN '${params.query.oldStartDate}' AND '${params.query.oldEndDate}'`
      )
      .then((res) => {
        if (res.rows.length !== 0) {
          oldResult = res.rows.reduce(function (previousValue, currentValue) {
            let array = [];
            let keys = Object.keys(res.rows[0]);
            let keysUpdated = removeA(
              keys,
              "id",
              "created_at",
              "updated_at",
              "machine_id"
            );
            keysUpdated.map((test) => {
              return (array[test] = previousValue[test] + currentValue[test]);
            });

            return array;
          });
        }
      });

    //querying new data
    await pool
      .query(
        `SELECT * FROM public."${params.query.machine_name}" WHERE created_at BETWEEN '${params.query.startDate}' AND '${params.query.endDate}'`
      )
      .then((res) => {
        if (res.rows.length !== 0) {
          newResult = res.rows.reduce(function (previousValue, currentValue) {
            let array = [];
            let keys = Object.keys(res.rows[0]);
            let keysUpdated = removeA(
              keys,
              "id",
              "created_at",
              "updated_at",
              "machine_id"
            );
            keysUpdated.map((test) => {
              return (array[test] = previousValue[test] + currentValue[test]);
            });

            return array;
          });
        }
      });
    newMachineData = separateObject(newResult);
    oldMachineData = separateObject(oldResult);

    let newPrecentage =
      (newMachineData[1].rejected * 100) / newMachineData[0].inspected;
    let oldPrecentage =
      oldMachineData[1] === undefined
        ? 0
        : (oldMachineData[1].rejected * 100) / oldMachineData[0].inspected;
    params.query.machine_sensors.sensors.forEach((sensor, i) => {
      let width = 0;
      sensor.counter.forEach((defect, index) => {
        let newData, oldData;
        newMachineData.forEach((obj) => {
          if (Object.keys(obj)[0].indexOf(defect.id.toLowerCase()) > -1) {
            newData = obj[Object.keys(obj)[0]];
          }
        });
        oldMachineData.forEach((obj) => {
          if (Object.keys(obj)[0].indexOf(defect.id.toLowerCase()) > -1) {
            oldData = obj[Object.keys(obj)[0]];
          }
        });
        if ((newData && newData !== 0) || (oldData && oldData !== 0)) {
          data.y1Data.push(newData);
          data.yData.push(oldData);
          data.xData.push(defect.id);
          //to calcualte the total width of the sensors
          width++;
          totalwidth++;
          console.log(width, totalwidth, sensor.id, defect.id);
        }
      });
      let sensorData = {
        min: 1,
        label: {
          show: true,
          position: "insideBottom",
          formatter: "{b}",
          offset: [0, 0],
          textStyle: {
            color: "#777",
          },
        },
        type: "bar",
        barGap: 0,
        barWidth: 100 * width,
        itemStyle: {
          normal: {
            color: presetPalettes.blue[i + 2],
          },
        },
        xAxisIndex: 1,
        yAxisIndex: 1,
      };
      console.log(sensorData.itemStyle.normal.color);
      sensorData.data = [
        {
          name: sensor.id.replace(/_/g, " "),
          value: 1,
        },
      ];
      option.series.push(sensorData);
    });
    //to remove the sensor if it has no data & calculate the total width of the sensor bar width
    option.series.forEach((sensor, i) => {
      if (sensor.barWidth === 0) {
        option.series.splice(i, 1);
      } else {
        sensor.barWidth = sensor.barWidth / totalwidth + "%";
      }
    });

    return {
      data: [option],
      newPrecentage: round(newPrecentage, 2),
      oldPrecentage: round(oldPrecentage, 2),
    };
  }

  async get(id, params) {
    return {
      id,
      text: `A new message with ID: ${id}!`,
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
