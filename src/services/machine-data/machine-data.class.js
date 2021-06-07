/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
const { presetPalettes } = require("@ant-design/colors");
const pool = require("./../../db");
const { mmmData } = require("./mmmData");
const { sensorData } = require("./sensorData");

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

exports.MachineData = class MachineData {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    switch (params.query.machine_type) {
      case "MX4":
      case "MULTI4":
      case "MCAL4":
        return await mmmData(params, colors);

      case "LI":
      case "PALLETIZER":
      case "VI":
        return await sensorData(params, colors);
    }
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
