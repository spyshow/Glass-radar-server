/* eslint-disable linebreak-style */
const sensorIds = {
  16: "LNM",
  40: "Plug",
  41: "Leak",
  42: "Check",
  46: "Thickness",
  121: "unknow",
};

const mx4Init = function (xml, insertQuery, machine_name, machine_id, pool) {
  let counters = [];
  const sensorObj = { sensors: [] };
  let machine = xml.CountsResult.Root.Machine.Mold[0];
  console.log(JSON.stringify(xml.CountsResult, null, 4));
  machine.Sensor.map((sensor) => {
    insertQuery += "MX4_" + sensorIds[sensor.attributes.id] + " integer,";
    counters.push({ id: sensorIds[sensor.attributes.id] });
  });
  sensorObj.sensors.push({
    id: "MX4",
    counter: counters,
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
  console.log(insertQuery);
  console.log(JSON.stringify(updateValues, null, 4));
  pool
    .query(insertQuery)
    .then(() => {
      pool.query(updateQuery, updateValues);
    })
    .catch((error) => console.log(error));
};

exports.mx4Init = mx4Init;
