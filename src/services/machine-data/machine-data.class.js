/* eslint-disable no-unused-vars */
const pool = require("./../../db");
const { separateObject } = require("../../utils/separateObject");
const { removeA } = require("../../utils/removeA");
const {
  blue,
  red,
  yellow,
  lime,
  volcano,
  cyan,
  purple,
} = require("@ant-design/colors");

exports.MachineData = class MachineData {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    let colors = [blue, red, yellow, lime, cyan, purple, volcano];
    let result = {};
    await pool
      .query(
        `SELECT * FROM public."${params.query.machine_name}" WHERE created_at BETWEEN '${params.query.startDate}' AND '${params.query.endDate}'`
      )
      .then((res) => {
        result = res.rows.reduce(function (previousValue, currentValue) {
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
      });
    let machineData = separateObject(result);
    let chartData = params.query.machine_sensors.sensors.map((sensor, i) => {
      let data = {
        label: { formatter: "{b}: {c}" },
        name: sensor.id,
        itemStyle: {
          color: colors[i][9],
        },
        children: [],
      };
      let colorCounter = 0;

      sensor.counter.forEach((defect, index) => {
        let value = 0;
        machineData.forEach((obj) => {
          if (Object.keys(obj)[0].indexOf(defect.id.toLowerCase()) > -1) {
            value = obj[Object.keys(obj)[0]];
          }
          // console.log(
          //   defect,
          //   value,
          //   obj,
          //   defect.id.toLowerCase(),
          //   Object.keys(obj)[0].search(defect.id.toLowerCase())
          // );
        });
        data.children[index] = {
          label: { formatter: "{b}: {c}" },
          name: defect.id,
          value: value,

          itemStyle: {
            color: colors[i][8 - colorCounter],
            shadowBlur: 2,
            shadowColor: colors[2],
          },
        };
        if (value !== 0) {
          colorCounter++;
        }
      });
      return data;
    });
    let option = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      title: {
        id: params.query.machine_name,
        text: `Total inspected: ${
          machineData[0].inspected
        } , Rejected: ${Math.round(
          (machineData[1].rejected * 100) / machineData[0].inspected
        )} %`,
        textStyle: {
          fontSize: 16,
          align: "center",
        },
      },
      series: {
        id: params.query.machine_name,
        name: params.query.machine_name,
        type: "sunburst",
        highlightPolicy: "ancestor",
        data: chartData,
        radius: ["00%", "90%"],
        sort: null,

        // label: {
        //   formatter: "{b}: {c}",
        // },
        emphasis: {
          label: {
            formatter: "{b}: {c}",
          },
        },
        downplay: {
          label: {
            formatter: "{b}: {c}",
          },
        },
        levels: [
          {
            // Blank setting for data mining
          },
          {
            // The most inside level
            label: { formatter: "{b}", rotate: "tangential" },
          },
          {
            // The second level
            label: { formatter: "{b}: {c}", rotate: "radial" },
          },
        ],
      },
    };

    return {
      data: [option],
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
