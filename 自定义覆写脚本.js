
function main(config) {
    // =========================
    // 1. 基础配置
    // =========================

    const nodes = Array.isArray(config.proxies) ? config.proxies : [];

    const allNodeNames = [...new Set(
        nodes
            .map(node => node && node.name)
            .filter(Boolean)
    )];

    const testUrl = "https://www.gstatic.com/generate_204";
    const directTestUrl = "https://connect.rom.miui.com/generate_204";
    const interval = 120;

    // =========================
    // 2. 创建地区代理组
    // =========================

    const regionConfigs = [
        {
            name: "🇭🇰 香港",
            keywords: ["香港", "HK", "Hong Kong"]
        },
        {
            name: "🇯🇵 日本",
            keywords: ["日本", "JP", "Japan"]
        },
        {
            name: "🇸🇬 新加坡",
            keywords: ["新加坡", "SG", "Singapore"]
        },
        {
            name: "🇹🇼 台湾",
            keywords: ["台湾", "TW", "Taiwan"]
        },
        {
            name: "🇺🇸 美国",
            keywords: ["美国", "US", "United States"]
        }
    ];

    const regionGroups = [];
    const regionNames = [];

    for (const region of regionConfigs) {
        const matchedNodes = allNodeNames.filter(nodeName =>
            region.keywords.some(keyword =>
                nodeName.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        if (matchedNodes.length === 0) {
            continue;
        }

        regionGroups.push({
            name: region.name,
            type: "url-test",
            proxies: matchedNodes,
            url: testUrl,
            interval: interval
        });

        regionNames.push(region.name);
    }

    // =========================
    // 3. 创建直连组
    // =========================

    const directGroupName = "➡️直连";

    const directGroup = {
        name: directGroupName,
        type: "url-test",
        proxies: ["DIRECT"],
        url: directTestUrl,
        interval: interval
    };

    // =========================
    // 4. 创建自动选择组
    // =========================

    const autoGroupName = "⚡ 自动选择";

    const autoGroup = {
        name: autoGroupName,
        type: "url-test",
        proxies: [...allNodeNames],
        url: testUrl,
        interval: interval
    };

    // =========================
    // 5. 创建故障转移组
    // =========================

    const fallbackGroupName = "🛟 故障转移";

    const fallbackGroup = {
        name: fallbackGroupName,
        type: "fallback",
        proxies: [...allNodeNames],
        url: testUrl,
        interval: interval
    };

    // =========================
    // 6. 创建 Proxy 主选择组
    // =========================

    const proxyGroupName = "🚀 Proxy";

    const proxyGroup = {
        name: proxyGroupName,
        type: "select",
        proxies: [
            directGroupName,
            "REJECT",
            autoGroupName,
            fallbackGroupName,
            ...regionNames
        ],
        "default-selected": autoGroupName
    };

    // =========================
    // 7. 公共代理选项
    // =========================

    const commonProxies = [
        directGroupName,
        "REJECT",
        autoGroupName,
        fallbackGroupName,
        proxyGroupName,
        ...regionNames
    ];

    // =========================
    // 8. 创建国内、国外及兜底代理组
    // =========================

    const domesticGroupName = "🇨🇳 国内";
    const foreignGroupName = "🌐 国外";
    const finalGroupName = "🐟 漏网之鱼";

    const domesticGroup = {
        name: domesticGroupName,
        type: "select",
        proxies: [...commonProxies],
        "default-selected": directGroupName
    };

    const foreignGroup = {
        name: foreignGroupName,
        type: "select",
        proxies: [...commonProxies],
        "default-selected": proxyGroupName
    };

    const finalGroup = {
        name: finalGroupName,
        type: "select",
        proxies: [...commonProxies],
        "default-selected": proxyGroupName
    };

    // =========================
    // 9. 创建服务分流代理组
    // =========================

    const serviceGroupConfigs = [
        { name: "🤖 AI" },
        { name: "▶️ YouTube" },
        { name: "🔎 Google" },
        { name: "🐙 GitHub" },
        { name: "🍎 Apple-基础服务", defaultSelected: directGroupName },
        { name: "🍎 Apple" },
        { name: "🪟 Microsoft" },
        { name: "✈️ Telegram" },
        { name: "🎮 Steam-基础服务", defaultSelected: directGroupName },
        { name: "🎮 Steam" },
        { name: "🛍️ Ubisoft-商城" },
        { name: "🎮 Ubisoft", defaultSelected: directGroupName }
    ];

    const serviceGroups = serviceGroupConfigs.map(item => ({
        name: item.name,
        type: "select",
        proxies: [...commonProxies],
        "default-selected": item.defaultSelected || proxyGroupName
    }));

    // =========================
    // 10. 整体替换原始代理组
    // =========================

    config["proxy-groups"] = [
        proxyGroup,
        directGroup,
        autoGroup,
        fallbackGroup,
        ...regionGroups,
        ...serviceGroups,
        domesticGroup,
        foreignGroup,
        finalGroup
    ];

    // =========================
    // 11. 全量替换分流规则
    // =========================

    config.rules = [
        // AI
        "GEOSITE,category-ai-!cn,🤖 AI",

        // YouTube
        "GEOSITE,youtube,▶️ YouTube",

        // Google
        "GEOSITE,google,🔎 Google",

        // GitHub
        "GEOSITE,github,🐙 GitHub",

        // Apple 基础服务
        "DOMAIN-SUFFIX,push.apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,push-apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,apple.com.cn,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,cdn-apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,icloud.com.cn,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,time.apple.com,🍎 Apple-基础服务",
        "DOMAIN-KEYWORD,iosapps,🍎 Apple-基础服务",

        // Apple
        "DOMAIN-KEYWORD,apple,🍎 Apple",

        // Microsoft
        "GEOSITE,microsoft,🪟 Microsoft",

        // Telegram
        "GEOSITE,telegram,✈️ Telegram",
        "GEOIP,telegram,✈️ Telegram,no-resolve",
        "IP-CIDR,91.105.192.0/23,✈️ Telegram,no-resolve",
        "IP-CIDR,91.108.4.0/22,✈️ Telegram,no-resolve",
        "IP-CIDR,91.108.8.0/22,✈️ Telegram,no-resolve",
        "IP-CIDR,91.108.12.0/22,✈️ Telegram,no-resolve",
        "IP-CIDR,91.108.16.0/22,✈️ Telegram,no-resolve",
        "IP-CIDR,91.108.20.0/22,✈️ Telegram,no-resolve",
        "IP-CIDR,91.108.56.0/22,✈️ Telegram,no-resolve",
        "IP-CIDR,149.154.160.0/20,✈️ Telegram,no-resolve",
        "IP-CIDR,185.76.151.0/24,✈️ Telegram,no-resolve",
        "IP-CIDR6,2001:67c:4e8::/48,✈️ Telegram,no-resolve",
        "IP-CIDR6,2001:b28:f23c::/48,✈️ Telegram,no-resolve",
        "IP-CIDR6,2001:b28:f23d::/48,✈️ Telegram,no-resolve",
        "IP-CIDR6,2001:b28:f23f::/48,✈️ Telegram,no-resolve",
        "IP-CIDR6,2a0a:f280::/32,✈️ Telegram,no-resolve",

        // Steam 基础服务
        "DOMAIN,steamcdn-a.akamaihd.net,🎮 Steam-基础服务",
        "DOMAIN-SUFFIX,steamcontent.com,🎮 Steam-基础服务",
        "DOMAIN-SUFFIX,steamserver.net,🎮 Steam-基础服务",
        "DOMAIN-SUFFIX,oss-accelerate.aliyuncs.com,🎮 Steam-基础服务",

        // Steam
        "DOMAIN-KEYWORD,steam,🎮 Steam",

        // Ubisoft 商城
        "DOMAIN,store.ubi.com,🛍️ Ubisoft-商城",
        "DOMAIN,store.ubisoft.com,🛍️ Ubisoft-商城",
        "DOMAIN,store-sessions.ecom.ubi.com,🛍️ Ubisoft-商城",
        "DOMAIN-KEYWORD,uplay-savegames,🛍️ Ubisoft-商城",

        // Ubisoft
        "DOMAIN-KEYWORD,ubi,🎮 Ubisoft",
        "DOMAIN-KEYWORD,ubisoft,🎮 Ubisoft",

        // DNS 泄露检测网站，统一走国外
        "DOMAIN-SUFFIX,browserleaks.com,🚀 Proxy",
        "DOMAIN-SUFFIX,dnsleaktest.com,🚀 Proxy",
        "DOMAIN-SUFFIX,dnsleak.com,🚀 Proxy",
        "DOMAIN-SUFFIX,ipleak.net,🚀 Proxy",
        "DOMAIN-SUFFIX,whoer.net,🚀 Proxy",
        "DOMAIN-SUFFIX,dnscheck.tools,🚀 Proxy",

        // 国内外兜底
        "GEOSITE,cn,DIRECT",
        "GEOIP,CN,DIRECT,no-resolve",
        "GEOSITE,geolocation-!cn,🌐 国外",

        // 最终兜底
        "MATCH,🐟 漏网之鱼"
    ];

    // =========================
    // 12. DNS 配置
    // =========================

    config.dns = config.dns || {};

    config.dns["respect-rules"] = true;

    config.dns["default-nameserver"] = [
        "223.5.5.5",
        "119.29.29.29"
    ];

    config.dns["proxy-server-nameserver"] = [
        "223.5.5.5",
        "119.29.29.29"
    ];

    config.dns.nameserver = [
        "https://dns.google/dns-query",
        "https://cloudflare-dns.com/dns-query"
    ];

    config.dns["nameserver-policy"] = {
        "geosite:cn": [
            "https://dns.alidns.com/dns-query",
            "https://doh.pub/dns-query"
        ]
    };

    // Fake-IP 黑名单模式
    config.dns["fake-ip-filter-mode"] = "blacklist";
    
    // fake-ip-filter 增量追加 geosite:cn，保留已有配置
    config.dns["fake-ip-filter"] =
        Array.isArray(config.dns["fake-ip-filter"])
            ? config.dns["fake-ip-filter"]
            : [];
    
    if (!config.dns["fake-ip-filter"].includes("geosite:cn")) {
        config.dns["fake-ip-filter"].push("geosite:cn");
    }

    return config;
}
