1. Een beheerder wil voor een lamp het het tijdsinterval (in secondes) kunnen aanpassen en ook de maximale lichtsterkte (in procenten). Maak hiervoor een console programma. NB: zorg er wel voor de code uit het vorige practicum blijft werken. Een lamp kan je aansturen op basis van de bewegingssensor.

lamp control:
```js
const mqtt = require('mqtt');
const readline = require('readline');
const conMessage = 'Connection established'
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttBewegingIoTHHS';
const client = mqtt.connect(brokerUrl);

const questions = ["Enter timeout time in ms: ", "Enter lamp strength in percentage: "];

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let index = 0;
let jsonMessage;
let timeoutTime;
let lightStrength;

function makeJson() {
    jsonMessage = JSON.stringify({
        "Timeout Time": timeoutTime,
        "Light Strength": lightStrength
    });

    console.log(jsonMessage);
}

// ask question and read in input
function askQuestion() {
    if (index >= questions.length) {
        // publish message
        makeJson();
        client.publish(topic, jsonMessage, (error) => {
            if (error) {
                console.error('Failed to publish message:', error);
            } else {
                console.log('Message published successfully');
            }
        });
        // set index back to 0 to keep repeating the questions
        index = 0;
    }

    rl.question(questions[index], handleInput);
    index++;
}

function handleInput(answer) {
    if (answer == "quit") {
        process.exit(0);
    }
    if (index == 1) {
        timeoutTime = answer;
    }
    else if (index == 2) {
        lightStrength = answer;
    }
    askQuestion();
}

console.log("Welcome to lamp control software. Enter 'quit' to exit the software.");
console.log("Answer -1 to any question to have the lamp not change it's behaviour.");

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    client.publish(topic, JSON.stringify({ 'Connection Established': conMessage }), (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published successfully');
        }
    });
    askQuestion();

});
```

Lamp: 
```js
const mqtt = require('mqtt');
const readline = require('readline');
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttBewegingIoTHHS';
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
```

2. De beheerder zou dit ook graag willen voor alle lampen of alle lampen op een bepaalde verdieping. Maak dit mbv 1 publish en wild cards: https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices