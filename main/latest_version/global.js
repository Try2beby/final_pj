const answerDir = '../data/answer/'
const subgraphDir = '../data/subgraph/'
const keyPathFile = "key_path.json"
const topNodeFile = "top_nodes.json"
const nodeFile = "nodes.csv"
const linkFile = "links.csv"

let params = {};
let container = {};
var grid = {};
grid.main = {
    height: 450,
    width: 700,
}

// const bottom_style = window.getComputedStyle(document.querySelector('#bottomleft-container svg'));
const bottom_style = {
    height: 226,
    width: 475,
}

const right_style = {
    height: 338,
    width: 400,
}


grid.hist = {
    height: right_style.height,
    width: right_style.width,
}
grid.fire = {
    height: right_style.height,
    width: right_style.width,
}
grid.para = {
    height: bottom_style.height,
    width: bottom_style.width,
}
grid.sankey = {
    height: bottom_style.height,
    width: bottom_style.width,
}

const graphsize = [-30, -10, -10, -5, -5];
const groups = [1, 2, 3, 4, 5];


let graph_params = {
    x_offset: 0,
    y_offset: 0,
    strength: -30,
    linkDistance: 30,
    alphaDecay: 0.0228,
}

let graph_handle = {};

