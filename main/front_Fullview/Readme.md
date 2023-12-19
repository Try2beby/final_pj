## 辅助视图部分 by CPY

### 直方图 indus_sum.js
内容：针对每个子图，展示该团伙的业务范围和分布。

做图流程：使用group_#number.json数据，统计数据中的nodes.industry信息。具体先将nodes.industry转换成Array型变量，再对其进行操作。

### 桑基图和烟花弦图
都只统计了由Domain到其余类型节点的情况。
（数据中还有由Domain到Domain, IP到IP_C之类的，这种节点流向没有统计。因为参考的那个一等奖的视频没有统计。。。如果需要统计的话再跟我说，我加上去）

### 桑基图 sankey.js
内容：统计节点的流量（即，由Source节点流向Target节点）情况，由此可以考察...

做图流程：使用每个子图的links.csv数据，根据relation提取节点流向的情况。（不能通过提取Source和Target的"_"前的信息来做，因为Whois_..._共有三类节点）


### 烟花弦图 fire_cord.js
内容：类似桑基图，展示节点流量情况；相比桑基图，我个人认为烟花弦图可以更好地展示比例（类似饼图）

### 平行坐标图
内容：展示节点的betweenness，度中心性和pagerank值，可以由此确定重要节点

做图流程：使用每个子图的nodes.csv数据。
