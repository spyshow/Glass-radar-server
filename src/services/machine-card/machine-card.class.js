/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const pool = require("./../../db");
var moment = require("moment");
const { round } = require("./../../utils/round");

exports.MachineCard = class MachineCard {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    let colors = [
      "rgba(128, 255, 165)",
      "rgba(255, 191, 0)",
      "rgba(224, 62, 76)",
      "rgba(1, 191, 236)",
      "rgba(116, 21, 219)",
      "rgba(255, 0, 135)",
      "rgba(0, 221, 255)",
      "rgba(77, 119, 255)",
      "rgba(55, 162, 255)",
      "rgba(135, 0, 157)",
      "rgba(128, 255, 165)",
      "rgba(1, 191, 236)",
    ];
    let lastHour = { accepted: 0, rejected: 0 };
    let beforeLastHour = { accepted: 0, rejected: 0 };
    let percentage = "";
    let minRange = 0;

    let option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          color: colors[params.query.index],
          label: {
            backgroundColor: "#6a7985",
          },
        },
        textStyle: {},
      },
      grid: {
        top: "3%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: false,
      },
      xAxis: [
        {
          type: "category",
          axisLine: {
            show: true,
          },
          splitArea: {
            // show: true,
            color: "#f00",
            lineStyle: {
              color: "#f00",
            },
          },
          axisLabel: {
            color: "#fff",
          },
          splitLine: {
            show: false,
          },
          boundaryGap: false,
          data: [],
        },
      ],
      yAxis: [
        {
          type: "value",
          min: 70,
          max: 110,
        },
      ],
      series: [],
    };
    await pool
      .query(
        //get sum of inspected and rejected every 5 min (5 * 60 = 300)
        `SELECT sum(inspected) as inspected,sum(rejected) as rejected,  
        to_timestamp(floor((extract('epoch' from created_at) / 3600 )) * 3600) 
         as interval_alias
        FROM public."${params.query.machine_name}_${params.query.line_number}" 
        where created_at > '${moment()
          .subtract(params.query.oldDate, "hours")
          .format()}'
        GROUP BY interval_alias
        order by interval_alias`
      )
      .then((res) => {
        console.log(res.rows.length);
        if (res.rows.length !== 0) {
          let lineOption = {
            name: params.query.machine_name,
            type: "line",
            smooth: false,
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: colors[params.query.index],
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: {
                type: "linear",
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "#FFFFFF", // color at 0% position
                  },
                  {
                    offset: 1,
                    color: colors[params.query.index], // color at 100% position
                  },
                ],
                global: false, // false by default
              },
              // color: echarts.graphic.LinearGradient(0, 0, 0, 1, [
              //   {
              //     offset: 0,
              //     color: colors[params.query.index],
              //   },
              //   {
              //     offset: 1,
              //     color: colors[params.query.index + 1],
              //   },
              // ]),
            },
            emphasis: {
              focus: "series",
            },
            data: [],
          };
          let xAxis = [];
          res.rows.map((row) => {
            let percent = round(100 - (row.rejected * 100) / row.inspected, 2);
            lineOption.data.push(percent);
            minRange > percent ? null : (minRange = percent);
            xAxis.push(moment(row.interval_alias).hour());
          });
          if (minRange - 20 < 0) {
            minRange = 0;
          }
          if (res.rows.length < 2) {
            res.rows.unshift({
              rejected: 0,
              inspected: 0,
              interval_alias: moment(res.rows[0].interval_alias)
                .subtract(1, "hours")
                .format(),
            });
          }
          console.log(res.rows);
          option.yAxis.min = minRange - 20;
          lastHour.rejected = round(
            (res.rows[res.rows.length - 1].rejected * 100) /
              res.rows[res.rows.length - 1].inspected,
            2
          );
          lastHour.accepted = round(
            100 -
              (res.rows[res.rows.length - 1].rejected * 100) /
                res.rows[res.rows.length - 1].inspected,
            2
          );
          beforeLastHour.rejected = round(
            (res.rows[res.rows.length - 2].rejected * 100) /
              res.rows[res.rows.length - 2].inspected,
            2
          );
          beforeLastHour.accepted = round(
            100 -
              (res.rows[res.rows.length - 2].rejected * 100) /
                res.rows[res.rows.length - 2].inspected,
            2
          );
          percentage =
            lastHour.rejected > beforeLastHour.rejected ? "down" : "up";
          option.xAxis[0].data.push(...xAxis);
          option.series = lineOption;
        }
      });
    return {
      id,
      percentage: percentage,
      accepted: lastHour.accepted,
      rejected: lastHour.rejected,
      option: option,
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
