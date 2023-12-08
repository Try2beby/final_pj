// 定义节点大小比例尺，根据节点的连接数分配不同的半径
var size = d3.scaleLinear()
.range([5, 15]);

// 定义边颜色比例尺，根据连接的类型分配不同的颜色
var color = d3.scaleOrdinal(d3.schemeCategory10);

// 定义力导向图模拟器
var simulation = d3.forceSimulation()
.force("link", d3.forceLink().id(function(d) { return d.id; }))
.force("charge", d3.forceManyBody().strength(-4))
.force('collision', d3.forceCollide(3))
.force("center", d3.forceCenter(400, 300))
.force("radial", d3.forceRadial(5, 440, 300));

// 选择svg元素
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

// 选择按钮元素
var button1 = d3.select("#button1");
var button2 = d3.select("#button2");

// 读取节点连接数据集Link.csv
d3.csv("Link.csv").then(function(links) {
// 从连接数据集中提取节点数据
var nodes = {};
links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {id: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {id: link.target});
});

// 计算每个节点的连接数
var nodeArray = Object.values(nodes);
nodeArray.forEach(function(node) {
    node.count = 0; // 初始化连接数为0
});
links.forEach(function(link) {
    nodes[link.source.id].count++; // 起始节点的连接数加1
    nodes[link.target.id].count++; // 指向节点的连接数加1
});

// 更新节点大小比例尺的定义域
size.domain(d3.extent(nodeArray, function(d) { return d.count; }));

// 添加连接元素
var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
    .attr("stroke", function(d) { return color(d.relation); }); // 根据连接的类型分配边的颜色

// 添加节点元素
var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodeArray)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", function(d) { return size(d.count); }) // 根据节点的连接数分配节点的大小
    .attr("fill", "#ccc")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

// 添加节点的鼠标点击事件
node.on("click", function(event, d) {
    // 判断节点是否已经被选中
    var selected = d3.select(this).classed("selected");
    // 如果已经被选中，则恢复所有节点和连接的可见性
    if (selected) {
        node.classed("selected", false);
        node.style("opacity", 1);
        link.style("opacity", 1);
    } else {
        // 如果没有被选中，则显示该点和与该节点相连接的节点和连接，隐藏其他节点和连接
        node.classed("selected", false);
        d3.select(this).classed("selected", true);
        node.style("opacity", function(o) {
            return isConnected(d, o) ? 1 : 0.05;
        });
        link.style("opacity", function(o) {
            return d.id == o.source.id || d.id == o.target.id ? 1 : 0.05;
        });
        // 显示该点本身
        d3.select(this).style("opacity", 1);
    }
});

// 定义提示框
var tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

// 鼠标移动到节点上时，显示对应节点的信息
node.on("mouseover", function(event, d){
    tooltip.transition()
    .duration(100)
    .style("opacity", .9);
    tooltip.html(d.id)
    .style("left", 550 + "px")
    .style("top",  28 + "px");
});

// 鼠标移出节点时，信息框消失
node.on("mouseout", function(event){
    tooltip.transition()
    .duration(300)
    .style("opacity", 0)
});

// 定义一个辅助函数，判断两个节点是否相连接
function isConnected(a, b) {
    return links.some(function(link) {
        return (link.source.id == a.id && link.target.id == b.id) || (link.source.id == b.id && link.target.id == a.id);
    });
}

// 更新力导向图模拟器的节点和连接数据
simulation
    .nodes(nodeArray)
    .on("tick", ticked);

simulation.force("link")
    .links(links);

// 定义一个辅助函数，更新节点和连接的位置
function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

// 定义一个辅助函数，处理节点拖拽开始的事件
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(1).restart();
    d.fx = d.x;
    d.fy = d.y;
}

// 定义一个辅助函数，处理节点拖拽中的事件
function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

// 定义一个辅助函数，处理节点拖拽结束的事件
function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// 添加图例元素
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20,20)");

// 获取连接的类型的数组
var relations = Array.from(new Set(links.map(function(d) { return d.relation; })));

// 添加图例的矩形元素，表示边的颜色
legend.selectAll("rect")
    .data(relations)
    .enter().append("rect")
    .attr("x", 0)
    .attr("y", function(d, i) { return i * 20; })
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", function(d) { return color(d); });

// 添加图例的文本元素，表示连接的类型
legend.selectAll("text")
    .data(relations)
    .enter().append("text")
    .attr("x", 15)
    .attr("y", function(d, i) { return i * 20 + 9; })
    .text(function(d) { return d; });

// 读取核心资产数据集asset.csv
d3.csv("asset.csv").then(function(nodeData) {
    // 定义一个变量，表示按钮的状态
    var buttonState1 = false;

    // 添加按钮的鼠标点击事件
    button1.on("click", function(event) {
        // 切换按钮的状态
        buttonState1 = !buttonState1;
        // 如果按钮的状态为真，则高亮显示核心资产的节点
        if (buttonState1) {
            node.classed("highlight", function(d) {
                return nodeData.some(function(n) {
                    return n.id == d.id;
                });
            });
        } else {
            // 如果按钮的状态为假，则恢复所有节点的正常显示
            node.classed("highlight", false);
        }
    });
});

// 读取关键链路数据集road.csv
d3.csv("road.csv").then(function(roadData) {
    // 定义一个变量，表示按钮的状态
    var buttonState2 = false;

    // 添加第二个按钮的鼠标点击事件
    button2.on("click", function(event) {
        // 切换按钮的状态
        buttonState2 = !buttonState2;
        
        // 如果按钮的状态为真，则高亮显示核心资产的节点
        if (buttonState2) {
            // 隐藏除road.csv中包含的连接以外的其他连接，以及这些连接两端的点
            link.style("display", function(d) {
                return roadData.some(function(r) {
                    return r.source === d.source.id && r.target === d.target.id;
                }) ? "inline" : "none";
            });
            node.style("display", function(d) {
                return roadData.some(function(r) {
                    return r.source === d.id || r.target === d.id;
                }) ? "inline" : "none";
            });
        } else{
            // 恢复原状
            link.style("display", "inline");
            node.style("display", "inline");
        }
    });
}); 

});