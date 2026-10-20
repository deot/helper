# @deot/helper-fp

函数式编程工具集合，包含函数管道、组合子、基础函子以及可暂停、取消或并发执行的任务类型。

## 安装

```bash
pnpm add @deot/helper-fp
```

## 使用

```ts
import { pipe, map, filter, Maybe, Task } from '@deot/helper-fp';

const select = pipe(
	map((value: number) => value * 2),
	filter((value: number) => value > 4)
);

select([1, 2, 3]);
Maybe.of(null).map(() => '不会执行').valueOf('fallback');

const task = Task.of(1).map(async value => value + 1);
const result = await task.toPromise();
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
| `fn` | `(...args: any[]) => any` | `Function` |

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

映射或展开映射结果

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Monad` / `any` |

#### `Monad.join()` / `Monad.valueOf()` / `Monad.toString()`

展开一层、读取值或字符串表示

| 返回值 |
| --- |
| `any` / `any` / `string` |

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

#### `Maybe.flatMap(fn)` / `Maybe.join()` / `Maybe.toString()`

展开映射、展开嵌套 Monad 或返回字符串表示

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

#### `Either.flatMap(fn)` / `Either.join()` / `Either.valueOf()` / `Either.toString()`

继承的展开、取值和字符串表示能力

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

创建 IO；`map` 会把普通值包装进惰性计算链

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `IO` |

#### `IO.map(fn)`

组合惰性计算

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `IO` |

#### `IO.valueOf()` / `IO.toString()`

执行计算或返回字符串表示；未经 `map` 的初始值需为函数

| 返回值 |
| --- |
| `any` / `string` |

#### `IO.flatMap(fn)` / `IO.join()`

继承的展开映射和嵌套 Monad 展开能力

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` |

#### `IO.value`

当前惰性计算值；映射后通常为函数

| 类型 |
| --- |
| `any` |


同一输入分别进入 Pointed、Monad、Maybe、Either、IO 和 Task：

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
import { Either, IO, Maybe, Monad, Pointed, Task } from '@deot/helper-fp';

const input = ref(2);
const output = ref({ status: '点击运行' });

const run = async () => {
	const value = Number(input.value) || 0;
	const either = Either.of(() => {
		if (value < 0) throw new Error('只接受非负数');
		return value;
	}).map(number => number + 1);
	const task = Task.of(value).map(async number => number * 3);

	output.value = {
		pointed: Pointed.of(value).map(number => number + 1).valueOf(),
		monad: Monad.of(Monad.of(value)).join().valueOf(),
		maybe: {
			just: Maybe.of(value).map(number => number * 2).valueOf(),
			nothing: Maybe.of(null).map(() => '不会执行').valueOf('fallback')
		},
		either: { isLeft: either.isLeft, isRight: either.isRight, value: String(either.valueOf()) },
		io: IO.of(value).map(number => number + 4).valueOf(),
		task: await task.toPromise()
	};
};
</script>

<template>
	<div class="demo">
		<label>数字输入 <input v-model="input" type="number"></label>
		<button @click="run">运行 Functor / Task</button>
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

`APointed`、`AMonad`、`ATask` 分别是对应容器和任务类型的抽象基类，主要用于扩展现有实现。

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

`join()` 后更新 `value`，再调用当前实例的 `map()`

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `any` |

#### `AMonad.join()`

递归展开嵌套的 `AMonad`，非嵌套时返回当前实例

| 返回值 |
| --- |
| `any` |

#### `AMonad.valueOf()`

返回公开属性 `value`

| 返回值 |
| --- |
| `any` |

### ATask

任务类的事件与中断基类，继承 `Emitter`；暂停方法名沿用源码中的 `pasue()`。

#### `ATask.suspend(value, target?)`

可选等待 target 后原样返回 value

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` / `target` | `any` / `PromiseLike<any>` | `Promise<any>` |

#### `ATask.start()` / `ATask.cancel()` / `ATask.pasue()` / `ATask.resume()`

由具体任务类实现的抽象控制方法

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `...args` | `any[]` | `any` |

#### `ATask.setPasueStatus(status)`

更新 `isPasue` 并创建或解除暂停 Promise

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `status` | `boolean` | `void` |

#### `ATask.setCancelStatus(status)`

更新 `isCancel` 并创建永久等待或已完成的取消 Promise

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `status` | `boolean` | `void` |

#### `ATask.end()` / `ATask.immediate()`

分别代理 `cancel()` 与 `start()`

| 返回值 |
| --- |
| `any` |

`ATask` 公开 `isCancel`、`isPasue` 状态以及 `pasuer`、`canceler` Promise；`_pasuer` 是解除暂停时使用的实现回调，不建议业务代码直接调用。


### Task

支持串行映射、归并、暂停、恢复、取消和重新执行的异步任务链。

