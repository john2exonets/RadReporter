//
//  Radiation Reporter
//
//  Send Rad data to the AT&T M2X System for reporting
//
//  John D. Allen
//  Nov 2016
//
var mqtt = require('mqtt');
var moment = require('moment');
var Client = require('node-rest-client').Client;
var m2x = new Client();

var BROKER = "mqtt://10.1.1.28";
var DEVICE = "{Your M2X Device Key Here}";
var APIKEY = "{Your M2X API Key Here}";

var copts = {
  clientId: "Rad_Reporter",
  keepalive: 20000
};

var client = mqtt.connect(BROKER, copts);

client.on('connect', function() {
  console.log("Rad Reporter daemon Connected...");
  client.subscribe('radlvl/read');
});

client.on('message', function(topic, msg) {
  var isodate = moment().toISOString();
  var rr = JSON.parse(msg.toString());
  var uri = "https://api-m2x.att.com/v2/devices/" + DEVICE + "/streams/Rad_Lvl/values";
  //var payload = "{ \"values\": [{ \"value\": " + rr.radlvl + ", \"timestamp\": \"" + isodate + "\" }]}";
  //var headers = "-H \"Content-Type: application/json\" -H \"X-M2X-KEY: " + APIKEY + "\" ";
  //var putheaders = "{ \"Content-Type\": \"application/json\", \"X-M2X-KEY\": \"" + APIKEY + "\" }";

  var args = {
    headers: { "Content-Type" : "application/json", "X-M2X-KEY": APIKEY },
    data: { "values": [ { "value": rr.radlvl, "timestamp": isodate  } ] }
  };

  //console.log("<<<:" + JSON.stringify(args));

  m2x.post(uri, args, function(data, response) {
    //console.log('STATUS: ' + response.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(response.headers));
    if (response.statusCode != 202) {
      console.log(response.statusMessage);
    }
    //console.log(Object.getOwnPropertyNames(response));

    //response.on('data', function(chunk) {
    //  console.log('BODY: ' + chunk);
    //});

    //console.log("data>" + JSON.stringify(data));
    //console.log("response>>" + JSON.stringify(response));
  }).on('error', function(e) {
    console.log('Error on Request: ' + e.message);
  });
  //console.log("curl " + uri + " -d '" + payload + "' " + headers);
  //var out = topic + ": " + message.toString();
  //console.log(out);
});

process.on('SIGINT', function() {     // catch CTRL-C for exiting program
  console.log('Exiting...');
  client.unsubscribe('radlvl/read');
  client.end();
  process.exit();
});
