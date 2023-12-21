//****************************** Histogram ********************/
function Histogram() {

    // 创建柱状图数据
    var industry_count = [
        { industry: "A", value: 0 },
        { industry: "B", value: 0 },
        { industry: "C", value: 0 },
        { industry: "D", value: 0 },
        { industry: "E", value: 0 },
        { industry: "F", value: 0 },
        { industry: "G", value: 0 },
        { industry: "H", value: 0 },
        { industry: "I", value: 0 }
    ];

    const data = params.graph;
    const width = grid.hist.width;
    const height = grid.hist.height;
    // const width = 400;
    // const height = 338;

    // clear
    d3.select("#industry_histogram").selectAll("*").remove();

    // 创建 SVG 元素
    const svg_hist = d3.select("#industry_histogram")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
    // .attr("style", "max-width: 100%; height: auto;");


    var margin = { top: 20, right: 20, bottom: 30, left: 30 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;


    data.nodes.forEach(function (node) {

        //console.log("i:",i);
        //console.log("node.industry:",node.industry);
        if (node.industry !== null && node.industry !== "[]") {
            var industryArray = node.industry.match(/'([^']+)'/g);
            industryArray = industryArray.map(function (item) {
                return item.replace(/'/g, '');
            });

            // 遍历 industryArray 提取字符
            industryArray.forEach(function (ind) {
                //console.log(ind);
            });
            if (industryArray.length !== 0) {
                // console.log("i:",i);
                // console.log("industryArray:",industryArray);
                for (var j = 0; j < industryArray.length; j++) {
                    for (var k = 0; k < industry_count.length; k++) {
                        //  console.log("k:",k)
                        //console.log("industry_count[k].industry:",industry_count[k].industry)
                        //  console.log("industryArray[j]:",industryArray[j])
                        if (industry_count[k].industry === industryArray[j]) {
                            industry_count[k].value++;
                            //    console.log("industry_count[k].industry:",industry_count[k].industry,"industry_count[k]value:",industry_count[k].value)
                        }
                    }
                }
            }

        }

    });

    industry_count[0].industry = "涉黄";
    industry_count[1].industry = "涉毒";
    industry_count[2].industry = "诈骗";
    industry_count[3].industry = "涉枪";
    industry_count[4].industry = "黑客";
    industry_count[5].industry = "非法交易";
    industry_count[6].industry = " 非法支付";
    industry_count[7].industry = "其他";
    console.log(industry_count)

    // 创建 x 比例尺
    var xScale = d3
        .scaleBand()
        .domain(industry_count.map(function (d) { return d.industry; }))
        .range([0, innerWidth])
        .padding(0.1);
    // console.log(xScale)

    // 创建 y 比例尺
    var yScale = d3
        .scaleLinear()
        .domain([0, d3.max(industry_count, function (d) { return d.value; })])
        .range([innerHeight, 0]);

    // 创建柱状图容器
    var g = svg_hist.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 定义颜色比例尺
    //var colorScale = d3.scaleOrdinal()
        //.domain(industry_count.map(function (d) { return d.industry; }))
        //.range(["#0d96f8", "#65cafe", "#8edffc", "#d9f6fe", "#0d96f8", "#65cafe", "#8edffc", "#d9f6fe"]);

    
    // 定义颜色比例尺
var colorScale = d3.scaleOrdinal()
.domain(industry_count.map(function(d) { return d.industry; }))
.range(["#ebc4c3", "#cbdae7", "#b7d2e2", "#aebbe3", "#9ec6d7", "#ebc4c3", "#ffe6db", "#b6dce9"]);

    // 绘制柱子
    g.selectAll("rect")
        .data(industry_count)
        .enter()
        .append("rect")
        .attr("x", function (d) { return xScale(d.industry); })
        .attr("y", function (d) { return yScale(d.value); })
        .attr("width", xScale.step())
        .attr("height", function (d) { return innerHeight - yScale(d.value); })
        .attr("fill", function (d, i) { return colorScale(i); });

    // 添加标签
    g.selectAll(".label")
        .data(industry_count)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function (d) { return xScale(d.industry) + xScale.step() / 2; })
        .attr("y", function (d) { return yScale(d.value) - 5; })
        .attr("text-anchor", "middle")
        .text(function (d) { return d.value; });

    // 添加 x 轴
    g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("class", "axis-label"); // 添加类名以应用样式

    // 添加 y 轴
    g.append("g")
        .call(d3.axisLeft(yScale));

    return svg_hist.node();
}





