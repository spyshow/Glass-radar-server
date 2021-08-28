/* eslint-disable linebreak-style */
/* eslint-disable indent */

const pool = require("./../../db");
const { round } = require("./../../utils/round");
const { timeRange } = require("./../../utils/timeRange");

const machineD = async function (machine, params, color1, color2) {
  let oldResult, newResult;
  let interval = timeRange(params.query.newStartDate, params.query.newEndDate);
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
                color: color1, // color at 0% position
              },
              {
                offset: 1,
                color: color2, // color at 100% position
              },
            ],
            global: false, // false by default
          },
          shadowColor: color1,
          shadowBlur: 10,
          shadowOffsetY: 7,
        },
        itemStyle: {
          color: color1,
          borderColor: color1,
        },
      },
    ],
  };
  let column = "";
  let machineAndLine = `${machine.machine_name}_${machine["line.line_number"]}`;

  switch (machine.type) {
    case "MX4":
    case "MULTI4":
    case "MCAL4":
      column = `public."${machineAndLine}".linepct`; //`SUM(public."${machineAndLine}".linepct)/${interval} AS linepct`;
      break;
    default:
      column = `public."${machineAndLine}".linepct`; //`SUM(public."${machineAndLine}".linepct)/${interval} AS linepct`;
      break;
  }
  // console.log(params.query);
  // console.log(
  //   "175",
  //   `SELECT ${column}
  //     ,to_timestamp((floor((extract('epoch' from created_at) / ${
  //       interval * 60
  //     } )) * ${interval * 60} ))
  //      as interval_alias
  //      FROM public."${machineAndLine}"
  //     where created_at BETWEEN '${params.query.newStartDate}' AND '${
  //     params.query.newEndDate
  //   }'
  //     GROUP BY interval_alias, linespeed
  //     order by interval_alias`
  // );
  // await pool
  //   .query(
  //     `SELECT ${column}
  //     ,to_timestamp((floor((extract('epoch' from created_at) / ${
  //       interval * 60
  //     } )) * ${interval * 60} ))
  //      as interval_alias
  //      FROM public."${machineAndLine}"
  //     where created_at BETWEEN '${params.query.oldStartDate}' AND '${
  //       params.query.oldEndDate
  //     }'
  //     GROUP BY interval_alias, linespeed
  //     order by interval_alias`
  //   )
  //   .then((res) => {
  //     oldResult = res.rows;

  //     return {
  //       // oldRejectedPrecentge: oldRejectedPrecentge,
  //       //oldAcceptedPrecentge: oldAcceptedPrecentge,
  //     };
  //   });
  console.log(`SELECT DISTINCT ${column}
  ,created_at
   FROM public."${machineAndLine}"
  where created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'
  order by created_at DESC`);
  await pool
    .query(
      `SELECT DISTINCT ${column}
      ,created_at
       FROM public."${machineAndLine}"
      where created_at BETWEEN '${params.query.newStartDate}' AND '${params.query.newEndDate}'
      order by created_at DESC`
    )
    .then((res) => {
      //console.log(res.rows);
      if (res.rows.length <= 0) {
        return (option.series[0].data = [0, 0]);
      } else {
        let goodBottles, percentage;
        let oldRejected, oldinspected;
        option.id = machine.machine_name;
        option.type = machine.type;
        option.series[0].data = res.rows.map((row) => {
          return [row.created_at, round(row.linepct, 2)];
        });
        //to calculate the passed through (good bottles)
        // switch (machine.type) {
        //   case "MX4":
        //   case "MULTI4":
        //   case "MCAL4":
        //     //to calculate precentages
        //     oldRejected = round(
        //       (res.rows[res.rows.length - 2].rejected * 100) /
        //         res.rows[res.rows.length - 2].inspected,
        //       2
        //     );
        //     oldinspected = 100 - oldRejected;

        //     option.series[0].data = res.rows.map((row) => {
        //       goodBottles = row.inspected - row.rejected;
        //       percentage =
        //         (goodBottles * 100) / (row.linespeed * machine.scantime);
        //       console.log("255", goodBottles, row.linespeed, machine.scantime);
        //       return [row.interval_alias, percentage.toPrecision(2)];
        //     });
        //     break;
        //   default:
        //     option.series[0].data = res.rows.map((row) => {
        //       goodBottles = row.inspected;
        //       percentage =
        //         (goodBottles * 100) / (row.lineSpeed * machine.scantime);
        //       return [row.created_at, percentage.toPrecision(2)];
        //     });
        //     break;
        // }
      }
    });
  return option;
};

exports.machineD = machineD;