#### `Task.of(value, parent?)` / `new Task(value, parent?)`

创建串行任务节点

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` / `parent` | `any` / `Task` | `Task` |

#### `Task.map(fn)` / `Task.flatMap(fn)`

追加可取消的异步映射，或执行展开映射

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `Function` | `Task` / `any` |

#### `Task.reduce(collection, done)`

串行归并集合

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `collection` / `done` | `any[] \| ((value) => any[] \| Promise<any[]>)` / `Function` | `Task` |

```ts
import { Task } from '@deot/helper-fp';

await Task.of(10).reduce([1, 2, 3], async (sum, value) => sum + value).toPromise(); // 16
```

#### `Task.start()` / `Task.immediate()`

从父节点开始任务链

| 返回值 |
| --- |
| `Task` |

#### `Task.pasue()` / `Task.resume()`

暂停或恢复任务链

| 返回值 |
| --- |
| `Task` |

#### `Task.cancel()` / `Task.end()`

取消当前任务及父链

| 返回值 |
| --- |
| `Task` |

#### `Task.restart(value?)`

按已记录的链重新创建并启动任务

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Task` |

#### `Task.toPromise()`

必要时启动任务并返回底层 Promise

| 返回值 |
| --- |
| `Promise<any>` |

#### `Task.valueOf()` / `Task.toString()`

读取已完成结果或字符串表示

| 返回值 |
| --- |
| `any` / `string` |

#### 公开状态

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `result` | `any` | 已完成节点的结果；未完成时初始为 `''` |
| `isCancel` / `isComplete` / `isStart` | `boolean` | 当前节点的取消、完成和启动状态 |
| `parent` / `child` | `Task \| null` | 任务链的相邻节点 |
| `ready` / `pasuer` | `Promise<any>` / `Promise<void>` | 启动门闩与暂停门闩 |
| `cancelHooks` | `Function[]` | 当前节点取消时调用的 reject 回调 |
| `record` | `[string, Function] \| null` | `restart()` 重建任务链时使用的方法记录 |
| `_ready` / `_pasuer` | `Function` | 解除启动或暂停门闩的实现回调，不建议直接调用 |

输入初始值，串行执行“加一 → 乘二”。运行过程中可以暂停、恢复或取消；`restart()` 会创建并启动一条新链：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { Task } from '@deot/helper-fp';

const input = ref(10);
const status = ref('未开始');
const isPaused = ref(false);
const output = ref({});
let task;
let generation = 0;
const wait = () => new Promise(resolve => setTimeout(resolve, 600));

const observe = (node) => {
	task = node;
	const id = ++generation;
	status.value = '运行中';
	isPaused.value = false;
	output.value = {};
	node.toPromise().then((result) => {
		if (id !== generation) return;
		status.value = '已完成';
		output.value = { result, valueOf: node.valueOf(), toString: node.toString(), isComplete: node.isComplete };
	}, (error) => {
		if (id === generation) { status.value = '失败'; output.value = { error: String(error) }; }
	});
};
const run = () => {
	task?.cancel();
	observe(Task.of(Number(input.value) || 0)
		.map(async (value) => { await wait(); return value + 1; })
		.map(async (value) => { await wait(); return value * 2; }));
};
const pause = () => { task.pasue(); isPaused.value = true; status.value = '已暂停'; };
const resume = () => { task.resume(); isPaused.value = false; status.value = '运行中'; };
const cancel = () => {
	task.cancel();
	generation += 1;
	isPaused.value = false;
	status.value = '已取消';
	output.value = { isCancel: task.isCancel, isComplete: task.isComplete };
};
const restart = () => observe(task.restart());
onBeforeUnmount(() => { generation += 1; task?.cancel(); });
</script>

<template>
	<div class="demo">
		<label>初始值 <input v-model.number="input" type="number"></label>
		<div class="controls">
			<button @click="run">新建并运行</button>
			<button :disabled="status !== '运行中'" @click="pause">暂停</button>
			<button :disabled="!isPaused" @click="resume">恢复</button>
			<button :disabled="!['运行中', '已暂停'].includes(status)" @click="cancel">取消</button>
			<button :disabled="!task" @click="restart">restart 原始输入</button>
		</div>
		<div>{{ status }}（每一步约 600ms）</div>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label, .demo .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.demo input { width: 100px; }
