// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
require('dotenv').config({ path: './opdracht5_env.env' });

var open = false;

// Choose a protocol by uncommenting one of these transports.
const Protocol = require('azure-iot-device-mqtt').Mqtt;
// const Protocol = require('azure-iot-device-amqp').Amqp;
// const Protocol = require('azure-iot-device-http').Http;
// const Protocol = require('azure-iot-device-mqtt').MqttWs;
// const Protocol = require('azure-iot-device-amqp').AmqpWs;

const Client = require('azure-iot-device').Client;
let client = null;

function main() {
    // open a connection to the device
    const deviceConnectionString = process.env.IOTHUB_DEUR_CONNECTION_STRING;
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
        client.onDeviceMethod('getDeviceLog', onGetDeviceLog);
        client.onDeviceMethod('lockDoor', onLockDoor);
    }
}

function onGetDeviceLog(request, response) {
    printDeviceMethodRequest(request);

    var responseMessage;

    if (open) {
        responseMessage = JSON.stringify({ doorStatus: 'open' });
    }
    else {
        responseMessage = JSON.stringify({ doorStatus: 'closed' });
    }

    // complete the response
    // response.send(200, responseMessage, function (err) {
    //     if (err) {
    //         console.error('An error ocurred when sending a method response:\n' +
    //             err.toString());
    //     } else {
    //         console.log(responseMessage);
    //     }
    // });
}

function onLockDoor(request, response) {
    printDeviceMethodRequest(request);
    var responseMessage = "";

    if (request["payload"].hasOwnProperty("status")) {
        if (request.payload.status == 'open') {
            if (open) {
                responseMessage = {message :"door is already open"};
            }
            else {
                responseMessage = {message : "opening door"};
                open = true;
            }
        }
        else if (request.payload.status == 'close') {
            if (!open) {
                responseMessage = {message :"door is already closed"};
            }
            else {
                responseMessage = {message :"closing door"};
                open = false;
            }
        }
    }

    console.log("response Message: " + JSON.stringify(responseMessage))


    // complete the response
    response.send(200, responseMessage, function (err) {
        if (err) {
            console.error('An error ocurred when sending a method response:\n' +
                err.toString());
        } else {
            console.log('Response to method \'' + request.methodName +
                '\' sent successfully.');
        }
    });
}

function printDeviceMethodRequest(request) {
    // print method name
    console.log('Received method call for method \'' + request.methodName + '\'');

    // if there's a payload just do a default console log on it
    if (request.payload) {
        console.log('Payload:\n' + JSON.stringify(request.payload, null, 2));
    }
}

// get the app rolling
main();