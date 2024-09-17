// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

require('dotenv').config({path: './simple_env.env'});

// Choose a protocol by uncommenting one of these transports.
const Protocol = require('azure-iot-device-mqtt').Mqtt;
// const Protocol = require('azure-iot-device-amqp').Amqp;
// const Protocol = require('azure-iot-device-http').Http;
// const Protocol = require('azure-iot-device-mqtt').MqttWs;
// const Protocol = require('azure-iot-device-amqp').AmqpWs;

const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTION_STRING;
let sendInterval;

function disconnectHandler() {
    clearInterval(sendInterval);
    sendInterval = null;
    client.open().catch((err) => {
        console.error(err.message);
    });
}

function messageHandler(msg) {
    console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
    client.complete(msg, printResultFor('completed'));
}

function generateMessage() {
    const windSpeed = 10 + (Math.random() * 4); // range: [10, 14]
    const temperature = 20 + (Math.random() * 10); // range: [20, 30]
    const humidity = 60 + (Math.random() * 20); // range: [60, 80]
    const time = new Date().toLocaleTimeString();    const data = JSON.stringify({ deviceId: 'myFirstDevice', windSpeed: windSpeed, temperature: temperature, humidity: humidity, time : time });
    const message = new Message(data);
    message.contentType='application/json';
    message.properties.add('temperatureAlert', (temperature > 28) ? 'true' : 'false');
    return message;
}

function errorHandler(err) {
    console.error(err.message);
}

function connectHandler() {
    console.log('Client connected');
    // Create a message and send it to the IoT Hub every two seconds
    if (!sendInterval) {
        sendInterval = setInterval(() => {
            const message = generateMessage();
            console.log('Sending message: ' + message.getData());
            client.sendEvent(message, printResultFor('send'));
        }, 2000);
    }
}

// fromConnectionString must specify a transport constructor, coming from any transport package.
let client = Client.fromConnectionString(deviceConnectionString, Protocol);

client.on('connect', connectHandler);
client.on('error', errorHandler);
client.on('disconnect', disconnectHandler);
client.on('message', messageHandler);

client.open()
    .catch((err) => {
        console.error('Could not connect: ' + err.message);
    });

// Helper function to print results in the console
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}