const EDUCATION_URL =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const COUNTIES_URL =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const width = 960;
const height = 620;

const palette = [
    "#e0f2fe",
    "#bae6fd",
    "#7dd3fc",
    "#38bdf8",
    "#0284c7",
    "#0369a1",
    "#075985"
];

const svg = d3
    .select("#chart-wrapper")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("#tooltip");
const path = d3.geoPath();

Promise.all([d3.json(COUNTIES_URL), d3.json(EDUCATION_URL)]).then(
    ([us, education]) => {
        const eduMap = new Map(education.map((item) => [item.fips, item]));
        const values = education.map((item) => item.bachelorsOrHigher);
        const minVal = d3.min(values);
        const maxVal = d3.max(values);

        const colorScale = d3
            .scaleQuantize()
            .domain([minVal, maxVal])
            .range(palette);

        const legendWidth = 280;
        const legendHeight = 12;
        const step = (maxVal - minVal) / palette.length;
        const thresholds = d3
            .range(palette.length + 1)
            .map((i) => minVal + i * step);

        const legendX = d3
            .scaleLinear()
            .domain([minVal, maxVal])
            .range([0, legendWidth]);

        const legendAxis = d3
            .axisBottom(legendX)
            .tickValues(thresholds)
            .tickFormat((d) => `${Math.round(d)}%`)
            .tickSize(14);

        const legend = svg
            .append("g")
            .attr("id", "legend")
            .attr("transform", "translate(590, 28)");

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

        legend.append("g").call(legendAxis);

        svg
            .append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("data-fips", (d) => d.id)
            .attr("data-education", (d) => {
                const entry = eduMap.get(d.id);
                return entry ? entry.bachelorsOrHigher : 0;
            })
            .attr("fill", (d) => {
                const entry = eduMap.get(d.id);
                return entry ? colorScale(entry.bachelorsOrHigher) : "#334155";
            })
            .on("mouseover", (event, d) => {
                const entry = eduMap.get(d.id);
                if (!entry) {
                    return;
                }
                const [xPos, yPos] = d3.pointer(
                    event,
                    document.getElementById("chart-wrapper")
                );
                tooltip
                    .style("opacity", 1)
                    .style("left", `${xPos + 14}px`)
                    .style("top", `${yPos - 36}px`)
                    .attr("data-education", entry.bachelorsOrHigher)
                    .html(
                        `${entry.area_name}, ${entry.state}: <strong>${entry.bachelorsOrHigher}%</strong>`
                    );
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        svg
            .append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("class", "states")
            .attr("d", path);
    }
);