//**************************fire cord***********************/
function Firecord() {
    const width = grid.fire.width;
    const height = grid.fire.height;
    const data = params.links_csv;

    // clear
        d3.select("#firecord").selectAll("*").remove();

    // 创建 SVG 元素
    const svg_fire = d3
        .select("#firecord")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    var margin = { top: 20, right: 20, bottom: 30, left: 40 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    var radius = Math.min(innerWidth, innerHeight) / 2;

    svg_fire.append("g").attr("transform", "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")");

    // 定义数据
    var categories = [
        "Domain",
        "IP",
        "Cert",
        "Whois_Name",
        "Whois_Phone",
        "Whois_Email",
        "IP_C",
        "ASN"
    ];

    var connections = [
        { source: "Domain", target: "IP", edge: "r_dns_a", weights: 0 },
        { source: "Domain", target: "Cert", edge: "r_cert", weights: 0 },
        { source: "Domain", target: "Whois_Name", edge: "r_whois_name", weights: 0 },
        { source: "Domain", target: "Whois_Phone", edge: "r_whois_phone", weights: 0 },
        { source: "Domain", target: "Whois_Email", edge: "r_whois_email", weights: 0 },
        { source: "Domain", target: "IP_C", edge: "r_whois_phone", weights: 0 },
        { source: "Domain", target: "ASN", edge: "r_whois_phone", weights: 0 },
        { source: "Domain", target: "Domain", edge: "r_cname", weights: 0 }
    ];

    data.forEach(function (d) {
        var edgeType = d.relation; // 获取边的类型，即第一列的值

        // 在 connections 中查找匹配的连接
        var matchingConnectionIndex = connections.findIndex(function (connection) {
            return connection.edge === edgeType;
        });

        // 如果找到匹配的连接，则修改其相应的 weights 值
        if (matchingConnectionIndex !== -1) {
            connections[matchingConnectionIndex].weights++;
        }
    });

    // 计算总的 weights 值
    var totalWeight = 0;
    connections.forEach(function (connection) {
        totalWeight += connection.weights;
    });

    // 更新 connections 中的每个对象的 weights 值
    connections.forEach(function (connection) {
        connection.weights = connection.weights / totalWeight;
    });

    console.log(connections);

    // 创建饼图的数据
    var pieData = connections.map(function (connection) {
        return {
            category: connection.target,
            value: connection.weights
        };
    });

    const typeList = ['Domain', 'IP', 'Cert', 'Whois_Name', 'Whois_Phone', 'Whois_Email', 'IP_C', 'ASN'];
    // Specify the color scale.
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10.slice(1))
        .domain(typeList);

    // 创建饼图的弧生成器
    var arc = d3.arc().innerRadius(0).outerRadius(radius);

    // 绘制饼图扇区
    var paths = svg_fire
        .selectAll("path")
        .data(d3.pie().value(function (d) {
            return d.value;
        })(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d) {
            return colorScale(d.data.category);
        })
        .style("opacity", 0.7)
        .style("stroke", function (d) {
            return colorScale(d.data.category);
        })
        .on("mouseover", function (event, d) {
            // 鼠标悬停时的事件处理函数
            d3.select(this)
                .style("opacity", 1) // 高亮显示当前扇形区域
                .style("cursor", "pointer");
        })
        .on("mouseout", function (event, d) {
            // 鼠标移出时的事件处理函数
            d3.select(this)
                .style("opacity", 0.7) // 恢复扇形区域的透明度
                .style("cursor", "default");
        })
        .each(function (d) {
            const content = d.data.category;

            tippy(this, {
                content: d.data.category,
                allowHTML: true,
                trigger: 'mouseenter',
                theme: 'light',
                arrow: false,
                hideOnClick: false,
                placement: 'right'
            });
        });

    // 创建提示框
    var tooltip = d3
        .select("body")
        .append("div")

    // 返回创建的 SVG 元素
    return svg_fire;
}


