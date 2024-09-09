const mqtt = require('mqtt');
const readline = require('readline');
const conMessage = 'Connection established'
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttBewegingIoTHHS/';
const object = '/lamp';
const client = mqtt.connect(brokerUrl);

const questions = ["Enter what floor you want to control: ",
     "Enter timeout time in ms: ",
      "Enter lamp strength in percentage: "];

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let index = 0;
let jsonMessage;
let timeoutTime;
let lightStrength;
let location;
let targetTopic;

function makeMessage() {
    if(location == 'roof' || location == 'ground' || location == 'all')
        targetTopic = topic + location + object;
    else // always send to everything by default >:)
        targetTopic = topic + 'all' + object;
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
        makeMessage();
        client.publish(targetTopic, jsonMessage, (error) => {
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
    if(index == 1) {
        location = answer;
    }
    if (index == 2) {
        timeoutTime = answer;
    }
    else if (index == 3) {
        lightStrength = answer;
    }
    askQuestion();
}

console.log("Welcome to lamp control software. Enter 'quit' to exit the software.");
console.log("availabe floors: ground, roof, all");
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