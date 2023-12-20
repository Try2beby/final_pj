import { LoadDataForGraph, ForceDirectedGraph, UpdateGraph } from "./utils.js";
import { CreateAllSlider, CreateAllButton, CreateSelect } from "./addComponents.js";

async function main() {
    await UpdateGraph(1);
    CreateSelect();
    CreateAllSlider();
    CreateAllButton();
}

main();