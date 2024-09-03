const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

function handleInput(answer) {
  if (answer == "quit") {
    rl.close();
  }

  console.log(`Thank you for your valuable feedback: ${answer}`);
}

rl.on('line', handleInput); 

// const readline = require('readline');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // very scalable, can even ask more than two questions :)
// const questions = ["give answer 1: ", "give answer 2: "];

// let index = 0;

// // ask question and read in input
// function askQuestion() {
//   if (index >= questions.length) {
//     index = 0;
//   }

//   rl.question(questions[index], handleInput);
//   index++;
// }

// function handleInput(input) {
//   console.log(`Received input: ${input}`);
//   askQuestion();
// }

// // start code
// askQuestion();