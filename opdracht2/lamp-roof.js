const mqtt = require('mqtt');
const readline = require('readline');
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttBewegingIoTHHS/roof';
const client = mqtt.connect(brokerUrl);

let lampEnabled = false;
let strengthLevel = 0;
let timeoutId;
let timeoutTime = 5000;

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

function containsValue(obj, value) {
    for (const key in obj) {
        if (obj[key] === value) {
            return true;
        }
    }
    return false;
}

function controlLamp(lampBool) {
    if (lampBool) {
        lampEnabled = false;
        strengthLevel = 0;
        console.log("lamp turns off")
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null;
        }
    }
    else {
        lampEnabled = true;
        console.log("lamp turns on")
    }
}

// 'a' turns lamp on or off
// 'b' controls strength
client.on('message', (mtopic, message) => {

    const jsonMessage = JSON.parse(message.toString());
    // console.log(`Received message on topic ${mtopic}:`, jsonMessage);

    if (containsValue(jsonMessage, 'a')) {
        controlLamp(lampEnabled)
        // 5 second timer. Gets disabled if lamp gets manually disabled before time is over
        if (lampEnabled && !timeoutId)
            timeoutId = setTimeout(() => controlLamp(true), timeoutTime);
        else if (!lampEnabled && timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }
    else if (containsValue(jsonMessage, 'b') && lampEnabled) {
        strengthLevel += 20;
        if (strengthLevel > 100)
            strengthLevel = 0;
        console.log('Light strength: ' + strengthLevel);
    }
    else if ('Timeout Time' in jsonMessage)
    {
        const timeout = parseInt(jsonMessage['Timeout Time']);
        const light = parseInt(jsonMessage['Light Strength']);
        if (timeout >= 0)
            timeoutTime = timeout;
        if (light >= 0 && light <= 100)
            strengthLevel = light;
            
        console.log('time out time: ' + timeoutTime);
        console.log('Light strength: ' + strengthLevel);

        if (lampEnabled && timeoutId)
        {
            clearTimeout(timeoutId);
            timeoutId = null;
            timeoutId = setTimeout(() => controlLamp(true), timeoutTime);
        }
    }

});

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});