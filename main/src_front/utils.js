import { Histogram, Parallel, Firecord, Sankey } from "./addSubplot.js";

async function LoadDataForGraph(group_int) {
    const groupAnswerDir = answerDir + group_int.toString() + "/";
    const groupSubgraphFile = subgraphDir + "group_" + group_int.toString() + ".json";
    const groupKeyPathFile = groupAnswerDir + keyPathFile;
    const groupTopNodeFile = groupAnswerDir + topNodeFile;

    params.graph = await d3.json(groupSubgraphFile);
    params.keypath = await d3.json(groupKeyPathFile);
    params.topnode = await d3.json(groupTopNodeFile);
    params.graphsize = graphsize[group_int - 1];

    const groupLinkscsvFile = subgraphDir + group_int.toString() + "/" + "links.csv"
    params.links_csv = await d3.csv(groupLinkscsvFile)
    const groupNodescsvFile = subgraphDir + group_int.toString() + "/" + "nodes.csv"
    params.nodes_csv = await d3.csv(groupNodescsvFile)
}

function ForceDirectedGraph() {
    // Specify the dimensions of the chart.
    const width = grid.main.width;
    const height = grid.main.height;
    const data = params.graph;
    // clear the graph
    d3.select("#graph").selectAll("*").remove();

    const typeList = ['Domain', 'IP', 'Cert', 'Whois_Name', 'Whois_Phone', 'Whois_Email', 'IP_C', 'ASN'];
    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeTableau10.slice(1))
        .domain(typeList);

    // Create the SVG container.
    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(graph_params.linkDistance).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(graph_params.strength))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter(graph_params.x_offset, graph_params.y_offset))
        .alphaDecay(graph_params.alphaDecay);

    // 在 SVG 容器中定义箭头标记
    svg.append("defs").selectAll("marker")
        .data(links)      // Different link/path types can be defined here
        .enter().append("marker")    // This section adds in the arrows
        .attr("id", d => convertToValidId(`${d.source.id}-${d.target.id}-${d.relation}`))
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .attr("opacity", 0.5)
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    // Add a line for each link, and a circle for each node.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("marker-end", d => "url(#" + convertToValidId(`${d.source.id}-${d.target.id}-${d.relation}`) + ")");

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => color(d.type));

    // node.append("title")
    //     .text(d => d.id);
    // add tooltip by tippy

    function StringTruncate(str, length) {
        if (str.length > length) {
            return str.slice(0, length) + "...";
        } else {
            return str;
        }
    }
    node.nodes().forEach(function (node) {
        const data = node.__data__;
        const tooltipContent = `
        <table class="tooltip" style="text-align: left; font-size: 10px;">
            <tr><th colspan="2">${StringTruncate(data.name, 6)}</th></tr>
            <tr><td><strong>Type</strong></td><td>${data.type}</td></tr>
            <tr><td><strong>Industry</strong></td><td>${data.industry}</td></tr>
            <tr><td><strong>pagerank</strong></td><td>${(data.pagerank).toExponential(3)}</td></tr>
            <tr><td><strong>degree centrality</strong></td><td>${(data.degree_centrality).toExponential(3)}</td></tr>
            <tr><td><strong>betweenness</strong></td><td>${(data.betweenness).toExponential(3)}</td></tr>
        </table>
        `;
        tippy(node, {
            content: tooltipContent,
            allowHTML: true,
            theme: 'myTheme',
            // hide arrow
            arrow: false,

        });
    });

    // Create the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${-width / 2 + 10}, ${-height / 2 + 10})`)
        .selectAll("g")
        .data(typeList)
        .join("g");

    legend.append("circle")
        .attr("cy", (d, i) => i * 10)
        .attr("r", 5)
        .attr("fill", d => color(d));

    legend.append("text")
        .attr("y", (d, i) => i * 10)
        .attr("x", 10)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .text(d => d);
    // Position the legend elements
    legend.attr("transform", (d, i) => `translate(0, ${i * 10})`);

    // Add a drag behavior.
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Set the position attributes of links and nodes each time the simulation ticks.
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;

    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;

    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
        // simulation.restart();
    }

    graph_handle = {
        svg: svg,
        simulation: simulation,
        link: link,
        node: node,
    };
    return
}

function convertToValidId(str) {
    // Replace all non-alphanumeric characters, excluding hyphen and colon, with underscore
    return str.replace(/[^a-zA-Z0-9\-:]/g, '_');
}

function UpdateGraphParams() {
    graph_params.strength = params.graphsize;
}

async function UpdateGraph(group) {
    await LoadDataForGraph(group);
    UpdateGraphParams();
    ForceDirectedGraph();

    Parallel();
    Sankey();

    Firecord();
    Histogram();

}

export { LoadDataForGraph, ForceDirectedGraph, UpdateGraph };
