// const fs = require('fs');

// console.log("Starting to read!");

// fs.readFile('./very_secret_info.txt', 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }

//     console.log("Super secret information: ");

//     console.log(data);
// });

// console.log("Finished Reading! (or am I?)");

const fs = require('fs/promises');

async function readFile() {
    console.log("Starting to read!");

    try {
        const data = await fs.readFile('./very_secret_info.txt', 'utf8');
        console.log("Super secret information: ");
        console.log(data);
    } catch (err) {
        console.error('Error reading file:', err);
    }

    console.log("Finished Reading!");
}

readFile();