/* eslint-disable linebreak-style */
/* eslint-disable indent */

const pool = require("./../../db");

/* TODO : dynamic data range 
          less than hour (every 5 min)
          between hour and 4 hours (every 15 min)
          between 4 hours and 1 day (every 1 hour)
          between  1 day and 3 days ( every 4 hours)
          more than  3 days (every 1 day)
*/

const machineData = async function (
  machine,
  params,
  lineSpeed,
  scanTime,
  color
) {
  const colorList = ["#9E87FF", "#73DDFF", "#fe9a8b", "#F56948", "#9E87FF"];
  let oldResult, newResult;
  let option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        //   label: {
        //     show: true,
        //     backgroundColor: "#fff",
        //     color: "#556677",
        //     borderColor: "rgba(0,0,0,0)",
        //     shadowColor: "rgba(0,0,0,0)",
        //     shadowOffsetY: 0,
        //   },
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
      textStyle: {
        color: "#5c6c7c",
      },
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
          interval: 0,
          textStyle: {
            color: "#556677",
          },
          fontSize: 12,

          margin: 15,
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
          width: 5,
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "#9effff", // color at 0% position
              },
              {
                offset: 1,
                color: "#9E87FF", // color at 100% position
              },
            ],
            global: false, // false by default
          },
          shadowColor: "rgba(158,135,255, 0.3)",
          shadowBlur: 10,
          shadowOffsetY: 20,
        },
        itemStyle: {
          normal: {
            color: colorList[0],
            borderColor: colorList[0],
          },
        },
      },
    ],
  };
  let column = "";
  switch (machine.type) {
    case "MX4":
    case "MULTI4":
    case "MCAL4":
      column = "inspected , rejected";
      break;
    default:
      column = "inspected";
      break;
  }
  let machineAndLine = `${machine.machine_name}_${machine["line.line_number"]}`;

  await pool
    .query(
      `SELECT ${column},created_at FROM public."${machineAndLine}" WHERE created_at BETWEEN '${params.query.oldStartDate}' AND '${params.query.oldEndDate}'`
    )
    .then((res) => {
      oldResult = res.rows;
    });
  await pool
    .query(
      `SELECT ${column},created_at FROM public."${machineAndLine}" WHERE created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'`
    )
    .then((res) => {
      let goodBottles, percentage;
      option.id = machine.machine_name;

      //to calculate the passed through (good bottles)
      switch (machine.type) {
        case "MX4":
        case "MULTI4":
        case "MCAL4":
          option.series[0].data = res.rows.map((row) => {
            goodBottles = row.inspected - row.rejected;
            percentage = (goodBottles * 100) / (lineSpeed * scanTime);
            console.log(
              row.inspected,
              row.rejected,
              goodBottles,
              lineSpeed,
              scanTime,
              percentage
            );
            return [row.created_at, percentage];
          });
          break;
        default:
          option.series[0].data = res.rows.map((row) => {
            goodBottles = row.inspected;
            percentage = (goodBottles * 100) / (lineSpeed * scanTime);
            return [row.created_at, percentage];
          });
          break;
      }
    });
  return option;
};

exports.machineData = machineData;
