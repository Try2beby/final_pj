import networkx as nx
import os
import pandas as pd
import random
from utils.global_rules import rules


dataDir = "../data/"
cacheDir = "../data/cache/"


def get_graph():
    print("Loading graph...")

    # read data
    Node = pd.read_csv(os.path.join(dataDir, "Node.csv"))
    Link = pd.read_csv(os.path.join(dataDir, "Link.csv"))

    print("Initial Node shape: ", Node.shape)
    print("Initial Link shape: ", Link.shape)

    # drop nan
    Node = Node.dropna()
    Link = Link.dropna()

    # drop duplicates
    Node = Node.drop_duplicates(subset=["id"])
    Link = Link.drop_duplicates()

    print("After drop nan and duplicates:")
    print("Node shape: ", Node.shape)
    print("Link shape: ", Link.shape)

    
    # add weights to links according to relation and rules
    # link_weight = (5-rules[link_priority][Link["relation"]])/5
    Link["weight"] = Link["relation"].apply(lambda x: (5 - rules["link_priority"][x]) / 5)

    G = nx.Graph()
    
    nodes = Node.apply(
        lambda x: (x["id"], {"name": x["name"], "type": x["type"], "is_core": None}),
        axis=1,
    )
    # Add nodes with "name" and "type" as attributes
    G.add_nodes_from(nodes)

    edges = Link.apply(
        lambda x: (
            x["source"],
            x["target"],
            {"weight": x["weight"], "relation": x["relation"]},
        ),
        axis=1,
    )
    # Add edges with 'weight' and 'relation' as attributes
    G.add_edges_from(edges)

    # print loading info
    print("Graph loaded.")

    return G


def get_subgrah(G, start_nodes, link_priority=rules["link_priority"], limit=3):
    visited = set()
    stack = [(node, 0) for node in start_nodes]

    while stack:
        node, depth = stack.pop()
        if node not in visited and depth <= limit:
            visited.add(node)

            num_weak_link = 0
            num_ip = 0
            for neighbor, edge_data in G[node].items():
                relation = edge_data["relation"]
                if link_priority[relation] == 4:
                    num_weak_link += 1
                    stack.append((neighbor, depth + 2))
                else:
                    stack.append((neighbor, depth + 1))

                if G.nodes[neighbor]["type"] == "IP":
                    num_ip += 1

            # set is_core for node
            if num_weak_link / len(G[node]) < 0.5:
                if G.nodes[node]["type"] == "Domain":
                    if num_ip < 2:
                        G.nodes[node]["is_core"] = True
                    else:
                        G.nodes[node]["is_core"] = False
                else:
                    G.nodes[node]["is_core"] = True

    return G.subgraph(visited)


def filter_nodes(
    G, countThreshold=100, countKeepPercent=0.2, pagerankCountThreshold=1000
):
    """Filter nodes in G.
    1. For each node, classify its neighbors according to relation type and node type.
       if there are more than `countThreshold` neighbors with the same relation type and node type,
       randomly select `countKeepPercent` percent of them to keep.
    2. Keep nodes with pagerank higher than `pagerankThreshold` or with degree higher than the average degree.

    Args:
        G_org (nx.Graph): Graph to filter.
        countThreshold (int, optional): Threshold to classify neighbors. Defaults to 100.
        countKeepPercent (float, optional): Percent of neighbors to keep. Defaults to 0.2.
        pagerankThreshold (float, optional): Threshold of pagerank. Defaults to 0.001.
    """
    random.seed(0)

    print("Filtering nodes...")

    nodes_to_remove = set()
    print("Removing nodes by count...")
    for node in G.nodes():
        neighbors = G[node]
        d_count = {}
        for neighbor, edge_data in neighbors.items():
            relation = edge_data["relation"]
            neighbor_type = G.nodes[neighbor]["type"]
            d_count.setdefault((relation, neighbor_type), []).append(neighbor)

        for (relation, neighbor_type), nodes in d_count.items():
            if len(nodes) > countThreshold:
                # keep countKeepPercent nodes with highest degree
                keep_nodes = (
                    set(
                        sorted(nodes, key=lambda x: G.degree(x), reverse=True)[
                            : int(len(nodes) * countKeepPercent)
                        ]
                    )
                    - nodes_to_remove
                )

                for n in nodes:
                    if n not in keep_nodes:
                        nodes_to_remove.add(n)

    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # keep nodes with pagerank higher than threshold
    print("Removing nodes by pagerank...")
    pr = nx.pagerank(G)
    # add pagerank as attribute
    nx.set_node_attributes(G, pr, "pagerank")
    sorted_pr = sorted(pr.items(), key=lambda x: x[1], reverse=True)
    # get first #pagerankCountThreshold nodes with highest pagerank
    nodes_to_keep = set([node for node, _ in sorted_pr[:pagerankCountThreshold]])
    nodes_to_remove = set(G.nodes()) - nodes_to_keep
    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # # remove nodes with degree lower than average degree
    # print("Removing nodes by degree...")
    # avg_degree = sum(dict(G.degree()).values()) / len(G)
    # # get nodes with degree higher than average degree
    # nodes_to_keep = set(
    #     [node for node, degree in dict(G.degree()).items() if degree > avg_degree]
    # )
    # nodes_to_remove = set(G.nodes()) - nodes_to_keep
    # # remove nodes
    # G.remove_nodes_from(list(nodes_to_remove))
    # print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # remove isolated nodes
    G.remove_nodes_from(list(nx.isolates(G)))

    return G

