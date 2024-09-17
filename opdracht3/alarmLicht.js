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

function onToggle() {
    process.stdout.write("aan");
    toggle = false;
    setInterval(print, 1000);
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

