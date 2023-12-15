import networkx as nx
import os
import pandas as pd
import random
import numpy as np

import importlib

rules = importlib.import_module("utils.global_rules")
importlib.reload(rules)
rules = rules.rules

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
    Link["weight"] = Link["relation"].apply(lambda x: rules["link_priority"][x])

    G = nx.Graph()

    nodes = Node.apply(
        lambda x: (
            x["id"],
            {
                "name": x["name"],
                "type": x["type"],
                "is_core": None,
                "industry": x["industry"] if x["type"] == "Domain" else None,
                "priority": 4
                if x["type"] == "Domain" and x["industry"] != "[]"
                else rules["node_priority"][x["type"]],
            },
        ),
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
    print("Undirected graph loaded.")

    return G


def get_subgraph(G: nx.Graph, start_nodes: list, Jump_limit: dict):
    result = set()
    for node in start_nodes:
        jump_limit = Jump_limit[G.nodes[node]["priority"]]
        edges = G.edges(node, data=True)
        for edge in edges:
            weight = edge[2]["weight"]
            limit = jump_limit[weight]
            if limit == 0:
                continue
            else:
                edges_dfs = nx.dfs_edges(G, source=edge[1], depth_limit=limit)
                result.update(edges_dfs)
    subgraph = G.edge_subgraph(result).copy()
    print("#nodes in subgraph: ", subgraph.number_of_nodes())
    print("#edges in subgraph: ", subgraph.number_of_edges())

    return subgraph


# def get_subgraph(G: nx.Graph, start_nodes, limit=3):
#     visited = set()
#     stack = [(node, 0) for node in start_nodes]

#     while stack:
#         node, depth = stack.pop()
#         if node not in visited and depth <= limit:
#             visited.add(node)
#             for neighbor, edge_data in G[node].items():
#                 weight = edge_data["weight"]
#                 if weight == 1:
#                     stack.append((neighbor, depth + 2))
#                 else:
#                     stack.append((neighbor, depth + 1))

#     return G.subgraph(visited).copy()


def set_core(G, link_priority=rules["link_priority"]):
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
        if num_weak_link / len(G.nodes[node]) < 0.5:
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
    G_org: nx.Graph,
    countThreshold=100,
    countKeepPercent=0.6,
    pagerankQuantile=0.9,
    degreeQuantile=0.9,
    degreeCentralityQuantile=0.9,
    emptyIndustryPercentThreshold=0.5,
    scaleThreshold=400,
    verbose=False,
):
    def validate_node_industry(node):
        if G.nodes[node]["type"] == "Domain":
            try:
                industry = G.nodes[node]["industry"]
                if industry == "[]":
                    return False
                else:
                    return True
            except:
                return False
        return False

    def remove_nodes(nodes_to_remove):
        # remove nodes
        G.remove_nodes_from(list(nodes_to_remove))
        if verbose:
            print(
                "Nodes removed: ", len(nodes_to_remove), "Nodes left: ", len(G.nodes())
            )

    def myprint(*args):
        if verbose:
            print(*args)

    G = G_org.copy()
    random.seed(42)

    myprint("Filtering subgraph...")

    myprint("Removing nodes by count...")
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

    remove_nodes(nodes_to_remove)

    # remove nodes according to pagerank quantile and degree centrality
    myprint("Removing nodes by pagerank quantile and degree centrality...")
    pr = nx.pagerank(G)
    # compute quantile
    pr_quantile = np.quantile(list(pr.values()), pagerankQuantile)
    # sorted_pr = sorted(pr.items(), key=lambda x: x[1])
    dc = nx.degree_centrality(G)
    dc_quantile = np.quantile(list(dc.values()), degreeCentralityQuantile)
    nodes_to_remove = set()
    nodes_to_keep = set()
    for node in G.nodes():
        if node in nodes_to_keep:
            continue
        # count valid neighbors
        valid_neighbors = 0
        valid_neighbors_set = set()
        node_neighbors = G.neighbors(node)
        for neighbor in node_neighbors:
            if validate_node_industry(neighbor):
                valid_neighbors += 1
                valid_neighbors_set.add(neighbor)

        if (
            G.nodes[node]["type"] in ["IP", "Cert"]
            and valid_neighbors / (len(list(node_neighbors)) + 0.01)
            > emptyIndustryPercentThreshold
        ):
            # update nodes_to_keep
            nodes_to_keep.update(valid_neighbors_set)
            continue

        if pr[node] < pr_quantile and dc[node] < dc_quantile:
            nodes_to_remove.add(node)

    remove_nodes(nodes_to_remove)

    # # remove nodes till the graph is small enough
    # print("Removing nodes till the graph is small enough...")
    # pr = nx.pagerank(G)
    # pr_sorted = sorted(pr.items(), key=lambda x: x[1])
    # dc = nx.degree_centrality(G)
    # dc_quantile = np.quantile(list(dc.values()), degreeCentralityQuantile)
    # G_len = len(G.nodes())
    # nodes_to_remove = set()
    # for node, _ in pr_sorted:
    #     if dc[node] < dc_quantile:
    #         remove = True
    #         count = 0
    #         for neighbor in G.neighbors(node):
    #             if dc[neighbor] >= dc_quantile:
    #                 count += 1
    #                 break
    #         if count >= 2:
    #             remove = False
    #         if remove:
    #             nodes_to_remove.add(node)
    #             break

    #     if G_len - len(nodes_to_remove) <= scaleThreshold:
    #         break

    # remove_nodes(nodes_to_remove)

    # Keep the max connected component
    myprint("Keeping the max connected component...")
    G = G.subgraph(max(nx.connected_components(G), key=len)).copy()

    # remove nodes with empty industry and low degree
    myprint("Removing nodes with empty industry and low degree...")
    degree_quantile = np.quantile(list(dict(G.degree()).values()), degreeQuantile)
    myprint("Degree quantile: ", degree_quantile)
    nodes_to_remove = set()
    for node in G.nodes():
        if not validate_node_industry(node) and G.degree(node) <= degree_quantile:
            # if any neighbor have degree > degree_quantile, keep this node
            keep = False
            count = 0
            for neighbor in G.neighbors(node):
                if G.degree(neighbor) > degree_quantile:
                    count += 1
            if count >= 2:
                keep = True
            if not keep:
                nodes_to_remove.add(node)

    remove_nodes(nodes_to_remove)

    # Keep the max connected component
    myprint("Keeping the max connected component...")
    G = G.subgraph(max(nx.connected_components(G), key=len)).copy()
    print("Nodes left: ", len(G.nodes()))
    print("Edges left: ", len(G.edges()))

    # count nodes with non-empty industry
    count = 0
    count_domain = 0
    for node in G.nodes():
        if G.nodes[node]["type"] == "Domain":
            count_domain += 1
            if G.nodes[node]["industry"] != "[]":
                count += 1
    print("Nodes with non-empty industry: %d / %d" % (count, count_domain))

    # compute betweenness centrality and pagerank again, add as attributes
    bc = nx.betweenness_centrality(G)
    dc = nx.degree_centrality(G)
    pr = nx.pagerank(G)
    nx.set_node_attributes(G, bc, "betweenness")
    nx.set_node_attributes(G, dc, "degree_centrality")
    nx.set_node_attributes(G, pr, "pagerank")

    return G
