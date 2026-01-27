---
title: 前端工程化实战：Webpack与Vite配置完全指南
slug: frontend-engineering-webpack-vite-guide
cover: /images/frontend-performance-optimization.webp
top_img: /images/frontend-performance-optimization.webp
date: 2026-01-21 00:15:00
categories:
  - 前端
  - 工程化
tags:
  - Webpack
  - Vite
  - 前端工程化
  - 构建工具
  - 性能优化
---

## 前言

前端工程化是现代Web开发的基石。Webpack和Vite是目前最流行的构建工具，理解它们的工作原理和配置技巧，对提升开发效率和项目性能至关重要。

本文将深入讲解Webpack和Vite的配置与优化。

## 一、Webpack 基础配置

### 核心概念

```
Webpack 工作流程:
┌─────────────┐
│   Entry     │ 入口文件
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Loader    │ 转换非 JS 文件
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Plugin    │ 扩展功能
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Output    │ 输出文件
└─────────────┘
```

### 基础配置

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // 入口
  entry: './src/index.js',

  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    publicPath: '/'
  },

  // 模式
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  // 模块
  module: {
    rules: [
      // JS/JSX
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false
          }
        }
      },

      // CSS
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },

      // SCSS/SASS
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },

      // 图片
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 10KB
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      },

      // 字体
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },

  // 插件
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    })
  ],

  // 解析
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },

  // 开发服务器
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
```

### Babel 配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      useBuiltIns: 'usage',
      corejs: 3,
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic' // React 17+ 不需要导入 React
    }],
    '@babel/preset-typescript'
  ],

  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]
};

// .browserslistrc
> 1%
last 2 versions
not dead
not ie 11
```

### PostCSS 配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'autoprefixer',
    'cssnano'({
      preset: 'default'
    })
  ]
};

// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

## 二、Webpack 高级配置

### 多入口配置

```javascript
module.exports = {
  entry: {
    main: './src/main.js',
    vendor: ['./src/react.js', './src/react-dom.js']
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js'
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendors'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  }
};
```

### 环境变量配置

```javascript
// webpack.dev.js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    devMiddleware: {
      stats: 'errors-warnings'
    }
  }
});

// webpack.prod.js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ]
  }
});

// webpack.config.js
module.exports = (env) => {
  if (env.production) {
    return require('./webpack.prod.js');
  }
  return require('./webpack.dev.js');
};

// package.json
{
  "scripts": {
    "build": "webpack --env production",
    "dev": "webpack serve --env development"
  }
}
```

### 性能优化配置

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
          output: {
            comments: false
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20
        },
        vue: {
          test: /[\\/]node_modules[\\/](vue|@vue|vuex|vue-router)[\\/]/,
          name: 'vue',
          priority: 20
        },
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: 'libs',
          priority: 10,
          minChunks: 2
        }
      }
    },
    moduleIds: 'deterministic',
    runtimeChunk: 'single'
  },

  plugins: [
    // Gzip 压缩
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    }),

    // Brotli 压缩
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11
      }
    })
  ],

  // 性能提示
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
```

### 缓存策略

```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ]
};
```

## 三、Vite 完全指南

### Vite vs Webpack

```javascript
/*
Vite 的优势:
✅ 开发服务器启动快（使用 esbuild）
✅ 热更新极快（原生 ESM）
✅ 开箱即用的 TypeScript 支持
✅ 更简洁的配置

Webpack 的优势:
✅ 更成熟的生态系统
✅ 更强的定制能力
✅ 更好的生产环境优化
*/
```

### Vite 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },

  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-library': ['antd', 'element-plus']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000
  },

  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: []
  }
});
```

### Vite 环境变量

