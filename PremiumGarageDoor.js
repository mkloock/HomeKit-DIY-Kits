var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var spawn = require("child_process").spawn;
var onoff = require('onoff');
var sleep = require('sleep');

var GPIO= onoff.Gpio;
//var button = new GPIO(18, 'out', "none",{activeLow: true});
//var sensor = new GPIO(15,'in');

var garageUUID = uuid.generate('hap-nodejs:accessories:'+'GarageDoor');
var garage = exports.accessory = new Accessory('Garage Door', garageUUID);

var PREMIUM_GARAGE = {
  button : new GPIO(18, 'high', "none",{activeLow: true}),
  sensor : new GPIO(15, 'in',"both"),
  opened: false,
  obstruction: false,
  open: function() {
    console.log("Opening the Garage!");
    //add your code here which allows the garage to open
    //var process = spawn('python',["/home/pi/share/PulsePin.py", "18", "0", "1"]);
    console.log("Set PIN to 1");
    PREMIUM_GARAGE.button.writeSync(1);
    console.log("Waiting....");
    sleep.sleep(1);
    console.log("Set PIN to 0");
    PREMIUM_GARAGE.button.writeSync(0);
    console.log("Done");
  },
  close: function() {
    console.log("Closing the Garage!");
    //var process = spawn('python',["/home/pi/share/PulsePin.py", "18", "0", "1"]);
    //add your code here which allows the garage to close

    console.log("Set PIN to 1");
    PREMIUM_GARAGE.button.writeSync(1);
    console.log("Waiting....");
    sleep.sleep(1);
    console.log("Set PIN to 0");
    PREMIUM_GARAGE.button.writeSync(0);
    console.log("Done");
  },
  stop: function() {
    console.log("Stopping the Garage!");
    //var process = spawn('python',["/home/pi/share/PulsePin.py", "18", "0", "1"]);
    //add your code here which allows the garage to close

    console.log("Set PIN to 1");
    PREMIUM_GARAGE.button.writeSync(1);
    console.log("Waiting....");
    sleep.sleep(1);
    console.log("Set PIN to 0");
    PREMIUM_GARAGE.button.writeSync(0);
    console.log("Done");
  },
  identify: function() {
    //add your code here which allows the garage to be identified
    console.log("Identify the Garage");
  },
  status: function(){
    //use this section to get sensor values. set the boolean FAKE_GARAGE.opened with a sensor value.
    PREMIUM_GARAGE.opened = (PREMIUM_GARAGE.sensor.readSync() == 0 ? true : false);
    console.log("Sensor queried! " + PREMIUM_GARAGE.opened);

  },
  detectobstruction: function(){
    //use this section to get sensor values. set the boolean FAKE_GARAGE.opened with a sensor value.
    console.log("Obstruction queried!");
    PREMIUM_GARAGE.obstruction = false;
  },
  sensorchanged: function(err, value) {
    console.log("Sensor Changed!"+value);
    if (value==0)
    {
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN)
        PREMIUM_GARAGE.opened = true;
    } else{
      garage
        .getService(Service.GarageDoorOpener)
        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED)
        PREMIUM_GARAGE.opened = false;
    }
  }
};

PREMIUM_GARAGE.sensor.watch(PREMIUM_GARAGE.sensorchanged);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
garage.username = "C1:5D:3F:EE:5E:FA"; //edit this if you use Core.js
garage.pincode = "031-45-154";

garage
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Liftmaster")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "TW000165");

garage.on('identify', function(paired, callback) {
  PREMIUM_GARAGE.identify();
  callback();
});

garage
  .addService(Service.GarageDoorOpener, "Garage Door")
 // .setCharacteristic(Characteristic.TargetDoorState, 4) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.CLOSED) {
      status = garage.getService(Service.GarageDoorOpener).getCharacteristic(Characteristic.CurrentDoorState).value;
      console.log("CLOSE Requested");

      if (status == Characteristic.CurrentDoorState.OPEN) {
        console.log("Door Status is  OPEN");
        console.log("Close Door...");
        PREMIUM_GARAGE.close();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);
      }
      else if (status == Characteristic.CurrentDoorState.CLOSED){
        console.log("Door Status is  CLOSED");
        console.log("No Changes");
        callback();
      }
      else if (status == Characteristic.CurrentDoorState.OPENING){
        console.log("Door Status is  OPENING");
        console.log("STOP Door...");
        PREMIUM_GARAGE.stop();
        callback();
        garage
        .getService(Service.GarageDoorOpener)
        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.OPEN); // Need to change this to next push will be for a CLOSE target state again.
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.STOPPED);
      }
      else if (status == Characteristic.CurrentDoorState.CLOSING){
        console.log("Door Status is  CLOSING");
        console.log("No Changes");
      }
      else if (status == Characteristic.CurrentDoorState.STOPPED){
        console.log("Door Status is  STOPPED");
        console.log("Close Door...");
        PREMIUM_GARAGE.close();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);
      } else {
        console.log("Illegal Current State");
        callback();
      }
    }
    else if (value == Characteristic.TargetDoorState.OPEN) {

      status = garage.getService(Service.GarageDoorOpener).getCharacteristic(Characteristic.CurrentDoorState).value;
      
      console.log("OPEN Requested");

      if (status == Characteristic.CurrentDoorState.OPEN) {
        console.log("Door Status is  OPEN");
        console.log("No Changes");
        callback();
      }
      else if (status == Characteristic.CurrentDoorState.CLOSED){
        console.log("Door Status is  CLOSED");
        console.log("Open Door...");
        PREMIUM_GARAGE.open();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
      }
      else if (status == Characteristic.CurrentDoorState.OPENING){
        console.log("Door Status is  OPENING");
        console.log("No Changes");
        callback();
      }
      else if (status == Characteristic.CurrentDoorState.CLOSING){
        console.log("Door Status is  CLOSING");
        console.log("STOP Door...");
        PREMIUM_GARAGE.stop();
        callback();
        garage
        .getService(Service.GarageDoorOpener)
        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED); // Need to change this to next push will be for a OPEN target state again.
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.STOPPED);
      }
      else if (status == Characteristic.CurrentDoorState.STOPPED){
        console.log("Door Status is  STOPPED");
        console.log("Close Door...");
        PREMIUM_GARAGE.open();
        callback();
        garage
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
      } else {
        console.log("Illegal Current State");
        callback();
      }
    }
  });


garage
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {

    var err = null;
    PREMIUM_GARAGE.status();

    if (PREMIUM_GARAGE.opened) {
      console.log("Query: Is Garage Open? Yes.");
      callback(err, Characteristic.CurrentDoorState.OPEN);
    }
    else {
      console.log("Query: Is Garage Open? No.");
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });

  garage
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.ObstructionDetected)
  .on('get', function(callback) {

    var err = null;
    PREMIUM_GARAGE.detectobstruction();

    if (PREMIUM_GARAGE.obstruction) {
      console.log("Query: Obstruction? Yes.");
      callback(err, 1);
    }
    else {
      console.log("Query: Obstruction? No.");
      callback(err, Characteristic.ObstructionDetected.FALSE);
    }
  });