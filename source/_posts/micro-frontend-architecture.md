---
title: 微前端架构实战：qiankun与single-spa完全指南
slug: micro-frontend-architecture-guide
cover: /images/micro-frontend-architecture.webp
top_img: /images/micro-frontend-architecture.webp
date: 2026-01-21 00:45:00
categories:
  - 前端
  - 架构
tags:
  - 微前端
  - 前端架构
---

## 前言

随着前端应用规模的增长，单体前端应用面临维护困难、部署缓慢、技术栈固化等问题。微前端架构应运而生，它允许我们将大型前端应用拆分成多个小型、独立的应用。

本文将深入讲解微前端架构的两种主流方案：qiankun 和 single-spa。

## 一、微前端架构概述

### 什么是微前端？

```
微前端概念：
┌─────────────────────────────────────────┐
│          微前端应用架构                   │
├─────────────────────────────────────────┤
│  主应用（Base App）                      │
│  - 路由管理                              │
│  - 应用加载                              │
│  - 状态共享                              │
│  - 通信协调                              │
├─────────────────────────────────────────┤
│  微应用（Micro Apps）                    │
│  ┌────────┬────────┬────────┬────────┐ │
│  │ App 1  │ App 2  │ App 3  │ App 4  │ │
│  │ React  │ Vue    │ Angular│ Svelte │ │
│  └────────┴────────┴────────┴────────┘ │
│  - 独立开发                              │
│  - 独立部署                              │
│  - 独立运行                              │
└─────────────────────────────────────────┘
```

### 微前端的优势

```javascript
/*
技术优势：
✅ 团队自治 - 不同团队可以独立开发
✅ 技术栈无关 - React/Vue/Angular 共存
✅ 独立部署 - 微应用可独立发布
✅ 增量升级 - 逐步迁移旧系统
✅ 故障隔离 - 一个应用崩溃不影响其他

业务优势：
✅ 快速交付 - 并行开发，加快迭代
✅ 灵活扩展 - 按需添加功能模块
✅ 降低风险 - 分布式开发降低单点风险
*/
```

### 主流微前端方案对比

```javascript
/*
方案对比：

┌──────────┬──────────┬──────────┬──────────┐
│          │ qiankun  │single-spa│  Module   │
│          │          │          │ Federation│
├──────────┼──────────┼──────────┼──────────┤
│上手难度  │   ⭐⭐   │   ⭐⭐⭐  │   ⭐⭐⭐⭐ │
│功能丰富度│   ⭐⭐⭐⭐ │   ⭐⭐⭐  │   ⭐⭐⭐  │
│生态成熟度│   ⭐⭐⭐⭐ │   ⭐⭐⭐⭐ │   ⭐⭐   │
│社区活跃度│   ⭐⭐⭐⭐ │   ⭐⭐⭐⭐ │   ⭐⭐⭐  │
│适用场景  │  企业级  │ 通用场景  │  现代浏览器│
└──────────┴──────────┴──────────┴──────────┘
*/
```

## 二、qiankun 完全指南

### 主应用配置

```javascript
// 主应用安装 qiankun
// npm install qiankun

// main.js
import { registerMicroApps, start } from 'qiankun';

// 注册微应用
registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:7100',
    container: '#subapp-container',
    activeRule: '/react',
    props: {
      routerBase: '/react',
      token: 'xxx'
    }
  },
  {
    name: 'vue-app',
    entry: '//localhost:7200',
    container: '#subapp-container',
    activeRule: '/vue',
    props: {
      routerBase: '/vue',
      store: {} // 传递全局状态
    }
  },
  {
    name: 'angular-app',
    entry: '//localhost:7300',
    container: '#subapp-container',
    activeRule: '/angular'
  }
]);

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: false, // 样式隔离
    experimentalStyleIsolation: true
  },
  prefetch: true, // 预加载
  singular: false, // 是否单实例
  fetch: window.fetch // 自定义 fetch
});
```

### React 微应用配置

