# @deot/helper-fp

函数式编程工具集合，包含函数管道、组合子与基础函子。所有导出都带有类型推导，包本身没有运行时依赖，可按需摇树。

> `Task`、`Job`、`Parallel` 已迁移到 [`@deot/helper-scheduler`](../scheduler/README.md)。

## 安装

```bash
pnpm add @deot/helper-fp
```

## 使用

```ts
import { pipe, map, filter, add, Maybe } from '@deot/helper-fp';

const select = pipe(
	map((value: number) => value * 2),
	filter((value: number) => value > 4)
);

select([1, 2, 3]); // [6]，类型为 number[]
add(0.1)(0.2); // 0.3，柯里化调用同样有类型
Maybe.of(null).map(() => '不会执行').valueOf('fallback');
```

聚合包以 `FP` 命名空间提供这些导出：

```ts
import { FP } from '@deot/helper';
```

## API

### Pipeline

用于构造、组合和转换函数与集合数据的基础函数。

#### `curry(fn)`

按 `fn.length` 将函数柯里化

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` | `(...args: any[]) => any` | `Curried<Parameters<fn>, ReturnType<fn>>` |

返回值的类型会随已传入的参数逐步收窄，例如 `curry((a: number, b: string) => true)(1)` 的类型是 `(b: string) => boolean`。使用占位符（`curry.placeholder`）时退回宽松签名，返回 `any`。带默认值或剩余参数的形参不计入 `fn.length`。

输入三个数字，查看柯里化函数的分步调用结果：

:::playground
<!--
<config lang="json5">
{
	views: ['runtime', 'files']
}
</config>
-->
```vue
<script setup>

import { ref } from 'vue';
import { curry } from '@deot/helper-fp';

const a = ref(1);
const b = ref(2);
const c = ref(3);
const output = ref({ status: '点击运行' });

const run = () => {
	const sum = curry((x, y, z) => x + y + z);
	output.value = {
		input: [Number(a.value), Number(b.value), Number(c.value)],
		result: sum(Number(a.value))(Number(b.value))(Number(c.value))
	};
};
</script>

<template>
	<div class="demo">
		<label>A <input v-model="a" type="number"></label>
		<label>B <input v-model="b" type="number"></label>
		<label>C <input v-model="c" type="number"></label>
		<button @click="run">运行 curry</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; gap: 10px; padding: 0; }
