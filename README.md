[ci-image]: https://github.com/deot/helper/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/deot/helper/actions/workflows/ci.yml

[![build status][ci-image]][ci-url]

# @deot/helper

面向 JavaScript / TypeScript 开发的实用工具集。仓库按能力拆分为独立包，也提供聚合包 `@deot/helper`；所有入口均使用具名导出，便于构建工具进行 tree-shaking。

## 特性

- **按需安装**：缓存、DOM、函数式编程、验证等能力均可独立安装。
- **聚合入口**：也可通过 `@deot/helper` 一次使用全部子包。
- **TypeScript**：所有包都随构建产物提供类型声明。
- **多种产物**：构建支持 ES module、CommonJS、UMD 与 IIFE。
- **跨环境**：通用工具可在 Node.js 中使用；依赖 DOM 的 API 会在文档中明确标注。

## 包

[npm-cache-image]: https://img.shields.io/npm/v/@deot/helper-cache
[npm-cache-url]: https://www.npmjs.com/package/@deot/helper-cache
[npm-device-image]: https://img.shields.io/npm/v/@deot/helper-device
[npm-device-url]: https://www.npmjs.com/package/@deot/helper-device
[npm-dom-image]: https://img.shields.io/npm/v/@deot/helper-dom
[npm-dom-url]: https://www.npmjs.com/package/@deot/helper-dom
[npm-emitter-image]: https://img.shields.io/npm/v/@deot/helper-emitter
[npm-emitter-url]: https://www.npmjs.com/package/@deot/helper-emitter
[npm-fp-image]: https://img.shields.io/npm/v/@deot/helper-fp
[npm-fp-url]: https://www.npmjs.com/package/@deot/helper-fp
[npm-index-image]: https://img.shields.io/npm/v/@deot/helper
[npm-index-url]: https://www.npmjs.com/package/@deot/helper
[npm-is-image]: https://img.shields.io/npm/v/@deot/helper-is
[npm-is-url]: https://www.npmjs.com/package/@deot/helper-is
[npm-load-image]: https://img.shields.io/npm/v/@deot/helper-load
[npm-load-url]: https://www.npmjs.com/package/@deot/helper-load
[npm-resize-image]: https://img.shields.io/npm/v/@deot/helper-resize
[npm-resize-url]: https://www.npmjs.com/package/@deot/helper-resize
[npm-route-image]: https://img.shields.io/npm/v/@deot/helper-route
[npm-route-url]: https://www.npmjs.com/package/@deot/helper-route
[npm-scheduler-image]: https://img.shields.io/npm/v/@deot/helper-scheduler
[npm-scheduler-url]: https://www.npmjs.com/package/@deot/helper-scheduler
[npm-shared-image]: https://img.shields.io/npm/v/@deot/helper-shared
[npm-shared-url]: https://www.npmjs.com/package/@deot/helper-shared
[npm-unicode-image]: https://img.shields.io/npm/v/@deot/helper-unicode
[npm-unicode-url]: https://www.npmjs.com/package/@deot/helper-unicode
[npm-utils-image]: https://img.shields.io/npm/v/@deot/helper-utils
[npm-utils-url]: https://www.npmjs.com/package/@deot/helper-utils
[npm-validator-image]: https://img.shields.io/npm/v/@deot/helper-validator
[npm-validator-url]: https://www.npmjs.com/package/@deot/helper-validator
[npm-wheel-image]: https://img.shields.io/npm/v/@deot/helper-wheel
[npm-wheel-url]: https://www.npmjs.com/package/@deot/helper-wheel

| 包名 | 版本 | 说明 |
| --- | --- | --- |
| [cache](packages/cache) | [![npm][npm-cache-image]][npm-cache-url] | Storage、Cookie 与 IndexedDB 缓存 |
| [device](packages/device) | [![npm][npm-device-image]][npm-device-url] | 设备与 User-Agent 信息 |
| [dom](packages/dom) | [![npm][npm-dom-image]][npm-dom-url] | DOM 查询、事件、样式和滚动工具 |
| [emitter](packages/emitter) | [![npm][npm-emitter-image]][npm-emitter-url] | 轻量发布订阅器 |
| [fp](packages/fp) | [![npm][npm-fp-image]][npm-fp-url] | 函数组合、函子和任务管理 |
| [index](packages/index) | [![npm][npm-index-image]][npm-index-url] | 全部子包的聚合入口 |
| [is](packages/is) | [![npm][npm-is-image]][npm-is-url] | 类型与实例判断 |
| [load](packages/load) | [![npm][npm-load-image]][npm-load-url] | 脚本、样式和图片加载 |
| [resize](packages/resize) | [![npm][npm-resize-image]][npm-resize-url] | 基于 ResizeObserver 的尺寸监听 |
| [route](packages/route) | [![npm][npm-route-image]][npm-route-url] | URL 路径与查询参数处理 |
| [scheduler](packages/scheduler) | [![npm][npm-scheduler-image]][npm-scheduler-url] | 中断器及任务调度入口 |
| [shared](packages/shared) | [![npm][npm-shared-image]][npm-shared-url] | 公共常量和 TypeScript 类型 |
| [unicode](packages/unicode) | [![npm][npm-unicode-image]][npm-unicode-url] | Unicode 压缩、编码与解码 |
| [utils](packages/utils) | [![npm][npm-utils-image]][npm-utils-url] | 常用数据、函数、图片和调度工具 |
| [validator](packages/validator) | [![npm][npm-validator-image]][npm-validator-url] | 同步/异步规则验证器与常用正则 |
| [wheel](packages/wheel) | [![npm][npm-wheel-image]][npm-wheel-url] | 鼠标滚轮和触控滚动优化 |

## 安装

安装聚合包：

```bash
pnpm add @deot/helper
```

或仅安装需要的能力：

```bash
pnpm add @deot/helper-utils
```

## 快速开始

聚合包按命名空间或类导出能力：

```ts
import { Utils, Is, Storage, Emitter } from '@deot/helper';

const id = Utils.getUid('item');
const isArray = Is.array([]);
Storage.set('id', id);
const emitter = Emitter.of();
```

独立包直接导出具体 API，更适合控制依赖范围：

```ts
import { debounce, getUid } from '@deot/helper-utils';
import { array, plainObject } from '@deot/helper-is';
```

完整导出和注意事项请查看上方各包文档。

## 运行环境

- `dom`、`load`、`resize`、`wheel` 以及 `cache` 的浏览器存储实现依赖浏览器 API。
- `device`、`route` 和部分 `utils` API 同时提供无浏览器环境下的安全回退。
- 各包均可使用具名 ES module 导入；具体构建格式以对应 npm 包的 `dist` 产物为准。

## 本仓库开发

本仓库是 pnpm monorepo，请在根目录执行：

```bash
pnpm install

# 文档站
npm run docs:dev

# 代码检查、类型检查、测试与构建
npm run lint
npm run typecheck
npm run test -- --package-name '*'
npm run build
```

单包开发或测试可以传入包目录名：

```bash
npm run dev -- --package-name 'utils'
npm run test -- --package-name 'utils'
```

贡献代码前请阅读[贡献指南](.github/CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
