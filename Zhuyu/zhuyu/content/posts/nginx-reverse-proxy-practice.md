---
title: Nginx 反向代理实战：一个域名跑多个服务
slug: nginx-reverse-proxy
description: 以 Zhuyu 博客的真实配置为例，详解 Nginx 反向代理、location 匹配规则、WebSocket 支持和缓存控制，以及部署中踩过的坑
date: 2026-05-18
---

## 前言

当你开始把个人项目往服务器上部署时，很快就会遇到一个问题：**只有一个服务器，却有多个服务要跑**。

比如我的博客 Zhuyu，它实际上由三个服务组成：

- **Next.js 前端** — 端口 3000
- **FastAPI 后端** — 端口 8000
- **reader3 阅读服务** — 端口 8085

不可能让用户记 `http://boke.hiromu.top:3000`、`http://boke.hiromu.top:8000` 这种端口号。解决方案就是用 Nginx 做反向代理，把所有服务统一到 80/443 端口，通过路径区分转发。

## 什么是反向代理

简单来说：Nginx 站在前面接客，根据请求路径判断应该交给后面哪个服务处理。

```
用户 → boke.hiromu.top/api/xxx  → Nginx → FastAPI (8000)
用户 → boke.hiromu.top/reader3/ → Nginx → reader3 (8085)
用户 → boke.hiromu.top/         → Nginx → Next.js (3000)
```

## 完整配置

以下是我博客的实际配置，去掉了一些宝塔面板自动生成的内容：

```nginx
server {
    listen 80;
    listen 443 ssl;
    http2 on;
    server_name boke.hiromu.top;
    index index.html index.htm default.htm default.html;
    include /www/server/panel/vhost/nginx/extension/zhuyu/*.conf;

    #CERT-APPLY-CHECK--START
    include /www/server/panel/vhost/nginx/well-known/Zhuyu.conf;
    #CERT-APPLY-CHECK--END

    #SSL-START
    set $isRedcert 1;
    if ($server_port != 443) {
        set $isRedcert 2;
    }
    if ( $uri ~ /\.well-known/ ) {
        set $isRedcert 1;
    }
    if ($isRedcert != 1) {
        rewrite ^(/.*)$ https://$host$1 permanent;
    }
    ssl_certificate    /www/server/panel/vhost/cert/zhuyu/fullchain.pem;
    ssl_certificate_key    /www/server/panel/vhost/cert/zhuyu/privkey.pem;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_tickets on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000";
    error_page 497  https://$host$request_uri;
    #SSL-END

    # 禁止访问的敏感文件
    location ~* (\.user.ini|\.htaccess|\.env.*|\.gitignore|LICENSE|README\.md|package\.json|yarn\.lock|pnpm-lock\.yaml|\.sql)$ {
        return 404;
    }

    # 禁止访问的敏感目录
    location ~* /(\.git|\.svn|\.vscode|\.idea|node_modules)/ {
        return 404;
    }

    location /.well-known/ {
        root  /path/to/your/site;
    }

    # Next.js Route Handler — 必须在 location /api/ 之前
    location = /api/music {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /api/uapis {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /feed {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /reader3/ {
        proxy_pass http://127.0.0.1:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header REMOTE-HOST $remote_addr;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        proxy_cache off;
    }

    access_log  /www/wwwlogs/Zhuyu.log;
    error_log  /www/wwwlogs/Zhuyu.error.log;
}
```

## 逐块讲解

### 1. 基础配置

`server_name` 指定这个配置块匹配哪个域名。`listen 443 ssl` 开启 HTTPS，`http2 on` 启用 HTTP/2，`listen 80` 负责把 HTTP 流量重定向到 HTTPS。

### 2. 最关键的 location 匹配顺序

Nginx 的 location 匹配有优先级：

```
精确匹配（=） > 前缀匹配（^~） > 正则匹配（~） > 普通前缀匹配
```

所以我的配置里有几条精确匹配放在普通路径前面：

