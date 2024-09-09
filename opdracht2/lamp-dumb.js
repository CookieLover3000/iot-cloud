const mqtt = require('mqtt');
const readline = require('readline');
const topic = 'mqttBewegingIoTHHS/lamp/1';
// const brokerUrl = 'mqtts://broker.hivemq.com';
// const client = mqtt.connect(brokerUrl);

const options = {
    protocol: 'mqtts',
    host: '7be1e893c3aa437b88105626415cac26.s1.eu.hivemq.cloud',
    port: 8883,
    username: 'iwan1',
    password: 'Iwan1234'
};

const client = mqtt.connect(options);

let lampEnabled = false;

client.on('connect', () => {
    console.log('Connection established');

    client.subscribe(topic, (error) => {
        if (error) {
            console.error('Failed to subscribe to topic:', error);
        } else {
            console.log('Subscribed successfully');
        }
    });
});

// 'a' turns lamp on or off
// 'b' controls strength
client.on('message', (mtopic) => {
    lampEnabled = !lampEnabled;
    console.log(`lamp is ${lampEnabled ? 'aan' : 'uit'}`);
});

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});