```javascript
// 微应用：React (webpack.config.js)
const { name } = require('./package.json');

module.exports = {
  output: {
    library: `${name}-[name]`,
    libraryTarget: 'umd',
    globalObject: 'window'
  },
  devServer: {
    port: 7100,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};

// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// src/index.js
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

let root = null;

function render(props = {}) {
  const { container } = props;
  root = ReactDOM.createRoot(
    container ? container.querySelector('#root') : document.querySelector('#root')
  );
  root.render(
    <App />
  );
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('React app bootstraped');
}

export async function mount(props) {
  console.log('React app mounted', props);
  render(props);
}

export async function unmount(props) {
  console.log('React app unmounted');
  const { container } = props;
  root.unmount(
    container ? container.querySelector('#root') : document.querySelector('#root')
  );
}
```

### Vue3 微应用配置

```javascript
// 微应用：Vue3 (vite.config.js)
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue-app', {
      useDevMode: true
    })
  ],
  server: {
    port: 7200,
    origin: 'http://localhost:7200',
    cors: true
  }
});

// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

let app = null;

function render(props = {}) {
  const { container } = props;
  app = createApp(App);
  app.use(router);

  const containerElement = container
    ? container.querySelector('#app')
    : document.querySelector('#app');

  app.mount(containerElement);
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('Vue app bootstraped');
}

export async function mount(props) {
  console.log('Vue app mounted', props);
  render(props);
}

export async function unmount() {
  console.log('Vue app unmounted');
  app.unmount();
}
```

### Angular 微应用配置

```typescript
// 微应用：Angular (src/main.ts)
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModuleRef } from '@angular/core';
import { AppModule } from './app/app.module';

let app: void | NgModuleRef<AppModule>;

function getProps() {
  return (window as any).__PROVIDED_QIANKUN_DEPS__;
}

function mount(props: any) {
  const { container } = props;
  app = platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((moduleRef) => {
      const rootElement = container
        ? container.querySelector('#app-root')
        : document.querySelector('#app-root');

      rootElement.appendChild(moduleRef.instance.elementRef.nativeElement);
      return moduleRef;
    });
}

function unmount() {
  if (app) {
    app.then((moduleRef) => {
      moduleRef.destroy();
    });
  }
}

// 独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  mount({});
}

export async function bootstrap() {
  console.log('Angular app bootstraped');
}

export async function mount(props) {
  console.log('Angular app mounted', props);
  await mount(props);
}

export async function unmount() {
  console.log('Angular app unmounted');
  unmount();
}
```

### 生命周期详解

```javascript
/*
qiankun 生命周期流程：

微应用加载流程：
┌──────────────┐
│  1. Bootstrap │ 初始化（只执行一次）
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  2. Mount     │ 挂载（每次激活）
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  3. Unmount   │ 卸载（每次失活）
└──────────────┘

生命周期最佳实践：

export async function bootstrap() {
  // 初始化全局配置
  // 建立连接（WebSocket、数据库等）
}

export async function mount(props) {
  // 接收主应用传递的 props
  // 初始化路由
  // 渲染组件
  // 订阅全局状态
}

export async function unmount(props) {
  // 清理订阅
  // 销毁连接
  // 清空状态
  // 移除 DOM
}
*/
```

## 三、样式隔离

### CSS 隔离方案

```javascript
// 方案1: 严格样式隔离（Shadow DOM）
start({
  sandbox: {
    strictStyleIsolation: true // 开启 Shadow DOM
  }
});

// 方案2: 实验性样式隔离（推荐）
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
});

/*
方案对比：

strictStyleIsolation:
✅ 完全隔离
✅ 样式不冲突
❌ 部分样式库失效（antd）
❌ 弹窗组件样式问题

experimentalStyleIsolation:
✅ 基本隔离
✅ 兼容性好
⚠️ 可能存在样式泄漏
*/
```

### Scoped CSS

```css
/* Vue Scoped CSS */
<style scoped>
.container {
  color: red;
}
/* 自动添加属性选择器 */
.container[data-v-xxx] {
  color: red;
}
</style>
```

```javascript
/* React CSS Modules */
/* styles.module.css */
.container {
  color: red;
}

/* Component.jsx */
import styles from './styles.module.css';

function Component() {
  return <div className={styles.container}>Hello</div>;
}
```

### 样式冲突解决

