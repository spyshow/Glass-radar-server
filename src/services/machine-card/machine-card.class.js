/* eslint-disable no-unused-vars */
const pool = require("./../../db");
var moment = require("moment");
exports.MachineCard = class MachineCard {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    //console.log(params.sequelize.include.model);3
    console.log(params.query.oldDate);
    console.log(moment().subtract(params.query.oldDate, "hours").format());
    await pool
      .query(
        //get sum of inspected and rejected every 5 min (5 * 60 = 300)
        `SELECT sum(inspected) as inspected,sum(rejected) as rejected,  
        to_timestamp(floor((extract('epoch' from created_at) / 300 )) * 300) 
         as interval_alias
        FROM public."${params.query.machine_name}_${params.query.line_number}" 
        where created_at > '${moment()
          .subtract(params.query.oldDate, "hours")
          .format()}'
        GROUP BY interval_alias
        order by interval_alias`
      )
      .then((res) => {
        console.log(res);
      });

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
