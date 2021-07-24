/* eslint-disable quotes */
/* eslint-disable linebreak-style */
const soap = require("soap");
const parseString = require("xml2js").parseString;
const pool = require("./../../db");
const { mx4Init } = require("./mx4Init");
const { mm4Init } = require("./mm4Init");

function learnMMMSensors(url, machine_name, id, data) {
  let insertQuery =
    'CREATE TABLE IF NOT EXISTS "' +
    machine_name +
    '" ( id uuid NOT NULL, machine_id integer, inspected integer, rejected integer,machinepct integer,linepct integer,linespeed integer, mold integer, ';
  console.log(url);
  soap.createClient(
    url,
    //"http://192.168.0.191/webservice/cwebservice.asmx?wsdl",
    function (err, client) {
      if (err) console.log("20:", err);
      console.log(client);
      if (typeof client === "undefined" || client === null) {
        console.log("waiting Client ... ");
        setTimeout(learnMMMSensors, 60000, url, machine_name, id, data);
      } else {
        console.log("S", data.type);
        //calling soap api

        client.Counts({}, function (err, xml) {
          //check if machine type is Mcal, Multi or MX4
          if (data.type === "MX4") {
            if (xml.CountsResult === null) {
              console.log("waiting result ... ");
              setTimeout(learnMMMSensors, 60000, url, machine_name, id, data);
            } else {
              mx4Init(xml, insertQuery, machine_name, id, pool);
            }
          } else {
            parseString(xml.CountsResult, function (err, result) {
              console.log("41", xml);
              if (result === null) {
                console.log("waiting result ... ");
                setTimeout(learnMMMSensors, 60000, url, machine_name, id, data);
              } else {
                console.log("multi");
                mm4Init(result, insertQuery, machine_name, id, pool);
              }
            });
          }
        });
      }
    }
  );
}

exports.learnMMMSensors = learnMMMSensors;
