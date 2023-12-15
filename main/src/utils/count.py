answerDir = "../data/answer/"

import pandas as pd


def count_type(group_str: str):
    def read_df(file):
        key = "type" if file == "/nodes.csv" else "relation"
        data = pd.read_csv(answerDir + group_str + file)
        df = pd.DataFrame(data[key].value_counts().sort_values(ascending=False)).T
        # change index column
        df.index = pd.Series([group_str])
        # change index column name to group
        df = df.rename_axis("group")
        # add total column
        df["total"] = df.sum(axis=1)
        # set dtype to int
        df = df.astype(int)
        total = data.shape[0]
        # print("total: ", total)
        # print(df)
        return df, total

    type_count_sorted, total_node = read_df("/nodes.csv")

    relation_count_sorted, total_link = read_df("/links.csv")

    return total_node, type_count_sorted, total_link, relation_count_sorted


def count_type_for_all_groups(group_to_analyze: list):
    # create a dataframe to store the result
    df = pd.DataFrame(columns=["group", "total_node", "total_link"])
    df = df.set_index("group")
    # Domain IP Cert Whois_Name Whois_Phone Whois_Email IP_C ASN
    df_node_type = pd.DataFrame(
        columns=[
            "group",
            "Domain",
            "IP",
            "Cert",
            "Whois_Name",
            "Whois_Phone",
            "Whois_Email",
            "IP_C",
            "ASN",
        ],
    )
    # set group as index
    df_node_type = df_node_type.set_index("group")
    # r_cert r_subdomain r_request_jump r_dns_a r_whois_name r_whois_email r_whois_phone r_cert_chain r_cname r_asn r_cidr
    df_link_type = pd.DataFrame(
        columns=[
            "group",
            "r_cert",
            "r_subdomain",
            "r_request_jump",
            "r_dns_a",
            "r_whois_name",
            "r_whois_email",
            "r_whois_phone",
            "r_cert_chain",
            "r_cname",
            "r_asn",
            "r_cidr",
        ],
    )
    df_link_type = df_link_type.set_index("group")

    for group in group_to_analyze:
        print("group: ", group)
        total_node, type_count_sorted, total_link, relation_count_sorted = count_type(
            group
        )
        df_node_type = pd.concat([df_node_type, type_count_sorted])
        df_link_type = pd.concat([df_link_type, relation_count_sorted])
        df.loc[group] = [total_node, total_link]

    # fill none with 0
    df_node_type = df_node_type.fillna(0)
    df_link_type = df_link_type.fillna(0)

    # write to csv
    df_node_type.to_csv(answerDir + "node_type.csv")
    df_link_type.to_csv(answerDir + "link_type.csv")
    df.to_csv(answerDir + "total.csv")

    return