```nginx
location = /api/music {
    proxy_pass http://127.0.0.1:3000;
}

location = /feed {
    proxy_pass http://127.0.0.1:3000;
}
```

这三个路由虽然是 `/api/` 开头或是 `/feed`，但它们是 Next.js 的 Route Handler，需要转发到前端而不是后端。用 `=` 精确匹配让它们优先于后面的 `/api/` 和 `/` 匹配。

### 3. proxy_pass 的斜杠陷阱

`proxy_pass` 后面加不加斜杠有区别：

```nginx
# 不加斜杠：传递完整路径
location /reader3/ {
    proxy_pass http://127.0.0.1:8085;
}
# 请求 /reader3/something → http://127.0.0.1:8085/reader3/something

# 加斜杠：截断匹配部分
location /reader3/ {
    proxy_pass http://127.0.0.1:8085/;
}
# 请求 /reader3/something → http://127.0.0.1:8085/something
```

我这里的配置没加斜杠，因为 reader3 服务本身也需要路径前缀来正确路由。

### 4. WebSocket 支持

Next.js 的 HMR（热模块替换）和某些功能依赖 WebSocket。不加下面这几行，WebSocket 连接会失败：

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

`Upgrade` 和 `Connection` 是 hop-by-hop 头部，默认不会被代理转发。必须显式设置。

### 5. 传递真实 IP

当你用了反向代理，后端服务收到的请求来源 IP 永远是 `127.0.0.1`（Nginx 本机）。需要透传真实客户端 IP：

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

后端从 `X-Forwarded-For` 头部取真实 IP。比如我的 FastAPI 后端就用了 `X-Forwarded-For` 来记录访客 IP。

### 6. HTTPS 重定向

宝塔面板自动生成的配置段：

```nginx
if ($server_port != 443) {
    rewrite ^(/.*)$ https://$host$1 permanent;
}
```

把所有非 443 端口的请求 301 重定向到 HTTPS 版本。`permanent` 返回 301 状态码，浏览器会缓存这个跳转。

## 踩坑记录

### 坑 1：Nginx 缓存导致页面不更新

这是遇到最多的问题。部署新版本后，Nginx 可能返回缓存的旧页面：

```nginx
location / {
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    proxy_cache off;
}
```

对动态内容直接关掉缓存，省心。如果非要缓存静态资源，用 `proxy_cache_path` 配合 `proxy_cache_valid` 精细化控制。

### 坑 2：SSL 证书路径搞错

宝塔面板统一管理证书，存放在 `/www/server/panel/vhost/cert/` 下。如果手动配置，注意证书文件路径要跟面板生成的保持一致，否则 HTTPS 会挂。

### 坑 3：敏感文件暴露

```nginx
location ~* (\.user.ini|\.htaccess|\.env.*|\.gitignore|LICENSE|README\.md|package\.json)$ {
    return 404;
}

location ~* /(\.git|\.svn|\.vscode|\.idea|node_modules)/ {
    return 404;
}
```

防止用户直接访问项目文件。特别是 `.env` 文件，里面可能包含密钥。

## 宝塔面板的小技巧

如果是用宝塔面板，配置最终会合并成这个样子：

```nginx
# 在主配置中引入面板生成的 SSL、伪静态等配置
include /www/server/panel/vhost/nginx/extension/zhuyu/*.conf;
include /www/server/panel/vhost/rewrite/node_Zhuyu.conf;
```

好处是 SSL 证书续期、伪静态规则都能通过面板 UI 管理，不需要每次都手改 Nginx 配置。关键的反代规则写在面板的"配置文件"里就行。

## 总结

一套 Nginx 反代配置的核心就是：

1. **想清楚路径规划** — 哪个路径转发到哪个服务
2. **注意匹配顺序** — 精确匹配优先，特殊路由放在前面
3. **透传必要信息** — 真实 IP、WebSocket 头部
4. **缓存策略要明确** — 动态内容关缓存，静态资源再考虑开

配置本身并不复杂，但每个细节都有它的道理。理解了这些，以后加新服务就只是加几行 `location` 的事。
