const mqtt = require('mqtt');
const readline = require('readline');
const topic = 'mqttBewegingIoTHHS/lamp/1';

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

rl.on('line', (input) => {

    client.publish(topic, input, (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published successfully');
        }
    });
});