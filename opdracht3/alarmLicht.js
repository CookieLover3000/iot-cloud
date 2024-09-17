require('dotenv').config({ path: './simple_env.env' });

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
let client = null;

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
        client.onDeviceMethod('toggle', onToggle);
    }
}

const chalk = require('chalk');
const { stdin: input, stdout: output } = require('node:process');

function onToggle(request, response) {

    var parsedMessage = JSON.parse(request.payload);
    console.log("parsed message: " + parsedMessage);

    clearInterval(intervalId);
    intervalId = null;

    console.log(`Received message on topic ${topic}:`, parsedMessage);

    if ('enable' in parsedMessage) {
        const enable = parsedMessage['enable'];
        console.log(`Enable: ${enable}`);

        if (!enable)
            return;
    }
    else {
        console.log("error: enabled not found.");
        return;
    }

    if ('blinkDelayMs' in parsedMessage) {
        blinkDelay = parsedMessage['blinkDelayMs'];
        console.log(`Blink Delay (ms): ${blinkDelay}`);
    }
    else {
        console.log("error: blinkDelayMs not found.")
        return;
    }

    if ('rgbValue' in parsedMessage) {
        const rgb = parsedMessage['rgbValue'];
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

}

function print() {
    process.stdout.cursorTo(0);
    if (toggle) {
        process.stdout.write("   ");
    }
    else {
        process.stdout.write(chalk.rgb(0, 255, 0)("aan"));
    }
    toggle = (!toggle);
}

main();

process.stdout.write("aan");
toggle = false;
setInterval(print, 1000);

