const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// very scalable, can even ask more than two questions :)
const questions = ["give answer 1: ", "give answer 2: "];

let index = 0;

// ask question and read in input
function askQuestion() {
    rl.question(questions[index], handleInput);
    index++;
    if (index >= questions.length)
        index = 0;
}

function handleInput(input) {
    if (input == 'quit') {
        process.exit(0);
    }
    console.log(`Received input: ${input}`);
    askQuestion();
}

// start code
askQuestion();