[ci-image]: https://github.com/deot/helper/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/deot/helper/actions/workflows/ci.yml

[![build status][ci-image]][ci-url]

# deot/helper

用于JS开发的工具集成, 且遵守`tree-shaking`

## Monorepo

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

[npm-load-image]: https://img.shields.io/npm/v/@deot/helper-load
[npm-load-url]: https://www.npmjs.com/package/@deot/helper-load

[npm-resize-image]: https://img.shields.io/npm/v/@deot/helper-resize
[npm-resize-url]: https://www.npmjs.com/package/@deot/helper-resize

[npm-route-image]: https://img.shields.io/npm/v/@deot/helper-route
[npm-route-url]: https://www.npmjs.com/package/@deot/helper-route

[npm-shared-image]: https://img.shields.io/npm/v/@deot/helper-shared
[npm-shared-url]: https://www.npmjs.com/package/@deot/helper-shared

[npm-unicode-image]: https://img.shields.io/npm/v/@deot/helper-unicode
[npm-unicode-url]: https://www.npmjs.com/package/@deot/helper-unicode

[npm-utils-image]: https://img.shields.io/npm/v/@deot/helper-utils
[npm-utils-url]: https://www.npmjs.com/package/@deot/helper-utils

[npm-wheel-image]: https://img.shields.io/npm/v/@deot/helper-wheel
[npm-wheel-url]: https://www.npmjs.com/package/@deot/helper-wheel

[npm-image]: https://img.shields.io/npm/v/@deot/helper
[npm-url]: https://www.npmjs.com/package/@deot/helper

| 包名                          | 版本                                           | 说明                                       |
| --------------------------- | -------------------------------------------- | ---------------------------------------- |
| [cache](packages/cache)     | [![npm][npm-cache-image]][npm-cache-url]     | 缓存管理（`Storage` / `Cookie` / `IndexDB`）         |
| [device](packages/device)   | [![npm][npm-device-image]][npm-device-url]   | 设备ua                                     |
| [dom](packages/dom)         | [![npm][npm-dom-image]][npm-dom-url]         | dom元素操作的一些方法                             |
| [emitter](packages/emitter) | [![npm][npm-emitter-image]][npm-emitter-url] | 简单的发布订阅                                  |
| [fp](packages/fp)           | [![npm][npm-fp-image]][npm-fp-url]           | 函数式工具，主要用`Task`函子延伸的`Job`，`Parallel`任务管理 |
| [load](packages/load)       | [![npm][npm-load-image]][npm-load-url]       | 加载脚本、样式（`link`&`style`）、图片                   |
| [resize](packages/resize)   | [![npm][npm-resize-image]][npm-resize-url]   | 元素变化监听                                   |
| [route](packages/route)     | [![npm][npm-route-image]][npm-route-url]     | 类`URL`/`URLSearchParams`相关取值                 |
| [shared](packages/shared)   | [![npm][npm-shared-image]][npm-shared-url]   | 共享类型和常量                                  |
| [unicode](packages/unicode) | [![npm][npm-unicode-image]][npm-unicode-url] | 用于字符串压缩                                  |
| [utils](packages/utils)     | [![npm][npm-utils-image]][npm-utils-url]     | 工具方法                                     |
| [wheel](packages/wheel)     | [![npm][npm-wheel-image]][npm-wheel-url]     | 滚轮                                       |
| [index](packages/index)     | [![npm][npm-image]][npm-url]                 | 当前所有包的合集                                 |


## Contributing

这是一个[monorepo](https://en.wikipedia.org/wiki/Monorepo)仓库 ，使用[pnpm](https://pnpm.io/) 管理

- 安装环境

```console
$ npm run init
```

- 添加依赖或添加新的包

```console
$ npm run add
```

- 关联

```console
$ npm run link
```

- 测试

```console
$ npm run test

# 或者 直接添加参数
$ npm run test -- --package-name '**' --watch
```

- 开发

```console
$ npm run dev

# 或者 直接添加参数
$ npm run dev -- --package-name '**'
```

- 打包

```console
$ npm run build
```

- 代码检查

```console
$ npm run lint
```

- 发布

```console
$ npm run pub
```

## 关联

[CONTRIBUTING](./.github/CONTRIBUTING.md)

[LICENSE (MIT)](./LICENSE)