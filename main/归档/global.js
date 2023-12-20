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
    width: 600,
}
grid.hist = {
    height: 160,
    width: 200,
    }
grid.fire = {
    height: 160,
    width: 200,
}
grid.para = {
    height: 160,
    width: 200,
}
grid.sankey = {
    height: 160,
    width: 200,
}

const graphsize = [-50, -20, -15, -5, -5]

