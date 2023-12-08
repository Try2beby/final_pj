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
        lambda x: (x["id"], {"name": x["name"], "type": x["type"], "is_core": None,"industry": x["industry"] if x["type"] == "Domain" else None}),
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


def get_subgraph(G, start_nodes, link_priority=rules["link_priority"], limit=3):
    visited = set()
    stack = [(node, 0) for node in start_nodes]

    while stack:
        node, depth = stack.pop()
        if node not in visited and depth <= limit:
            visited.add(node)
            for neighbor, edge_data in G[node].items():
                relation = edge_data["relation"]
                if link_priority[relation] == 4:
                    stack.append((neighbor, depth + 2))
                else:
                    stack.append((neighbor, depth + 1))

    return G.subgraph(visited).copy()

def set_core(G,link_priority=rules["link_priority"]):
    for node in G.nodes():
        num_weak_link = 0
        num_ip = 0
        for neighbor, edge_data in G[node].items():
            relation = edge_data["relation"]
            if link_priority[relation] == 4:
                num_weak_link += 1
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
        else:
            G.nodes[node]["is_core"] = False
    
    return G
        

def filter_subgraph(
    G_org, countThreshold=100, countKeepPercent=0.2, pagerankCountThreshold=300
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
    G = G_org.copy()

    print("Filtering nodes...")
    
    # remove nodes with empty industry
    print("Removing nodes with empty industry...")
    nodes_to_remove = set()
    for node in G.nodes():
        if G.nodes[node]["type"] == "Domain":
            try:
                industry = G.nodes[node]["industry"]
                if industry == "[]":
                    # print("Domain node with empty industry: ", node)
                    nodes_to_remove.add(node)
            except:
                # print("Domain node without industry: ", node)
                nodes_to_remove.add(node)
    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))


    print("Removing nodes by count...")
    nodes_to_remove = set()
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
                keep_nodes = (set(
                    sorted(nodes, key=lambda x: G.degree(x), reverse=True)[
                        : int(len(nodes) * countKeepPercent)
                    ])
                - nodes_to_remove)
                
                for n in nodes:
                    if n not in keep_nodes:
                        nodes_to_remove.add(n)

    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))

    # remove nodes according to pagerank and betweenness centrality
    print("Removing nodes by pagerank and betweenness centrality...")
    pr = nx.pagerank(G)
    sorted_pr = sorted(pr.items(), key=lambda x: x[1])
    print("len(sorted_pr): ", len(sorted_pr))
    G_dir = G.to_directed()
    bc = nx.edge_betweenness_centrality(G_dir)
    # print first element of bc
    # print("First element of bc: ", list(bc.items())[0])
    # compute average betweenness centrality
    bc_avg = sum(bc.values()) / len(bc)
    nodes_to_remove = set()
    # remove nodes with low pagerank, if the node have a link with bc higher than average, keep it
    # remove until the number of nodes left is equal to pagerankCountThreshold
    for node, pr in sorted_pr:
        if len(G.nodes()) - len(nodes_to_remove) <= pagerankCountThreshold:
            break
        # if all edge bc are lower than average, remove the node
        flag = True
        for edge in G_dir.edges(node):
            if bc[edge] > bc_avg:
                flag = False
                break
        if flag:
            nodes_to_remove.add(node)
        
    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))
    
    # keep nodes with is_core = True
    print("Keeping nodes with is_core = True...")
    nodes_to_remove = set()
    for node in G.nodes():
        if G.nodes[node]["is_core"] != True:
            nodes_to_remove.add(node)
    # remove nodes
    G.remove_nodes_from(list(nodes_to_remove))
    print("Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes()))
    
    
    # remove isolated nodes
    print("Removing isolated nodes...")
    G.remove_nodes_from(list(nx.isolates(G)))
    print("Nodes left: ", len(G.nodes()))
    
    # # Keep the max connected component
    # print("Keeping the max connected component...")
    # G = G.subgraph(max(nx.connected_components(G), key=len)).copy()
    # print("Nodes left: ", len(G.nodes()))
    
    
    # compute betweenness centrality and pagerank again, add as attributes
    bc = nx.betweenness_centrality(G)
    pr = nx.pagerank(G)
    nx.set_node_attributes(G, bc, "betweenness")
    nx.set_node_attributes(G, pr, "pagerank")

    return G

