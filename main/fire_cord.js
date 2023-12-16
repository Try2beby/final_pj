
// 创建SVG画布
var svg_fire = d3.select("#svg_fire");
var width = +svg_fire.attr("width");
var height = +svg_fire.attr("height");


var margin_fire = { top:20, right: 20, bottom: 20, left: 20 };
// 计算实际画布的宽度和高度
var innerWidth = width - margin_fire.left - margin_fire.right;
var innerHeight = height - margin_fire.top - margin_fire.bottom;
var radius = Math.min(innerWidth, innerHeight) / 2;
var center_x = width / 2; // 画布的中心点 x 坐标
var center_y = height / 2; // 画布的中心点 y 坐标

svg_fire
  .append("g")
  .attr("transform", "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")");


// 定义数据
var categories = ["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"];
var connections = [
    { source: "Domain", target: "IP", edge: "r_dns_a", weight: 0 },
    { source: "Domain", target: "Cert", edge: "r_cert", weight: 0},
    { source: "Domain", target: "Whois_Name", edge: "r_whois_name", weight: 0},
    { source: "Domain", target: "Whois_Phone", edge: "r_whois_phone", weight: 0 },
    { source: "Domain", target: "Whois_Email", edge: "r_whois_email", weight: 0 }
    // { source: "Domain", target: "IP_C", edge: "r_whois_phone", weight: 0 },
    // { source: "Domain", target: "ASN", edge: "r_whois_phone", weight: 0 },
];


d3.csv("Link.csv").then(function(data) {
    // 遍历CSV数据
  data.forEach(function(d) {
    var edgeType = d.relation; // 获取边的类型，即第一列的值
    //console.log(edgeType)

    // 在connections中查找匹配的连接
    var matchingConnectionIndex = connections.findIndex(function(connection){
        return connection.edge === edgeType;
      });
      //console.log(matchingConnectionIndex) 
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

console.log(connections);

// 创建弦生成器
var chord = d3.chord()
.padAngle(0.05)
.sortSubgroups(d3.descending);

// 根据数据生成弦矩阵
var matrix = [];
for (var i = 0; i < categories.length; i++) {
matrix[i] = [];
for (var j = 0; j < categories.length; j++) {
matrix[i][j] = 0;
}
}
connections.forEach(function (d) {
matrix[categories.indexOf(d.source)][categories.indexOf(d.target)] = d.weight;
});

// 根据弦矩阵生成布局数据
var chords = chord(matrix);

// 创建颜色比例尺
var colorScale = d3.scaleOrdinal()
.domain(connections.map(function(d) { return d.source + "-" + d.target; }))
.range([ "blue", "green", "red", "orange", "purple", "cyan", "magenta", "yellow"]);

// 绘制弦
svg_fire.append("g")
.selectAll("path")
.data(chords)
.enter()
.append("path")
.attr("d", d3.ribbon().radius(radius))
.style("fill", function (d) {
return colorScale(categories[d.source.index] + "-" + categories[d.target.index]);
})
.style("opacity", 0.7)
.style("stroke", function (d) {
return colorScale(categories[d.source.index] + "-" + categories[d.target.index]);
});

// ...

// 绘制类别标签
svg_fire.append("g")
.selectAll("text")
.data(chords.groups)
.enter()
.append("text")
.attr("x", function (d) {
return radius * Math.cos((d.startAngle + d.endAngle) / 2);
})
.attr("y", function (d) {
return radius * Math.sin((d.startAngle + d.endAngle) / 2);
})
.attr("dy", "0.35em")
.text(function (d) {
return categories[d.index];
})
.style("text-anchor", function (d) {
return ((d.startAngle + d.endAngle) / 2 > Math.PI) ? "end" : "start";
});

svg_fire.attr("width", width)
    .attr("height", height)
    .style("display", "block")
    .style("margin", "auto");

});