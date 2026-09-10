---
title: "从零搭建一个全栈博客：Next.js + FastAPI + vue-pure-admin"
description: "记录我用 Next.js 16、FastAPI、SQLModel 和 vue-pure-admin 搭建个人博客的全过程，包含前后端分离、管理后台、对象存储、部署上线等环节。"
cover: "/images/default-cover.jpg"
category: "技术"
tags: ["Next.js", "FastAPI", "SQLModel", "vue-pure-admin", "全栈"]
status: "published"
is_pinned: false
published_at: "2026-05-15T12:00:00"
---

## 前言

折腾了快半个月，终于把这个博客从一个空白页面搞到了现在这个样子。回头看，踩的坑也不少，但总算有个能看的成品了。

这篇文章就当个记录，聊聊整个项目的架构、技术选型、核心实现和部署过程。如果你也想搞一个全栈博客，希望能给你一些参考。

## 技术栈一览

先上最终选定的技术栈：

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 16 + React 19 + TypeScript | App Router，Tailwind CSS 4 |
| 后端 | FastAPI + SQLModel + PostgreSQL | Python，异步友好 |
| 管理后台 | vue-pure-admin + Element Plus | Vue 3 + Vite，开箱即用 |
| 对象存储 | 阿里云 OSS | 图片、文件上传 |
| 部署 | 宝塔面板 + Nginx | 阿里云 ECS |

为什么这么选？简单来说就是：**用最顺手的工具干最合适的活**。

Next.js 的 SSR/SSG 能力对博客来说是刚需，SEO 直接拉满；FastAPI 写 API 真的快，配合 SQLModel 的类型提示，开发体验很舒服；管理后台没必要自己从头写，vue-pure-admin 开箱即用，省了不少事。

## 项目结构

```
zhuyu/                  # Next.js 前端
├── app/                   # App Router 页面
│   ├── posts/             # 文章列表 & 详情
│   ├── about/             # 关于页
│   ├── album/             # 相册
│   ├── bookmark/          # 收藏夹
│   ├── music/             # 音乐播放器
│   ├── novel/             # 小说阅读
│   ├── garden/            # 子站（各种小工具页面）
│   └── api/               # API 封装
├── components/            # 公共组件
│   ├── posts/             # 文章卡片、Markdown 渲染
│   ├── home/              # 首页组件
│   ├── layout/            # 导航栏、页脚
│   └── ui/                # 通用 UI 组件
└── public/                # 静态资源

zhuyu-backend/          # FastAPI 后端
├── app/
│   ├── api/               # 路由层（16 个模块）
│   ├── models/            # SQLModel 数据模型
│   ├── schemas/           # Pydantic 校验
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具函数
│   └── main.py            # 入口
└── admin/                 # vue-pure-admin 管理后台
    ├── src/
    │   ├── views/         # 页面视图
    │   ├── api/           # API 调用
    │   ├── router/        # 路由配置
    │   └── store/         # Pinia 状态管理
    └── package.json
```

前后端完全分离，通过 API 通信。管理后台打包后由后端静态文件服务，不用额外部署。

## 后端：FastAPI + SQLModel

### 数据模型

SQLModel 是 FastAPI 作者搞的，把 SQLAlchemy 和 Pydantic 合一了，写起来很爽。类型提示即字段定义，不用重复写 Schema 和 Model，一个类搞定。

以文章模型为例，定义好字段后，SQLModel 会自动映射到数据库表，同时也能直接作为 Pydantic 校验用，一举两得。

### API 路由

FastAPI 的路由按模块拆分，每个功能一个文件（posts.py、auth.py、albums.py 等），最后在 `router.py` 里统一注册到 app 上。路由用 `Depends` 注入数据库 Session 和当前用户，代码很干净。

需要注意一点：**路由定义的顺序很重要**。比如 `/admin` 这种静态路径要放在 `/{id}` 这种动态路径前面，否则 FastAPI 会把 "admin" 当成 id 去解析，直接报 422。

