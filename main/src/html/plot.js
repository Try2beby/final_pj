cacheDir = "../../data/cache/";
subgraphDir = "../../data/subgraph/";
// dataName = "core_subgraph.json";
dataName = (num) => `group_${num}.json`;

async function loadData() {
    const data = await d3.json(subgraphDir + dataName(1));
    return data
}

async function plot() {
    const data = await loadData();
    let nodes = data.nodes;
    let links = data.links;
    const graph = { nodes: nodes, links: links };
    let forceGraph = DisjointForceDirectedGraph(graph);
    document.getElementById("forcegraph").appendChild(forceGraph);
}

plot();