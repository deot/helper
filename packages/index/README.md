# @deot/helper

`@deot/helper` 是所有 helper 子包的聚合入口。它按命名空间导出函数集合，并直接导出常用类和缓存实例。

## 安装

```bash
pnpm add @deot/helper
```

## 使用

```ts
import {
	Utils,
	Is,
	$,
	Storage,
	Emitter,
	Validator
} from '@deot/helper';

const id = Utils.getUid('item');
if (Is.string(id)) Storage.set('id', id);
const stop = $.on(document.body, 'click', () => {});
stop();
```

希望获得最小依赖范围时，请直接安装并导入对应子包。

## API

- 函数较多的包以命名空间导出，例如 `Utils.getUid()`、`Is.array()`、`$.on()`。
- 类和单例直接导出，例如 `Emitter`、`Resize`、`Storage`。
- 聚合入口不改变子包 API；具体签名和运行环境要求见各子包 README。

| 导出 | 类型 | 来源 | 参数说明 |
| --- | --- | --- | --- |
| `Cookie`、`Storage`、`IndexedDB` | 单例 | `@deot/helper-cache` | 见 cache API |
| `IndexedDBStore` | class | `@deot/helper-cache` | 构造参数见 cache API |
| `Device` | object | `@deot/helper-device` | `parse(ua?)` 见 device API |
| `$`、`FP`、`Is`、`Load`、`Route`、`Shared`、`Unicode`、`Utils` | namespace | 对应子包 | 每个方法的参数见对应子包 API |
| `Emitter`、`Resize`、`Wheel`、`Interrupter`、`Task`、`Job`、`Parallel`、`Validator` | class | 对应子包 | 构造参数和方法见对应子包 API |
| `RegExps`、`RuleHelper` | namespace | `@deot/helper-validator` | 规则参数见 validator API |

## 其他说明

聚合入口只转发各子包的公开导出，不增加独立运行逻辑。可交互的输入与输出案例按 API 分组放在对应子包文档中，避免同一案例在聚合包重复维护。

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

| 包名 | 版本 | 聚合导出 | 说明 |
| --- | --- | --- | --- |
| [cache](../cache/README.md) | [![npm][npm-cache-image]][npm-cache-url] | `Cookie`、`Storage`、`IndexedDB`、`IndexedDBStore` | 浏览器缓存 |
| [device](../device/README.md) | [![npm][npm-device-image]][npm-device-url] | `Device` | 设备信息 |
| [dom](../dom/README.md) | [![npm][npm-dom-image]][npm-dom-url] | `$` | DOM 工具命名空间 |
| [emitter](../emitter/README.md) | [![npm][npm-emitter-image]][npm-emitter-url] | `Emitter` | 发布订阅 |
| [fp](../fp/README.md) | [![npm][npm-fp-image]][npm-fp-url] | `FP` | 函数式工具命名空间 |
| [index](README.md) | [![npm][npm-index-image]][npm-index-url] | — | 当前聚合包 |
| [is](../is/README.md) | [![npm][npm-is-image]][npm-is-url] | `Is` | 类型判断命名空间 |
| [load](../load/README.md) | [![npm][npm-load-image]][npm-load-url] | `Load` | 资源加载命名空间 |
| [resize](../resize/README.md) | [![npm][npm-resize-image]][npm-resize-url] | `Resize` | 元素尺寸监听 |
| [route](../route/README.md) | [![npm][npm-route-image]][npm-route-url] | `Route` | URL 工具命名空间 |
| [scheduler](../scheduler/README.md) | [![npm][npm-scheduler-image]][npm-scheduler-url] | `Interrupter`、`Task`、`Job`、`Parallel` | 任务调度 |
| [shared](../shared/README.md) | [![npm][npm-shared-image]][npm-shared-url] | `Shared` | 公共类型与常量 |
| [unicode](../unicode/README.md) | [![npm][npm-unicode-image]][npm-unicode-url] | `Unicode` | 压缩编码 |
| [utils](../utils/README.md) | [![npm][npm-utils-image]][npm-utils-url] | `Utils` | 通用工具命名空间 |
| [validator](../validator/README.md) | [![npm][npm-validator-image]][npm-validator-url] | `Validator`、`RegExps`、`RuleHelper` | 数据验证 |
| [wheel](../wheel/README.md) | [![npm][npm-wheel-image]][npm-wheel-url] | `Wheel` | 滚动优化 |
