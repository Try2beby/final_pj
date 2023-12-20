
var svg2 = d3.select("#svg_parallel"),
width = +svg2.attr("width"),
height = +svg2.attr("height");

// 在 body 元素中添加 tooltip 的容器
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #ddd")
    .style("pointer-events", "none"); // 确保 tooltip 不会捕获事件

let margin=80;

 // 在svg下添加组group，用来包含平行坐标图
 let group = svg2.append("g");

 // 在svg下添加组legend，用来包含图例
 let legend = svg2.append("g");

 // 假设你已经加载了d3.js库和数据nodes.csv

// 使用d3.csv()方法读取CSV文件
d3.csv("nodes.csv").then(rawdata => {
    // 提取所需的列数据
    const data = rawdata.map(d => ({
      type: d.type,
      betweenness: +d.betweenness,
      degree_centrality: +d.degree_centrality,
      pagerank: +d.pagerank
    }));
  
    // 在控制台打印筛选后的数据
    console.log(data);


     // ******************** 绘制平行坐标图 ********************

     // 获取各数据维度名称
     let dimensions = ['betweenness','degree_centrality','pagerank'];
     console.log(dimensions)

     // 创建颜色比例尺，每种鸢尾花对应一种颜色
     let colorScale = d3.scaleOrdinal()
     .domain(["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"])
     .range(["#1877e7", '#fcdd1d', '#cb76ca', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']);

     // 创建一个辅助用的横轴比例尺，用来确定实际每条纵轴的位置
     let scaleX = d3.scalePoint()
         .domain(dimensions)
         .range([0, width - 2 * margin]);

     // 对数据的每一个维度，都创建一个相应的比例尺，并存放在scaleY中
     let scaleY = {}

     dimensions.forEach(function (d) {
         scaleY[d] = d3.scaleLinear()
             .domain([d3.min(data.map(e => e[d])), d3.max(data.map(e => e[d]))])
             .range([height - 2 * margin, 0])
     });

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
             })
         ))
         .attr("fill", "none")
         .attr("class", d => d['type']) // 将每条折线的class设为其对应的品种
         .attr("stroke", d => colorScale(d['type']))
         .attr("stroke-width", 1.5)
         .attr("opacity", 0.5)

         .on("mouseover", function(event, d) { // 修改这部分，添加对 tooltip 的操作
            d3.select(this).attr('stroke-width', 5).attr('opacity', 1);

            tooltip.transition()
                   .duration(200)
                   .style("opacity", 0.9);
            tooltip.html(d.type) // 显示线段名称
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() { // 还原折线，隐藏 tooltip
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
     .attr("x", -0.05 * width) // 稍作移动以对齐
     .attr("y", -0.03 * height)
     .text(d => { return d.slice(0, -2)})
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
     group.attr("transform", `translate(${0.5*margin}, ${margin})`);



     // ******************** 绘制图例 ********************

     // 记录图例被点击的状态
     let flag = { 'Domain': true, 'IP': true, 'Cert': true, 'Whois_Name': true, 'Whois_Phone': true, 'Whois_Email': true, 'IP_C': true, 'ASN': true };

     // 鸢尾花的三种种类，用来绑定给图例
     let type = ["Domain", "IP", "Cert", "Whois_Name", "Whois_Phone", "Whois_Email", "IP_C", "ASN"];

     // 绘制图例前的圆形图标
     legend.selectAll(".circles")
         .data(type)
         .enter()
         .append("circle")
         .attr("fill", d => colorScale(d))
         .attr('cx', 6)
         .attr('cy', (d, i) => i * 25 + 30)
         .attr('r', 4)

        .on("mouseover", function (event, d) { // 第一个参数是事件对象，第二个是绑定的数据
            d3.select(this).transition().attr('stroke-width', 5).attr('opacity', 1);
        })

         .on("mouseout", function () { // 还原
             d3.select(this).transition().attr('r', 4)

         })
         .on("click", function (event, d) { // 点击图标，隐藏或显示对应品种类别的折线
             if (flag[d]) { // 若该类别未被隐藏，隐藏
                 d3.select(this).attr('fill', 'lightgrey') // 把图标变为灰色
                 d3.selectAll(`.${d}`).attr('stroke', 'lightgrey') // 把对应折线变为灰色
                 flag[d] = !flag[d] // 更新状态
             }
             else { // 若该类别已被隐藏，还原
                 d3.select(this).attr('fill', e => colorScale(e))
                 d3.selectAll(`.${d}`).attr('stroke', e => colorScale(e.type))
                 flag[d] = !flag[d]
             }
         });

     // 绘制图例中的文字
     legend.selectAll(".texts")
         .data(type)
         .enter()
         .append("text")
         .attr('x', 30)
         .attr('y', (d, i) => i * 25 + 35)
         .text(d => d)
         .attr("font-size", 11);

     // 将图例移动到合适位置
     legend.attr('transform', `translate(${width-1.5*margin},${margin})`);
 })