def filter_nodes(
    G, countNeighborInterval = (7,30), pagerankCountThreshold=1000
):
    """Filter nodes in G.
    1. For each node, classify its neighbors according to relation type and node type.
       if there are more than `countThreshold` neighbors with the same relation type and node type,
       randomly select `countKeepPercent` percent of them to keep.
    2. Keep nodes with pagerank higher than `pagerankThreshold` or with degree higher than the average degree.

    Args:
        G_org (nx.Graph): Graph to filter.
        countThreshold (int, optional): Threshold to classify neighbors. Defaults to 100.
        countKeepPercent (float, optional): Percent of neighbors to keep. Defaults to 0.2.
        pagerankThreshold (float, optional): Threshold of pagerank. Defaults to 0.001.
    """
    random.seed(0)

    print("Filtering nodes...")

    nodes_to_remove = set()
    print("Removing nodes by count...")
    for node in G.nodes():
        neighbors = G[node]
        d_count = {}
        # for neighbor, edge_data in neighbors.items():
            

    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # keep nodes with pagerank higher than threshold
    print("Removing nodes by pagerank...")
    pr = nx.pagerank(G)
    # add pagerank as attribute
    nx.set_node_attributes(G, pr, "pagerank")
    sorted_pr = sorted(pr.items(), key=lambda x: x[1], reverse=True)
    # get first #pagerankCountThreshold nodes with highest pagerank
    nodes_to_keep = set([node for node, _ in sorted_pr[:pagerankCountThreshold]])
    nodes_to_remove = set(G.nodes()) - nodes_to_keep
    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # # remove nodes with degree lower than average degree
    # print("Removing nodes by degree...")
    # avg_degree = sum(dict(G.degree()).values()) / len(G)
    # # get nodes with degree higher than average degree
    # nodes_to_keep = set(
    #     [node for node, degree in dict(G.degree()).items() if degree > avg_degree]
    # )
    # nodes_to_remove = set(G.nodes()) - nodes_to_keep
    # # remove nodes
    # G.remove_nodes_from(list(nodes_to_remove))
    # print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # remove isolated nodes
    G.remove_nodes_from(list(nx.isolates(G)))

    return G


import plotly.graph_objects as go

def plot_graph(G, title=""):
    pos = nx.spring_layout(G)
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.append(x0)
        edge_x.append(x1)
        edge_x.append(None)
        edge_y.append(y0)
        edge_y.append(y1)
        edge_y.append(None)

    edge_trace = go.Scatter(
        x=edge_x,
        y=edge_y,
        line=dict(width=0.5, color="#888"),
        hoverinfo="none",
        mode="lines",
    )

    node_x = []
    node_y = []
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)

    node_trace = go.Scatter(
        x=node_x,
        y=node_y,
        mode="markers",
        hoverinfo="text",
        marker=dict(
            showscale=True,
            # colorscale options
            # 'Greys' | 'YlGnBu' | 'Greens' | 'YlOrRd' | 'Bluered' | 'RdBu'
            # 'Reds' | 'Blues' | 'Picnic' | 'Rainbow' | 'Portland' | 'Jet'
            # 'Hot' | 'Blackbody' | 'Earth' | 'Electric' | 'Viridis' |
            colorscale="YlGnBu",
            reversescale=True,
            color=[],
            size=10,
            colorbar=dict(
                thickness=15,
                title="Node Connections",
                xanchor="left",
                titleside="right",
            ),
            line_width=2,
        ),
    )

    node_adjacencies = []
    node_text = []
    for node, adjacencies in enumerate(G.adjacency()):
        node_adjacencies.append(len(adjacencies[1]))
        node_text.append(
            "# of connections: "
            + str(len(adjacencies[1]))
            + "<br>"
            + str(adjacencies[0])
        )

    node_trace.marker.color = node_adjacencies
    node_trace.text = node_text

    fig = go.Figure(
        data=[edge_trace, node_trace],
        layout=go.Layout(
            title=title,
            titlefont_size=16,
            showlegend=False,
            hovermode="closest",
            margin=dict(b=20, l=5, r=5, t=40),
            annotations=[
                dict(
                    text="",
                    showarrow=False,
                    xref="paper",
                    yref="paper",
                    x=0.005,
                    y=-0.002,
                )
            ],
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        ),
    )
    fig.show()