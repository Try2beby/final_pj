async function LoadDataForGraph(group_int) {
    console.log("group_int: " + group_int);
    const groupAnswerDir = answerDir + group_int.toString() + "/";
    const groupSubgraphFile = subgraphDir + "group_" + group_int.toString() + ".json";
    const groupKeyPathFile = groupAnswerDir + keyPathFile;
    const groupTopNodeFile = groupAnswerDir + topNodeFile;
    console.log(groupSubgraphFile);
    params.graph = await d3.json(groupSubgraphFile);
    params.keypath = await d3.json(groupKeyPathFile);
    params.topnode = await d3.json(groupTopNodeFile);
    params.graphsize = graphsize[group_int - 1];
}

function ForceDirectedGraph() {
    // Specify the dimensions of the chart.
    const width = grid.main.width;
    const height = grid.main.height;
    const data = params.graph;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(['Domain', 'IP', 'Cert', 'Whois_Name', 'Whois_Phone', 'Whois_Email', 'IP_C', 'ASN']);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    // Create the SVG container.
    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // 在 SVG 容器中定义箭头标记
    svg.append("defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
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
        .attr("marker-end", "url(#end)");  // Add this line

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => color(d.type));

    node.append("title")
        .text(d => d.id);

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
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return svg.node();
}


async function UpdateGraph(group) {
    await LoadDataForGraph(group);
    ForceDirectedGraph();
}

export { LoadDataForGraph, ForceDirectedGraph, UpdateGraph };
