package com.zhongmingchun.zmctools;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * 机场 clash 订阅下载器
 */
@Component
public class AirportClashSubscribeDownloader {

    /**
     * 下载机场订阅
     *
     * @param url 机场订阅链接
     * @return 订阅内容(YAML字符串)
     */
    public String download(String url) {
        RestTemplate restTemplate = new RestTemplate();
        // 请求头
        HttpHeaders headers = new HttpHeaders();
        // 客户端使用 Clash Verge
        headers.set(HttpHeaders.USER_AGENT, "clash-verge/v2.4.5");
        // Accept类型
        headers.setAccept(List.of(MediaType.TEXT_PLAIN, MediaType.APPLICATION_YAML, MediaType.ALL));
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("订阅下载失败: " + response.getStatusCode());
        }
        return response.getBody();
    }
}