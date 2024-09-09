const mqtt = require('mqtt');
const readline = require('readline');
const conMessage = 'Connection established'
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mqttBewegingIoTHHS/lamp/';
const client = mqtt.connect(brokerUrl);

// const questions = ["Enter lamp number (example: 1)", "Enter timeout time in ms: "];
const questions = ["Enter timeout time in ms: "];

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lampEnabled = false;
let index = 0;
let location = "1";
let jsonMessage;
let timeoutTime;
let timeoutId;
let targetTopic;

function makeTopic() {
    targetTopic = topic + location;
    console.log(targetTopic);
}

function sendMessage() {
    // publish message
    client.publish(targetTopic, "hi :)", (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published successfully');
        }
    });
}

function lampLogic() {
    lampEnabled = !lampEnabled;

    if (lampEnabled) {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }
    else if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }

    console.log("enabled: " + lampEnabled);

    timeoutId = setTimeout(() => {
        client.publish(targetTopic, "hi :(")
        lampEnabled = !lampEnabled;
        console.log("Lamp Enabled: " + lampEnabled);
    }, timeoutTime)
}

// ask question and read in input
function askQuestion() {
    if (index >= questions.length) {
        makeTopic();

        sendMessage();

        lampLogic();

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
    // if (index == 1) {
    //     location = answer;
    // }
    // if (index == 2) {
    try {
        timeoutTime = parseInt(answer);
    }
    catch {
        console.log("you didn't enter a number and I can't deal with that. Exiting program.")
        process.exit(0);
    }
    // }
    askQuestion();

}

console.log("Welcome to lamp control software. Enter 'quit' to exit the software.");
console.log("");
// console.log("Answer -1 to any question to have the lamp not change it's behaviour.");

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

