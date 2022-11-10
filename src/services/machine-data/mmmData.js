/* eslint-disable linebreak-style */
const pool = require("./../../db");
const dayjs = require('dayjs');
const { separateObject } = require("../../utils/separateObject");
const { removeA } = require("../../utils/removeA");
const { round } = require("./../../utils/round");
const { colorArray, basicColorArray } = require("../../utils/color");

const mmmData = async function (params) {
  let totalwidth = 0;
  let previousDate = "Previous time";
  let selectedDate = "selected date";
  let newResult = {};
  let oldResult = {};
  let oldMachineData, newMachineData;
  let data = { xData: [], yData: [], y1Data: [] };
  let colors = colorArray(params.query.primary, params.query.secondary);
  console.log(colors);
  let option = {
    color: basicColorArray(params.query.primary, params.query.secondary),
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },

    // dataZoom: {
    //   type: "slider",
    //   show: true,
    //   start: 0,
    //   xAxisIndex: 0,
    // },
    dataZoom: [
      {
        show: true,
        type: "slider",
        xAxisIndex: [0, 1, 2, 3],
        end: 100,
        filterMode: "filter",
      },
      {
        type: "inside",
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
      },
    ],
    // dataZoom: [
    //   {
    //     xAxisIndex: [0],
    //     handleIcon:
    //       "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
    //   },
    // ],
    legend: {
      top: 20,
      right: 150,
      orient: "vertical",
      data: [
        {
          name: previousDate,
          icon: "path://M.971.923h25v14h-25zM1.536 1.222L15.09 14.778M.91 7.472l7.307 7.306M8.285.972L22.03 14.716M15.911.971l9.931 9.932",
          itemStyle: {
            color: "white",
            borderColor: params.query.secondary,
            borderWidth: 1,
          },
        },
        {
          name: selectedDate,
          icon: "rect",
          itemStyle: {
            color: params.query.primary,
          },
        },
      ],
      formatter:
        "{name} (" +
        dayjs(params.query.newStartDate).from(params.query.oldStartDate) +
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
  // calculate the rejection new and old precantage
  let newPrecentage =
    newMachineData[1] === undefined
      ? 0
      : (newMachineData[1].rejected * 100) / newMachineData[0].inspected;
  let oldPrecentage =
    oldMachineData[1] === undefined
      ? 0
      : (oldMachineData[1].rejected * 100) / oldMachineData[0].inspected;

  params.query.machine_sensors.sensors.map((sensor, i) => {
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
        color: colors[i][6],
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
  let deleteSensorIndex = [];
  option.series.forEach((sensor, i) => {
    if (sensor.barWidth !== 0) {
      sensor.barWidth = sensor.barWidth / totalwidth + "%";
    } else {
      deleteSensorIndex.push(i);
    }
  });
  for (let s = 0; s < deleteSensorIndex.length; s++) {
    option.series.splice(deleteSensorIndex[s], 1);
  }
  return {
    data: [option],
    newPrecentage: round(newPrecentage, 2),
    oldPrecentage: round(oldPrecentage, 2),
  };
};

exports.mmmData = mmmData;
