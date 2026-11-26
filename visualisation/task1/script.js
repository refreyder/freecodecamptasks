const DATA_URL =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const width = 880;
const height = 460;
const margin = { top: 24, right: 28, bottom: 48, left: 72 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3
    .select("#chart-wrapper")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const tooltip = d3.select("#tooltip");

d3.json(DATA_URL).then((dataset) => {
    const data = dataset.data;
    const dates = data.map((d) => new Date(d[0]));
    const gdps = data.map((d) => d[1]);

    const xScale = d3
        .scaleTime()
        .domain([d3.min(dates), d3.max(dates)])
        .range([0, innerWidth]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(gdps)])
        .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chart
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis);

    chart
        .append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    chart
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -52)
        .attr("text-anchor", "middle")
        .text("Gross Domestic Product (Billions)");

    const barWidth = innerWidth / data.length;

    chart
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-date", (d) => d[0])
        .attr("data-gdp", (d) => d[1])
        .attr("x", (d, i) => xScale(dates[i]))
        .attr("y", (d) => yScale(d[1]))
        .attr("width", barWidth)
        .attr("height", (d) => innerHeight - yScale(d[1]))
        .on("mouseover", (event, d) => {
            const [xPos, yPos] = d3.pointer(event, document.getElementById("chart-wrapper"));
            tooltip
                .style("opacity", 1)
                .style("left", `${xPos + 14}px`)
                .style("top", `${yPos - 44}px`)
                .attr("data-date", d[0])
                .html(`<strong>${d[0]}</strong><br>$${d[1].toLocaleString("en-US")} Billion`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
});
