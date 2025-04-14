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

/// Set the dimensions and margins of the graph
const margin = { top: 60, right: 150, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

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
    console.log("Raw data:", data); // Debugging: Log raw data

    const dateParser = d3.timeParse("%m/%d/%Y");

    // Filter and process the data
    const validData = data
        .filter(d => d["StateResidence"] && d["DateDisappeared"]) // Ensure required fields are present
        .map(d => ({
            state: d["StateResidence"],
            date: dateParser(d["DateDisappeared"]),
        }))
        .filter(d => d.date); // Ensure valid dates

    console.log("Valid data:", validData); // Debugging: Log valid data

    // Group data by state and date
    const groupedData = d3.group(validData, d => d.state);

    console.log("Grouped data:", groupedData); // Debugging: Log grouped data

    // Prepare data for plotting
    const facilities = Array.from(groupedData, ([state, records]) => {
        const dateCounts = d3.rollup(
            records,
            v => v.length,
            d => d.date
        );

        const cumulativeData = Array.from(dateCounts, ([date, count]) => ({
            date: date,
            count: count,
        }))
            .sort((a, b) => a.date - b.date)
            .map((d, i, arr) => ({
                date: d.date,
                cumulativeCount: arr.slice(0, i + 1).reduce((sum, curr) => sum + curr.count, 0),
            }));

        console.log(`Cumulative data for ${state}:`, cumulativeData); // Debugging: Log cumulative data

        return { state, cumulativeData };
    });

    console.log("Facilities data:", facilities); // Debugging: Log facilities data

    // // Create scales
    // const xScale = d3.scaleTime()
    //     .domain([
    //         d3.min(facilities, f => d3.min(f.cumulativeData, d => d.date)),
    //         d3.max(facilities, f => d3.max(f.cumulativeData, d => d.date)),
    //     ])
    //     .range([0, width]);

    // const yScale = d3.scaleLinear()
    //     .domain([0, d3.max(facilities, f => d3.max(f.cumulativeData, d => d.cumulativeCount))])
    //     .range([height, 0]);

    // console.log("xScale domain:", xScale.domain()); // Debugging: Log xScale domain
    // console.log("yScale domain:", yScale.domain()); // Debugging: Log yScale domain

    // // Create area generator
    // const areaGenerator = d3.area()
    //     .x(d => xScale(d.date))
    //     .y0(height)
    //     .y1(d => yScale(d.cumulativeCount));
    // Create scales
const xScale = d3.scaleTime()
.domain([
    d3.min(facilities, f => d3.min(f.cumulativeData, d => d.date)),
    d3.max(facilities, f => d3.max(f.cumulativeData, d => d.date)),
])
.range([0, width]);

const yScale = d3.scaleLinear()
.domain([0, -d3.max(facilities, f => d3.max(f.cumulativeData, d => d.cumulativeCount))]) // Invert the Y-axis
.range([0, height]); // Keep the range the same

console.log("xScale domain:", xScale.domain()); // Debugging: Log xScale domain
console.log("yScale domain:", yScale.domain()); // Debugging: Log yScale domain

// Create area generator
const areaGenerator = d3.area()
.x(d => xScale(d.date))
.y0(0) // Baseline at 0
.y1(d => yScale(-d.cumulativeCount)); // Use negative cumulative count

// Add X axis (at the top of the graph)
svg.append("g")
    .attr("transform", `translate(0, 0)`) // Position at the top of the graph
    .call(d3.axisTop(xScale)) // Use d3.axisTop for the top axis
    .selectAll("text") // Rotate text for better readability
    .style("text-anchor", "end")
    .attr("dx", ".8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(45)");

// Add Y axis
svg.append("g")
.call(d3.axisLeft(yScale));    

    // Plot the data
    facilities.forEach(state => {
        console.log(`Plotting state: ${state.state}`); // Debugging: Log state being plotted

        svg.append("path")
            .datum(state.cumulativeData)
            .attr("d", areaGenerator)
            .style("fill", colorScale(state.state))
            .style("opacity", 0.6);
    });
    // Add a legend
const legend = svg.append("g")
.attr("transform", `translate(${width + 20}, 0)`); // Position the legend to the right of the chart

facilities.forEach((state, index) => {
// Add a colored rectangle for each state
legend.append("rect")
    .attr("x", 0)
    .attr("y", index * 20) // Space out the legend items
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", colorScale(state.state));

// Add the state name next to the rectangle
legend.append("text")
    .attr("x", 20) // Position the text to the right of the rectangle
    .attr("y", index * 20 + 12) // Align text with the rectangle
    .style("font-size", "12px")
    .style("font-family", "Arial, sans-serif")
    .text(state.state);
});
    
});