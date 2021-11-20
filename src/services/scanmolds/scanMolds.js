/* eslint-disable linebreak-style */
const soap = require("soap");

const scanMolds = async (machine, app) => {
  //return new Promise((resolve, reject) => {
  let s2n = (string) => {
    return parseInt(string, 10);
  };
  let mounted = [];
  let rejected = [];
  const [mountedMolds, rejectedMolds] = await Promise.allSettled([
    await soap
      .createClientAsync(
        //call the soap API
        machine.url
      )
      .then((client) => {
        if (typeof client === "undefined") {
          //if the first call for the API it will return an empty respond
          console.log("mounted client undefined");
          setTimeout(scanMolds, 1000, machine, app); // call the function again after 60 second
        } else {
          //calling soap api
          return client.ReadenMoldsAsync({}).then((xml) => {
            if (machine.type === "MX4") {
              if (xml == null) {
                console.log("waiting result ... ");
                // if the respond is empty
                setTimeout(scanMolds, 1000, machine, app); // try again in 60 second
              } else {
                let result = xml[0].ReadenMoldsResult.Root;
                if (
                  Array.isArray(result.mold) ||
                  result !== null ||
                  result.mold !== null ||
                  typeof result !== "undefined"
                ) {
                  result.mold.forEach((mold, i) => {
                    mounted[i] = s2n(mold.attributes.nb);
                  });
                }
                return mounted;
              }
            }
          });
        }
      }),
    await soap
      .createClientAsync(
        //call the soap API
        machine.url
      )
      .then((client2) => {
        if (typeof client2 === "undefined") {
          console.log("mounted client2 undefined");
          //if the first call for the API it will return an empty respond
          setTimeout(scanMolds, 1000, machine, app); // call the function again after 60 second
        } else {
          //calling soap api
          return client2.EjectedMoldsAsync({}).then((xml2) => {
            if (machine.type === "MX4") {
              if (xml2 == null) {
                console.log("waiting result2 ... ");
                // if the respond is empty
                setTimeout(scanMolds, 1000, machine, app); // try again in 60 second
              } else {
                let result2 = xml2[0].EjectedMoldsResult.Root;
                if (result2 === null) {
                  return (rejected[0] = []);
                } else if (
                  Array.isArray(result2.mold) &&
                  typeof result2 !== "undefined"
                ) {
                  result2.mold.forEach((mold, i) => {
                    rejected[i] = s2n(mold.attributes.nb);
                  });
                } else {
                  rejected[0] = s2n(result2.mold.attributes.nb);
                }
                return rejected;
              }
            }
          });
        }
      }),
  ]);
  //generate the mounted molds array
  console.log({
    mountedMolds: mountedMolds,
    rejectedMolds: rejectedMolds,
  });
  return {
    mountedMolds: mountedMolds,
    rejectedMolds: rejectedMolds,
  };
  //generate the rejected molds array

  // });
};

exports.scanMolds = scanMolds;