```javascript
// 方案1: CSS 命名空间
// 主应用
.main-app-button {
  /* 主应用样式 */
}

// 微应用
.subapp-button {
  /* 微应用样式 */
}

// 方案2: CSS-in-JS
import styled from 'styled-components';

const Button = styled.button`
  color: red;
`;

// 方案3: 动态添加/移除样式
// qiankun 自动处理微应用样式挂载和卸载
```

## 四、JS 沙箱

### 快照沙箱（开发环境）

```javascript
// qiankun 在开发环境使用快照沙箱
class SnapshotSandbox {
  constructor(name) {
    this.name = name;
    this.proxy = window;
    this.type = 'Snapshot';
    this.sandboxRunning = false;
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 记录当前状态
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }

    // 恢复上次修改
    Object.keys(this.modifyPropsMap).forEach((prop) => {
      window[prop] = this.modifyPropsMap[prop];
    });

    this.sandboxRunning = true;
  }

  inactive() {
    this.modifyPropsMap = {};

    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    }

    this.sandboxRunning = false;
  }
}
```

### 代理沙箱（生产环境）

```javascript
// qiankun 在生产环境使用代理沙箱（不支持 IE）
class ProxySandbox {
  constructor(name) {
    const fakeWindow = Object.create(null);
    const proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        if (this.sandboxRunning) {
          target[prop] = value;
        }
        return true;
      },
      get: (target, prop) => {
        return target[prop] || window[prop];
      }
    });

    this.proxy = proxy;
    this.type = 'Proxy';
    this.sandboxRunning = false;
  }

  active() {
    this.sandboxRunning = true;
  }

  inactive() {
    this.sandboxRunning = false;
  }
}
```

## 五、应用间通信

### 主应用传递 props

```javascript
// 主应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:7200',
    container: '#subapp',
    activeRule: '/vue',
    props: {
      data: { userId: 123 },
      actions: {
        onGlobalStateChange: (state, prev) => {
          console.log('主应用状态变化', state, prev);
        }
      }
    }
  }
]);

// 微应用接收
export async function mount(props) {
  console.log(props.data); // { userId: 123 }
  props.actions.onGlobalStateChange();
}
```

### 全局状态管理

```javascript
// 安装 qiankun 状态管理
// npm install qiankun

// 主应用
import { initGlobalState } from 'qiankun';

const initialState = {
  user: null,
  token: null,
  language: 'zh-CN'
};

const actions = initGlobalState(initialState);

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用:', state, prev);
});

// 修改状态
actions.setGlobalState({
  user: { name: 'Alice' }
});

// offGlobalStateChange 取消监听

// 微应用
export async function mount(props) {
  // 监听全局状态
  props.onGlobalStateChange((state, prev) => {
    console.log('微应用:', state, prev);
  }, true);

  // 修改全局状态
  props.setGlobalState({
    user: { name: 'Bob' }
  });
}
```

### 自定义事件总线

```javascript
// event-bus.js
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;

    this.events[event].forEach(callback => {
      callback(data);
    });
  }
}

// 导出单例
export const eventBus = new EventBus();

// 主应用
import { eventBus } from './event-bus';

eventBus.on('user-login', (user) => {
  console.log('用户登录', user);
});

// 微应用
import { eventBus } from './event-bus';

eventBus.emit('user-login', { name: 'Alice' });
```

## 六、路由管理

### 主应用路由配置

```javascript
// React Router v6
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/">首页</Link>
          <Link to="/react">React应用</Link>
          <Link to="/vue">Vue应用</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/react/*" element={<div id="subapp-container" />} />
          <Route path="/vue/*" element={<div id="subapp-container" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// 路由拦截
function App() {
  const location = useLocation();

  useEffect(() => {
    // 路由守卫
    if (location.pathname.includes('/admin')) {
      const token = localStorage.getItem('token');
      if (!token) {
        // 跳转到登录页
      }
    }
  }, [location]);
}
```

### 微应用路由配置

```javascript
// React 微应用路由
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App({ routerBase }) {
  return (
    <BrowserRouter basename={routerBase}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

// Vue 微应用路由
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];

const router = createRouter({
  history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? '/vue' : '/'),
  routes
});

export default router;
```

## 七、性能优化

### 预加载策略