//****************************** Parallel ********************/
function Parallel() {
    const width = grid.para.width;
    const height = grid.para.height;
    // const data = params.nodes_csv;
    const data = params.graph.nodes;

    // clear
    d3.select("#parallel").selectAll("*").remove();
    // 创建 SVG 元素
    const svg = d3.select("#parallel")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // 在 body 元素中添加 tooltip 的容器
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid #ddd")
        .style("pointer-events", "none"); // 确保 tooltip 不会捕获事件

    let margin = {
        vertical: 40,
        horizontal: 30
    }

    // 在svg下添加组group，用来包含平行坐标图
    let group = svg.append("g");


    // 获取各数据维度名称
    let dimensions = ['betweenness', 'degree_centrality', 'pagerank'];
    // console.log(dimensions)

    // // 创建颜色比例尺，每种鸢尾花对应一种颜色
    // let colorScale = d3.scaleOrdinal()
    //     .domain(["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"])
    //     .range(["#1877e7", '#fcdd1d', '#cb76ca', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']);
    const typeList = ['Domain', 'IP', 'Cert', 'Whois_Name', 'Whois_Phone', 'Whois_Email', 'IP_C', 'ASN'];
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10.slice(1))
        .domain(typeList);

    // 创建一个辅助用的横轴比例尺，用来确定实际每条纵轴的位置
    let scaleX = d3.scalePoint()
        .domain(dimensions)
        .range([margin.horizontal, width - margin.horizontal]);

    // 对数据的每一个维度，都创建一个相应的比例尺，并存放在scaleY中
    let scaleY = {}

    dimensions.forEach(function (d) {
        scaleY[d] = d3.scaleLinear()
            .domain([d3.min(data.map(e => e[d])), d3.max(data.map(e => e[d]))])
            .range([height - margin.vertical, margin.vertical])
    });

    // const betweenness = data.map(e => e['betweenness']);
    // const degree_centrality = data.map(e => e['degree_centrality']);
    // const pagerank = data.map(e => e['pagerank']);
    // get min and max

    // let test = [];
    // dimensions.forEach(function (d) {
    //     test.push(d3.min(data.map(e => e[d])));
    //     test.push(d3.max(data.map(e => e[d])));
    // });
    // console.log(test)

    // 创建一个折线路径生成器
    let lineGenerator = d3.line();

    // 绘制折线
    group
        .append("g")
        .selectAll() // 绑定数据并创建path元素
        .data(data)
        .enter()
        .append("path")
        .attr("d", d => lineGenerator(  // 利用刚才定义的路径生成器pathGenerator设置path的d属性
            dimensions.map(function (p) {
                return [scaleX(p), scaleY[p](d[p])];
                // return [scaleX(p), scaleY[p](0.000007)];
            })
        ))
        .attr("fill", "none")
        .attr("class", d => d['type']) // 将每条折线的class设为其对应的品种
        .attr("stroke", d => colorScale(d['type']))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.5)

        .on("mouseover", function (event, d) { // 修改这部分，添加对 tooltip 的操作
            d3.select(this).attr('stroke-width', 5).attr('opacity', 1);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(d.type) // 显示线段名称
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function () { // 还原折线，隐藏 tooltip
            d3.select(this).transition().attr('stroke-width', 1.5).attr('opacity', 0.5);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // 各个坐标轴的容器，每一个与一个dimension绑定
    let Ys = group
        .selectAll(".dimension")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "dimension")
        .attr("transform", d => `translate(${scaleX(d)},0)`);

    // 绘制各轴
    Ys.append("g")
        .each(function (d) {
            d3.select(this).call(d3.axisLeft(scaleY[d]));
        });

    // 为各轴注明属性名称
    Ys.append("text")
        .attr("x", -30) // 稍作移动以对齐
        .attr("y", 30)
        .text(d => { return d })
        .attr("font-size", 11);

    // 一个小trick，效果相当于给刻度文字加上白色描边，让显示更清晰
    Ys.selectAll("text")
        .clone(true)
        .lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white");

    // 移动group内所有元素，空出留白
    group.attr("transform", `translate(${0.5 * 20}, ${20})`);


    // 记录图例被点击的状态
    let flag = { 'Domain': true, 'IP': true, 'Cert': true, 'Whois_Name': true, 'Whois_Phone': true, 'Whois_Email': true, 'IP_C': true, 'ASN': true };

    // 鸢尾花的三种种类，用来绑定给图例
    let type = ["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"];

    // // 绘制图例前的圆形图标
    // legend.selectAll(".circles")
    //     .data(type)
    //     .enter()
    //     .append("circle")
    //     .attr("fill", d => colorScale(d))
    //     .attr('cx', 6)
    //     .attr('cy', (d, i) => i * 25 + 30)
    //     .attr('r', 4)

    //     .on("mouseover", function (event, d) { // 第一个参数是事件对象，第二个是绑定的数据
    //         d3.select(this).transition().attr('stroke-width', 5).attr('opacity', 1);
    //     })

    //     .on("mouseout", function () { // 还原
    //         d3.select(this).transition().attr('r', 4)

    //     })
    //     .on("click", function (event, d) { // 点击图标，隐藏或显示对应品种类别的折线
    //         if (flag[d]) { // 若该类别未被隐藏，隐藏
    //             d3.select(this).attr('fill', 'lightgrey') // 把图标变为灰色
    //             d3.selectAll(`.${d}`).attr('stroke', 'lightgrey') // 把对应折线变为灰色
    //             flag[d] = !flag[d] // 更新状态
    //         }
    //         else { // 若该类别已被隐藏，还原
    //             d3.select(this).attr('fill', e => colorScale(e))
    //             d3.selectAll(`.${d}`).attr('stroke', e => colorScale(e.type))
    //             flag[d] = !flag[d]
    //         }
    //     });

    // // 绘制图例中的文字
    // legend.selectAll(".texts")
    //     .data(type)
    //     .enter()
    //     .append("text")
    //     .attr('x', 30)
    //     .attr('y', (d, i) => i * 25 + 35)
    //     .text(d => d)
    //     .attr("font-size", 11);

    // // 将图例移动到合适位置
    // legend.attr('transform', `translate(${width - 1.5 * margin},${margin})`);

}

//************************sankey ************/
function Sankey() {
    // width and height are set in css
    const width = grid.sankey.width;
    const height = grid.sankey.height;

    const data = params.links_csv;

    // clear
    d3.select("#sankey").selectAll("*").remove();
    // 创建 SVG 元素
    const svg = d3.select("#sankey")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, -10, width, height])
        .attr("style", "max-width: 100%; height: auto;");


    var margin_sankey = { top: 30, right: 10, bottom: 0, left: 10 };
    // 计算实际画布的宽度和高度
    var innerWidth = width - margin_sankey.left - margin_sankey.right;
    var innerHeight = height - margin_sankey.top - margin_sankey.bottom;

    svg.append("g")
        .attr("transform", "translate(" + margin_sankey.left + "," + margin_sankey.top + ")");

    // 定义数据
    var categories = ["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"];
    var connections = [
        { source: "Domain", target: "IP", edge: "r_dns_a", weights: 0 },
        { source: "Domain", target: "Cert", edge: "r_cert", weights: 0 },
        { source: "Domain", target: "Whois_Name", edge: "r_whois_name", weights: 0 },
        { source: "Domain", target: "Whois_Phone", edge: "r_whois_phone", weights: 0 },
        { source: "Domain", target: "Whois_Email", edge: "r_whois_email", weights: 0 }
    ];

    // 遍历CSV数据
    data.forEach(function (d) {
        var edgeType = d.relation; // 获取边的类型，即第一列的值

        // 在connections中查找匹配的连接
        var matchingConnectionIndex = connections.findIndex(function (connection) {
            return connection.edge === edgeType;
        });

        // 如果找到匹配的连接，则修改其相应的weights值
        if (matchingConnectionIndex !== -1) {
            connections[matchingConnectionIndex].weights++;
        }
    });

    // 计算总的weights值
    var totalWeight = 0;
    connections.forEach(function (connection) {
        totalWeight += connection.weights;
    });

    // 更新connections中的每个对象的weights值
    connections.forEach(function (connection) {
        connection.weights = connection.weights / totalWeight;
    });

    // 创建桑基图布局
    var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([innerWidth, innerHeight]);

    // 通过调用sankey函数将数据转换为适用于桑基图的格式
    var graph = sankey({
        nodes: categories.map(function (category) {
            return { name: category };
        }),
        links: connections.map(function (connection) {
            return {
                source: categories.indexOf(connection.source),
                target: categories.indexOf(connection.target),
                value: connection.weights
            };
        })
    });


    // 定义节点颜色比例尺，根据节点的类型分配不同的颜色
    var colorScale = d3.scaleOrdinal(d3.schemeTableau10.slice(1))
        .domain(['Domain', 'IP', 'Cert', 'Whois_Name', 'Whois_Phone', 'Whois_Email', 'IP_C', 'ASN']);

    // 创建节点颜色映射表
    var nodeColorMap = {};
    graph.nodes.forEach(function (node) {
        nodeColorMap[node.name] = colorScale(node.name);
    });

    // 绘制连接线
    svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", function (d) {
            return nodeColorMap[d.target.name];
        })
        .attr("stroke-opacity", 0.2)
        .attr("fill", "none")
        .attr("stroke-width", function (d) {
            return Math.max(1, d.width);
        });

    // 绘制节点
    var nodes = svg.append("g")
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return d.x0;
        })
        .attr("y", function (d) {
            return d.y0;
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("width", function (d) {
            return d.x1 - d.x0;
        })
        .attr("fill", function (d) {
            return colorScale(d.name);
        });

    // 添加节点标签
    svg.append("g")
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .attr("x", function (d) {
            return d.x0 - 6;
        })
        .attr("y", function (d) {
            return (d.y1 + d.y0) / 2;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(function (d) {
            return d.name;
        })
        .style("font-size", "12px")
        .attr("transform", function (d) {
            if (d.name === 'Domain') {
                let x = d.x0 - 6;
                let y = (d.y1 + d.y0) / 2;
                let deltaX = 20; // replace with your value
                let deltaY = 12; // replace with your value
                return `rotate(-90, ${x}, ${y}) translate(${deltaX}, ${deltaY})`;
            }
            return "";
        });

}

export { Histogram, Firecord, Parallel, Sankey }
