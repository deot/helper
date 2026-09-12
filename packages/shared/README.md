# @deot/helper-shared

各 helper 包共享的运行时常量与 TypeScript 类型。

## 安装

```bash
pnpm add @deot/helper-shared
```

## 使用

```ts
import { IS_SERVER } from '@deot/helper-shared';
import type { Hash, Nullable, AnyFunction } from '@deot/helper-shared';

const state: Hash<number> = { count: 1 };
const selected: Nullable<string> = null;
```

聚合包以 `Shared` 命名空间提供运行时导出；TypeScript 类型建议直接从独立包使用 `import type`。

## API

| 名称 | 泛型参数 | 完整类型 | 说明 |
| --- | --- | --- | --- |
| `IS_SERVER` | — | `boolean` | 当前环境是否缺少 `window` |
| `Indexable<T = any>` | `T`：属性值类型 | `{ [key: string]: T }` | 字符串 key 的索引对象 |
| `Hash<T>` | `T`：属性值类型 | `Indexable<T>` | `Indexable` 别名 |
| `Options<T = {}>` | `T`：扩展字段 | `Indexable & T` | 可扩展配置对象 |
| `AnyFunction<T = void>` | `T`：返回值类型 | `(...args: any[]) => T` | 任意参数函数 |
| `Nullable<T>` | `T`：原始类型 | `T \| null` | 可空类型 |
| `Customized<Origin = any, Extend = any>` | 原始类型、扩展类型 | `Origin & Extend` | 交叉组合类型 |
| `TimeoutHandle` | — | `ReturnType<typeof global.setTimeout>` | 当前环境的定时器句柄 |

该包不包含业务逻辑，适合被其他包作为轻量基础依赖。

## 其他说明

该包除环境常量 `IS_SERVER` 外均为编译期 TypeScript 类型，没有可由表单输入改变的运行时行为，因此不提供交互 Playground。可在浏览器与 Node 环境中分别读取 `IS_SERVER` 验证环境结果。
