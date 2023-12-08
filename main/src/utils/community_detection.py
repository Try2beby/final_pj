import json
import os
import networkx as nx
from utils.global_rules import rules
import importlib
process = importlib.import_module("process")
importlib.reload(process)

cacheDir = "../data/cache/"
communityDir = "../data/communities/"

def get_communities(G):
    from networkx.algorithms.community import louvain_communities
    
    # Create a copy of the graph
    G_unweighted = G.copy()

    # Remove weights
    for u, v, d in G_unweighted.edges(data=True):
        d["weight"] = 1
    communities = louvain_communities(G_unweighted, seed=0)

    # save communities to file
    for i, community in enumerate(communities):
        print("community", i, ":", len(community), "nodes")
        with open(communityDir + "community" + str(i) + ".json", "w") as f:
            json.dump(list(community), f)

    return communities

def check_all_evidence_in_community(group: str):
    def check_evidence_in_community(file, community, evidence, community_with_evidence):
        if evidence in community:
            print(file, "contains", evidence)
            print("length of community:", len(community))
            community_with_evidence.update(community)
        return community_with_evidence

    print("checking evidence for group", group)

    test_evidence = rules["evidence"][group]

    # list all files in the directory
    # print current directory
    # print("current directory:", os.getcwd())
    files = sorted(os.listdir(communityDir))

    community_with_evidence = set()
    for file in files:
        # open file
        with open(communityDir + file, "r") as f:
            community = json.load(f)
            for evidence in test_evidence:
                community_with_evidence = check_evidence_in_community(
                    file, community, evidence, community_with_evidence
                )
    print("length of community with evidence:", len(community_with_evidence))
    print()

    return community_with_evidence


def get_community_for_all_groups(G):
    for group in rules["evidence"]:
        community_with_evidence = check_all_evidence_in_community(group)
        subgraph = G.subgraph(community_with_evidence)
        # write subgraph to json file
        data = nx.readwrite.json_graph.node_link_data(subgraph)
        with open(os.path.join(cacheDir, "group_" + group + ".json"), "w") as f:
            json.dump(data, f)
            
# if __name__ == "__main__":
#     get_communities(G)
#     get_community_for_all_groups(G)