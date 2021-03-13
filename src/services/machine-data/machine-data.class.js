/* eslint-disable semi */
/* eslint-disable no-unused-vars */
const { presetPalettes } = require("@ant-design/colors");
const pool = require("./../../db");
const { separateObject } = require("../../utils/separateObject");
const { removeA } = require("../../utils/removeA");
var moment = require("moment");

const colors = [
  [
    "#A8C545",
    "#2d350a",
    "#3a440c",
    "#47530f",
    "#5a6913",
    "#677916",
    "#7a8f1a",
    "#879e1d",
    "#9ab521",
    "#a7c424",
    "#b9d82a",
    "#c2dd46",
    "#c8e159",
    "#cde366",
    "#d7e986",
    "#e2efa6",
    "#e8f2b9",
  ],
  [
    "#0067A6",
    "#001f2f",
    "#01273d",
    "#01304a",
    "#013d5e",
    "#01466c",
    "#015380",
    "#015c8e",
    "#0269a2",
    "#0272af",
    "#027fc4",
    "#0294e4",
    "#07a6fd",
    "#1aadfd",
    "#49befd",
    "#79cffe",
    "#96d9fe",
  ],
  [
    "#C30F0E",
    "#4c0000",
    "#620000",
    "#780000",
    "#980000",
    "#ae0000",
    "#cf0000",
    "#e40000",
    "#ff0606",
    "#ff1c1c",
    "#ff3c3c",
    "#ff5d5d",
    "#ff6e6e",
    "#ff7979",
    "#ff9595",
    "#ffb1b1",
    "#ffc2c2",
  ],
  [
    "#732DD9",
    "#140b23",
    "#1e1135",
    "#251541",
    "#2f1a53",
    "#351e5e",
    "#3f2470",
    "#46277c",
    "#502d8e",
    "#563199",
    "#6036ab",
    "#6f40c2",
    "#7e54c9",
    "#8861cd",
    "#a182d7",
    "#b9a3e2",
    "#c8b7e8",
  ],
  [
    "#7A5700",
    "#231900",
    "#372700",
    "#3f2d00",
    "#4b3500",
    "#533b00",
    "#5e4300",
    "#664900",
    "#725100",
    "#876000",
    "#936900",
    "#b98400",
    "#d29500",
    "#ffbb11",
    "#ffcd50",
    "#ffd875",
    "#ffdf8e",
  ],
];
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
    let oldColors = [];
    let newColors = [];
    let oldResult = {};
    let oldMachineData, newMachineData;
    let data = { xData: [], yData: [], y1Data: [] };
    console.log(
      params.query.newStartDate,
      params.query.oldStartDate,
      moment(params.query.newStartDate).from(params.query.oldStartDate)
    );
    let option = {
      color: [
        "#ae1029",
        "#0065c2",
        "#26c238",
        "#9876aa",
        "#fb8649",
        "#57904b",
        "#d35b5c",
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      dataZoom: {
        type: "slider",
        show: true,
        start: 0,
        xAxisIndex: 0,
      },

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
      aria: {
        enabled: true,
        decal: {
          show: true,
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
            padding: [0, 10, 0, 0],
            color: "black",
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
              color: "black",
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
        `SELECT * FROM public."${params.query.machine_name}" WHERE created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'`
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
    console.log(newMachineData, oldMachineData);
    // calculate the rejection new and old precantage
    let newPrecentage =
      newMachineData[1] === undefined
        ? 0
        : (newMachineData[1].rejected * 100) / newMachineData[0].inspected;
    let oldPrecentage =
      oldMachineData[1] === undefined
        ? 0
        : (oldMachineData[1].rejected * 100) / oldMachineData[0].inspected;

    params.query.machine_sensors.sensors.forEach((sensor, i) => {
      let width = 0;
      // console.log(sensor);
      let sensorName = sensor.id.toLowerCase();
      sensor.counter.forEach((defect, index) => {
        let newData, oldData;
        newMachineData.forEach((obj) => {
          if (
            Object.keys(obj)[0].indexOf(
              sensorName + "_" + defect.id.toLowerCase()
            ) > -1
          ) {
            newData = {
              value: obj[Object.keys(obj)[0]],
              itemStyle: { color: colors[i][index + 1] },
            };
          }
        });
        oldMachineData.forEach((obj) => {
          if (
            Object.keys(obj)[0].indexOf(
              sensorName + "_" + defect.id.toLowerCase()
            ) > -1
          ) {
            oldData = {
              value: obj[Object.keys(obj)[0]],
              itemStyle: {
                borderWidth: 1,
                borderColor: colors[i][index + 1],
                color: "white",
                decal: {
                  color: colors[i][index + 1],

                  dashArrayX: [1, 0],
                  dashArrayY: [2, 5],
                  symbolSize: 1,
                  rotation: Math.PI / 6,
                },
              },
            };
          }
        });
        if (
          (newData && newData.value !== 0) ||
          (oldData && oldData.value !== 0)
        ) {
          data.y1Data.push(newData);
          data.yData.push(oldData);
          data.xData.push(defect.id);
          //to calcualte the total width of the sensors
          width++;
          totalwidth++;
          //console.log(width, totalwidth, sensor.id, defect.id);
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
            color: "black",
          },
        },
        type: "bar",
        barGap: 0,
        barWidth: 100 * width,
        itemStyle: {
          color: colors[i][0],
        },
        xAxisIndex: 1,
        yAxisIndex: 1,
      };
      //console.log(sensorData.itemStyle.normal.color);
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
