node_priority = {
    "Domain": 1,  # 非常重要
    "IP": 1,
    "Cert": 1,
    "Whois_Name": 2,  # 重要
    "Whois_Phone": 2,
    "Whois_Email": 2,
    # 'IP_CIDR': 3,           # 一般
    "IP_C": 3,
    "ASN": 3,
}

link_priority = {
    "r_cert": 1,  # 很强
    "r_subdomain": 1,
    "r_request_jump": 1,
    "r_dns_a": 1,
    "r_whois_name": 2,  # 较强
    "r_whois_email": 2,
    "r_whois_phone": 2,
    "r_cert_chain": 3,  # 一般
    "r_cname": 3,
    "r_asn": 4,  # 较弱
    "r_cidr": 4,
}

jump_limit = {4: 1, 3: 2, 2: 3, 1: 4}

net_limit = {
    "small": {"node": 400, "edge": 800, "corelimit": 6, "filterbase": 20},
    "medium": {"node": 800, "edge": 1600, "corelimit": 10, "filterbase": 30},
    "large": {"node": 3000, "edge": 6000, "corelimit": 20, "filterbase": 70},
}

scale = {
    "1":"small",
    "2":"medium",
    "3":"medium",
    "4":"large",
    "5":"large",
}

evidence = {
    "1": [
        "Domain_c58c149eec59bb14b0c102a0f303d4c20366926b5c3206555d2937474124beb9",
        "Domain_f3554b666038baffa5814c319d3053ee2c2eb30d31d0ef509a1a463386b69845",
    ],
    "2": [
        "IP_400c19e584976ff2a35950659d4d148a3d146f1b71692468132b849b0eb8702c",
        "Domain_b10f98a9b53806ccd3a5ee45676c7c09366545c5b12aa96955cde3953e7ad058",
    ],
    "3": [
        "Domain_24acfd52f9ceb424d4a2643a832638ce1673b8689fa952d9010dd44949e6b1d9",
        "Domain_9c72287c3f9bb38cb0186acf37b7054442b75ac32324dfd245aed46a03026de1",
        "Domain_717aa5778731a1f4d6f0218dd3a27b114c839213b4af781427ac1e22dc9a7dea",
        "Domain_8748687a61811032f0ed1dcdb57e01efef9983a6d9c236b82997b07477e66177",
        "Whois_Phone_f4a84443fb72da27731660695dd00877e8ce25b264ec418504fface62cdcbbd7",
    ],
    "4": [
        "IP_7e730b193c2496fc908086e8c44fc2dbbf7766e599fabde86a4bcb6afdaad66e",
        "Cert_6724539e5c0851f37dcf91b7ac85cb35fcd9f8ba4df0107332c308aa53d63bdb",
    ],
    "5": [
        "Whois_Phone_fd0a3f6712ff520edae7e554cb6dfb4bdd2af1e4a97a39ed9357b31b6888b4af",
        "IP_21ce145cae6730a99300bf677b83bbe430cc0ec957047172e73659372f0031b8",
        "Domain_7939d01c5b99c39d2a0f2b418f6060b917804e60c15309811ef4059257c0818a",
        "Domain_587da0bac152713947db682a5443ef639e35f77a3b59e246e8a07c5eccae67e5",
    ],
}

rules = {
    "node_priority": node_priority,
    "link_priority": link_priority,
    "jump_limit": jump_limit,
    "net_limit": net_limit,
    "evidence": evidence,
    "scale": scale,
}
