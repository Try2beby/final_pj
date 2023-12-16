
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
  

// 假设您已经在indus_sum.js文件中引入了d3.js库

d3.json("group_1.json").then(function(data) {
    // 在这里进行统计操作
    var i = 0;
    data.nodes.forEach(function(node) {

        //console.log("i:",i);
        //console.log("node.industry:",node.industry);
      if (node.industry !== null && node.industry !== "[]") {
        var industryArray = node.industry.match(/'([^']+)'/g);
        industryArray = industryArray.map(function(item) {
        return item.replace(/'/g, '');
        });

        // 遍历 industryArray 提取字符
        industryArray.forEach(function(ind) {
            //console.log(ind);
        });
        if (industryArray.length!==0){
           // console.log("i:",i);
           // console.log("industryArray:",industryArray);
            for(var j = 0; j < industryArray.length; j++){
                for(var k = 0; k < industry_count.length; k++ ){
                  //  console.log("k:",k)
                    //console.log("industry_count[k].industry:",industry_count[k].industry)
                  //  console.log("industryArray[j]:",industryArray[j])
                    if( industry_count[k].industry=== industryArray[j] ){
                        industry_count[k].value++;
                    //    console.log("industry_count[k].industry:",industry_count[k].industry,"industry_count[k]value:",industry_count[k].value)
                    }
                }
            }
        }

      }
      i++;
    });
 
    industry_count[0].industry = "涉黄";
    industry_count[1].industry = "涉毒";
    industry_count[2].industry = "诈骗";
    industry_count[3].industry = "涉枪";
    industry_count[4].industry = "黑客";
    industry_count[5].industry = "非法交易";
    industry_count[6].industry = "非法支付";
    industry_count[7].industry = "其他";
    console.log(industry_count)
  // 创建 SVG 元素
var svg_hist = d3.select("#svg_hist"); // 使用 id 选择器选择特定的 <svg> 元素
var width = +svg_hist.attr("width");
var height = +svg_hist.attr("height");
  
  // 定义柱状图的尺寸和边距
  var margin = { top: 20, right: 20, bottom: 30, left: 40 };
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;
  
 // 创建 x 比例尺
var xScale = d3
.scaleBand()
.domain(industry_count.map(function(d) { return d.industry; }))
.range([0, innerWidth])
.padding(0.1);
console.log(xScale)

// 创建 y 比例尺
var yScale = d3
.scaleLinear()
.domain([0, d3.max(industry_count, function(d) { return d.value; })])
.range([innerHeight, 0]);

// 创建柱状图容器
var g = svg_hist.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 绘制柱子
g.selectAll("rect")
.data(industry_count)
.enter()
.append("rect")
.attr("x", function(d) { return xScale(d.industry); })
.attr("y", function(d) { return yScale(d.value); })
.attr("width", xScale.step())
.attr("height", function(d) { return innerHeight - yScale(d.value); })
.attr("fill", "steelblue");

// 添加标签
g.selectAll(".label")
.data(industry_count)
.enter()
.append("text")
.attr("class", "label")
.attr("x", function(d) { return xScale(d.industry) + xScale.step() / 2; })
.attr("y", function(d) { return yScale(d.value) - 5; })
.attr("text-anchor", "middle")
.text(function(d) { return d.value; });

// 添加 x 轴
g.append("g")
.attr("transform", "translate(0," + innerHeight + ")")
.call(d3.axisBottom(xScale));

// 添加 y 轴
g.append("g")
.call(d3.axisLeft(yScale));

     });