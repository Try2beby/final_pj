import networkx as nx
import json

answerDir = "../data/answer/"
subgraphDir = "../data/subgraph/"


def find_key_path(group_str: str):
    def compute_score_for_node(graph):
        # for each node: score = pagerank + degree centrality + betweenness centrality
        # get all value in rhs from the node's attribute
        for node in graph.nodes:
            graph.nodes[node]["score"] = (
                graph.nodes[node]["pagerank"]
                + graph.nodes[node]["degree_centrality"]
                + graph.nodes[node]["betweenness"]
            )

        return

    def find_key_path_for_pair(graph, node1, node2):
        # find all path between node1 and node2
        all_path = nx.all_simple_paths(graph, node1, node2)
        # filter the path with length <= 4
        # all_path = filter(lambda x: len(x) <= 4, all_path)
        all_path_length = list(map(lambda x: len(x), all_path))
        print("#path: ", len(list(all_path)))
        all_path_weight = []
        for path in all_path:
            # find the key path in the path
            total_weight = 0
            for link in path:
                total_weight += graph.edges[link]["weight"]
            all_path_weight.append(total_weight)

        # normalize the weight as x-min/(max-min)
        all_path_weight = list(
            map(
                lambda x: (x - min(all_path_weight))
                / (max(all_path_weight) - min(all_path_weight)),
                all_path_weight,
            )
        )

        # normalize the length as max-x/(max-min)
        all_path_length = list(
            map(
                lambda x: (max(all_path_length) - x)
                / (max(all_path_length) - min(all_path_length)),
                all_path_length,
            )
        )

        # compute the score for each path
        all_path_score = list(map(lambda x, y: x + y, all_path_weight, all_path_length))

        # sort the path by score
        all_path = list(zip(all_path, all_path_score))
        all_path = sorted(all_path, key=lambda x: x[1], reverse=True)
        print(all_path)

        return

    print("find key path for group: ", group_str)
    # read the group
    graph = nx.readwrite.json_graph.node_link_graph(
        json.load(open(subgraphDir + "group_" + group_str + ".json"))
    )
    # print graph info
    print("#nodes: ", graph.number_of_nodes())
    print("#edges: ", graph.number_of_edges())

    compute_score_for_node(graph)

    # get nodes with top 10 score
    top_nodes = sorted(
        graph.nodes(data=True), key=lambda x: x[1]["score"], reverse=True
    )[:10]

    # find all key path for each pair of top nodes
    # find_key_path_for_pair(graph, top_nodes[0][0], top_nodes[1][0])
    key_path = {}
    for i in range(len(top_nodes)):
        for j in range(i + 1, len(top_nodes)):
            path = nx.shortest_path(
                graph, top_nodes[i][0], top_nodes[j][0], weight="weight"
            )
            key_path[str((top_nodes[i][0], top_nodes[j][0]))] = (
                path if len(path) <= 4 else []
            )

    # write top_nodes to file
    json.dump(
        top_nodes,
        open(answerDir + group_str + "/top_nodes.json", "w"),
        indent=4,
    )

    # write key_path to file
    json.dump(
        key_path,
        open(answerDir + group_str + "/key_path.json", "w"),
        indent=4,
    )


def find_key_path_for_all_groups(group_to_analyze):
    for group in group_to_analyze:
        find_key_path(group)


def find_key_path_for_node_list(graph, node_list):
    key_path_list = []
    if len(node_list) < 2:
        return key_path_list
    for i in range(len(node_list)):
        for j in range(i + 1, len(node_list)):
            path = nx.shortest_path(
                graph, node_list[i][0], node_list[j][0], weight="weight"
            )
            key_path_list[str((node_list[i][0], node_list[j][0]))] = (
                path if len(path) <= 4 else []
            )
    return key_path_list
