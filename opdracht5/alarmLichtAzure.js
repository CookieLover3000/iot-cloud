'use strict';
require('dotenv').config({ path: './opdracht5_env.env' });

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
let client = null;
let intervalId;
const chalk = require('chalk');

let blinkDelay = 1000;
let rgbValue = [0, 255, 0]
var toggle = false;

function main() {
    // open a connection to the device
    const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTION_STRING;
    client = Client.fromConnectionString(deviceConnectionString, Protocol);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    client.open(onConnect);
}

function onConnect(err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Connected to device. Registering handlers for methods.');

        // register handlers for all the method names we are interested in
        client.onDeviceMethod('toggleEffect', onToggleEffect);
    }
}

function print() {
    process.stdout.cursorTo(0);
    if (toggle) {
        process.stdout.write("   ");
    }
    else {
        process.stdout.write(chalk.rgb(rgbValue[0], rgbValue[1], rgbValue[2])("aan"));
    }
    toggle = (!toggle);
}

function printDeviceMethodRequest(request) {
    // print method name
    console.log('Received method call for method \'' + request.methodName + '\'');

    // if there's a payload just do a default console log on it
    if (request.payload) {
        console.log('Payload:\n' + request.payload);
    }
}


function onToggleEffect(request, response) {
    // printDeviceMethodRequest(request);

    var responseMessage = "";
    clearInterval(intervalId);
    intervalId = null;
    
    console.log(request.payload);

    if (request.payload.enable) {
        const enable = request.payload.enable;
        console.log(`Enable: ${enable}`);

        if (!enable)
            return;
    }
    else {
        console.log("error: enabled not found.");
        return;
    }

    if (request.payload.blinkDelayMs) {
        blinkDelay = request.payload.blinkDelayMs;
        console.log(`Blink Delay (ms): ${blinkDelay}`);
    }
    else {
        console.log("error: blinkDelayMs not found.")
        return;
    }

    if (request.payload.rgbValue) {
        const rgb = request.payload.rgbValue;
        console.log(`RGB Value ${rgb}`);
        rgbValue[0] = rgb['red'];
        rgbValue[1] = rgb['green'];
        rgbValue[2] = rgb['blue'];
        console.log(`RGB Value - Red: ${rgbValue[0]}, Green: ${rgbValue[1]}, Blue: ${rgbValue[2]}`);
    }
    else {
        console.log("error: rgbValue not found.")
        return;
    }

    intervalId = setInterval(print, blinkDelay);

    // complete the response
    response.send(200, responseMessage, function (err) {
        if (err) {
            console.error('An error ocurred when sending a method response:\n' +
                err.toString());
        } else {
            console.log(responseMessage);
        }
    });

}

// program

main();

process.stdout.write("aan");
toggle = false;
intervalId = setInterval(print, 1000);