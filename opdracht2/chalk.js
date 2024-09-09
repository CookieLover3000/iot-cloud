const chalk = require('chalk');
const mqtt = require('mqtt');
const { stdin: input, stdout: output } = require('node:process');
const topic = 'mqttBewegingIoTHHS/knipperlamp';
const brokerUrl = 'mqtt://broker.hivemq.com';
const client = mqtt.connect(brokerUrl);

let intervalId;

let blinkDelay = 1000;
let rgbValue = [0, 255, 0]

process.stdout.write('aan');
toggle = false;
// intervalId = setInterval(print, blinkDelay);

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


client.on('connect', () => {
    console.log('Connected to MQTT broker');

    client.subscribe(topic, (error) => {
        if (error) {
            console.error('Failed to subscribe to topic:', error);
        } else {
            console.log('Subscribed succesfully');
        }
    });
});

client.on('message', (mtopic, message) => {

    clearInterval(intervalId);
    intervalId = null;

    const jsonMessage = JSON.parse(message.toString());
    console.log(`Received message on topic ${topic}:`, jsonMessage);

    if ('enable' in jsonMessage) {
        const enable = jsonMessage['enable'];
        console.log(`Enable: ${enable}`);

        if (!enable)
            return;
    }
    else {
        console.log("error: enabled not found.");
        return;
    }

    if ('blinkDelayMs' in jsonMessage) {
        blinkDelay = jsonMessage['blinkDelayMs'];
        console.log(`Blink Delay (ms): ${blinkDelay}`);
    }
    else {
        console.log("error: blinkDelayMs not found.")
        return;
    }

    if ('rgbValue' in jsonMessage) {
        const rgb = jsonMessage['rgbValue'];
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
});