```javascript
// 预加载所有微应用
start({
  prefetch: true // 默认，会在第一个微应用挂载后预加载其他
});

// 预加载指定微应用
start({
  prefetch: ['app1', 'app2']
});

// 禁用预加载
start({
  prefetch: false
});

// 自定义预加载策略
start({
  prefetch: (apps) => {
    // apps: 所有已注册的微应用
    return apps.filter(app => ['app1', 'app2'].includes(app.name));
  }
});
```

### 懒加载

```javascript
// 按需加载微应用
registerMicroApps([
  {
    name: 'heavy-app',
    entry: () => import('./heavy-app/entry'), // 动态 entry
    container: '#container',
    activeRule: '/heavy',
    props: {}
  }
]);
```

### 缓存策略

```javascript
// 应用缓存
const cache = {};

async function loadApp(name) {
  if (cache[name]) {
    return cache[name];
  }

  const app = await import(`./apps/${name}`);
  cache[name] = app;
  return app;
}
```

## 八、single-spa 方案

### 基础配置

```javascript
// 安装 single-spa
// npm install single-spa

// root-config.js
import { registerApplication, start } from 'single-spa';

// 注册微应用
registerApplication({
  name: '@org/react-app',
  main: () => System.import('@org/react-app'),
  activeWhen: '/react',
  customProps: {}
});

registerApplication({
  name: '@org/vue-app',
  main: () => System.import('@org/vue-app'),
  activeWhen: (location) => location.pathname.startsWith('/vue'),
  customProps: {}
});

// 启动
start({
  urlRerouteOnly: true // 只在 URL 变化时重新路由
});
```

### SystemJS 配置

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/systemjs/dist/system.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/systemjs/dist/extras/amd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/systemjs/dist/exposables/use-default.min.js"></script>

<script>
  System.import('@org/root-config');
</script>
```

```javascript
// system-import-map.json
{
  "imports": {
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa/lib/system/single-spa.min.js",
    "react": "https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js",
    "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js",
    "@org/react-app": "http://localhost:7100/org-react-app.js",
    "@org/vue-app": "http://localhost:7200/org-vue-app.js"
  }
}
```

## 九、最佳实践

### 开发规范

```javascript
/*
1. 应用边界
   - 按业务领域划分（用户、订单、商品）
   - 按功能模块划分（管理后台、用户端）
   - 按团队划分（前端组A、前端组B）

2. 依赖管理
   - 避免共享依赖
   - 版本锁定
   - 使用 peerDependencies

3. 样式规范
   - 使用 CSS Modules / Scoped CSS
   - 统一设计系统
   - 样式隔离

4. 通信规范
   - 使用 props 传递基础数据
   - 使用 qiankun 状态管理全局状态
   - 事件总线用于跨应用通信

5. 部署规范
   - 独立 CI/CD
   - 灰度发布
   - 版本管理
*/
```

### 错误边界

```javascript
// React 错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('微应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <div id="subapp-container"></div>
</ErrorBoundary>
```

### 监控与日志

```javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 上报监控平台
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  // 上报监控平台
});

// qiankun 生命周期错误捕获
registerMicroApps([
  {
    name: 'app',
    entry: '//localhost:7100',
    container: '#container',
    activeRule: '/app',
    // 错误处理
    container: '#container',
    errorBoundary: (err) => {
      console.error('微应用加载失败:', err);
      return <div>加载失败，请刷新重试</div>;
    }
  }
]);
```

## 总结

### qiankun vs single-spa

**选择 qiankun 如果：**
- ✅ 需要开箱即用的解决方案
- ✅ 团队对微前端不太熟悉
- ✅ 需要完善的样式隔离和 JS 沙箱
- ✅ 使用 Vue/React/Angular

**选择 single-spa 如果：**
- ✅ 需要更灵活的控制
- ✅ 使用 SystemJS 模块联邦
- ✅ 需要与其他框架集成

### 实施建议

1. **渐进式迁移** - 从边缘功能开始，逐步迁移
2. **统一规范** - 制定开发、部署、监控规范
3. **稳定优先** - 保证用户体验，做好降级方案
4. **持续优化** - 监控性能，优化加载策略

微前端架构是大型前端应用的解决方案，根据实际需求选择合适的方案！

---

*微前端系列文章完结，感谢阅读！*
