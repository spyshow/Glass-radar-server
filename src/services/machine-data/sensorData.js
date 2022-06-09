/* eslint-disable linebreak-style */
const pool = require("./../../db");
const { round } = require("./../../utils/round");

const sensorData = async function (params, colors) {
  let previousDate = "Previous time";
  let selectedDate = "selected date";
  let newPrecentage, oldPrecentage;

  const colorList = ["#9E87FF", "#73DDFF", "#fe9a8b", "#F56948", "#9E87FF"];
  let option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        // label: {
        //   show: true,
        //   backgroundColor: "#fff",
        //   color: "#556677",
        //   borderColor: "rgba(0,0,0,0)",
        //   shadowColor: "rgba(0,0,0,0)",
        //   shadowOffsetY: 0,
        // },
        lineStyle: {
          width: 0,
          show: true,
          backgroundColor: "#a4c",
          color: "#556677",
          borderColor: "rgba(0,0,0,0)",
          shadowColor: "rgba(0,0,0,0)",
          shadowOffsetY: 0,
        },
      },
      // },
      backgroundColor: "#fff",

      padding: [10, 10],
      extraCssText: "box-shadow: 1px 0 2px 0 rgba(163,163,163,0.5)",
    },
    grid: {
      top: "15%",
    },
    xAxis: [
      {
        type: "time",
        axisLine: {
          lineStyle: {
            color: "#DCE2E8",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: "auto", // interval,
          textStyle: {
            color: "#556677",
          },
          fontSize: 12,
          margin: 15,
          rotate: 50,
        },
        axisPointer: {
          label: {
            // padding: [11, 5, 7],
            padding: [0, 0, 10, 0],

            margin: 15,
            fontSize: 12,
            backgroundColor: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#fff",
                },
                {
                  offset: 0.86,

                  color: "#fff",
                },
                {
                  offset: 0.86,
                  color: "#33c0cd",
                },
                {
                  offset: 1,
                  color: "#33c0cd",
                },
              ],
              global: false,
            },
          },
        },
        boundaryGap: false,
      },
    ],
    yAxis: [
      {
        type: "value",
        axisTick: {
          show: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#DCE2E8",
          },
        },
        axisLabel: {
          textStyle: {
            color: "#556677",
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        type: "line",
        data: [],
        symbolSize: 1,
        symbol: "circle",
        smooth: true,
        yAxisIndex: 0,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "#fe9a8b", //color1, // color at 0% position
              },
              {
                offset: 1,
                color: "#F56948", //color2, // color at 100% position
              },
            ],
            global: false, // false by default
          },
          shadowColor: "#fe9a8b", //color1,
          shadowBlur: 10,
          shadowOffsetY: 7,
        },
        itemStyle: {
          color: "#fe9a8b", //color1,
          borderColor: "#fe9a8b", //color1,
        },
      },
      {
        type: "line",
        data: [],
        symbolSize: 1,
        symbol: "circle",
        smooth: true,
        yAxisIndex: 0,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "#fe9a8b", //color1, // color at 0% position
              },
              {
                offset: 1,
                color: "#F56948", //color2, // color at 100% position
              },
            ],
            global: false, // false by default
          },
          shadowColor: "#fe9a8b", //color1,
          shadowBlur: 10,
          shadowOffsetY: 7,
        },
        itemStyle: {
          color: "#fe9a8b", //color1,
          borderColor: "#fe9a8b", //color1,
        },
      },
    ],
  };

  //querying old data
  console.log("dates", params.query.oldStartDate, params.query.oldEndDate);
  console.log("dates", params.query.newStartDate, params.query.newEndDate);
  console.log(`SELECT DISTINCT "${params.query.machine_name}".linepct
  ,created_at
   FROM public."${params.query.machine_name}"
  where created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'
  order by created_at DESC`);
  await pool
    .query(
      `SELECT DISTINCT "${params.query.machine_name}".linepct
      ,created_at
       FROM public."${params.query.machine_name}"
      where created_at BETWEEN '${params.query.oldStartDate}' AND '${params.query.oldEndDate}'
      order by created_at DESC`
    )
    .then((res) => {
      if (res.rows.length <= 0) {
        return (option.series[0].data = null);
      } else {
        option.id = params.query.machine_name;
        option.type = params.query.machine_type;
        let totalLinePct = 0;
        option.series[0].data = [];
        option.series[0].data = res.rows.map((row) => {
          totalLinePct += row.linepct;
          return [row.created_at, round(row.linepct, 2)];
        });
        oldPrecentage = totalLinePct / res.rows.length; // get the percentage of the total linepct
      }
    });
  console.log(option.series[0].data);
  await pool
    .query(
      `SELECT DISTINCT "${params.query.machine_name}".linepct
      ,created_at
       FROM public."${params.query.machine_name}"
      where created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'
      order by created_at DESC`
    )
    .then((res) => {
      if (res.rows.length <= 0) {
        option.series[1].data = [];
        return (option.series[1].data = null);
      } else {
        console.log("here");

        option.id = params.query.machine_name;
        option.type = params.query.machine_type;
        let totalLinePct = 0;
        option.series[1].data = [];
        option.series[1].data = res.rows.map((row) => {
          totalLinePct += row.linepct;
          return [row.created_at, round(row.linepct, 2)];
        });
        newPrecentage = totalLinePct / res.rows.length; // get the percentage of the total linepct
      }
    });
  console.log("option", option.series[1].data);
  return {
    data: [option],
    newPrecentage: round(newPrecentage, 2),
    oldPrecentage: round(oldPrecentage, 2),
  };
};

exports.sensorData = sensorData;
