package com.zhongmingchun.zmctools;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.util.*;

/**
 * 良心云 机场 订阅自定义编辑
 */
@RestController
@RequestMapping("/lxy")
public class LxyClashConfigCustomEditorController {

    private AirportClashSubscribeDownloader airportClashSubscribeDownloader = new AirportClashSubscribeDownloader();

    private static final List<String> CUSTOM_RULES = Arrays.asList(
            // OpenAI / ChatGPT -> AIGC
            "DOMAIN-SUFFIX,chatgpt.com,AIGC",
            "DOMAIN-SUFFIX,openai.com,AIGC",
            "DOMAIN-KEYWORD,chatgpt,AIGC",
            "DOMAIN-KEYWORD,openai,AIGC",
            "DOMAIN-SUFFIX,ingest.us.sentry.io,AIGC",
            // Steam: 下载游戏 -> 直连, 其他 -> 代理`
            "DOMAIN-SUFFIX,steamcontent.com,DIRECT",
            "DOMAIN-SUFFIX,steamserver.net,DIRECT",
            "DOMAIN,steamcdn-a.akamaihd.net,DIRECT",
            "DOMAIN-KEYWORD,steam,良心云",
            // Apple: 推送服务 -> 直连
            "DOMAIN-SUFFIX,push.apple.com,DIRECT",
            "DOMAIN-SUFFIX,push-apple.com,DIRECT",
            // Apple: 下载软件 -> 直连
            "DOMAIN-KEYWORD,iosapps,DIRECT",
            "DOMAIN-SUFFIX,cdn-apple.com,DIRECT",
            // Apple: 云上贵州 -> 直连
            "DOMAIN-SUFFIX,icloud.com.cn,DIRECT",
            // Apple: 国外icloud -> 代理
            "DOMAIN-KEYWORD,icloud,DIRECT",
            // Apple: 国外apple -> 代理
            "DOMAIN-KEYWORD,apple,良心云",
            // 育碧: 直连
            "DOMAIN-SUFFIX,ubi.com,DIRECT",
            "DOMAIN-SUFFIX,ubisoft.com,DIRECT",
            "DOMAIN-KEYWORD,ubisoft,DIRECT"
    );

    @GetMapping(value = "/edit")
    public String edit(@RequestParam("url") String url) {
        // 下载订阅配置文件
        String configStr = airportClashSubscribeDownloader.download(url);
        // yaml输出配置
        DumperOptions options = new DumperOptions();
        // 不改变原yaml的结构
        options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
        // yaml解析对象
        Yaml yaml = new Yaml(options);
        // YAML -> Map
        Map<String, Object> config = yaml.load(configStr);
        // 原始节点列表
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) config.get("proxies");
        // 原始代理组
        List<Map<String, Object>> groups = (List<Map<String, Object>>) config.get("proxy-groups");
        // 不同地区的节点组
        List<Object> hkList = new ArrayList<>();
        List<Object> jpList = new ArrayList<>();
        List<Object> sgList = new ArrayList<>();
        List<Object> twList = new ArrayList<>();
        List<Object> usList = new ArrayList<>();
        // 遍历节点, 按地区分类
        if (nodes != null) {
            for (Map<String, Object> node : nodes) {
                // 当前节点名称，例如：香港01
                String name = String.valueOf(node.get("name"));
                if (name.contains("香港")) {
                    hkList.add(name);
                } else if (name.contains("日本")) {
                    jpList.add(name);
                } else if (name.contains("新加坡")) {
                    sgList.add(name);
                } else if (name.contains("台湾")) {
                    twList.add(name);
                } else if (name.contains("美国")) {
                    usList.add(name);
                }
            }
        }
        Map<String, Object> hkGroup = new LinkedHashMap<>();
        hkGroup.put("name", "香港组");
        hkGroup.put("type", "url-test");
        hkGroup.put("proxies", hkList);
        hkGroup.put("url", "http://www.gstatic.com/generate_204");
        hkGroup.put("interval", 300);

        Map<String, Object> jpGroup = new LinkedHashMap<>();
        jpGroup.put("name", "日本组");
        jpGroup.put("type", "url-test");
        jpGroup.put("proxies", jpList);
        jpGroup.put("url", "http://www.gstatic.com/generate_204");
        jpGroup.put("interval", 300);

        Map<String, Object> sgGroup = new LinkedHashMap<>();
        sgGroup.put("name", "新加坡组");
        sgGroup.put("type", "url-test");
        sgGroup.put("proxies", sgList);
        sgGroup.put("url", "http://www.gstatic.com/generate_204");
        sgGroup.put("interval", 300);

        Map<String, Object> twGroup = new LinkedHashMap<>();
        twGroup.put("name", "台湾组");
        twGroup.put("type", "url-test");
        twGroup.put("proxies", twList);
        twGroup.put("url", "http://www.gstatic.com/generate_204");
        twGroup.put("interval", 300);

        Map<String, Object> usGroup = new LinkedHashMap<>();
        usGroup.put("name", "美国组");
        usGroup.put("type", "url-test");
        usGroup.put("proxies", usList);
        usGroup.put("url", "http://www.gstatic.com/generate_204");
        usGroup.put("interval", 300);

        Map<String, Object> aigcGroup = new LinkedHashMap<>();
        aigcGroup.put("name", "AIGC");
        aigcGroup.put("type", "select");
        aigcGroup.put("proxies", Arrays.asList(
                hkGroup.get("name"),
                jpGroup.get("name"),
                sgGroup.get("name"),
                twGroup.get("name"),
                usGroup.get("name")
        ));
        // 添加到代理组
        if (groups != null) {
            groups.add(hkGroup);
            groups.add(jpGroup);
            groups.add(sgGroup);
            groups.add(twGroup);
            groups.add(usGroup);
            // 把地区组加入第一个代理组
            if (!groups.isEmpty()) {
                groups.add(aigcGroup);
                Map<String, Object> firstGroup = groups.get(0);
                List<Object> firstGroupProxies = (List<Object>) firstGroup.get("proxies");
                if (firstGroupProxies != null) {
                    firstGroupProxies.add("香港组");
                    firstGroupProxies.add("日本组");
                    firstGroupProxies.add("新加坡组");
                    firstGroupProxies.add("台湾组");
                    firstGroupProxies.add("美国组");
                }
            }
        }
        List<String> rules = (List<String>) config.get("rules");
        // 将硬编码的自定义规则插入到原 rules 的最顶部（索引 0）
        rules.addAll(0, CUSTOM_RULES);
        config.put("rules", rules);

        int index = configStr.lastIndexOf("proxy-groups:");
        String part1 = configStr.substring(0, index);
        // 输出 yaml
        String dump = yaml.dump(config);
        int i = dump.lastIndexOf("proxy-groups:");
        String part2 = dump.substring(i);
        return part1 + part2;
    }
}