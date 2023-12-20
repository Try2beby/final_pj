import { ForceDirectedGraph, UpdateGraph } from "./utils.js";

function CreateAllSlider() {
    CreateSlider(-100, 100, graph_params.x_offset, "x_offset", "x_offset", function (value) {
        graph_params.x_offset = value;
        ForceDirectedGraph();
    });
    CreateSlider(-100, 100, graph_params.y_offset, "y_offset", "y_offset", function (value) {
        graph_params.y_offset = value;
        ForceDirectedGraph();
    });

    CreateSlider(-50, 0, graph_params.strength, "strength", "strength", function (value) {
        graph_params.strength = value;
        ForceDirectedGraph();
    });
    CreateSlider(0, 100, graph_params.linkDistance, "linkDistance", "linkDistance", function (value) {
        graph_params.linkDistance = value;
        ForceDirectedGraph();
    });
    CreateSlider(0, 0.05, graph_params.alphaDecay, "alphaDecay", "alphaDecay", function (value) {
        graph_params.alphaDecay = value;
        ForceDirectedGraph();
    }, 0.0001);

}

function CreateSlider(min, max, value, id, description, responseFunction, step = 1) {
    // create a div element for the slider
    const sliderDiv = document.createElement("div");
    sliderDiv.className = "sliderDiv";
    document.getElementById("slider").appendChild(sliderDiv);

    // 创建一个新的div元素来包含label和valueSpan
    const labelValueDiv = document.createElement("div");
    labelValueDiv.className = "labelValueDiv";
    sliderDiv.appendChild(labelValueDiv);

    // 创建标签
    const label = document.createElement("label");
    label.for = id;
    label.innerHTML = description;
    labelValueDiv.appendChild(label);

    // 创建用于显示值的span元素
    const valueSpan = document.createElement("span");
    valueSpan.id = id + "Value";
    valueSpan.innerHTML = value;
    labelValueDiv.appendChild(valueSpan);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.id = id;
    slider.className = "slider";
    slider.oninput = function () {
        valueSpan.innerHTML = this.value;
        responseFunction(this.value);
    }
    sliderDiv.appendChild(slider);
}


function CreateSelect() {
    const selectDiv = document.createElement("div");
    selectDiv.className = "selectDiv";
    document.getElementById("slider").appendChild(selectDiv);

    const select = document.createElement("select");
    select.id = "select";
    selectDiv.appendChild(select);

    select.addEventListener("change", function () {
        UpdateGraph(this.value);
    });

    groups.forEach(function (group) {
        CreateSelectOption(group, "Group " + group.toString());
    });

}

function CreateSelectOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.innerHTML = text;
    document.getElementById("select").appendChild(option);
}

function ShowCorePath() {
    const corePath = params.keypath;
    const array = Object.values(corePath);
    const pathData = new Set(array.flat());
    graph_handle.link.style("stroke-opacity", function (d) {
        if (pathData.has(d.source.id) && pathData.has(d.target.id)) {
            return 1;
        } else {
            return 0.1;
        }
    });
    graph_handle.node.style("fill-opacity", function (d) {
        if (pathData.has(d.id)) {
            return 1;
        } else {
            return 0.1;
        }
    });
    graph_handle.svg.selectAll("marker").style("opacity", function (d) {
        if (pathData.has(d.source.id) && pathData.has(d.target.id)) {
            return 0.5;
        } else {
            return 0.1;
        }
    });
}

function CreateAllButton() {
    CreateButton("core_path", "Show core path", function (pressed) {
        if (pressed) {
            ShowCorePath();
        } else {
            graph_handle.link.style("stroke-opacity", 0.6);
            graph_handle.node.style("fill-opacity", 1);
            graph_handle.svg.selectAll("marker").style("opacity", 0.5);
        }
    });
}

function CreateButton(id, description, responseFunction) {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = description;
    button.pressed = false;
    button.onclick = function () {
        this.pressed = !this.pressed;
        responseFunction(this.pressed);
    }
    document.getElementById("button").appendChild(button);
}

export { CreateAllSlider, CreateAllButton, CreateSelect }