input, button { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
input { width: 100%; max-width: 480px; box-sizing: border-box; }
button { width: fit-content; cursor: pointer; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `compose(...fns)`

从右向左组合函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fns` | `Function[]` | `Function` |

```ts
import { compose } from '@deot/helper-fp';

const double = (value: number) => value * 2;
const increment = (value: number) => value + 1;
compose(double, increment)(3); // 8：先 3 + 1，再乘 2
```

#### `pipe(...fns)`

从左向右组合函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fns` | `Function[]` | `Function` |

```ts
import { pipe } from '@deot/helper-fp';

const double = (value: number) => value * 2;
const increment = (value: number) => value + 1;
pipe(double, increment)(3); // 7：先 3 * 2，再加 1
```

两者都同步传递返回值，不会自动 await Promise；异步链可结合 `then$` / `catch$`。

#### `partial(fn, ...args)`

创建预填部分参数的函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `args` | `Function` / `any[]` | `Function` |

```ts
import { partial } from '@deot/helper-fp';

const format = (prefix: string, name: string, suffix: string) => `${prefix}${name}${suffix}`;
partial(format, '你好，')('Deot', '！'); // '你好，Deot！'
partial(format, partial.placeholder, 'Deot')('Hello, ', '!'); // 'Hello, Deot!'
```

`partial.placeholder` 就是 `partial` 自身，用它标记需要从后续调用补入的位置；剩余实参会追加到末尾。

#### `then$(fn, thenable)`

调用 `thenable.then(fn)`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `thenable` | `Function` / `PromiseLike<any>` | `PromiseLike<any>` |

```ts
import { pipe, then$ } from '@deot/helper-fp';

const doubleAsync = pipe(Promise.resolve.bind(Promise), then$((value: number) => value * 2));
await doubleAsync(3); // 6
```

#### `catch$(fn, promise)`

调用 `promise.catch(fn)`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `promise` | `Function` / `Promise<any>` | `Promise<any>` |

```ts
import { catch$ } from '@deot/helper-fp';

await catch$((error: Error) => `fallback: ${error.message}`, Promise.reject(new Error('offline')));
// 'fallback: offline'；也支持 catch$(fn)(promise)
```

#### `memoize(fn, resolver?)`

按首个参数或 resolver 返回值缓存结果

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `resolver` | `Function` / `Function` | `Function` |

```ts
import { memoize } from '@deot/helper-fp';

let calls = 0;
const sum = memoize((a: number, b: number) => { calls += 1; return a + b; });
sum(1, 2); // 3
sum(1, 9); // 3；默认只用第一个实参作键，calls 仍为 1

const pairSum = memoize((a: number, b: number) => a + b, (a: number, b: number) => JSON.stringify([a, b]));
pairSum(1, 2); // 3
pairSum(1, 9); // 10；resolver 区分全部实参
```

缓存不会自动过期；无形参（`fn.length === 0`）的函数会被原样返回，不创建缓存。

#### `map(fn, value)`

映射数组或对象值

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `value` | `Function` / `any[] \| object` | `any[] \| object` |

```ts
import { map } from '@deot/helper-fp';

map((value: number) => value * 2)([1, 2]); // [2, 4]
map((value: number) => value * 2, { a: 1, b: 2 }); // { a: 2, b: 4 }
```

#### `filter(fn, value)`

筛选数组或对象值

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `value` | `Function` / `any[] \| object` | `any[] \| object` |

```ts
import { filter } from '@deot/helper-fp';

filter((value: number) => value > 1)([1, 2, 3]); // [2, 3]
filter((value: number) => value > 1, { a: 1, b: 2 }); // { b: 2 }
```

#### `reduce(fn, initialValue, value)`

从左向右归并数组

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `initialValue` / `value` | `Function` / `any` / `any[]` | `any` |

```ts
import { reduce } from '@deot/helper-fp';

reduce((sum: number, value: number) => sum + value, 0)([1, 2, 3]); // 6
```

#### `reverse(value)`

反转数组或字符串

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any[] \| string` | `any[] \| string` |

`add` / `subtract` / `multiply` / `divide` 先把两个数按小数位数对齐成整数再运算，规避浮点误差；支持科学计数法（如 `1.5e-7`）与数字字符串，`null` 按 `0` 处理。四个函数都已柯里化，`add(1)(2)` 与 `add(1, 2)` 等价。

#### `add(a, b)`

精确处理小数加法

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `a` / `b` | `number` / `number` | `number` |

#### `subtract(a, b)`

`a - b`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `a` / `b` | `number` / `number` | `number` |

#### `multiply(a, b)`

`a * b`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `a` / `b` | `number` / `number` | `number` |

#### `divide(a, b)`

`a / b`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `a` / `b` | `number` / `number` | `number` |

```ts
import { add, divide, multiply } from '@deot/helper-fp';

0.1 + 0.2; // 0.30000000000000004
add(0.1, 0.2); // 0.3
0.57 / 0.01; // 56.99999999999999
divide(0.57, 0.01); // 57
multiply(1.5e-7, 2); // 3e-7
```

### Combinator

围绕同一输入组织副作用、备选分支和结果汇合的组合子。

#### `identity(value)`

原样返回参数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `any` |

#### `tap(fn, value)`

执行副作用后返回原值

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `value` | `Function` / `any` | `any` |

```ts
import { pipe, tap } from '@deot/helper-fp';

const logs: number[] = [];
pipe(tap((value: number) => logs.push(value)), (value: number) => value * 2)(3); // 6
// logs: [3]；tap 返回输入 3，而不是 push 的返回值
```

#### `alternation(first, second)`

first 结果为 falsy 时执行 second

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `first` / `second` | `Function` / `Function` | `Function` |

```ts
import { alternation } from '@deot/helper-fp';

const display = alternation((value: string) => value.trim(), () => '匿名');
display(' Deot '); // 'Deot'
display('   '); // '匿名'；0、false 等其它 falsy 结果同样触发后备分支
```

#### `sequence(...fns)`

以同一个值依次执行函数，不返回执行结果

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fns` | `Function[]` | `(value?: any) => void` |

```ts
import { sequence } from '@deot/helper-fp';

const logs: string[] = [];
sequence((value: number) => logs.push(`A:${value}`), (value: number) => logs.push(`B:${value}`))(3);
// logs: ['A:3', 'B:3']；两个函数收到同一个输入，不传递前一步结果
```

#### `fork(join, left, right)`

对同一输入执行两个分支，再由 join 合并

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `join` / `left` / `right` | `Function` / `Function` / `Function` | `Function` |

```ts
import { fork } from '@deot/helper-fp';

const average = fork(
	(sum: number, count: number) => sum / count,
	(values: number[]) => values.reduce((sum, value) => sum + value, 0),
	(values: number[]) => values.length
);
average([2, 4, 6]); // 4
```

### Pointed

Pointed 函数式容器的创建、映射与取值 API。

#### `Pointed.of(value)` / `new Pointed(value)`

创建容器

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Pointed` |

#### `Pointed.map(fn)`

映射容器值

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Pointed` |

#### `Pointed.valueOf()` / `Pointed.toString()`

读取值或字符串表示

| 返回值 |
| --- |
| `any` / `string` |

#### `Pointed.value`

当前容器值

| 类型 |
| --- |
| `any` |

### Monad

Monad 函数式容器的创建、映射与取值 API。

#### `Monad.of(value)` / `new Monad(value)`

创建 Monad

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Monad` |

#### `Monad.map(fn)` / `Monad.flatMap(fn)`

映射；`flatMap` 在映射后再展平一层，用于 `fn` 本身返回 Monad 的情况

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Monad` / `any` |

```ts
import { Monad } from '@deot/helper-fp';

Monad.of(1).map(x => Monad.of(x + 1)); // Monad(Monad(2))
Monad.of(1).flatMap(x => Monad.of(x + 1)); // Monad(2)
Monad.of(Monad.of(Monad.of(1))).flatten().map(x => x + 1); // Monad(2)
```

#### `Monad.join()` / `Monad.flatten()` / `Monad.valueOf()` / `Monad.toString()`

展开一层、展开全部层级、读取值或字符串表示

| 返回值 |
| --- |
| `any` / `any` / `any` / `string` |

#### `Monad.value`

当前容器值

| 类型 |
| --- |
| `any` |

### Maybe

Maybe 函数式容器的创建、映射与取值 API。

#### `Maybe.of(value)` / `new Maybe(value)`

创建可空容器

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Maybe` |

#### `Maybe.map(fn)`

非空时映射，空值保持为空

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Maybe` |

#### `Maybe.isNothing()` / `Maybe.isJust()`

判断空值或非空值

| 返回值 |
| --- |
| `boolean` |

#### `Maybe.valueOf(other?)`

空值返回备用值，否则返回容器值

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `other` | `any` | `any` |

#### `Maybe.flatMap(fn)` / `Maybe.join()` / `Maybe.flatten()` / `Maybe.toString()`

映射后展平一层、展平一层、展平全部层级或返回字符串表示

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` / `any` / `string` |

#### `Maybe.value`

当前容器值

| 类型 |
| --- |
| `any` |

### Either

Either 函数式容器的创建、映射与取值 API。

#### `Either.of(fn)` / `Either.try(fn)`

执行函数，将结果或异常放入 Right/Left

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Either` |

#### `Either.ok(value)` / `Either.right(value)`

创建 Right

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Either` |

#### `Either.error(value)` / `Either.left(value)`

创建 Left

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Either` |

#### `new Either(value, isError?)`

直接创建 Right，`isError: true` 时创建 Left

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` / `isError` | `any` / `boolean` | `Either` |

#### `Either.map(fn)`

仅映射 Right；`isLeft`、`isRight` 表示当前分支

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Either` |

#### `Either.flatMap(fn)` / `Either.join()` / `Either.flatten()` / `Either.valueOf()` / `Either.toString()`

继承的展开、取值和字符串表示能力；Left 不参与映射，它的值也不会被 `join()` 展平

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` |

#### `Either.value` / `Either.isLeft` / `Either.isRight`

当前分支值与分支状态

| 类型 |
| --- |
| `any` / `boolean` / `boolean` |

### IO

IO 函数式容器的创建、映射与取值 API。

#### `IO.of(value)` / `new IO(value)`

创建 IO；`map` 会把值包装进惰性计算链。函数作为初始值时同样被当作普通值，不会被执行

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `IO` |

#### `IO.map(fn)`

组合惰性计算

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `IO` |

#### `IO.run()` / `IO.valueOf()` / `IO.toString()`

执行计算或返回字符串表示；每次调用都会重新执行整条计算链

| 返回值 |
| --- |
| `any` / `any` / `string` |

#### `IO.flatMap(fn)` / `IO.join()` / `IO.flatten()`

同样是惰性的：`flatMap` 在 `fn` 返回 IO 时展平一层，`join` 展平一层，`flatten` 展平全部层级

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `IO` |

#### `IO.value` / `IO.lazy`

`lazy` 为 `true` 时 `value` 是内部生成的待执行函数，否则是初始值

| 类型 |
| --- |
| `any` / `boolean` |


同一输入分别进入 Pointed、Monad、Maybe、Either 和 IO：

:::playground
<!--
<config lang="json5">
{
	views: ['runtime', 'files']
}
</config>
-->
```vue
<script setup>

import { ref } from 'vue';
import { Either, IO, Maybe, Monad, Pointed } from '@deot/helper-fp';

const input = ref(2);
const output = ref({ status: '点击运行' });

const run = () => {
	const value = Number(input.value) || 0;
	const either = Either.of(() => {
		if (value < 0) throw new Error('只接受非负数');
		return value;
	}).map(number => number + 1);

	output.value = {
		pointed: Pointed.of(value).map(number => number + 1).valueOf(),
		monad: {
			join: Monad.of(Monad.of(value)).join().valueOf(),
			flatMap: Monad.of(value).flatMap(number => Monad.of(number * 2)).valueOf()
		},
		maybe: {
			just: Maybe.of(value).map(number => number * 2).valueOf(),
			nothing: Maybe.of(null).map(() => '不会执行').valueOf('fallback')
		},
		either: { isLeft: either.isLeft, isRight: either.isRight, value: String(either.valueOf()) },
		io: IO.of(value).map(number => number + 4).valueOf()
	};
};
</script>

<template>
	<div class="demo">
		<label>数字输入 <input v-model="input" type="number"></label>
		<button @click="run">运行 Functor</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; gap: 10px; padding: 0; }
input, button { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
input { width: 100%; max-width: 480px; box-sizing: border-box; }
button { width: fit-content; cursor: pointer; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

`APointed`、`AMonad` 分别是对应容器的抽象基类，主要用于扩展现有实现。

### APointed

保存一个 `value`，并要求子类实现映射与字符串表示。

#### `new APointed(value)`

抽象构造函数，只能通过子类调用

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `APointed` |

#### `APointed.map(fn)`

抽象映射方法，由子类实现

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` |

#### `APointed.toString()`

抽象字符串表示方法，由子类实现

| 返回值 |
| --- |
| `any` |

#### `APointed.valueOf()`

返回公开属性 `value`

| 返回值 |
| --- |
| `any` |

### AMonad

在 `APointed` 的容器能力之外提供嵌套 Monad 展开。

#### `new AMonad(value)`

抽象构造函数，只能通过子类调用

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `AMonad` |

#### `AMonad.map(fn)` / `AMonad.toString()`

由子类实现的抽象方法

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` |

#### `AMonad.flatMap(fn)`

标准的 chain：等价于 `this.map(fn).join()`，不修改当前实例

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` |

#### `AMonad.join()`

展平一层：`value` 是 `AMonad` 时返回它，否则返回当前实例

| 返回值 |
| --- |
| `any` |

#### `AMonad.flatten()`

展平全部层级，返回最内层的实例；不同 Monad 混用时返回的类型以最内层为准

| 返回值 |
| --- |
| `any` |

#### `AMonad.valueOf()`

返回公开属性 `value`

| 返回值 |
| --- |
| `any` |

## 参考

设计参考《JavaScript 函数式编程指南》；combinator 与 pipeline 场景也可结合 Ramda 等专用函数式库评估使用。