### 认证 & 文件上传

认证用的 JWT，登录时生成 token，需要鉴权的接口加个 `Depends(get_current_user)` 就行。

文件上传对接阿里云 OSS，图片上传后返回 URL 存数据库。OSS 的好处是不用管服务器磁盘，CDN 加速也方便。

## 前端：Next.js 16

### App Router

Next.js 13+ 的 App Router 用文件系统做路由，很直观。文件夹就是路径，`page.tsx` 就是页面，`layout.tsx` 就是布局，零配置。

### 数据获取

Server Components 直接 `async` 获取数据，不用 `useEffect`，SEO 友好。Client Components 里该用 `useEffect` 还是用，各司其职。

### 样式方案

Tailwind CSS 4 + 手写组件，不用任何 UI 框架。博客嘛，样式得自己掌控。深色模式用 `dark:` 前缀，Tailwind 原生支持，省心。

动画用的 Framer Motion，几行代码就能做出不错的入场效果。

### 一些有意思的模块

**看板娘**：页面右下角的 Live2D 小人，用 script 注入的方式本地加载，支持多个角色模型切换。没什么实际用处，但挺可爱的。

**音乐播放器**：集成 @meting/core，支持网易云歌单和单曲，首页有悬浮歌词条，音乐页面有完整的播放列表和逐字歌词。歌曲数据通过 Next.js API Route 走网易云接口，Nginx 那边要单独把 `/api/music` 指向 Next.js，不然会被转发到后端 404。

**小说阅读器**：自写的阅读器组件，支持章节切换、字体大小调整、阅读进度保存。

**工具箱**：首页底部有个工具箱入口，36 个实用工具——天气、计算器、日历、BMI 计算、单位换算、密码生成器、B站热榜、金价查询、IP 查询等等，加上 18 个小游戏：俄罗斯方块、贪吃蛇、2048、扫雷、五子棋、Flappy Bird、合成大西瓜……都是前端纯实现，不用后端。

**子站**：garden 目录下是一堆独立的实验性页面。视觉类的有：Three.js 做的 3D 太阳系和星空、粒子烟花、矩阵数字雨、流体模拟、万花筒、落沙模拟、康威生命游戏。开发工具类的有：浏览器端 Python 编辑器（CodeMirror）、排序算法可视化、Markdown 编辑器、JSON 格式化、函数图像绘制。还有一个 3D 家具工作室，支持拖拽摆放和截图导出。这些跟博客主业没啥关系，纯属折腾着玩，但放在子站里统一管理还挺方便。

**UI 细节**：鼠标轨迹特效、点击粒子效果、自定义光标、径向菜单、页面切换动画、阅读进度条。这些小东西单独看不起眼，但加在一起确实让页面更有质感。

## 管理后台：vue-pure-admin

管理后台没自己从头写，用的 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 模板，Vue 3 + Vite + Element Plus，开箱即用。

模板自带很多示例页面，大部分用不上，我做了大幅裁剪，然后做了些自己需要的功能：文章管理、相册管理、留言管理、友链管理、收藏夹管理、站点配置、访客统计、仪表盘。

每个模块都有对应的 API 文件，页面里直接调用就行。数据量大的页面都做了服务端分页。

管理后台改完代码后记得 `pnpm build`，dist 目录由后端静态文件服务。这个我忘了好几次，改了代码发现没生效，后来才反应过来没打包。

## 部署：宝塔 + Nginx

这部分是重点，一步步来。

### 服务器准备

我用的阿里云 ECS + 宝塔面板。宝塔的好处是不用手动装环境，面板上点几下就行：

1. 安装宝塔面板（bt.cn 一键安装脚本）
2. 在宝塔「软件商店」里安装：Nginx、Node.js 18+、Python 3.10+、PostgreSQL 15
3. 配置好防火墙，开放 80、443、3000、8000 端口

### 数据库

