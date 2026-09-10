<div align="center">

# zhuyu

**「yu」见 — 愿：你若满目星辰**

一个基于开源项目深度定制的全栈个人博客系统，前端 Next.js，后端 FastAPI，附带 Vue 管理后台和网易云音乐 API 服务。

## 致谢

本项目基于以下开源项目修改而来：

- **[Kirameku](https://github.com/Xinghongia/Kirameku)** — 前后端架构与整体框架 by [Xinghongia](https://github.com/Xinghongia)
- **[XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs)** — 前端界面样式大幅参考 by [heiehiehi](https://github.com/heiehiehi)

感谢以上开源作者的贡献 🙏

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?logo=fastapi)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## 项目简介

一个功能完善的全栈个人博客系统，具有以下特点：

- 🎨 **Glassmorphism 风格** — 全站毛玻璃质感，亮色暗色双主题
- 🎭 **微交互动画** — Framer Motion 驱动，页面过渡、卡片悬停、果冻弹跳
- 📱 **全端适配** — 响应式布局，手机端单列瀑布流，桌面端智能瀑布流
- 🔐 **第三方登录** — GitHub OAuth + QQ 登录（心月互联）
- 🎵 **音乐播放器** — 网易云音乐集成，支持歌单
- 🌿 **彩蛋页** — 11 个创意互动工具（移动端适配）
- 📊 **访客统计** — 记录访问数据，管理后台可视化
- 🔗 **友链系统** — 用户可在线申请友链
- 📝 **Markdown 编辑** — 支持多种编程语言的语法高亮
- 🗑️ **OSS 自动清理** — 删除照片/相册时自动清理阿里云 OSS 文件
- 🖼️ **图片渐进加载** — OSS 缩略图 + 模糊过渡，三阶段原图加载
- 📌 **文章置顶** — 归档页支持置顶标识，首页置顶优先展示
- 🔍 **全文搜索** — 支持标题、描述、内容、分类名搜索

---

## 项目结构

```
Zhuyu/
├── zhuyu/                              # 前端（Next.js 16 App Router）
│   ├── app/                            # 页面路由
│   │   ├── page.tsx                    # 首页
│   │   ├── layout.tsx                  # 根布局
│   │   ├── HomeClient.tsx              # 首页客户端组件
│   │   ├── globals.css                 # 全局样式
│   │   ├── about/                      # 关于页面
│   │   ├── api/                        # 前端 API 封装
│   │   ├── auth/                       # 认证相关（OAuth 回调）
│   │   ├── feed/                       # RSS 订阅
│   │   ├── friends/                    # 友链页面
│   │   ├── garden/                     # 花园（创意实验室）
│   │   │   ├── layout.tsx              # 花园布局（侧边栏导航）
│   │   │   ├── page.tsx                # 仪表盘
│   │   │   ├── color/                  # 调色板
│   │   │   ├── fireworks/              # 烟花效果
│   │   │   ├── fluid/                  # 流体模拟
│   │   │   ├── kaleidoscope/           # 万花筒
│   │   │   ├── life/                   # 生命游戏
│   │   │   ├── qrcode/                 # 二维码生成
│   │   │   ├── sand/                   # 沙画模拟
│   │   │   ├── solar/                  # 太阳系模拟
│   │   │   ├── sorting/                # 排序可视化
│   │   │   ├── studio/                 # 3D 工作室
│   │   │   └── visitor/                # 访客可视化
│   │   ├── messages/                   # 留言页面
│   │   ├── moments/                    # 说说页面（瀑布流）
│   │   ├── photowall/                  # 照片墙
│   │   ├── timeline/                   # 归档页面
│   │   │   ├── page.tsx                # 文章列表（中枢链路 + 矩阵网格）
│   │   │   └── [slug]/                 # 文章详情（动态路由）
│   │   │       └── page.tsx
│   │   └── globals.css
│   ├── components/                     # UI 组件
│   │   ├── home/                       # 首页组件
│   │   ├── layout/                     # 布局组件（导航、页脚）
│   │   ├── music/                      # 音乐播放器组件
│   │   ├── photos/                     # 相册组件（PhotoCard、Lightbox）
│   │   ├── posts/                      # 文章组件
│   │   ├── providers/                  # 上下文提供者（主题等）
│   │   ├── ui/                         # 通用 UI 组件
│   │   └── widgets/                    # 小部件
│   ├── public/                         # 静态资源（图片等）
│   ├── data/                           # 数据文件
│   ├── siteConfig.ts                   # 站点全局配置
│   ├── next.config.ts                  # Next.js 配置（含 API 代理、图片域名白名单）
│   ├── tsconfig.json
│   └── package.json
│
├── zhuyu-backend/                      # 后端（FastAPI）
│   ├── app/
│   │   ├── main.py                     # FastAPI 入口
│   │   ├── config.py                   # 配置管理
│   │   ├── database.py                 # 数据库连接
│   │   ├── api/                        # RESTful API 接口
│   │   │   ├── auth.py                 # 用户认证
│   │   │   ├── github_auth.py          # GitHub OAuth
│   │   │   ├── qq_auth_new.py          # QQ 登录（心月互联）
│   │   │   ├── posts.py                # 文章管理
│   │   │   ├── chatters.py             # 说说系统
│   │   │   ├── albums.py               # 相册管理
│   │   │   ├── upload.py               # 文件上传（阿里云 OSS）
│   │   │   └── ...
│   │   ├── models/                     # SQLModel 数据模型
│   │   ├── schemas/                    # Pydantic 请求/响应模型
│   │   ├── services/                   # 业务逻辑层
│   │   └── utils/                      # 工具函数
│   ├── admin/                          # 管理后台（Vue 3 + Element Plus）
│   │   └── src/views/                  # 页面视图
│   ├── uploads/                        # 上传文件目录
│   ├── .env                            # 环境变量（不提交到 Git）
│   ├── .env.example                    # 环境变量示例
│   └── requirements.txt                # Python 依赖
│
├── netease-api/                        # 网易云音乐 API 服务（Node.js）
│   ├── app.js                          # Express 服务入口（端口 3001）
│   ├── package.json
│   └── .env.example
│
├── ecosystem.config.js                 # pm2 进程管理配置
├── backup_db.sh                        # 数据库备份脚本
├── health_check.sh                     # 健康检查脚本
├── README.md
└── LICENSE                             # MIT 许可证
```

---

## 技术栈

<table>
<tr>
<td width="50%" valign="top">

**前端**
- **Next.js 16.2** + **React 19.2** — App Router，SSR/SSG
- **Tailwind CSS 4** — 原子化样式
- **Framer Motion 12** — 页面过渡与微交互
- **TypeScript 5** — 类型安全
- **Three.js** — 3D 渲染（花园工作室）
- **Recharts 3** — 图表组件
- **Lucide React** — 图标库

</td>
<td width="50%" valign="top">

**后端**
- **FastAPI 0.115.6** — 高性能 Python Web 框架
- **SQLModel 0.0.22** — ORM（SQLAlchemy + Pydantic）
- **PostgreSQL 16** — 关系型数据库
- **阿里云 OSS** — 图片对象存储
- **JWT** — 身份认证
- **GitHub OAuth** — GitHub 第三方登录
- **心月互联** — QQ 第三方登录

</td>
</tr>
<tr>
<td width="50%" valign="top">

**管理后台**
- **Vue 3** + **Element Plus** — 后台 UI
- **Pure Admin** — 管理后台模板
- **Vite** — 构建工具
- **Pinia** — 状态管理
- 内嵌于后端，无需单独部署

</td>
<td width="50%" valign="top">

**音乐服务**
- **NeteaseCloudMusicApi** — 网易云音乐 API
- **Express** — Node.js 服务
- 独立部署，端口 3001，pm2 管理

</td>
</tr>
</table>

---

## 功能模块

### 博客前台

| 模块 | 路径 | 描述 |
|:-----|:-----|:-----|
| 首页 | `/` | 文章预览、说说、照片墙，一站式入口 |
| 归档 | `/timeline` | 文章列表（中枢链路 + 矩阵网格），支持置顶标识 |
| 文章详情 | `/timeline/[slug]` | 动态路由，单篇文章展示（含评论） |
| 说说 | `/moments` | 瀑布流布局（手机单列，桌面智能分配） |
| 留言 | `/messages` | 轻量话题讨论区 |
| 友链 | `/friends` | 友情链接展示与申请（自动补全URL协议） |
| 照片墙 | `/photowall` | OSS 缩略图 + 模糊过渡加载 |
| 花园彩蛋页 | `/garden` | 创意实验室（11 个互动工具，移动端适配） |
| 关于 | `/about` | 关于博主 |
| RSS | `/feed` | RSS 订阅源 |

### 彩蛋页工具

| 工具 | 路径 | 描述 |
|:-----|:-----|:-----|
| 仪表盘 | `/garden` | 数据概览与统计 |
| 访客信息 | `/garden/visitor` | 访客数据可视化 |
| 太阳系模拟 | `/garden/solar` | 太阳系 3D 模拟 |
| 烟花效果 | `/garden/fireworks` | 烟花粒子动画 |
| 流体模拟 | `/garden/fluid` | 流体动力学模拟 |
| 万花筒 | `/garden/kaleidoscope` | 万花筒视觉效果 |
| 重力沙子 | `/garden/sand` | 沙子物理模拟 |
| 生命游戏 | `/garden/life` | 康威生命游戏 |
| 排序可视化 | `/garden/sorting` | 排序算法可视化 |
| 颜色工具 | `/garden/color` | 颜色选择与调色 |
| 3D 工作室 | `/garden/studio` | 室内设计 3D 模拟（移动端适配） |
| 二维码 | `/garden/qrcode` | 二维码生成工具 |

### 管理后台

| 模块 | 路径 | 描述 |
|:-----|:-----|:-----|
| 仪表盘 | `/admin/dashboard` | 数据概览与统计 |
| 文章管理 | `/admin/post` | 文章的增删改查 |
| 说说管理 | `/admin/chatter` | 说说的增删改查（含图片删除） |
| 评论管理 | `/admin/comment` | 评论审核与管理 |
| 留言管理 | `/admin/message` | 留言审核与管理 |
| 相册管理 | `/admin/album` | 相册与照片管理 |
| 友链管理 | `/admin/friend-link` | 友链审核与管理 |
| 友链申请 | `/admin/friend-link-apply` | 申请审核 |
| 站点配置 | `/admin/site-config` | 全站配置管理 |
| 背景图管理 | `/admin/bg-images` | 背景图片管理 |
| 访客统计 | `/admin/visitor` | 访客数据分析 |
| 管理员管理 | `/admin/admin-users` | 管理员账号管理 |
| 账户设置 | `/admin/account-settings` | 个人账户设置 |
| Markdown 编辑 | `/admin/markdown` | Markdown 内容编辑 |

---

## 快速开始

### 1. 后端

```bash
cd zhuyu-backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库、密钥、OSS 等配置

# 初始化数据库
psql -U postgres -c "CREATE DATABASE zhuyu;"
# 根据 app/models/ 中的模型自动创建表结构

# 打包管理后台
cd admin && npm install && npm run build && cd ..

# 启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API 文档：`http://localhost:8000/docs`
管理后台：`http://localhost:8000/admin`

### 2. 前端

```bash
cd zhuyu

npm install
npm run dev                          # 开发模式 → http://localhost:3000

# 部署
npm run build && npm start
```

### 3. 网易云音乐 API（可选）

```bash
cd netease-api

npm install
node app.js                          # 端口 3001
```

---

## 配置说明

### 环境变量

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp zhuyu-backend/.env.example zhuyu-backend/.env
   ```

2. 编辑 `.env` 文件，填入你的配置

### 获取配置值

#### GitHub OAuth
1. 访问 https://github.com/settings/developers
2. 创建新的 OAuth App
3. 回调地址：`https://your-domain.com/api/auth/github/callback`

#### 阿里云 OSS
1. 访问 https://oss.console.aliyun.com/
2. 创建 Bucket
3. 获取 AccessKey ID 和 AccessKey Secret
4. 配置 CORS 规则，允许你的域名访问

#### QQ 登录（心月互联）
1. 访问 https://www.wch666.com/
2. 注册并创建应用
3. 回调地址：`https://your-domain.com/api/auth/qq/callback`

### 环境变量示例

```env
# zhuyu-backend/.env
DATABASE_URL=postgresql://user:password@127.0.0.1:5432/zhuyu
SECRET_KEY=your-secret-key
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET_NAME=your-bucket-name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_CUSTOM_DOMAIN=https://your-domain.com/oss-images
OSS_PREFIX=blog/
QQ_APP_ID=your-qq-app-id
QQ_APP_KEY=your-qq-app-key
CORS_ORIGINS=https://your-domain.com,http://localhost:3000
FRONTEND_ORIGIN=https://your-domain.com
```

---

## 部署说明

### 服务器环境

- **服务器**：推荐 2GB+ 内存
- **前端**：Next.js 16，端口 3000
- **后端**：FastAPI，端口 8000
- **音乐 API**：Node.js，端口 3001
- **数据库**：PostgreSQL 16
- **Nginx**：反向代理

### Nginx 配置

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name your-domain.com;
    root /path/to/project;

    # SSL 证书（使用宝塔面板自动申请）

    # OSS 图片反代（解决部分地区无法直连 OSS 的问题）
    location ^~ /oss-images/ {
        proxy_pass https://your-bucket.oss-cn-hangzhou.aliyuncs.com/;
        proxy_set_header Host your-bucket.oss-cn-hangzhou.aliyuncs.com;
        proxy_ssl_server_name on;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js 静态资源
    location ^~ /_next/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 管理后台
    location ^~ /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    # 前端（兜底）
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 使用 pm2 管理服务

```bash
npm install -g pm2

# 使用项目自带的 ecosystem.config.js 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 构建与部署

```bash
# 前端（修改代码后必须重新构建）
cd Zhuyu/zhuyu
rm -rf .next
NODE_OPTIONS=--max-old-space-size=1536 npm run build
pm2 restart nextjs-frontend

# 后端（修改代码后直接重启）
pm2 restart fastapi-backend

# 管理后台
cd Zhuyu/zhuyu-backend/admin
npm run build
pm2 restart fastapi-backend
```

---

## 数据库

### 表结构

| 表名 | 说明 |
|:-----|:-----|
| `user` | 管理后台用户 |
| `github_user` | GitHub 登录用户 |
| `qq_user` | QQ 登录用户 |
| `post` | 文章（含 is_pinned 置顶字段） |
| `category` | 文章分类 |
| `tag` | 标签 |
| `post_tag` | 文章-标签关联 |
| `chatter` | 说说 |
| `chatter_comment` | 说说评论 |
| `message` | 留言 |
| `comment` | 文章评论 |
| `album` | 相册 |
| `photo` | 照片（URL 通过 OSS 反代访问） |
| `friend_link` | 友链 |
| `site_config` | 站点配置 |
| `visitor` | 访客记录 |

### 备份

```bash
# 手动备份
./backup_db.sh

# PostgreSQL 导出
pg_dump -U postgres zhuyu > backup.sql
```

---

## 常见问题

### 图片加载不出来

**症状**：页面显示破损图片图标

**排查**：
1. F12 → Network → 筛选 Img，找到红色请求
2. 复制失败的 URL，在新标签页打开

**解决方案**：
- OSS 图片：配置 Nginx 反代（见上方 Nginx 配置）
- 本地图片：检查 `public/images/` 目录
- 构建缓存：`rm -rf .next && npm run build`

### 前端修改后不生效

```bash
cd Zhuyu/zhuyu
rm -rf .next
NODE_OPTIONS=--max-old-space-size=1536 npm run build
pm2 restart nextjs-frontend
```

### 管理后台修改后不生效

```bash
cd Zhuyu/zhuyu-backend/admin
npm run build
pm2 restart fastapi-backend
```

### 说说瀑布流排序时间错误

前端使用 UTC 时间解析，确保 `timeAgo` 函数和排序逻辑中时间解析一致：
```javascript
const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
```

### QQ 登录跳转问题

如果 QQ 登录后跳转到首页而不是原页面，检查：
1. 前端登录按钮是否设置了 `sessionStorage`
2. 心月互联 API 是否支持 state 参数回传
3. 浏览器是否缓存了旧的前端代码

### 内存限制

服务器内存紧张时，构建前端需限制内存：
```bash
NODE_OPTIONS=--max-old-space-size=1536 npm run build
```

---

## 设计亮点

- **Glassmorphism 风格** — 全站毛玻璃质感，亮色暗色双主题
- **微交互动画** — Framer Motion 驱动，页面过渡、卡片悬停、果冻弹跳
- **智能瀑布流** — 说说页手机单列、桌面端按高度智能分配
- **图片渐进加载** — OSS 缩略图模糊占位 + 三阶段原图加载
- **文章置顶** — 归档页矩阵网格支持置顶标识
- **全文搜索** — 支持标题、描述、内容、分类名搜索
- **花园实验室** — 11 个创意互动工具，移动端适配
- **移动端适配** — 导航栏、花园侧边栏、3D 工作室均有移动端方案
- **第三方登录** — GitHub OAuth + 心月互联 QQ 登录
- **OSS 图片反代** — 解决部分地区无法直连阿里云 OSS 的问题

---

## License

MIT

---

<div align="center">

**博客地址**：[www.zhuyu.me](https://www.zhuyu.me)

**作者**：zhuyu

**GitHub**：[@zhuyu07417](https://github.com/zhuyu07417)

</div>
