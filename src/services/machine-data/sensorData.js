/* eslint-disable linebreak-style */
const pool = require("./../../db");
var moment = require("moment");
const { separateObject } = require("../../utils/separateObject");
const { removeA } = require("../../utils/removeA");
const { round } = require("./../../utils/round");

const sensorData = async function (params, colors) {
  let newResult = {};
  let oldResult = {};
  let previousDate = "Previous time";
  let selectedDate = "selected date";
  let oldMachineData, newMachineData;
  let data = { xData: [], yData: [], y1Data: [] };

  const colorList = ["#9E87FF", "#73DDFF", "#fe9a8b", "#F56948", "#9E87FF"];
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
    // dataZoom: {
    //   type: "slider",
    //   show: true,
    //   start: 0,
    //   xAxisIndex: 0,
    // },
    // dataZoom: [
    //   {
    //     show: true,
    //     type: "slider",
    //     start: 0,
    //     end: 100,
    //     filterMode: "filter",
    //   },
    //   {
    //     type: "inside",
    //     start: 0,
    //     end: 100,
    //   },
    //   {
    //     show: false,
    //     yAxisIndex: 0,
    //     filterMode: "empty",
    //     width: 30,
    //     height: "80%",
    //     showDataShadow: false,
    //     left: "93%",
    //   },
    // ],
    dataZoom: [
      {
        xAxisIndex: [0],
        handleIcon:
          "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
      },
    ],
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
  //   let option = {
  //     backgroundColor: "#fff",

  //     legend: {
  //       icon: "circle",
  //       top: 20,
  //       right: 150,
  //       orient: "vertical",
  //       itemWidth: 6,
  //       itemGap: 20,
  //       data: [previousDate, selectedDate],
  //       textStyle: {
  //         color: "#556677",
  //       },
  //       formatter:
  //         "{name} (" +
  //         // moment(params.query.newStartDate).from(params.query.oldStartDate) +
  //         ")",
  //     },
  //     tooltip: {
  //       trigger: "axis",
  //       axisPointer: {
  //         label: {
  //           show: true,
  //           backgroundColor: "#fff",
  //           color: "#556677",
  //           borderColor: "rgba(0,0,0,0)",
  //           shadowColor: "rgba(0,0,0,0)",
  //           shadowOffsetY: 0,
  //         },
  //         lineStyle: {
  //           width: 0,
  //         },
  //       },
  //       backgroundColor: "#fff",
  //       textStyle: {
  //         color: "#5c6c7c",
  //       },
  //       padding: [10, 10],
  //       extraCssText: "box-shadow: 1px 0 2px 0 rgba(163,163,163,0.5)",
  //     },
  //     grid: {
  //       top: "15%",
  //     },
  //     xAxis: [
  //       {
  //         type: "category",
  //         data: [],
  //         axisLine: {
  //           lineStyle: {
  //             color: "#DCE2E8",
  //           },
  //         },
  //         axisTick: {
  //           show: false,
  //         },
  //         axisLabel: {
  //           interval: 0,
  //           textStyle: {
  //             color: "#556677",
  //           },
  //           // 默认x轴字体大小
  //           fontSize: 12,
  //           // margin:文字到x轴的距离
  //           margin: 15,
  //         },
  //         axisPointer: {
  //           label: {
  //             // padding: [11, 5, 7],
  //             padding: [0, 0, 10, 0],
  //             /*
  //     除了padding[0]建议必须是0之外，其他三项可随意设置

  //     和CSSpadding相同，[上，右，下，左]

  //     如果需要下边线超出文字，设左右padding即可，注：左右padding最好相同

  //     padding[2]的10:

  //     10 = 文字距下边线的距离 + 下边线的宽度

  //     如：UI图中文字距下边线距离为7 下边线宽度为2

  //     则padding: [0, 0, 9, 0]

  //                 */
  //             // 这里的margin和axisLabel的margin要一致!
  //             margin: 15,
  //             // 移入时的字体大小
  //             fontSize: 12,
  //             backgroundColor: {
  //               type: "linear",
  //               x: 0,
  //               y: 0,
  //               x2: 0,
  //               y2: 1,
  //               colorStops: [
  //                 {
  //                   offset: 0,
  //                   color: "#fff", // 0% 处的颜色
  //                 },
  //                 {
  //                   // offset: 0.9,
  //                   offset: 0.86,
  //                   /*
  // 0.86 = （文字 + 文字距下边线的距离）/（文字 + 文字距下边线的距离 + 下边线的宽度）

  //                         */
  //                   color: "#fff", // 0% 处的颜色
  //                 },
  //                 {
  //                   offset: 0.86,
  //                   color: "#33c0cd", // 0% 处的颜色
  //                 },
  //                 {
  //                   offset: 1,
  //                   color: "#33c0cd", // 100% 处的颜色
  //                 },
  //               ],
  //               global: false, // 缺省为 false
  //             },
  //           },
  //         },
  //         boundaryGap: false,
  //       },
  //     ],
  //     yAxis: [
  //       {
  //         type: "value",
  //         axisTick: {
  //           show: false,
  //         },
  //         axisLine: {
  //           show: true,
  //           lineStyle: {
  //             color: "#DCE2E8",
  //           },
  //         },
  //         axisLabel: {
  //           textStyle: {
  //             color: "#556677",
  //           },
  //         },
  //         splitLine: {
  //           show: false,
  //         },
  //       },
  //       {
  //         type: "value",
  //         position: "right",
  //         axisTick: {
  //           show: false,
  //         },
  //         axisLabel: {
  //           textStyle: {
  //             color: "#556677",
  //           },
  //           formatter: "{value}",
  //         },
  //         axisLine: {
  //           show: true,
  //           lineStyle: {
  //             color: "#DCE2E8",
  //           },
  //         },
  //         splitLine: {
  //           show: false,
  //         },
  //       },
  //     ],
  //     series: [
  //       {
  //         name: "Adidas",
  //         type: "line",
  //         data: [10, 10, 30, 12, 15, 3, 7],
  //         symbolSize: 1,
  //         symbol: "circle",
  //         smooth: true,
  //         yAxisIndex: 0,
  //         showSymbol: false,
  //         lineStyle: {
  //           width: 5,
  //           // color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
  //           //   {
  //           //     offset: 0,
  //           //     color: "#9effff",
  //           //   },
  //           //   {
  //           //     offset: 1,
  //           //     color: "#9E87FF",
  //           //   },
  //           // ]),
  //           shadowColor: "rgba(158,135,255, 0.3)",
  //           shadowBlur: 10,
  //           shadowOffsetY: 20,
  //         },
  //         itemStyle: {
  //           normal: {
  //             color: colorList[0],
  //             borderColor: colorList[0],
  //           },
  //         },
  //       },
  //       {
  //         name: "Nike",
  //         type: "line",
  //         data: [5, 12, 11, 14, 25, 16, 10],
  //         symbolSize: 1,
  //         symbol: "circle",
  //         smooth: true,
  //         yAxisIndex: 0,
  //         showSymbol: false,
  //         lineStyle: {
  //           width: 5,

  //           // color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
  //           //   {
  //           //     offset: 0,
  //           //     color: "#73DD39",
  //           //   },
  //           //   {
  //           //     offset: 1,
  //           //     color: "#73DDFF",
  //           //   },
  //           // ]),
  //           shadowColor: "rgba(115,221,255, 0.3)",
  //           shadowBlur: 10,
  //           shadowOffsetY: 20,
  //         },
  //         itemStyle: {
  //           normal: {
  //             color: colorList[1],
  //             borderColor: colorList[1],
  //           },
  //         },
  //       },
  //       {
  //         name: "老北京布鞋",
  //         type: "line",
  //         data: [150, 120, 170, 140, 500, 160, 110],
  //         symbolSize: 1,
  //         yAxisIndex: 1,
  //         symbol: "circle",
  //         smooth: true,
  //         showSymbol: false,
  //         lineStyle: {
  //           width: 5,
  //           // color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
  //           //   {
  //           //     offset: 0,
  //           //     color: "#fe9a",
  //           //   },
  //           //   {
  //           //     offset: 1,
  //           //     color: "#fe9a8b",
  //           //   },
  //           // ]),
  //           shadowColor: "rgba(254,154,139, 0.3)",
  //           shadowBlur: 10,
  //           shadowOffsetY: 20,
  //         },
  //         itemStyle: {
  //           normal: {
  //             color: colorList[2],
  //             borderColor: colorList[2],
  //           },
  //         },
  //       },
  //     ],
  //   };

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

          return keysUpdated;
        });
      }
    });

  //querying new data
  await pool
    .query(
      `SELECT * FROM public."${params.query.machine_name}" WHERE created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'`
    )
    .then((res) => {
      console.log(res.rows);
      let keys = Object.keys(res.rows[0]);
      let keysUpdated = removeA(
        keys,
        "id",
        "created_at",
        "updated_at",
        "machine_id"
      );
      // if (res.rows.length !== 0) {
      //   newResult = res.rows.reduce(function (previousValue, currentValue) {
      //     let array = [];
      //     let keys = Object.keys(res.rows[0]);
      //     let keysUpdated = removeA(
      //       keys,
      //       "id",
      //       "created_at",
      //       "updated_at",
      //       "machine_id"
      //     );
      //     keysUpdated.map((test) => {
      //       return (array[test] = previousValue[test] + currentValue[test]);
      //     });

      //     return keysUpdated;
      //   });
      // }
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
};

exports.sensorData = sensorData;
