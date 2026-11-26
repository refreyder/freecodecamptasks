const DATA_URL =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const width = 880;
const height = 480;
const margin = { top: 30, right: 30, bottom: 50, left: 72 };
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

d3.json(DATA_URL).then((data) => {
    data.forEach((d) => {
        const [mins, secs] = d.Time.split(":").map(Number);
        d.parsedTime = new Date(1970, 0, 1, 0, mins, secs);
    });

    const xScale = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => d.Year) - 1, d3.max(data, (d) => d.Year) + 1])
        .range([0, innerWidth]);

    const yScale = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.parsedTime))
        .range([0, innerHeight]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

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
        .text("Time in Minutes");

    const colorDoping = "#f97316";
    const colorClean = "#38bdf8";

    chart
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", (d) => xScale(d.Year))
        .attr("cy", (d) => yScale(d.parsedTime))
        .attr("data-xvalue", (d) => d.Year)
        .attr("data-yvalue", (d) => d.parsedTime.toISOString())
        .attr("fill", (d) => (d.Doping ? colorDoping : colorClean))
        .on("mouseover", (event, d) => {
            const [xPos, yPos] = d3.pointer(event, document.getElementById("chart-wrapper"));
            const dopingInfo = d.Doping ? `<br><br>${d.Doping}` : "";
            tooltip
                .style("opacity", 1)
                .style("left", `${xPos + 14}px`)
                .style("top", `${yPos - 28}px`)
                .attr("data-year", d.Year)
                .html(
                    `<strong>${d.Name}</strong> (${d.Nationality})<br>Year: ${d.Year}, Time: ${d.Time}${dopingInfo}`
                );
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    const legend = chart
        .append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${innerWidth - 220}, 20)`);

    const legendItems = [
        { label: "No doping allegations", color: colorClean },
        { label: "Riders with doping allegations", color: colorDoping }
    ];

    legendItems.forEach((item, index) => {
        const row = legend
            .append("g")
            .attr("transform", `translate(0, ${index * 24})`);

        row.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("rx", 3)
            .attr("fill", item.color);

        row.append("text")
            .attr("class", "legend-text")
            .attr("x", 22)
            .attr("y", 11)
            .text(item.label);
    });
});
