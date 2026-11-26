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
    const directTestUrl = "https://www.baidu.com";
    const interval = 180;

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
        },
        {
            name: "🇬🇧 英国",
            keywords: ["英国", "UK", "United Kingdom", "London"]
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
    // 8. 创建服务分流代理组（含 SpeedTest、国内、国外及兜底）
    // =========================

    const serviceGroupConfigs = [
        {name: "🤖 AI"},
        {name: "▶️ YouTube"},
        {name: "🎵 TikTok", defaultSelected: proxyGroupName},
        {name: "🎬 Netflix", defaultSelected: proxyGroupName},
        {name: "🔎 Google"},
        {name: "🐙 GitHub"},
        {name: "🍎 Apple-基础服务", defaultSelected: directGroupName},
        {name: "🍎 Apple"},
        {name: "💻 Microsoft"},
        {name: "✈️ Telegram"},
        {name: "🐦 Twitter"},
        {name: "📘 Meta"},
        {name: "🎮 Steam-基础服务", defaultSelected: directGroupName},
        {name: "🎮 Steam"},
        {name: "🛍️ Ubisoft-商城"},
        {name: "🎮 Ubisoft", defaultSelected: directGroupName},
        {name: "🕹️ PlayStation-基础服务", defaultSelected: proxyGroupName},
        {name: "🕹️ PlayStation", defaultSelected: proxyGroupName},
        {name: "⏱️ SpeedTest", defaultSelected: directGroupName},
        {name: "☁️ CDN", defaultSelected: proxyGroupName},
        {name: "🌐 国外", defaultSelected: proxyGroupName},
        {name: "🇨🇳 国内", defaultSelected: directGroupName},
        {name: "🐟 漏网之鱼", defaultSelected: proxyGroupName}
    ];

    const serviceGroups = serviceGroupConfigs.map(item => ({
        name: item.name,
        type: "select",
        proxies: [...commonProxies],
        "default-selected": item.defaultSelected || proxyGroupName
    }));

    // =========================
    // 9. 整体替换原始代理组
    // =========================

    config["proxy-groups"] = [
        proxyGroup,
        directGroup,
        autoGroup,
        fallbackGroup,
        ...serviceGroups,
        ...regionGroups
    ];

    // =========================
    // 10. 全量替换分流规则
    // =========================

    config.rules = [
        // 私有网络域名
        "GEOSITE,private,DIRECT",

        // AI
        "GEOSITE,category-ai-!cn,🤖 AI",

        // YouTube
        "GEOSITE,youtube,▶️ YouTube",

        // TikTok
        "GEOSITE,tiktok,🎵 TikTok",

        // Netflix
        "GEOSITE,netflix,🎬 Netflix",
        "GEOIP,netflix,🎬 Netflix,no-resolve",

        // Google
        "GEOSITE,google,🔎 Google",
        "GEOIP,google,🔎 Google,no-resolve",

        // GitHub
        "GEOSITE,github,🐙 GitHub",

        // Apple 基础服务
        "DOMAIN-SUFFIX,push.apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,push-apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,apple.com.cn,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,cdn-apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,icloud.com.cn,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,icloud-content.com.cn,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,icloud.net.cn,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,time.apple.com,🍎 Apple-基础服务",
        "DOMAIN-SUFFIX,time-macos.apple.com,🍎 Apple-基础服务",
        "DOMAIN-KEYWORD,iosapps,🍎 Apple-基础服务",

        // Apple
        "DOMAIN-KEYWORD,apple,🍎 Apple",

        // Microsoft
        "GEOSITE,microsoft,💻 Microsoft",

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

        // Twitter / X
        "GEOSITE,twitter,🐦 Twitter",
        "GEOIP,twitter,🐦 Twitter,no-resolve",

        // Meta（Facebook / Instagram / WhatsApp / Threads）
        "GEOSITE,meta,📘 Meta",
        "GEOIP,facebook,📘 Meta,no-resolve",

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

        // PlayStation 连通性测试 -> 直连
        "DOMAIN,ena.net.playstation.net,🕹️ PlayStation-基础服务",
        // PlayStation NAT类型检测(fake-ip-filter要排除此域名) -> 直连
        "DOMAIN-SUFFIX,stun.playstation.net,🕹️ PlayStation-基础服务",

        // PlayStation
        "DOMAIN-KEYWORD,playstation,🕹️ PlayStation",

        // SpeedTest
        "GEOSITE,speedtest,⏱️ SpeedTest",
        "DOMAIN-KEYWORD,speedtest,⏱️ SpeedTest",

        // DNS 泄露检测网站
        "DOMAIN-SUFFIX,browserleaks.com,🌐 国外",
        "DOMAIN-SUFFIX,browserleaks.org,🌐 国外",
        "DOMAIN-KEYWORD,browserleaks,🌐 国外",
        "DOMAIN-SUFFIX,dnsleaktest.com,🌐 国外",
        "DOMAIN-SUFFIX,dnsleak.com,🌐 国外",
        "DOMAIN-SUFFIX,ipleak.net,🌐 国外",
        "DOMAIN-SUFFIX,whoer.net,🌐 国外",
        "DOMAIN-SUFFIX,dnscheck.tools,🌐 国外",

        // 国际 IP 检测网站
        "DOMAIN-SUFFIX,ip.sb,🌐 国外",
        "DOMAIN-SUFFIX,ipwho.is,🌐 国外",
        "DOMAIN-SUFFIX,ipapi.is,🌐 国外",

        // 国外 CDN
        "DOMAIN-SUFFIX,akamai.net,☁️ CDN",
        "DOMAIN-SUFFIX,akamaihd.net,☁️ CDN",
        "DOMAIN-SUFFIX,akamaized.net,☁️ CDN",
        "DOMAIN-SUFFIX,akamaiedge.net,☁️ CDN",
        "DOMAIN-SUFFIX,edgekey.net,☁️ CDN",
        "DOMAIN-SUFFIX,edgesuite.net,☁️ CDN",
        "DOMAIN-SUFFIX,cloudflare.com,☁️ CDN",
        "DOMAIN-SUFFIX,cloudflare.net,☁️ CDN",
        "DOMAIN-SUFFIX,cloudfront.net,☁️ CDN",
        "DOMAIN-SUFFIX,fastly.net,☁️ CDN",
        "DOMAIN-SUFFIX,fastlylb.net,☁️ CDN",
        "DOMAIN-SUFFIX,jsdelivr.net,☁️ CDN",
        "DOMAIN-SUFFIX,unpkg.com,☁️ CDN",
        "DOMAIN-SUFFIX,bunnycdn.com,☁️ CDN",
        "DOMAIN-SUFFIX,bunny.net,☁️ CDN",
        "DOMAIN-SUFFIX,b-cdn.net,☁️ CDN",
        "DOMAIN-SUFFIX,azureedge.net,☁️ CDN",
        "DOMAIN-SUFFIX,msecnd.net,☁️ CDN",
        "DOMAIN-SUFFIX,cloudinary.com,☁️ CDN",
        "DOMAIN-SUFFIX,imgix.net,☁️ CDN",
        "DOMAIN-SUFFIX,kxcdn.com,☁️ CDN",
        "DOMAIN-SUFFIX,stackpathdns.com,☁️ CDN",
        "DOMAIN-SUFFIX,stackpathcdn.com,☁️ CDN",
        "DOMAIN-SUFFIX,bootstrapcdn.com,☁️ CDN",
        "DOMAIN-SUFFIX,incapsula.com,☁️ CDN",
        "DOMAIN-SUFFIX,impervadns.net,☁️ CDN",
        "DOMAIN-SUFFIX,sucuri.net,☁️ CDN",
        "DOMAIN-SUFFIX,netlify.app,☁️ CDN",
        "DOMAIN-SUFFIX,netlify.com,☁️ CDN",
        "DOMAIN-SUFFIX,vercel.app,☁️ CDN",
        "DOMAIN-SUFFIX,vercel.com,☁️ CDN",
        "DOMAIN-SUFFIX,now.sh,☁️ CDN",
        "DOMAIN-SUFFIX,cdn77.org,☁️ CDN",
        "DOMAIN-SUFFIX,hwcdn.net,☁️ CDN",

        // 国外
        "GEOSITE,geolocation-!cn,🌐 国外",

        // 国内
        "GEOSITE,cn,🇨🇳 国内",
        "GEOIP,CN,🇨🇳 国内,no-resolve",

        // 最终兜底
        "MATCH,🐟 漏网之鱼"
    ];

    // =========================
    // 11. DNS 配置
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

    // fake-ip-filter 增量追加局域网域名，保留已有配置
    config.dns["fake-ip-filter"] =
        Array.isArray(config.dns["fake-ip-filter"])
            ? config.dns["fake-ip-filter"]
            : [];

    const fakeIpFilters = [
        "geosite:cn",
        "geosite:private",
        "geosite:playstation",
        "+.stun.playstation.net",
        "+.turn.playstation.net",
        "+.sonyentertainmentnetwork.com",
        "+.lan",
        "+.local",
        "+.home.arpa",
        "localhost"
    ];

    for (const filter of fakeIpFilters) {
        if (!config.dns["fake-ip-filter"].includes(filter)) {
            config.dns["fake-ip-filter"].push(filter);
        }
    }

    return config;
}
