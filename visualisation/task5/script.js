const DATA_URL =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const width = 960;
const height = 570;

const palette = [
    "#4c92c3",
    "#ff993e",
    "#56b356",
    "#de5253",
    "#a985ca",
    "#a3786f",
    "#e992ce",
    "#999999",
    "#c9ca4e",
    "#46c1d0",
    "#bed2ed",
    "#ffc993",
    "#ade5a1",
    "#ffadab",
    "#d1c0dd",
    "#d0b0a9",
    "#f9c5db",
    "#d2d2d2"
];

const svg = d3
    .select("#chart-wrapper")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("#tooltip");

d3.json(DATA_URL).then((data) => {
    const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).paddingInner(1)(root);

    const categories = Array.from(
        new Set(root.leaves().map((d) => d.data.category))
    );

    const colorScale = d3
        .scaleOrdinal()
        .domain(categories)
        .range(palette);

    const cell = svg
        .selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

    cell
        .append("clipPath")
        .attr("id", (d, i) => `clip-${i}`)
        .append("rect")
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0));

    cell
        .append("rect")
        .attr("class", "tile")
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0))
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.data.value)
        .attr("fill", (d) => colorScale(d.data.category))
        .on("mouseover mousemove", (event, d) => {
            const [xPos, yPos] = d3.pointer(
                event,
                document.getElementById("chart-wrapper")
            );
            tooltip
                .style("opacity", 1)
                .style("visibility", "visible")
                .style("left", `${xPos + 14}px`)
                .style("top", `${yPos - 44}px`)
                .attr("data-value", d.data.value)
                .html(
                    `<strong>${d.data.name}</strong><br>Platform: ${d.data.category}<br>Sales: ${d.data.value}M`
                );
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0).style("visibility", "hidden");
        });

    cell
        .append("text")
        .attr("class", "tile-text")
        .attr("clip-path", (d, i) => `url(#clip-${i})`)
        .selectAll("tspan")
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 11)
        .text((d) => d);

    const legendWidth = 600;
    const cols = 3;
    const colWidth = legendWidth / cols;
    const rowHeight = 26;
    const rows = Math.ceil(categories.length / cols);

    const legend = d3
        .select("#chart-wrapper")
        .append("svg")
        .attr("id", "legend")
        .attr("width", legendWidth)
        .attr("height", rows * rowHeight + 16);

    const legendItems = legend
        .selectAll("g")
        .data(categories)
        .enter()
        .append("g")
        .attr("transform", (d, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return `translate(${col * colWidth + 10}, ${row * rowHeight + 10})`;
        });

    legendItems
        .append("rect")
        .attr("class", "legend-item")
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 3)
        .attr("fill", (d) => colorScale(d));

    legendItems
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 24)
        .attr("y", 13)
        .text((d) => d);
});
