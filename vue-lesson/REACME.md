# vue-lesson

一个基于 **Vue 3 响应式系统源码** 的学习项目，使用 TypeScript 编写，支持多格式构建（ESM、CJS、IIFE、UMD），采用 pnpm monorepo 管理。

---

## 🧱 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式前端框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [esbuild](https://esbuild.github.io/) - 超快的构建工具
- [pnpm](https://pnpm.io/) - 快速、节省磁盘空间的包管理器

---

## 📦 安装依赖

确保你已经安装了 [pnpm](https://pnpm.io/installation)，然后运行：

```bash
pnpm install
🚀 启动开发环境
```bash
pnpm dev
```
该命令会运行 ./scripts/dev.ts，并构建 reactivity 模块为 CommonJS 格式。
📁 项目结构
```
├── packages/
│   ├── reactivity/         # Vue 响应式模块
│        └──src/   
│           └──index.ts    
│   └── shared/            # Vue 运行时共享模块
│        └──src/   
│            └──index.ts          
├── scripts/
│   └── dev.ts            # 构建脚本入口
├── dist/                 # 构建产物（示例）
│   ├── reactivity.cjs.js
│   ├── reactivity.esm.js
│   └── reactivity.iife.js
├── .npmrc                # pnpm 配置
├── package.json          # 根项目配置
├── pnpm-workspace.yaml   # pnpm monorepo 配置
├── tsconfig.json         # TypeScript 配置
└── README.md
```
📘 模块说明

`
@vue/reactivity
`

Vue 3 的响应式系统核心，支持以下构建格式：

✅ `esm-bundler`（`reactivity.esm.js`）

✅ `cjs`（`reactivity.cjs.js）`

✅ `global` / `iife`（`reactivity.iife.js）`

✅ `esm-browser`

✅ `umd`

`@vue/shared`

Vue 内部共享的工具函数库，支持：

✅ `esm-bundler`

✅ `cjs`

✅ `esm-browser`

🔧 构建配置

使用 `esbuild` 构建 `TypeScript` 脚本

支持多格式输出（`ESM`、`CJS`、`IIFE`、`UMD`）

使用路径别名 `@vue/*` 映射到 `packages/*/src`

构建产物含 `sourcemap`，支持调试

🧪 示例代码运行
浏览器中运行 IIFE 版本
HTML
预览
```javascript
<script src="dist/reactivity.iife.js"></script>
<script>
  // VueReactivity 是全局变量
  console.log('IIFE 构建成功');
</script>
```
Node 中运行 CJS 版本
```node
node dist/reactivity.cjs.js
# 输出：false（因为 'abc' 不是对象）
```