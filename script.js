


const tomatoArea = document.getElementById("tomato-area");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const timerDisplay = document.getElementById("timer-display");

let timeLeft = 30; // ✅ Change Timer to 99 Seconds
let isRunning = false;

// Function to create a fully packed circular tomato
function createFragments() {
    tomatoArea.innerHTML = "";
    const fragmentSize = 1.25; // Size of each fragment
    const gridSize = 6; // 6x6 grid for full coverage
    const radius = 4; // Defines circular boundary

    for (let row = -gridSize / 2; row < gridSize / 2; row++) {
        for (let col = -gridSize / 2; col < gridSize / 2; col++) {
            const fragment = document.createElement("div");
            fragment.classList.add("fragment");

            // Convert grid positions to circular layout
            let xPos = col * fragmentSize;
            let yPos = row * fragmentSize;

            // ** NEW: Push fragments outward slightly for a more organic fill **
            let distanceFromCenter = Math.sqrt(xPos * xPos + yPos * yPos);
            if (distanceFromCenter < radius * fragmentSize) {
                let pushFactor = (Math.random() - 0.5) * 0.6; // Small offset
                xPos += pushFactor;
                yPos += pushFactor;

                // ** NEW: Random rotation to avoid grid effect **
                let rotation = Math.random() * 360;

                // Random scattered start positions
                const randomX = Math.random() * 20 - 10 + "rem";
                const randomY = Math.random() * 20 - 10 + "rem";

                // Final circular placement
                const finalX = xPos + "rem";
                const finalY = yPos + "rem";

                // Animation properties
                const animationTime = (timeLeft / 2) + "s";
                fragment.style.setProperty("--animation-time", animationTime);

                // Apply starting and final positions
                fragment.style.transform = `translate(${randomX}, ${randomY}) rotate(${rotation}deg)`;
                fragment.style.setProperty("--random-x", randomX);
                fragment.style.setProperty("--random-y", randomY);
                fragment.style.setProperty("--final-x", finalX);
                fragment.style.setProperty("--final-y", finalY);

                tomatoArea.appendChild(fragment);
            }
        }
    }

    // Add the large S-shaped stem
    const stem = document.createElement("div");
    stem.classList.add("stem");
    tomatoArea.appendChild(stem);
}



    // Add the large S-shaped stem
    const stem = document.createElement("div");
    stem.classList.add("stem");
    tomatoArea.appendChild(stem);



// Function to animate fragments into a round tomato
function animateFragments() {
    const fragments = document.querySelectorAll(".fragment");
    const stem = document.querySelector(".stem");

    fragments.forEach((fragment, index) => {
        setTimeout(() => {
            fragment.style.animation = `moveToTomato ${timeLeft}s linear forwards`;
        }, index * (timeLeft * 10 / fragments.length)); 
    });

    // Delay the stem appearance until fragments settle
    setTimeout(() => {
        stem.style.opacity = 1;
    }, timeLeft * 800);
}

// Timer function
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    let countdown = timeLeft;

    const interval = setInterval(() => {
        if (countdown <= 0) {
            clearInterval(interval);
            isRunning = false;
        } else {
            countdown--;
            timerDisplay.textContent = countdown + "s";
        }
    }, 1000);

    animateFragments();
}

// Reset function
function resetTimer() {
    isRunning = false;
    timeLeft = 10;
    timerDisplay.textContent = "10s";
    createFragments();
}

// Event listeners
startButton.addEventListener("click", startTimer);
resetButton.addEventListener("click", resetTimer);

// Initialize fragments on load
createFragments();






