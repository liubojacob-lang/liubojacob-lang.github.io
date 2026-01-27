# FullStack AI 博客

![Hexo](https://img.shields.io/badge/Hexo-8.1.1-0e83c8?logo=hexo)
![Butterfly](https://img.shields.io/badge/Butterfly-5.5.4-brightgreen)
![Node](https://img.shields.io/badge/Node.js-18.0+-green?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue)

> 专注前端、后端、AI 与工程化技术分享的个人技术博客

[![Preview](https://img.shields.io/badge/Preview-Online-orange)](https://liubojacob-lang.github.io/)
[![GitHub](https://img.shields.io/badge/Github-Repo-purple?logo=github)](https://github.com/liubojacob-lang/liubojacob-lang.github.io)

---

## 📖 项目简介

FullStack AI 是一个基于 Hexo 静态站点生成器构建的个人技术博客，使用 Butterfly 主题，专注于分享全栈开发、人工智能、前端工程化等技术内容。

### 核心特性

- 🚀 **高性能**：图片优化（WebP格式）、懒加载、代码分割
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎨 **现代化UI**：Butterfly 主题，支持深色模式
- 🔍 **SEO优化**：结构化数据、Sitemap、语义化HTML
- ⚡ **快速加载**：资源压缩、CDN加速
- 📝 **Markdown写作**：支持代码高亮、数学公式

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Hexo** | 8.1.1 | 静态站点生成器 |
| **Butterfly** | 5.5.4 | 主题 |
| **Node.js** | 18.0+ | 运行环境 |
| **Markdown** | - | 内容编写 |
| **WebP** | - | 图片格式优化 |
| **Prism.js** | - | 代码高亮 |

---

## ✨ 功能特性

### 已实现功能

- [x] 文章分类与标签管理
- [x] 文章搜索功能
- [x] 深色模式切换
- [x] 友情链接页面
- [x] 知识库页面
- [x] 面包屑导航
- [x] 评论系统集成
- [x] 图片懒加载
- [x] SEO优化（JSON-LD结构化数据）
- [x] 图片压缩优化（节省89%空间）
- [x] URL英文化（SEO友好）

---

## 📦 安装与运行

### 环境要求

- Node.js 18.0 或更高版本
- Git
- npm 或 yarn

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/liubojacob-lang/liubojacob-lang.github.io.git
cd liubojacob-lang.github.io

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 或
hexo clean && hexo g && hexo s

# 4. 访问 http://localhost:4000
```

### 构建部署

```bash
# 生成静态文件
npm run build
# 或
hexo clean && hexo g

# 部署到GitHub Pages
npm run deploy
```

---

## 📁 项目结构

```
hexo-starter/
├── source/                 # 源文件目录
│   ├── _posts/            # Markdown文章
│   ├── images/            # 图片资源
│   ├── css/               # 自定义样式
│   ├── about/             # 关于页面
│   ├── link/              # 友情链接
│   └── wiki/              # 知识库
├── themes/                # 主题目录
│   └── butterfly/         # Butterfly主题
├── public/                # 生成的静态文件
├── _config.yml            # Hexo主配置
├── _config.butterfly.yml  # Butterfly主题配置
├── package.json           # 项目依赖
├── optimize-images.js     # 图片优化脚本
└── README.md              # 项目说明
```

---

## ⚙️ 配置说明

### 关键配置文件

1. **_config.yml** - Hexo主配置
   - URL设置
   - 永久链接格式
   - 部署配置

2. **_config.butterfly.yml** - 主题配置
   - 导航菜单
   - 主题色
   - 首页背景图
   - 深色模式

### 部署到GitHub Pages

```yaml
# _config.yml
deploy:
  type: git
  repo: https://github.com/liubojacob-lang/liubojacob-lang.github.io.git
  branch: main
```

---

## 🎨 主题定制

### 自定义样式

在 `source/css/custom.css` 中添加自定义样式：

```css
/* 示例：自定义主题色 */
:root {
  --main-color: #49b1f5;
  --hover-color: #fc6423;
}
```

### 修改导航菜单

编辑 `_config.butterfly.yml`：

```yaml
nav:
  menu:
    首页: / || fas fa-home
    归档: /archives/ || fas fa-archive
    标签: /tags/ || fas fa-tags
    分类: /categories/ || fas fa-folder-open
```

---

## 📊 性能优化

本项目已实施以下优化措施：

| 优化项 | 效果 |
|--------|------|
| 图片压缩 | 节省89%空间（27MB→3.3MB） |
| WebP格式 | 更小的文件体积 |
| 懒加载 | 减少首屏加载时间 |
| 代码分割 | 按需加载JavaScript |
| CDN加速 | 静态资源CDN分发 |
| Gzip压缩 | 减少传输大小 |

---

## 📝 写作指南

### 创建新文章

```bash
hexo new "文章标题"
# 或指定分类
hexo new "文章标题" --category 前端
```

### 文章Front-Matter模板

```yaml
---
title: 文章标题
slug: article-slug  # 英文slug，SEO友好
date: 2026-01-27 10:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类1
  - 二级分类
cover: /images/cover-image.webp
top_img: /images/cover-image.webp
---
```

---

## 🚀 部署指南

### GitHub Pages 自动部署

使用 GitHub Actions 实现自动部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          npm install
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

### Vercel 部署

1. 导入项目到 Vercel
2. 构建命令：`npm run build`
3. 输出目录：`public`
4. 自动部署

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📈 更新日志

### v1.0.0 (2026-01-27)

- ✨ 初始化项目
- 🎨 集成Butterfly主题
- 🚀 优化图片加载性能
- 📝 添加20篇技术文章
- 🔍 实现搜索功能
- 🌙 支持深色模式
- 📱 响应式设计优化

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 📮 联系方式

- **GitHub**: [@liubojacob-lang](https://github.com/liubojacob-lang)
- **Email**: liubojacob@gmail.com
- **博客**: [https://liubojacob-lang.github.io/](https://liubojacob-lang.github.io/)

---

## 🙏 致谢

- [Hexo](https://hexo.io/) - 强大的静态站点生成器
- [Butterfly](https://butterfly.js.org/) - 精美的Hexo主题
- [Jerry](https://butterfly.js.org/) - Butterfly主题作者

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️**

Made with ❤️ by FullStack Developer

</div>
