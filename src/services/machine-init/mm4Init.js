/* eslint-disable linebreak-style */
const mm4Init = function (result, insertQuery, machine_name, machine_id, pool) {
  const sensorObj = { sensors: [] };

  let machine = result.Mold.Machine[0];
  machine.Sensor.map((sensor) => {
    let counters = [];
    let sensorName = sensor.$.id;
    let counter = {};
    console.log(sensor.$.id);
    if (Array.isArray(sensor.Counter)) {
      console.log("its array", Array.isArray(sensor.Counter));
      counter = sensor.Counter;
      for (let i = 0; i < counter.length; i++) {
        console.log(sensor);
        let counterId = sensor.Counter[i]["$"].id.replace(/[^A-Z0-9]/gi, "");
        insertQuery += sensorName + "_" + counterId + " integer,";

        counters.push({ id: counterId });
      }
      sensorObj.sensors.push({
        id: sensorName,
        counter: counters,
      });
    } else if (sensor.Counter === undefined) {
      counter = Object.keys(sensor);
      console.log(counter);

      let counterId = sensor["$"].id.replace(/[^A-Z0-9]/gi, "");
      insertQuery += sensorName + " integer,";

      counters.push({ id: counterId });

      sensorObj.sensors.push({
        id: sensorName,
        counter: counters,
      });
    } else {
      counter = Object.keys(sensor.Counter);
      console.log(counter);
      for (let i = 0; i < counter.length; i++) {
        console.log(sensor);
        let counterId = sensor.Counter[i]["$"].id.replace(/[^A-Z0-9]/gi, "");
        insertQuery += sensorName + "_" + counterId + " integer,";

        counters.push({ id: counterId });
      }
      sensorObj.sensors.push({
        id: sensorName,
        counter: counters,
      });
    }
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
