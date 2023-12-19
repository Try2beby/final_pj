

// 创建SVG画布
var svg_sankey = d3.select("#svg_sankey");
var width = +svg_sankey.attr("width");
var height = +svg_sankey.attr("height");

var margin_sankey = { top: 50, right: 50, bottom: 50, left: 50 };
// 计算实际画布的宽度和高度
var innerWidth = width - margin_sankey.left - margin_sankey.right;
var innerHeight = height - margin_sankey.top - margin_sankey.bottom;

svg_sankey.append("g")
    .attr("transform", "translate(" + margin_sankey.left + "," + margin_sankey.top + ")");

// 定义数据
var categories = ["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"];
var connections = [
  { source: "Domain", target: "IP", edge: "r_dns_a", weight: 0 },
  { source: "Domain", target: "Cert", edge: "r_cert", weight: 0 },
  { source: "Domain", target: "Whois_Name", edge: "r_whois_name", weight: 0 },
  { source: "Domain", target: "Whois_Phone", edge: "r_whois_phone", weight: 0 },
  { source: "Domain", target: "Whois_Email", edge: "r_whois_email", weight: 0 }
];

d3.csv("links.csv").then(function(data) {
  // 遍历CSV数据
  data.forEach(function(d) {
    var edgeType = d.relation; // 获取边的类型，即第一列的值

    // 在connections中查找匹配的连接
    var matchingConnectionIndex = connections.findIndex(function(connection) {
      return connection.edge === edgeType;
    });

    // 如果找到匹配的连接，则修改其相应的weight值
    if (matchingConnectionIndex !== -1) {
      connections[matchingConnectionIndex].weight++;
    }
  });

  // 计算总的weight值
  var totalWeight = 0;
  connections.forEach(function(connection) {
    totalWeight += connection.weight;
  });

  // 更新connections中的每个对象的weight值
  connections.forEach(function(connection) {
    connection.weight = connection.weight / totalWeight;
  });

  // 创建桑基图布局
  var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([innerWidth, innerHeight]);

  // 通过调用sankey函数将数据转换为适用于桑基图的格式
  var graph = sankey({
    nodes: categories.map(function(category) {
      return { name: category };
    }),
    links: connections.map(function(connection) {
      return {
        source: categories.indexOf(connection.source),
        target: categories.indexOf(connection.target),
        value: connection.weight
      };
    })
  });

  // 创建颜色比例尺，使用与节点名称相对应的颜色
  var colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(["#1877e7", '#fcdd1d', '#cb76ca', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']);

  // 绘制连接线
  svg_sankey.append("g")
    .selectAll("path")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2)
    .attr("fill", "none")
    .attr("stroke-width", function(d) {
      return Math.max(1, d.width);
    });

  // 绘制节点
  var nodes = svg_sankey.append("g")
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return d.x0;
    })
    .attr("y", function(d) {
      return d.y0;
    })
    .attr("height", function(d) {
      return d.y1 - d.y0;
    })
    .attr("width", function(d) {
      return d.x1 - d.x0;
    })
    .attr("fill", function(d) {
      return colorScale(d.name);
    });

  // 添加节点标签
  svg_sankey.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .enter()
    .append("text")
    .attr("x", function(d) {
      return d.x0 - 6;
    })
    .attr("y", function(d) {
      return (d.y1 + d.y0) / 2;
    })
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(function(d) {
      return d.name;
    })
    .style("font-size", "12px");
});