.demo input, .demo button { padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo button { cursor: pointer; color: #0f172a; background: #fff; }
.demo button:disabled { opacity: .5; cursor: default; }
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

暂停在任务节点之间生效，不会中止已经进入的异步函数。取消后的原链 Promise 可能保持 pending，不能靠 `await task.toPromise()` 等待取消完成；`restart()` 返回新 Task，必须使用其返回值。底层请求和定时器的清理仍由调用方负责。

### Job

按固定间隔重复执行任务，适合轮询或周期工作。

`TaskSource` 为 `Task | (() => Promise<any>)`；`ParallelSource` 还可以是上述值的数组。

#### `Job.of(task, interval?)` / `new Job(...)`

创建周期任务

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `task` / `interval` | `TaskSource` / `number` | `0` | `Job` |

#### `Job.start()` / `Job.immediate()`

启动任务循环

| 返回值 |
| --- |
| `void` |

#### `Job.pasue()` / `Job.resume()`

暂停或恢复任务循环

| 返回值 |
| --- |
| `void` |

#### `Job.cancel()` / `Job.end()`

取消任务循环

| 返回值 |
| --- |
| `void` |

#### `Job.restart()`

清除取消状态并重新执行；不会自动解除暂停，暂停中的任务应先 `resume()`

| 返回值 |
| --- |
| `void` |

#### `Job.process(leaf?)`

执行并递归安排下一轮；属于可见的调度实现方法

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `leaf` | `Task \| (() => Promise<any>)` | 原始任务 | `any` |

`Job` 还公开 `original`、`task`、`interval`、`isStart`，以及继承自 `ATask` 的中断状态。它会发布 `fulfilled`、`rejected` 事件。

下面依次演示启动、暂停、恢复、取消和重启。每一轮输出序号；暂停和取消后等待一个间隔，验证序号停止增长，再进入下一阶段：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { Job } from '@deot/helper-fp';

const interval = ref(200);
const isRunning = ref(false);
const output = ref([]);
let job;
let isDisposed = false;

const run = async () => {
	isRunning.value = true;
	output.value = [];
	let tick = 0;
	const delay = Math.max(50, Number(interval.value) || 200);
	const current = Job.of(async () => ++tick, delay);
	job = current;
	const next = action => new Promise(resolve => current.once('fulfilled', (value) => { action(); resolve(value); }));
	const wait = () => new Promise(resolve => setTimeout(resolve, delay + 50));
	const first = next(() => current.pasue());
	current.start();
	output.value.push({ method: 'start → pasue', value: await first });
	await wait();
	if (isDisposed) return;
	output.value.push({ method: '暂停后等待一个间隔', tick, isPasue: current.isPasue });
	const second = next(() => current.cancel());
	current.resume();
	output.value.push({ method: 'resume → cancel', value: await second });
	await wait();
	if (isDisposed) return;
	output.value.push({ method: '取消后等待一个间隔', tick, isCancel: current.isCancel });
	const third = next(() => current.cancel());
	current.restart();
	output.value.push({ method: 'restart → cancel', value: await third });
	isRunning.value = false;
};

onBeforeUnmount(() => { isDisposed = true; job?.cancel(); });
</script>

<template>
	<div class="demo">
		<label>间隔毫秒 <input v-model.number="interval" type="number" min="50" :disabled="isRunning"></label>
		<button :disabled="isRunning" @click="run">{{ isRunning ? '执行中…' : '运行生命周期' }}</button>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.demo input { width: 100px; }
.demo input, .demo button { padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo button { width: fit-content; cursor: pointer; color: #0f172a; background: #fff; }
.demo button:disabled { opacity: .5; }
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

`interval` 是每轮任务完成后再等待的时间，不是固定时钟的触发频率。函数形式的任务在暂停或取消时不会中断已进入的函数；不要在上一次调用尚未结束时反复 `restart()`，网络请求仍需自行处理 `AbortSignal`。

### Parallel

按指定并发数调度一组异步任务。

`TaskSource` 为 `Task | (() => Promise<any>)`；`ParallelSource` 还可以是上述值的数组。

#### `Parallel.of(task, concurrency?, options?)` / `new Parallel(...)`

创建并发任务调度器

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `task` / `concurrency` / `options` | `ParallelSource` / `number` / `{ skipError?: boolean }` | `1` / `{ skipError: true }` | `Parallel` |

#### `Parallel.setConcurrency(value)`

设置大于 0 的并发数并返回实际值

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `number` | `number` |

#### `Parallel.start()` / `Parallel.immediate()`

启动调度，全部完成时 resolve

| 返回值 |
| --- |
| `Promise<any>` |

#### `Parallel.pasue()` / `Parallel.resume()`

暂停或恢复当前任务

| 返回值 |
| --- |
| `Promise<void>` / `void` |

#### `Parallel.cancel()` / `Parallel.end()`

取消当前调度

| 返回值 |
| --- |
| `Promise<void>` |

#### `Parallel.restart()`

取消后恢复原始任务并重新启动；不会自动解除暂停，暂停中的任务应先 `resume()`

| 返回值 |
| --- |
| `Promise<any>` |

#### `Parallel.process()`

按 concurrency 填充执行队列；属于可见的调度实现方法

| 返回值 |
| --- |
| `void` |

#### `Parallel.onFulfilled(value)` / `Parallel.onRejected(error)`

完成或失败后的内部队列推进回调

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` / `error` | `any` | `void` |

`Parallel` 公开 `original`、`task`、`tasks`、`concurrency`、`options`、`isStart`、`target` 和 `_target` 状态。`target` 是当前 `start()` Promise，`_target` 保存其 resolve/reject；后两者属于实现状态，不建议业务代码修改。

调整并发数和错误策略，观察调度完成事件。运行中可以修改并发数、暂停、恢复或取消；结束后 `restart()` 重新执行同一组任务：

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
import { onBeforeUnmount, ref } from 'vue';
import { Parallel } from '@deot/helper-fp';

const concurrency = ref(2);
const skipError = ref(true);
const fail = ref(false);
const status = ref('未开始');
const isControlling = ref(false);
const output = ref([]);
let parallel;

const run = () => {
	output.value = [];
	const shouldFail = fail.value;
	parallel = Parallel.of(
		[1, 2, 3, 4, 5, 6].map(id => async () => {
			await new Promise(resolve => setTimeout(resolve, id % 2 ? 600 : 400));
			if (shouldFail && id === 4) throw new Error('任务 4 失败');
			return { id };
		}),
		Math.max(1, Math.floor(Number(concurrency.value) || 1)),
		{ skipError: skipError.value }
	);
	parallel.on('fulfilled', value => output.value.push({ event: 'fulfilled', ...value }));
	parallel.on('rejected', error => output.value.push({ event: 'rejected', message: error.message }));
	observe(parallel.start());
};
const observe = (promise) => {
	status.value = '运行中';
	promise.then(() => { status.value = '已完成'; }, (error) => {
		status.value = '异常结束';
		output.value.push({ startPromise: 'reject', message: error.message });
	});
};
const setConcurrency = () => {
	const actual = parallel.setConcurrency(Math.max(1, Math.floor(Number(concurrency.value) || 1)));
	output.value.push({ method: 'setConcurrency', value: actual });
};
const pause = () => { parallel.pasue(); status.value = '已暂停'; };
const resume = () => { parallel.resume(); status.value = '运行中'; };
const cancel = async () => {
	isControlling.value = true;
	if (parallel.isPasue) parallel.resume();
	await parallel.cancel();
	status.value = '已取消';
	isControlling.value = false;
};
const restart = () => { output.value = []; observe(parallel.restart()); };
onBeforeUnmount(() => parallel?.cancel());
</script>

<template>
	<div class="demo">
		<label>并发数 <input v-model.number="concurrency" type="number" min="1" max="6"></label>
		<div class="controls">
			<label><input v-model="skipError" type="checkbox">skipError</label>
			<label><input v-model="fail" type="checkbox">让任务 4 失败</label>
		</div>
		<div class="controls">
			<button :disabled="isControlling || ['运行中', '已暂停'].includes(status)" @click="run">新建并运行</button>
			<button :disabled="status !== '运行中' || isControlling" @click="setConcurrency">应用并发数</button>
			<button :disabled="status !== '运行中' || isControlling" @click="pause">暂停</button>
			<button :disabled="status !== '已暂停' || isControlling" @click="resume">恢复</button>
			<button :disabled="!['运行中', '已暂停'].includes(status) || isControlling" @click="cancel">取消</button>
			<button :disabled="!['已完成', '已取消'].includes(status) || isControlling" @click="restart">restart</button>
		</div>
		<div>{{ status }}；每个任务耗时约 400–600ms，错误策略在新建时读取。</div>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label, .demo .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.demo input[type="number"] { width: 100px; }
.demo input[type="checkbox"] { width: auto; padding: 0; }
.demo input, .demo button { padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo button { cursor: pointer; color: #0f172a; background: #fff; }
.demo button:disabled { opacity: .5; cursor: default; }
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

数组任务通过 `pop()` 从末尾取出，事件按实际完成顺序发出，不保证与输入数组同序。`skipError: true` 会发出 `rejected` 后继续；`false` 会使 `start()` reject，已经开始的函数不会因此被自动中止。

暂停会延后结果通知与后续调度，但不能撤销已发出的请求；不要在暂停期间提高并发数，`setConcurrency()` 本身会立即尝试补充队列。取消后原来的 `start()` Promise 保持 pending，`await cancel()` 与等待原 Promise 是两回事。

## 参考

设计参考《JavaScript 函数式编程指南》；combinator 与 pipeline 场景也可结合 Ramda 等专用函数式库评估使用。

为保持现有 API 兼容，任务类型的暂停方法名是源码中的 `pasue()`（而非 `pause()`）。
