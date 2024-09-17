'use strict';


require('dotenv').config({ path: './simple_env.env' });

const readline = require('readline');

// Set up readline to listen for key presses
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var answer1;
var answer2;

var Client = require('azure-iothub').Client;

var connectionString = process.env.IOTHUB_CONNECTION_STRING;
var targetDevice = process.env.IOTHUB_DEVICE_ID;
var methodParams //= {
//     methodName: process.env.IOTHUB_METHOD_NAME,
//     payload: process.env.IOTHUB_METHOD_PAYLOAD,
//     responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
// };


let index = 0;

const questions = ["Method? ", "payload? "];

// ask question and read in input
function askQuestion() {
    if (index >= questions.length) {
        // create methodParams
        methodParams = {
            methodName: answer1,
            payload: answer2,
            responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
        };

        client.invokeDeviceMethod(targetDevice, methodParams, function (err, result) {
            if (err) {
                console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
            } else {
                console.log(methodParams.methodName + ' on ' + targetDevice + ':');
                console.log(JSON.stringify(result, null, 2));

                methodParams = {
                    methodName: null,
                    payload: null,
                    responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
                };
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
        if (answer == 'getDeviceLog' || answer == 'lockDoor')
            answer1 = answer;
    }
    if (index == 2) {
        if (answer1 == 'lockDoor') {
            if (answer == 'open' || answer == 'close') {
                answer2 = JSON.stringify( {'status' : answer} );
            }
            else {
                console.log("enter either open or close");
                index--;
            }
        }
        else
            answer2 = answer;
    }
    askQuestion();
}

askQuestion();

var client = Client.fromConnectionString(connectionString);
