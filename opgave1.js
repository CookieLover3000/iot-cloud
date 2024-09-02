//programma met synchrone functie aanroep

function print(naam, leeftijd) {
    console.log(`Hallo ${naam}. U bent ${leeftijd}`);
}

// setTimeout(() => print("Jan, 22"), 5000);
const intervalId = setInterval(() => print("Jan, 22"), 5000);

setTimeout(() => clearInterval(intervalId), 20000);
// print("Jan", 22)