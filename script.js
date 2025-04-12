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
const margin = {top: 50, right: 50, bottom: 70, left: 60};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

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

/// Load and process the data
d3.csv("missing.csv").then(data => {
    // Parse dates and group by date
    const dateCounts = d3.group(data, d => d3.timeDay.floor(d3.timeParse("%m/%d/%Y")(d["Date Disappered"])));
    
    // Convert to array and sort by date
    const timeData = Array.from(dateCounts, ([date, group]) => ({
        date: date,
        count: group.length
    })).sort((a, b) => a.date - b.date);

    // Filter dates to limit to Jan 21, 2025, to the present day
    const startDate = new Date("2025-01-21");
    const endDate = new Date(); // Current date
    const filteredData = timeData.filter(d => d.date >= startDate && d.date <= endDate);

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(filteredData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.count)])
        .range([height, 0]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Date");

    // Add Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .text("Number of Disappearances");

    // Create the line
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.count));

    // Add the line path
    svg.append("path")
        .datum(filteredData)
        .attr("class", "line")
        .attr("d", line);

    // Add dots
    svg.selectAll(".dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.count))
        .attr("r", 4)
        .style("fill", "#ff6b6b");
});

// Add a second SVG container for the cumulative graph
const svgCumulative = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process the data
d3.csv("missing.csv").then(data => {
    // Parse dates and group by date
    const dateCounts = d3.group(data, d => d3.timeDay.floor(d3.timeParse("%m/%d/%Y")(d["Date Disappered"])));
    
    // Convert to array and sort by date
    const timeData = Array.from(dateCounts, ([date, group]) => ({
        date: date,
        count: group.length
    })).sort((a, b) => a.date - b.date);

    // Filter dates to limit to Feb 1, 2025, to the present day
    const startDate = new Date("2025-02-01");
    const endDate = new Date(); // Current date
    const filteredData = timeData.filter(d => d.date >= startDate && d.date <= endDate);

    // Calculate cumulative sum
    let cumulativeCount = 0;
    const cumulativeData = filteredData.map(d => {
        cumulativeCount += d.count;
        return { date: d.date, cumulativeCount: cumulativeCount };
    });

    // Create scales for the cumulative graph
    const xCumulative = d3.scaleTime()
        .domain(d3.extent(cumulativeData, d => d.date))
        .range([0, width]);

    const yCumulative = d3.scaleLinear()
        .domain([0, d3.max(cumulativeData, d => d.cumulativeCount)])
        .range([height, 0]);

    // Add X axis for the cumulative graph
    svgCumulative.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xCumulative))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add Y axis for the cumulative graph
    svgCumulative.append("g")
        .call(d3.axisLeft(yCumulative));

    // Add X axis label for the cumulative graph
    svgCumulative.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Date");

    // Add Y axis label for the cumulative graph
    svgCumulative.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .text("Cumulative Number of Disappearances");

// Create the area generator for the cumulative graph
const cumulativeArea = d3.area()
    .x(d => xCumulative(d.date))
    .y0(height) // The baseline of the area (bottom of the graph)
    .y1(d => yCumulative(d.cumulativeCount)); // The top of the area (cumulative count)

// Add the area path for the cumulative graph
svgCumulative.append("path")
    .datum(cumulativeData)
    .attr("class", "area")
    .attr("d", cumulativeArea)
    .style("fill", "#4CAF50")
    .style("opacity", 0.6);

// Add dots for the cumulative graph (optional, for emphasis)
svgCumulative.selectAll(".dot")
    .data(cumulativeData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => xCumulative(d.date))
    .attr("cy", d => yCumulative(d.cumulativeCount))
    .attr("r", 4)
    .style("fill", "#4CAF50");
});