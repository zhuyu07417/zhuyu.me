<div align="center">

# zhuyu

**「yu」见 — 愿：你若满目星辰**

一个基于开源项目深度定制的全栈个人博客系统，前端 Next.js，后端 FastAPI，附带 Vue 管理后台和网易云音乐 API 服务。

## 致谢

本项目基于以下开源项目修改而来：

- **[Zhuyu](https://github.com/Xinghongia/Zhuyu)** — 前后端架构与整体框架 by [Xinghongia](https://github.com/Xinghongia)
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

your-domain.com 是一个功能完善的全栈个人博客系统，具有以下特点：

- 🎨 **Glassmorphism 风格** — 全站毛玻璃质感，亮色暗色双主题
- 🎭 **微交互动画** — Framer Motion 驱动，页面过渡、卡片悬停、果冻弹跳
- 📱 **移动端适配** — 响应式布局，移动端导航菜单
- 🔐 **第三方登录** — GitHub OAuth + QQ 登录（心月互联）
- 🎵 **音乐播放器** — 网易云音乐集成，支持歌单
- 🌿 **花园实验室** — 18 个创意互动工具
- 📊 **访客统计** — 记录访问数据，管理后台可视化
- 🔗 **友链系统** — 用户可在线申请友链
- 📝 **Markdown 编辑** — 支持多种编程语言的语法高亮
- 🗑️ **OSS 自动清理** — 删除照片/相册时自动清理阿里云 OSS 文件

---

## 项目结构

```
.
├── zhuyu/                              # 前端（Next.js 16 App Router）
│   ├── app/                               # 页面路由
│   │   ├── page.tsx                       # 首页
│   │   ├── layout.tsx                     # 根布局
│   │   ├── HomeClient.tsx                 # 首页客户端组件
│   │   ├── globals.css                    # 全局样式
│   │   ├── about/                         # 关于页面
│   │   │   ├── page.tsx
│   │   │   └── about.md
│   │   ├── api/                           # 前端 API 封装
│   │   │   ├── index.ts                   # API 导出
│   │   │   ├── client.ts                  # API 客户端
│   │   │   ├── types.ts                   # 类型定义
│   │   │   ├── posts.ts                   # 文章接口
│   │   │   ├── albums.ts                  # 相册接口
│   │   │   ├── bookmarks.ts               # 收藏夹接口
│   │   │   ├── categories.ts              # 分类接口
│   │   │   ├── chatters.ts                # 聊天接口
│   │   │   ├── comments.ts                # 评论接口
│   │   │   ├── friends.ts                 # 友链接口
│   │   │   ├── messages.ts                # 留言接口
│   │   │   ├── projects.ts                # 项目接口
│   │   │   ├── site-config.ts             # 站点配置接口
│   │   │   ├── music/                     # 音乐 API 路由
│   │   │   │   └── route.ts
│   │   │   └── uapis/                     # 第三方 API 路由
│   │   │       └── route.ts
│   │   ├── auth/                          # 认证相关
│   │   │   └── callback/
│   │   │       └── page.tsx               # OAuth 回调页面
│   │   ├── bookmark/                      # 收藏夹页面
│   │   │   └── page.tsx
│   │   ├── feed/
│   │   │   └── route.ts                   # RSS 订阅
│   │   ├── friends/                       # 友链页面
│   │   │   └── page.tsx
│   │   ├── garden/                        # 花园（创意实验室）
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── color/                     # 调色板
│   │   │   ├── fireworks/                 # 烟花效果
│   │   │   ├── fluid/                     # 流体模拟
│   │   │   ├── json/                      # JSON 编辑器
│   │   │   ├── kaleidoscope/              # 万花筒
│   │   │   ├── life/                      # 生命游戏
│   │   │   ├── map/                       # 地图展示
│   │   │   ├── markdown/                  # Markdown 编辑器
│   │   │   ├── math/                      # 数学可视化
│   │   │   ├── python/                    # Python 运行器
│   │   │   ├── qrcode/                    # 二维码生成
│   │   │   ├── rain/                      # 雨滴效果
│   │   │   ├── sand/                      # 沙画模拟
│   │   │   ├── solar/                     # 太阳系模拟
│   │   │   ├── sorting/                   # 排序可视化
│   │   │   ├── stars/                     # 星空效果
│   │   │   ├── studio/                    # 创意工作室
│   │   │   └── visitor/                   # 访客可视化
│   │   ├── login/                         # 登录页面
│   │   │   └── page.tsx
│   │   ├── messages/                      # 留言页面
│   │   │   └── page.tsx
│   │   ├── moments/                       # 说说页面
│   │   │   └── page.tsx
│   │   ├── music/                         # 音乐播放器
│   │   │   └── page.tsx
│   │   ├── photowall/                     # 照片墙
│   │   │   └── page.tsx
│   │   ├── posts/                         # 文章系统
│   │   │   ├── page.tsx
│   │   │   └── [slug]/                    # 文章详情（动态路由）
│   │   │       └── page.tsx
│   │   └── timeline/                      # 归档时间线
│   │       └── page.tsx
│   ├── components/                        # UI 组件
│   │   ├── AboutTabs.tsx                  # 关于页标签组件
│   │   ├── home/                          # 首页组件
│   │   ├── icons/                         # 图标组件
│   │   ├── layout/                        # 布局组件（导航、页脚）
│   │   ├── music/                         # 音乐播放器组件
│   │   ├── photos/                        # 相册组件
│   │   ├── posts/                         # 文章组件
│   │   ├── providers/                     # 上下文提供者（主题等）
│   │   ├── ui/                            # 通用 UI 组件
│   │   └── widgets/                       # 小部件
│   ├── public/                            # 静态资源
│   ├── content/                           # Markdown 内容
│   ├── data/                              # 数据文件
│   ├── types/                             # TypeScript 类型定义
│   ├── siteConfig.ts                      # 站点全局配置
│   ├── next.config.ts                     # Next.js 配置（含 API 代理）
│   ├── tsconfig.json                      # TypeScript 配置
│   ├── eslint.config.mjs                  # ESLint 配置
│   ├── postcss.config.mjs                 # PostCSS 配置
│   ├── next-env.d.ts                      # Next.js 环境类型
│   └── package.json                       # 依赖配置
│
├── zhuyu-backend/                      # 后端（FastAPI）
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                        # FastAPI 入口
│   │   ├── config.py                      # 配置管理
│   │   ├── database.py                    # 数据库连接
│   │   ├── deps.py                        # 依赖注入
│   │   ├── api/                           # RESTful API 接口
│   │   │   ├── __init__.py
│   │   │   ├── router.py                  # 路由汇总
│   │   │   ├── auth.py                    # 用户认证
│   │   │   ├── github_auth.py             # GitHub OAuth
│   │   │   ├── qq_auth.py                 # QQ 登录（旧版）
│   │   │   ├── qq_auth_new.py             # QQ 登录（新版，心月互联）
│   │   │   ├── posts.py                   # 文章管理
│   │   │   ├── categories.py              # 分类管理
│   │   │   ├── tags.py                    # 标签管理
│   │   │   ├── comments.py                # 评论系统
│   │   │   ├── messages.py                # 留言系统
│   │   │   ├── chatters.py                # 聊天/说说系统
│   │   │   ├── albums.py                  # 相册管理
│   │   │   ├── friend_links.py            # 友链管理
│   │   │   ├── friend_link_apply.py       # 友链申请
│   │   │   ├── site_config.py             # 站点配置
│   │   │   ├── upload.py                  # 文件上传（阿里云 OSS）
│   │   │   ├── bookmarks.py               # 收藏夹管理
│   │   │   ├── visitors.py                # 访客统计
│   │   │   ├── dashboard.py               # 管理仪表盘
│   │   │   ├── music.py                   # 音乐服务
│   │   │   ├── netease_config.py          # 网易云配置
│   │   │   ├── admin_users.py             # 管理员管理
│   │   │   ├── session_manage.py          # 会话管理
│   │   │   ├── admin_tokens.py            # 管理员令牌
│   │   │   └── permanent_token.py         # 永久令牌
│   │   ├── models/                        # SQLModel 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py                    # 用户模型
│   │   │   ├── github_user.py             # GitHub 用户模型
│   │   │   ├── qq_user.py                 # QQ 用户模型
│   │   │   ├── post.py                    # 文章/分类/标签模型
│   │   │   ├── comment.py                 # 评论模型
│   │   │   ├── message.py                 # 留言模型
│   │   │   ├── chatter.py                 # 聊天模型
│   │   │   ├── album.py                   # 相册模型
│   │   │   ├── friend_link.py             # 友链模型
│   │   │   ├── site_config.py             # 站点配置模型
│   │   │   ├── bookmark.py                # 收藏夹模型
│   │   │   ├── visitor.py                 # 访客模型
│   │   │   └── login_session.py           # 登录会话模型
│   │   ├── schemas/                       # Pydantic 请求/响应模型
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── post.py
│   │   │   ├── comment.py
│   │   │   ├── album.py
│   │   │   ├── bookmark.py
│   │   │   ├── category.py
│   │   │   ├── chatter.py
│   │   │   ├── friend_link.py
│   │   │   └── site_config.py
│   │   ├── services/                      # 业务逻辑层
│   │   │   ├── __init__.py
│   │   │   ├── post_service.py
│   │   │   ├── category_service.py
│   │   │   ├── tag_service.py
│   │   │   ├── comment_service.py
│   │   │   ├── message_service.py
│   │   │   ├── chatter_service.py
│   │   │   ├── album_service.py
│   │   │   ├── friend_link_service.py
│   │   │   ├── bookmark_service.py
│   │   │   ├── visitor_service.py
│   │   │   └── site_config_service.py
│   │   ├── oss_utils.py                   # OSS 文件删除工具
│   │   └── utils/                         # 工具函数
│   │       ├── __init__.py
│   │       ├── auth.py                    # 认证工具
│   │       └── session_guard.py           # 会话守卫
│   ├── admin/                             # 管理后台（Vue 3 + Element Plus）
│   │   ├── src/
│   │   │   ├── views/                     # 页面视图
│   │   │   │   ├── about/                 # 关于页面
│   │   │   │   ├── account-settings/      # 账户设置
│   │   │   │   ├── admin-tokens/          # 管理员令牌管理
│   │   │   │   ├── admin-users/           # 管理员管理
│   │   │   │   ├── album/                 # 相册管理
│   │   │   │   ├── bg-images/             # 背景图管理
│   │   │   │   ├── bookmark/              # 收藏夹管理
│   │   │   │   ├── category/              # 分类管理
│   │   │   │   ├── chatter/               # 聊天管理
│   │   │   │   ├── comment/               # 评论管理
│   │   │   │   ├── dashboard/             # 仪表盘
│   │   │   │   ├── editor/                # Markdown 编辑器
│   │   │   │   ├── empty/                 # 空页面
│   │   │   │   ├── error/                 # 错误页面（403/404/500）
│   │   │   │   ├── friend-link/           # 友链管理
│   │   │   │   ├── friend-link-apply/     # 友链申请管理
│   │   │   │   ├── login/                 # 登录页面
│   │   │   │   ├── markdown/              # Markdown 编辑器
│   │   │   │   ├── message/               # 留言管理
│   │   │   │   ├── monitor/               # 系统监控（日志/在线用户）
│   │   │   │   ├── netease-cookie/        # 网易云 Cookie 管理
│   │   │   │   ├── permanent-token/       # 永久令牌管理
│   │   │   │   ├── permission/            # 权限管理
│   │   │   │   ├── post/                  # 文章管理
│   │   │   │   ├── project/               # 项目管理
│   │   │   │   ├── sessions/              # 会话管理
│   │   │   │   ├── site-config/           # 站点配置
│   │   │   │   ├── system/                # 系统管理（用户/角色/菜单/部门）
│   │   │   │   ├── tag/                   # 标签管理
│   │   │   │   └── visitor/               # 访客统计
│   │   │   ├── api/                       # 前端 API
│   │   │   ├── store/                     # Pinia 状态管理
│   │   │   ├── router/                    # 路由配置
│   │   │   ├── layout/                    # 布局组件
│   │   │   ├── components/                # 组件
│   │   │   ├── directives/                # 指令
│   │   │   ├── assets/                    # 静态资源
│   │   │   ├── plugins/                   # 插件
│   │   │   ├── config/                    # 配置
│   │   │   ├── style/                     # 样式
│   │   │   └── utils/                     # 工具函数
│   │   ├── package.json                   # Vue 项目依赖
│   │   ├── vite.config.ts                 # Vite 配置
│   │   ├── tsconfig.json                  # TypeScript 配置
│   │   └── tailwind.config.js             # Tailwind 配置
│   ├── uploads/                           # 上传文件目录（运行时生成）
│   ├── .env                               # 环境变量（需要自行创建）
│   ├── .env.example                       # 环境变量示例
│   └── requirements.txt                   # Python 依赖
│
├── netease-api/                           # 网易云音乐 API 服务（Node.js）
│   ├── app.js                             # Express 服务入口（端口 3001）
│   ├── package.json                       # Node.js 依赖
│   └── .env                               # 环境变量（可选）
│
├── index.html                             # 默认主机页面
├── .htaccess                              # Apache 配置
├── .user.ini                              # PHP 配置
├── 404.html                               # 404 错误页面
├── LICENSE                                # MIT 许可证
├── DEPLOY_NOTES.md                        # 部署踩坑记录
├── nginx-cache-debug.md                   # Nginx 缓存调试文档
├── session_deploy.py                      # 会话部署脚本
└── 音乐.md                                # Meting 音乐库文档
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
- **CodeMirror 6** — 代码编辑器（支持多种语言高亮）
- **Three.js 0.184** — 3D 渲染
- **Leaflet 1.9** — 地图展示
- **Recharts 3** — 图表组件
- **Lucide React** — 图标库

</td>
<td width="50%" valign="top">

**后端**
- **FastAPI 0.115.6** — 高性能 Python Web 框架
- **SQLModel 0.0.22** — ORM（SQLAlchemy + Pydantic）
- **PostgreSQL** — 关系型数据库
- **阿里云 OSS** — 图片对象存储（oss2）
- **JWT** — 身份认证（python-jose）
- **GitHub OAuth** — GitHub 第三方登录
- **心月互联** — QQ 第三方登录（[your-qq-platform.com](https://your-qq-platform.com/)）
- **Pillow** — 图片处理

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
| 文章 | `/posts` | 分类筛选、标签、Markdown 渲染、代码高亮 |
| 文章详情 | `/posts/[slug]` | 动态路由，单篇文章展示 |
| 说说 | `/moments` | 碎片化记录，类朋友圈时间线 |
| 留言 | `/messages` | 轻量话题讨论区 |
| 收藏夹 | `/bookmark` | 站点导航，分类管理，平台标签，自动获取 favicon |
| 友链 | `/friends` | 友情链接展示与申请 |
| 照片墙 | `/photowall` | 相册瀑布流展示 |
| 归档 | `/timeline` | 时间河流可视化，拖动浏览全部文章 |
| 音乐 | `/music` | 云音乐播放器，支持歌单 |
| 花园 | `/garden` | 创意实验室（18 个互动小工具） |
| 关于 | `/about` | 关于博主 |
| 登录 | `/login` | GitHub OAuth 登录 |
| RSS | `/feed` | RSS 订阅源 |

### 花园工具

| 工具 | 路径 | 描述 |
|:-----|:-----|:-----|
| 调色板 | `/garden/color` | 颜色选择与调色 |
| 烟花效果 | `/garden/fireworks` | 烟花粒子动画 |
| 流体模拟 | `/garden/fluid` | 流体动力学模拟 |
| JSON 编辑器 | `/garden/json` | JSON 格式化与编辑 |
| 万花筒 | `/garden/kaleidoscope` | 万花筒视觉效果 |
| 生命游戏 | `/garden/life` | 康威生命游戏 |
| 地图展示 | `/garden/map` | Leaflet 交互地图 |
| Markdown 编辑器 | `/garden/markdown` | 实时 Markdown 预览 |
| 数学可视化 | `/garden/math` | 函数图形绘制 |
| Python 运行器 | `/garden/python` | Python 代码运行 |
| 二维码生成 | `/garden/qrcode` | 二维码生成工具 |
| 雨滴效果 | `/garden/rain` | 雨滴粒子动画 |
| 沙画模拟 | `/garden/sand` | 沙子物理模拟 |
| 太阳系模拟 | `/garden/solar` | 太阳系 3D 模拟 |
| 排序可视化 | `/garden/sorting` | 排序算法可视化 |
| 星空效果 | `/garden/stars` | 星空粒子动画 |
| 创意工作室 | `/garden/studio` | 综合创意工具 |
| 访客可视化 | `/garden/visitor` | 访客数据可视化 |

### 管理后台

| 模块 | 路径 | 描述 |
|:-----|:-----|:-----|
| 仪表盘 | `/dashboard` | 数据概览与统计 |
| 文章管理 | `/post` | 文章的增删改查 |
| 分类管理 | `/category` | 分类的增删改查 |
| 标签管理 | `/tag` | 标签的增删改查 |
| 评论管理 | `/comment` | 评论审核与管理 |
| 留言管理 | `/message` | 留言审核与管理 |
| 说说管理 | `/chatter` | 说说的增删改查 |
| 相册管理 | `/album` | 相册与照片管理 |
| 收藏夹管理 | `/bookmark` | 收藏站点管理 |
| 友链管理 | `/friend-link` | 友链审核与管理 |
| 友链申请 | `/friend-link-apply` | 申请审核 |
| 项目管理 | `/project` | 项目展示管理 |
| 站点配置 | `/site-config` | 全站配置管理 |
| 背景图管理 | `/bg-images` | 背景图片管理 |
| 访客统计 | `/visitor` | 访客数据分析 |
| 管理员管理 | `/admin-users` | 管理员账号管理 |
| 管理员令牌 | `/admin-tokens` | API 令牌管理 |
| 永久令牌 | `/permanent-token` | 永久访问令牌 |
| 会话管理 | `/sessions` | 登录会话管理 |
| 账户设置 | `/account-settings` | 个人账户设置 |
| Markdown 编辑 | `/markdown` | Markdown 内容编辑 |
| 网易云 Cookie | `/netease-cookie` | 网易云 Cookie 管理 |
| 系统管理 | `/system` | 用户/角色/菜单/部门 |
| 系统监控 | `/monitor` | 日志/在线用户监控 |
| 权限管理 | `/permission` | 页面与按钮权限 |
| 登录页面 | `/login` | 管理后台登录 |

### API 模块

| 模块 | 描述 |
|:-----|:-----|
| auth | 用户认证 |
| github_auth | GitHub OAuth 登录 |
| qq_auth | QQ 登录（旧版） |
| qq_auth_new | QQ 登录（新版，心月互联） |
| posts | 文章管理 |
| categories | 分类管理 |
| tags | 标签管理 |
| comments | 评论系统 |
| messages | 留言系统 |
| chatters | 聊天/说说系统 |
| albums | 相册管理 |
| friend_links | 友链管理 |
| friend_link_apply | 友链申请 |
| site_config | 站点配置 |
| upload | 文件上传（阿里云 OSS） |
| bookmarks | 收藏夹管理 |
| visitors | 访客统计 |
| dashboard | 管理仪表盘 |
| music | 音乐服务 |
| netease_config | 网易云配置 |
| admin_users | 管理员管理 |
| session_manage | 会话管理 |
| admin_tokens | 管理员令牌 |
| permanent_token | 永久令牌 |

---

## 快速开始

### 1. 后端

```bash
cd zhuyu-backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库、密钥、OSS 等配置

# 初始化数据库
# 根据 app/models/ 中的模型创建表结构

# 打包管理后台
cd admin && pnpm install && pnpm build && cd ..

# 启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API 文档：`http://localhost:8000/docs`
管理后台：`http://localhost:8000/admin`

### 2. 前端

```bash
cd Zhuyu

pnpm install
pnpm dev                          # 开发模式 → http://localhost:3000

# 部署
pnpm build && pnpm start
```

### 3. 网易云音乐 API（可选）

```bash
cd netease-api

# 需要先安装依赖（首次运行）
npm install express NeteaseCloudMusicApi

# 启动服务 → 端口 3001
node app.js
```

**注意**：音乐 API 服务使用 pm2 管理，可通过管理后台的「网易云 Cookie」页面重启服务。

---

## 配置说明

### 环境变量配置

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp zhuyu-backend/.env.example zhuyu-backend/.env
   ```

2. 编辑 `.env` 文件，填入你的配置：
   - 数据库连接信息
   - JWT密钥（建议使用随机生成的强密钥）
   - GitHub OAuth配置（从 GitHub Developer Settings 获取）
   - 阿里云OSS配置（从阿里云控制台获取）
   - QQ登录配置（从心月互联获取）

### 获取配置值

#### GitHub OAuth
1. 访问 https://github.com/settings/developers
2. 创建新的 OAuth App
3. 获取 Client ID 和 Client Secret
4. 回调地址设置为：`https://your-domain.com/api/auth/github/callback`

#### 阿里云OSS
1. 访问 https://oss.console.aliyun.com/
2. 创建 Bucket
3. 获取 AccessKey ID 和 AccessKey Secret
4. 配置 CORS 规则，允许你的域名访问

#### QQ登录（心月互联）
1. 访问 https://your-qq-platform.com/
2. 注册并创建应用
3. 获取 Token
4. 回调地址设置为：`https://your-domain.com/api/auth/qq/callback`

#### 网易云音乐API（可选）
1. 安装依赖：`npm install express NeteaseCloudMusicApi`
2. 启动服务：`node app.js`
3. 在管理后台的「网易云 Cookie」页面配置 Cookie

---

## 环境变量

### zhuyu-backend/.env

```env
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
SECRET_KEY=your-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# 阿里云 OSS
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET_NAME=your-bucket-name
OSS_ENDPOINT=oss-cn-xxx.aliyuncs.com
OSS_CUSTOM_DOMAIN=your-custom-domain
OSS_PREFIX=your-prefix

# QQ登录（心月互联）
QQ_APP_ID=your-qq-app-id
QQ_APP_KEY=your-qq-app-key
XINYUE_QQ_TOKEN=your-xinyue-token

# CORS（可选，默认允许 localhost:3000 和 www.your-domain.com）
CORS_ORIGINS=http://localhost:3000,https://www.your-domain.com

# 前端地址（用于OAuth回调）
FRONTEND_ORIGIN=https://www.your-domain.com
```

### netease-api/.env（可选）

```env
# 后端 API 地址（用于获取网易云 Cookie）
BACKEND_API=http://127.0.0.1:8000
```

---

## 部署说明

### 服务器环境

- **服务器**：阿里云 ECS（推荐 2GB+ 内存）
- **面板**：宝塔面板（可选）
- **前端**：Next.js 16，端口 3000
- **后端**：FastAPI，端口 8000
- **音乐 API**：Node.js，端口 3001
- **Nginx**：反向代理，`/api/` → 8000，`/music-api/` → 3001，`/` → 3000

### Nginx 配置示例

```nginx
# 前端
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 禁用缓存，避免部署后返回旧 HTML
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    proxy_cache off;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";

    proxy_connect_timeout 30s;
    proxy_read_timeout 86400s;
    proxy_send_timeout 30s;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# 后端 API
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 音乐 API
location /music-api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_set_header Host $host;
}

# 上传文件
location /uploads/ {
    proxy_pass http://127.0.0.1:8000/uploads/;
}
```

### 使用 pm2 管理服务（推荐）

```bash
# 安装 pm2
npm install -g pm2

# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'fastapi-backend',
      script: 'venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/path/to/zhuyu-backend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'nextjs-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/path/to/Zhuyu',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'netease-api',
      script: 'app.js',
      cwd: '/path/to/netease-api',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      max_memory_restart: '200M'
    }
  ]
};
EOF

# 启动所有服务
pm2 start ecosystem.config.js

# 保存配置并设置开机自启
pm2 save
pm2 startup
```

### 常见问题

**Nginx 缓存导致旧页面**

部署后浏览器仍显示旧版本？在 Nginx 配置中禁用代理缓存（详见 `DEPLOY_NOTES.md`）。

**内存限制**

服务器内存紧张时，可限制 Next.js 内存使用：
```bash
NODE_OPTIONS=--max-old-space-size=512 next start
```

**宝塔面板注意事项**

- Node 项目管理器可能有自己的缓存机制，重启项目后确认进程 PID 更新
- 部署后用 `curl -s https://www.your-domain.com/ | grep buildId` 确认返回的是最新构建

**QQ登录跳转问题**

如果QQ登录后跳转到首页而不是原页面，请检查：
1. 前端登录按钮是否设置了 `sessionStorage`
2. 心月互联API是否支持state参数回传
3. 浏览器是否缓存了旧的前端代码

---

## 设计亮点

- **Glassmorphism 风格** — 全站毛玻璃质感，亮色暗色双主题
- **微交互动画** — Framer Motion 驱动，页面过渡、卡片悬停、果冻弹跳
- **收藏夹** — 自动获取站点 favicon，平台标签，搜索过滤
- **时间河流** — 归档页的可视化时间线，拖动交互
- **音乐播放器** — 网易云音乐集成，支持歌单
- **花园实验室** — 18 个创意互动工具
- **移动端适配** — 响应式布局，移动端导航菜单
- **第三方登录** — GitHub OAuth + 心月互联 QQ 登录
- **访客统计** — 记录访问数据，管理后台可视化
- **友链申请** — 用户可在线申请友链
- **代码高亮** — 支持多种编程语言的语法高亮
- **OSS 自动清理** — 删除照片/相册时自动清理阿里云 OSS 文件

---

## 相关文档

- [部署踩坑记录](DEPLOY_NOTES.md) — Nginx 缓存、API 代理等实战经验
- [音乐 API 文档](音乐.md) — Meting 音乐库使用说明

---

## 安全提示

- **永远不要**将 `.env` 文件提交到 Git 仓库
- **永远不要**在公开场合分享你的密钥
- 定期更换密钥以提高安全性
- 使用 SSH 密钥认证代替密码认证
- 定期备份数据库

---

## License

MIT

---

<div align="center">

**博客地址**：[www.your-domain.com](https://www.your-domain.com)

**作者**：your-name

**GitHub**：[@your-username](https://github.com/your-username)

</div>
