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
/* eslint-disable no-useless-assignment */
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

#### `pipe(...fns)`

从左向右组合函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fns` | `Function[]` | `Function` |

#### `partial(fn, ...args)`

创建预填部分参数的函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `args` | `Function` / `any[]` | `Function` |

#### `then$(fn, thenable)`

调用 `thenable.then(fn)`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `thenable` | `Function` / `PromiseLike<any>` | `PromiseLike<any>` |

#### `catch$(fn, promise)`

调用 `promise.catch(fn)`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `promise` | `Function` / `Promise<any>` | `Promise<any>` |

#### `memoize(fn, resolver?)`

按首个参数或 resolver 返回值缓存结果

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `resolver` | `Function` / `Function` | `Function` |

#### `map(fn, value)`

映射数组或对象值

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `value` | `Function` / `any[] \| object` | `any[] \| object` |

#### `filter(fn, value)`

筛选数组或对象值

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `value` | `Function` / `any[] \| object` | `any[] \| object` |

#### `reduce(fn, initialValue, value)`

从左向右归并数组

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fn` / `initialValue` / `value` | `Function` / `any` / `any[]` | `any` |

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

#### `alternation(first, second)`

first 结果为 falsy 时执行 second

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `first` / `second` | `Function` / `Function` | `Function` |

#### `sequence(...fns)`

以同一个值依次执行函数，不返回执行结果

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `fns` | `Function[]` | `(value?: any) => void` |

#### `fork(join, left, right)`

对同一输入执行两个分支，再由 join 合并

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `join` / `left` / `right` | `Function` / `Function` / `Function` | `Function` |

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
/* eslint-disable no-useless-assignment */
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

清理中断状态并重新执行

| 返回值 |
| --- |
| `void` |

#### `Job.process(leaf?)`

执行并递归安排下一轮；属于可见的调度实现方法

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `leaf` | `Task \| (() => Promise<any>)` | 原始任务 | `any` |

`Job` 还公开 `original`、`task`、`interval`、`isStart`，以及继承自 `ATask` 的中断状态。它会发布 `fulfilled`、`rejected` 事件。

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

取消后恢复原始任务并重新启动

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

输入初始值和并发数，分别查看串行归并、周期任务的主动结束，以及并发任务的完成顺序：

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
/* eslint-disable no-useless-assignment */
import { onBeforeUnmount, ref } from 'vue';
import { Job, Parallel, Task } from '@deot/helper-fp';

const input = ref(10);
const concurrency = ref(2);
const output = ref({ status: '点击运行' });
let activeJob;

const run = async () => {
	activeJob?.cancel();
	const value = Number(input.value) || 0;
	const task = Task.of(value).reduce([1, 2, 3], (sum, item) => sum + item);
	const taskResult = await task.toPromise();

	let tick = 0;
	const jobValues = [];
	activeJob = Job.of(async () => ++tick, 20);
	await new Promise((resolve) => {
		activeJob.on('fulfilled', (result) => {
			jobValues.push(result);
			if (jobValues.length === 3) {
				activeJob.cancel();
				resolve();
			}
		});
		activeJob.start();
	});

	const parallelValues = [];
	const delays = [45, 10, 25, 5];
	const parallel = Parallel.of(
		delays.map((delay, index) => () => new Promise((resolve) => {
			setTimeout(() => resolve(`任务 ${index + 1}（${delay}ms）`), delay);
		})),
		Math.max(1, Number(concurrency.value) || 1)
	);
	parallel.on('fulfilled', result => parallelValues.push(result));
	await parallel.start();

	output.value = {
		task: { input: value, collection: [1, 2, 3], result: taskResult },
		job: { values: jobValues, isCancel: activeJob.isCancel },
		parallel: { concurrency: parallel.concurrency, fulfilled: parallelValues }
	};
};

onBeforeUnmount(() => activeJob?.cancel());
</script>

<template>
	<div class="demo">
		<label>初始值 <input v-model="input" type="number"></label>
		<label>并发数 <input v-model="concurrency" type="number" min="1" max="4"></label>
		<button @click="run">运行任务分组</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; grid-template-columns: 72px minmax(0, 180px); align-items: center; gap: 8px; }
input, button { min-height: 32px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; }
input { width: 100%; }
button { width: fit-content; cursor: pointer; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

## 参考

设计参考《JavaScript 函数式编程指南》；combinator 与 pipeline 场景也可结合 Ramda 等专用函数式库评估使用。

为保持现有 API 兼容，任务类型的暂停方法名是源码中的 `pasue()`（而非 `pause()`）。