```javascript
// .env
VITE_APP_TITLE=My App
VITE_API_BASE_URL=https://api.example.com

// .env.development
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.example.com

// 使用
console.log(import.meta.env.VITE_APP_TITLE);
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 类型定义
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Vite 插件开发

```javascript
// my-plugin.js
export function myPlugin() {
  return {
    name: 'my-plugin',

    // 钩子函数
    config(config, { command }) {
      // 修改配置
      if (command === 'serve') {
        return {
          server: {
            port: 3000
          }
        };
      }
    },

    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        if (req.url === '/hello') {
          res.end('Hello from Vite plugin!');
        } else {
          next();
        }
      });
    },

    transform(code, id) {
      // 转换代码
      if (id.endsWith('.special')) {
        return `export default ${JSON.stringify(code)}`;
      }
    },

    buildStart() {
      // 构建开始
      console.log('Build started');
    },

    buildEnd() {
      // 构建结束
      console.log('Build ended');
    }
  };
}

// 使用
// vite.config.js
import { myPlugin } from './my-plugin';

export default defineConfig({
  plugins: [
    react(),
    myPlugin()
  ]
});
```

## 四、构建优化实战

### 代码分割策略

```javascript
// Webpack 代码分割
// 动态导入
const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

// 预加载
import(/* webpackPrefetch: true */ './path/to/Login');
import(/* webpackPreload: true */ './path/to/HeavyComponent');

// Vite 代码分割
const Home = defineAsyncComponent(() => import('./routes/Home'));
const About = defineAsyncComponent({
  loader: () => import('./routes/About'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000
});
```

### Tree Shaking

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: true
  }
};

// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// 使用 ES6 模块
// ✅ 正确 - 可以 tree-shaking
export { fn1, fn2 } from './utils';
import { fn1 } from './utils';

// ❌ 错误 - 无法 tree-shaking
module.exports = { fn1, fn2 };
const utils = require('./utils');
```

### 资源优化

```javascript
// 图片优化
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [{
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [{
        loader: ImageMinimizerPlugin.loader,
        options: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: [
                ['gifsicle', { interlaced: true }],
                ['jpegtran', { progressive: true }],
                ['optipng', { optimizationLevel: 5 }],
                ['svgo', {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: 'http://www.w3.org/2000/svg' }
                              ]
                            }
                          }
                        }
                      }
                    }
                  ]
                }]
              ]
            }
          }
        }
      }]
    }]
  }
};

// 字体优化
module.exports = {
  module: {
    rules: [{
      test: /\.(woff2?|eot|ttf|otf)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[hash:8].[ext]',
          outputPath: 'fonts/'
        }
      }]
    }]
  }
};
```

### CDN 加速

```javascript
// webpack.config.js
module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'vue': 'Vue',
    'lodash': '_'
  }
};

// index.html
<script crossorigin src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
```

## 五、CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build project
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

      - name: Deploy to GitHub Pages
        if: matrix.node-version == '18.x' && github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Docker 部署

```dockerfile
# Dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```javascript
// nginx.conf
server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    location ~* \.(html)$ {
      expires -1;
      add_header Cache-Control "no-cache";
    }
  }

  # Gzip 压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

## 六、性能监控

### Bundle 分析

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};

// Vite
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html'
    })
  ]
});
```

### 构建速度优化

```javascript
// 使用 cache-loader
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      use: [
        'cache-loader',
        'babel-loader'
      ]
    }]
  },

  // 使用持久化缓存
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.temp_cache')
  }
};

// 多线程构建
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
};
```

## 总结

### Webpack vs Vite 选择

**选择 Webpack 如果你需要：**
- ✅ 复杂的定制需求
- ✅ 成熟的插件生态
- ✅ 细粒度的配置控制

**选择 Vite 如果你需要：**
- ✅ 快速的开发体验
- ✅ 开箱即用的配置
- ✅ 现代化的构建工具

### 最佳实践

1. **代码分割** - 按路由和供应商拆分代码
2. **缓存策略** - contenthash + 长期缓存
3. **压缩优化** - Gzip/Brotli + 代码压缩
4. **CDN 加速** - 静态资源 CDN 托管
5. **性能监控** - 持续监测构建产物

**学习路径**：
1. 掌握基础配置
2. 学习性能优化
3. 实践 CI/CD
4. 监控和调优

前端工程化是一个持续优化的过程，根据项目需求选择合适的工具和策略！

---

*下一篇将介绍 TypeScript 进阶，敬请期待！*
