[ci-image]: https://github.com/deot/helper/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/deot/helper/actions/workflows/ci.yml

[![build status][ci-image]][ci-url]

# deot/helper

用于JS开发的工具集成

## Monorepo

| 包名                                                 | 说明                                                 |
| --------------------------------------------------- | ---------------------------------------------------- |
| [compress](packages/compress)                       | 压缩相关                                              |
| [shared](packages/shared)                           | 公共方法                                              |
| [index](packages/index)                             | 所有仓库的集成                                         |

## Contributing

这是一个[monorepo](https://en.wikipedia.org/wiki/Monorepo)仓库 ，使用[lerna](https://lerna.js.org/) 管理

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
$ npm run test -- --packageName '**' --watch
```

- 开发

```console
$ npm run dev

# 或者 直接添加参数
$ npm run dev -- --packageName '**'
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