/* eslint-disable linebreak-style */
const mm4Init = function (result, insertQuery, machine_name, machine_id, pool) {
  const sensorObj = { sensors: [] };
  let machine = result.Mold.Machine[0];
  machine.Sensor.map((sensor) => {
    let counters = [];
    let sensorName = sensor.$.id;
    for (let i = 0; i < Object.keys(sensor.Counter).length; i++) {
      let counterId = sensor.Counter[i]["$"].id.replace(/[^A-Z0-9]/gi, "");
      insertQuery += sensorName + "_" + counterId + " integer,";

      counters.push({ id: counterId });
    }
    sensorObj.sensors.push({
      id: sensorName,
      counter: counters,
    });
  });
  insertQuery +=
    "created_at timestamp with time zone,updated_at timestamp with time zone, " +
    "CONSTRAINT " +
    machine_name +
    "_pkey PRIMARY KEY (id), " +
    "CONSTRAINT " +
    machine_name +
    "_machine_id_fkey FOREIGN KEY (machine_id) " +
    "REFERENCES public.machines (id) MATCH SIMPLE " +
    "ON UPDATE CASCADE " +
    "ON DELETE CASCADE);";
  const updateQuery = `UPDATE public.machines
                      SET sensors=$1
                      WHERE id=$2;`;
  //console.log(id, JSON.stringify(sensorObj, null, 4));
  const updateValues = [sensorObj, machine_id];
  console.log(updateValues);
  console.log(insertQuery);
  pool
    .query(insertQuery)
    .then(() => {
      pool.query(updateQuery, updateValues);
    })
    .catch((error) => console.log(error));
};

exports.mm4Init = mm4Init;