```bash
# 创建数据库
psql -U postgres -c "CREATE DATABASE zhuyu;"

# 导入初始化 SQL
psql -U postgres -d zhuyu -f init_db.sql
```

SQL 文件里包含了所有表的建表语句，直接导入就行。

### 后端部署

```bash
# 进入后端目录
cd /path/to/your/site/zhuyu-backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（.env 文件）
# DATABASE_URL=postgresql://postgres:password@localhost:5432/zhuyu
# SECRET_KEY=你的密钥
# OSS_ACCESS_KEY_ID=xxx
# OSS_ACCESS_KEY_SECRET=xxx
# OSS_BUCKET=xxx
# OSS_ENDPOINT=xxx

# 启动（用 nohup 或 pm2）
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
```

可以用宝塔的 Python 项目管理器，能自动管理进程、设置开机自启，比 nohup 靠谱。

### 前端部署

```bash
# 进入前端目录
cd /path/to/your/site/Zhuyu

# 安装依赖
npm install

# 构建
npm run build

# 启动（生产模式）
npm run start
```

宝塔有 Node 项目管理器，可以直接添加项目，自动帮你跑 `npm start`，还能设置开机自启和进程守护。

**开发环境的 API 代理**：Next.js 开发时需要把 `/api/*` 请求代理到后端，在 `next.config.js` 里配 rewrites：

```javascript
rewrites: async () => [
  { source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }
]
```

生产环境不需要这个，因为 Nginx 会直接分流。

### 管理后台打包

```bash
cd /path/to/your/site/zhuyu-backend/admin
pnpm install
pnpm build
```

打包后的文件在 `admin/dist/` 目录，后端会自动把 `/admin` 路径指向这个目录，所以不用额外配置 Nginx。

### Nginx 配置

这是最关键的一步，在宝塔的网站设置里找到「配置文件」，加上反向代理：

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    # SSL 证书（宝塔自动配置，不用手动改）
    ssl_certificate    /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 前端 - Next.js (port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache off;
    }

    # 音乐 API - Next.js API Route（必须在 /api/ 前面）
    location /api/music {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # 后端 API - FastAPI (port 8000)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 管理后台 - 由后端静态文件服务
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

核心逻辑就一句话：`/` 走前端（3000），`/api/` 和 `/admin` 走后端（8000）。

### 踩过的坑

**Nginx 缓存**：部署新版本后，页面加载的还是旧的 chunk 文件，看不到新功能。排查了半天，发现是 Nginx 默认会缓存代理响应。加上 `proxy_cache off;` 解决了。这个坑真的坑了我好久。

**Admin 改了代码没生效**：vue-pure-admin 改完要 `pnpm build`，dist 目录由后端静态文件服务。我有好几次改完代码刷新页面发现没变化，后来才想起来没打包。建议在 package.json 里加个 `postinstall` 脚本自动打包。

**前端 rewrite 失效**：开发环境 Next.js 的 rewrites 只在 `next dev` 时生效，`next build` + `next start` 后就不走 rewrite 了。生产环境靠 Nginx 分流，不用配 rewrites。

**PostgreSQL 连接数**：默认连接数太少，并发高了会报连接池耗尽。在 `postgresql.conf` 里把 `max_connections` 调大一些。

## 写在最后

这个项目的功能比我最初预想的多了不少，从最基础的文章发布，到相册、照片墙、归档、子站、小说阅读器等等，都是一步步加下来的。

技术栈的选择其实没有绝对的对错，关键是选自己顺手的。Next.js 的开发体验确实好，FastAPI 写 API 也很爽，vue-pure-admin 省了大量后台开发时间。

如果你也想搞一个类似的项目，建议从最小的功能集开始：先跑通前后端，再逐步加功能。别一上来就想把所有东西都做好，那样很容易半途而废。

代码开源于 GitHub，欢迎 Star 和 PR。<https://github.com/Xinghongia/Zhuyu>
