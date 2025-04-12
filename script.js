// const tomatoArea = document.getElementById("tomato-area");
// const startButton = document.getElementById("start");
// const resetButton = document.getElementById("reset");
// const timerDisplay = document.getElementById("timer-display");

// let timeLeft = 30; // ✅ Change Timer to 99 Seconds
// let isRunning = false;

// // Function to create a fully packed circular tomato
// function createFragments() {
//     tomatoArea.innerHTML = "";
//     const fragmentSize = 1.25; // Size of each fragment
//     const gridSize = 6; // 6x6 grid for full coverage
//     const radius = 4; // Defines circular boundary

//     for (let row = -gridSize / 2; row < gridSize / 2; row++) {
//         for (let col = -gridSize / 2; col < gridSize / 2; col++) {
//             const fragment = document.createElement("div");
//             fragment.classList.add("fragment");

//             // Convert grid positions to circular layout
//             let xPos = col * fragmentSize;
//             let yPos = row * fragmentSize;

//             // ** NEW: Push fragments outward slightly for a more organic fill **
//             let distanceFromCenter = Math.sqrt(xPos * xPos + yPos * yPos);
//             if (distanceFromCenter < radius * fragmentSize) {
//                 let pushFactor = (Math.random() - 0.5) * 0.6; // Small offset
//                 xPos += pushFactor;
//                 yPos += pushFactor;

//                 // ** NEW: Random rotation to avoid grid effect **
//                 let rotation = Math.random() * 360;

//                 // Random scattered start positions
//                 const randomX = Math.random() * 20 - 10 + "rem";
//                 const randomY = Math.random() * 20 - 10 + "rem";

//                 // Final circular placement
//                 const finalX = xPos + "rem";
//                 const finalY = yPos + "rem";

//                 // Animation properties
//                 const animationTime = (timeLeft / 2) + "s";
//                 fragment.style.setProperty("--animation-time", animationTime);

//                 // Apply starting and final positions
//                 fragment.style.transform = `translate(${randomX}, ${randomY}) rotate(${rotation}deg)`;
//                 fragment.style.setProperty("--random-x", randomX);
//                 fragment.style.setProperty("--random-y", randomY);
//                 fragment.style.setProperty("--final-x", finalX);
//                 fragment.style.setProperty("--final-y", finalY);

//                 tomatoArea.appendChild(fragment);
//             }
//         }
//     }

//     // Add the large S-shaped stem
//     const stem = document.createElement("div");
//     stem.classList.add("stem");
//     tomatoArea.appendChild(stem);
// }

// // Function to animate fragments into a round tomato
// function animateFragments() {
//     const fragments = document.querySelectorAll(".fragment");
//     const stem = document.querySelector(".stem");

//     fragments.forEach((fragment, index) => {
//         setTimeout(() => {
//             fragment.style.animation = `moveToTomato ${timeLeft}s linear forwards`;
//         }, index * (timeLeft * 10 / fragments.length)); 
//     });

//     // Delay the stem appearance until fragments settle
//     setTimeout(() => {
//         stem.style.opacity = 1;
//     }, timeLeft * 800);
// }

// // Timer function
// function startTimer() {
//     if (isRunning) return;
//     isRunning = true;
//     let countdown = timeLeft;

//     const interval = setInterval(() => {
//         if (countdown <= 0) {
//             clearInterval(interval);
//             isRunning = false;
//         } else {
//             countdown--;
//             timerDisplay.textContent = countdown + "s";
//         }
//     }, 1000);

//     animateFragments();
// }

// // Reset function
// function resetTimer() {
//     isRunning = false;
//     timeLeft = 10;
//     timerDisplay.textContent = "10s";
//     createFragments();
// }

// // Event listeners
// startButton.addEventListener("click", startTimer);
// resetButton.addEventListener("click", resetTimer);

// Initialize fragments on load
// createFragments();

// Set the dimensions and margins of the graph
// Set the dimensions and margins of the graph
const margin = { top: 40, right: 150, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right; // Reduce the width
const height = 400 - margin.top - margin.bottom; // Reduce the height
// Create SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add title
svg.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .text("Number of Disappearances Over Time");

// Create a color scale for facilities
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load and process the data
d3.csv("newMissing.csv").then(data => {
    // Parse dates and group by facility and date
    const StateData = d3.group(data, d => d["StateResidence"]);

    // Prepare data for each facility
    const facilities = Array.from(StateData, ([facility, records]) => {
        const dateCounts = d3.rollup(
            records,
            v => v.length,
            d => d3.timeDay.floor(d3.timeParse("%m/%d/%Y")(d["DateDisappered"]))
        );

        const cumulativeData = Array.from(dateCounts, ([date, count]) => ({
            date: date,
            count: count
        }))
            .sort((a, b) => a.date - b.date)
            .map((d, i, arr) => ({
                date: d.date,
                cumulativeCount: arr.slice(0, i + 1).reduce((sum, curr) => sum + curr.count, 0)
            }));

        return { facility, cumulativeData };
    });

    // Create scales
    const xCumulative = d3.scaleTime()
        .domain([
            d3.min(facilities, f => d3.min(f.cumulativeData, d => d.date)),
            d3.max(facilities, f => d3.max(f.cumulativeData, d => d.date))
        ])
        .range([0, width]);

    const yCumulative = d3.scaleLinear()
        .domain([0, d3.max(facilities, f => d3.max(f.cumulativeData, d => d.cumulativeCount))])
        .range([height, 0]);
    // Create a new SVG container for the cumulative graph
    const svgCumulative = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // Add X axis
    svgCumulative.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xCumulative))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    svgCumulative.append("g")
        .call(d3.axisLeft(yCumulative));

    // Add X axis label
    svgCumulative.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Date");

    // Add Y axis label
    svgCumulative.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .text("Cumulative Number of Disappearances");

    // Create the area generator
    const cumulativeArea = d3.area()
        .x(d => xCumulative(d.date))
        .y0(height)
        .y1(d => yCumulative(d.cumulativeCount));

    // Add areas for each facility
    facilities.forEach((facility, index) => {
        svgCumulative.append("path")
            .datum(facility.cumulativeData)
            .attr("class", "area")
            .attr("d", cumulativeArea)
            .style("fill", colorScale(facility.facility))
            .style("opacity", 0.6);

        // Add a legend for each facility
        svgCumulative.append("text")
            .attr("x", width + 10)
            .attr("y", 20 + index * 20)
            .attr("class", "legend")
            .style("fill", colorScale(facility.facility))
            .text(facility.facility);
    });
});