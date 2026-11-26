const DATA_URL =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const width = 1200;
const height = 540;
const margin = { top: 24, right: 30, bottom: 96, left: 90 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const palette = [
    "#313695",
    "#4575b4",
    "#74add1",
    "#abd9e9",
    "#e0f3f8",
    "#fee090",
    "#fdae61",
    "#f46d43",
    "#d73027"
];

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

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
    const baseTemp = dataset.baseTemperature;
    const data = dataset.monthlyVariance;

    d3.select("#description").text(
        `1753 - 2015: base temperature ${baseTemp}℃`
    );

    const years = Array.from(new Set(data.map((d) => d.year)));
    const months = d3.range(12);

    const xScale = d3
        .scaleBand()
        .domain(years)
        .range([0, innerWidth]);

    const yScale = d3
        .scaleBand()
        .domain(months)
        .range([0, innerHeight]);

    const temps = data.map((d) => baseTemp + d.variance);
    const minTemp = d3.min(temps);
    const maxTemp = d3.max(temps);

    const colorScale = d3
        .scaleQuantize()
        .domain([minTemp, maxTemp])
        .range(palette);

    const xAxis = d3
        .axisBottom(xScale)
        .tickValues(years.filter((y) => y % 10 === 0))
        .tickFormat(d3.format("d"));

    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((m) => monthNames[m]);

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
        .selectAll(".cell")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", (d) => d.month - 1)
        .attr("data-year", (d) => d.year)
        .attr("data-temp", (d) => baseTemp + d.variance)
        .attr("x", (d) => xScale(d.year))
        .attr("y", (d) => yScale(d.month - 1))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => colorScale(baseTemp + d.variance))
        .on("mouseover", (event, d) => {
            const [xPos, yPos] = d3.pointer(event, document.getElementById("chart-wrapper"));
            const temp = (baseTemp + d.variance).toFixed(2);
            const varianceStr =
                d.variance >= 0 ? `+${d.variance.toFixed(2)}` : d.variance.toFixed(2);
            tooltip
                .style("opacity", 1)
                .style("left", `${xPos + 14}px`)
                .style("top", `${yPos - 56}px`)
                .attr("data-year", d.year)
                .html(
                    `<strong>${d.year} - ${monthNames[d.month - 1]}</strong><br>${temp}℃ (${varianceStr}℃)`
                );
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    const legendWidth = 360;
    const legendHeight = 20;
    const step = (maxTemp - minTemp) / palette.length;
    const thresholds = d3.range(palette.length + 1).map((i) => minTemp + i * step);

    const legendX = d3
        .scaleLinear()
        .domain([minTemp, maxTemp])
        .range([0, legendWidth]);

    const legendAxis = d3
        .axisBottom(legendX)
        .tickValues(thresholds)
        .tickFormat(d3.format(".1f"));

    const legend = chart
        .append("g")
        .attr("id", "legend")
        .attr("transform", `translate(0, ${innerHeight + 44})`);

    legend
        .selectAll("rect")
        .data(palette)
        .enter()
        .append("rect")
        .attr("x", (d, i) => legendX(thresholds[i]))
        .attr("y", 0)
        .attr("width", legendWidth / palette.length)
        .attr("height", legendHeight)
        .attr("fill", (d) => d);

    legend
        .append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
});
