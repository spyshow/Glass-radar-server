const pool = require("./../../db");

exports.MachineExist = class MachineExist {
  constructor(options) {
    this.options = options || {};
  }

  async find() {
    let machinesExists = { data: [] };
    await pool
      .query("SELECT id,machine_name,lineId FROM machines")
      .then(async (data) => {
        let rows = data.rows;
        for (let i = 0; i < rows.length; i++) {
          await pool
            .query(
              `SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE   table_name   = $1
                    );`,
              [`${rows[i].machine_name}_${rows[i].machine_line}`]
            )
            .then((machineData) => {
              let machine = `${rows[i].machine_name}_${rows[i].machine_line}`;
              let exists = {};
              let notExists = {};
              exists[machine] = true;
              notExists[machine] = false;
              if (machineData.rows.exists) {
                machinesExists["data"].push(exists);
              } else {
                machinesExists["data"].push(notExists);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return machinesExists;
  }
  setup(app) {
    this.app = app;
  }

  async get(id, params) {
    let machineExists = null;
    await pool
      .query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name=$1);",
        [params.query.name]
      )
      .then((data) => {
        if (data.rows[0].exists) {
          machineExists = true;
        } else {
          machineExists = false;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    if (machineExists) {
      return {
        id: id,
        name: params.query.name,
        status: true,
      };
    } else {
      return {
        id: id,
        name: params.query.name,
        status: false,
      };
    }
  }
};
