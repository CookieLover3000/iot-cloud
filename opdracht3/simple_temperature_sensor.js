'use strict';

require('dotenv').config({ path: './simple_env.env' });

// Choose a protocol by uncommenting one of these transports.
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

const deviceConnectionString = process.env.IOTHUB_TEMPSENSOR_CONNECTION_STRING;
let sendInterval;

function generateMessage() {
    const temperature = 20 + (Math.random() * 10); // range: [20, 30]
    const data = JSON.stringify({ deviceId: 'simpleTempSensor', temperature: temperature, });
    const message = new Message(data);
    message.properties.add('temperatureAlert', (temperature > 28) ? 'true' : 'false');
    return message;
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