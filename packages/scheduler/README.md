# @deot/helper-scheduler

任务调度入口，提供可等待的 `Interrupter`，并重新导出 `@deot/helper-fp` 中的 `Task`、`Job` 与 `Parallel`。

## 安装

```bash
pnpm add @deot/helper-scheduler
```

## 使用

```ts
import { Interrupter } from '@deot/helper-scheduler';

const interrupter = Interrupter.of<number>();
setTimeout(() => interrupter.next(1), 100);

const value = await interrupter;
```

聚合包可直接导入 `Interrupter`、`Task`、`Job` 和 `Parallel`。

## API

### Interrupter

可重复推进并可永久结束的 Promise-like 中断器。

#### `new Interrupter(options?)` / `Interrupter.of(options?)`

创建 thenable 中断器；timeout 当前仅声明未应用

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `options` | `{ timeout?: number }` | `{}` | `Interrupter<T>` |

#### `Interrupter.next(value?)`

解析当前等待并生成下一轮

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `value` | `T` | `undefined` | `Promise<void>` |

#### `Interrupter.nextWithError(error?)`

拒绝当前等待并生成下一轮

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `error` | `any` | `undefined` | `Promise<void>` |

#### `Interrupter.finish(value?)`

解析并永久结束

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `value` | `T` | `undefined` | `this` |

#### `Interrupter.finishWithError(error?)`

拒绝并永久结束

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `error` | `T` | `undefined` | `this` |

#### `Interrupter.then(resolve, reject?)`

Promise-like then

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `resolve`、`reject` | `(value: T) => void` | `Promise<void>` |

#### `Interrupter.catch(callback?)`

Promise-like catch

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `callback` | `(reason: T) => void` | `Promise<any>` |

#### `Interrupter.finally(callback?)`

Promise-like finally

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `callback` | `() => void` | `Promise<any>` |

#### 公开状态与实现成员

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `options` | `InterrupterOptions` | 构造时传入的配置 |
| `_finish` | `boolean` | 是否已通过 finish 方法永久结束 |
| `_task` | `Promise<any>` | 当前一轮等待的 Promise |
| `_success` / `_fail` | `((value?: any) => void) \| undefined` | 当前 Promise 的 resolve/reject 包装函数 |
| `_generateTask()` | `() => void` | 创建下一轮等待 Promise |

下划线成员虽然在当前声明中可见，但属于调度实现状态，不应由业务代码修改或调用。

分别运行成功、错误和永久结束流程，观察 `then`、`catch`、`finally` 与推进方法的调用顺序：

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
import { Interrupter } from '@deot/helper-scheduler';

const output = ref([]);

const runNext = async () => {
	const logs = [];
	const interrupter = Interrupter.of();
	const waiting = interrupter
		.then(value => logs.push(`then:${value}`))
		.finally(() => logs.push('finally'));
	await interrupter.next(1);
	await waiting;
	output.value = logs;
};

const runError = async () => {
	const logs = [];
	const interrupter = Interrupter.of();
	const waiting = interrupter
		.catch(reason => logs.push(`catch:${reason}`))
		.finally(() => logs.push('finally'));
	await interrupter.nextWithError('error');
	await waiting;
	output.value = logs;
};

const runFinish = async () => {
	const interrupter = Interrupter.of();
	const waiting = interrupter.then(value => `finish:${value}`);
	interrupter.finish('done');
	output.value = [await waiting, `finished:${interrupter._finish}`];
};

const runFinishError = async () => {
	const interrupter = Interrupter.of();
	const waiting = interrupter.catch(reason => `finishWithError:${reason}`);
	interrupter.finishWithError('done');
	output.value = [await waiting, `finished:${interrupter._finish}`];
};
</script>

<template>
	<div class="demo">
		<div class="actions">
			<button @click="runNext">next</button>
			<button @click="runError">nextWithError</button>
			<button @click="runFinish">finish</button>
			<button @click="runFinishError">finishWithError</button>
		</div>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `InterrupterOptions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `timeout` | `number` | 已声明但当前实现尚未应用超时逻辑 |

以下任务类从 `@deot/helper-fp` 重新导出。

### Task

串行函数链，通过 `Task.of(value, parent?)` 或构造函数创建；完整方法、状态和参数见 fp API。

#### `Task.of(value, parent?)` / `new Task(value, parent?)`

创建任务节点

| 参数 | 返回值 |
| --- | --- |
| `any` / `Task` | `Task` |

#### `Task.map(fn)` / `Task.flatMap(fn)`

追加映射或展开映射

| 参数 | 返回值 |
| --- | --- |
| `Function` | `Task` / `any` |

#### `Task.reduce(collection, done)`

串行归并集合

| 参数 | 返回值 |
| --- | --- |
| `any[] \| Function` / `Function` | `Task` |

#### `Task.start()` / `Task.immediate()`

启动任务链

| 返回值 |
| --- |
| `Task` |

#### `Task.pasue()` / `Task.resume()`

暂停或恢复

| 返回值 |
| --- |
| `Task` |

#### `Task.cancel()` / `Task.end()`

取消任务链

| 返回值 |
| --- |
| `Task` |

#### `Task.restart(value?)`

重建并启动任务链

| 参数 | 返回值 |
| --- | --- |
| `any` | `Task` |

#### `Task.toPromise()` / `Task.valueOf()` / `Task.toString()`

等待、取值或格式化

| 返回值 |
| --- |
| `Promise<any>` / `any` / `string` |

公开状态包括 `result`、`cancelHooks`、`isCancel`、`isComplete`、`isStart`、`parent`、`child`、`record`、`ready`、`pasuer`；`_ready`、`_pasuer` 是实现回调。

### Job

周期任务，通过 `Job.of(task, interval?)` 或构造函数创建；完整方法、状态和参数见 fp API。

#### `Job.of(task, interval?)` / `new Job(task, interval?)`

创建周期任务

| 参数 | 返回值 |
| --- | --- |
| `TaskSource` / `number` | `Job` |

#### `Job.process(leaf?)`

执行并安排下一轮

| 参数 | 返回值 |
| --- | --- |
| `TaskSource` | `any` |

#### `Job.start()` / `Job.immediate()`

启动循环

| 返回值 |
| --- |
| `void` |

#### `Job.pasue()` / `Job.resume()`

暂停或恢复

| 返回值 |
| --- |
| `void` |

#### `Job.cancel()` / `Job.end()`

取消循环

| 返回值 |
| --- |
| `void` |

#### `Job.restart()`

清理中断状态并重新执行

| 返回值 |
| --- |
| `void` |

公开状态包括 `original`、`task`、`interval`、`isStart` 及继承自 `ATask` 的中断状态。

### Parallel

并发任务，通过 `Parallel.of(task, concurrency?, options?)` 或构造函数创建；完整方法、状态和参数见 fp API。

#### `Parallel.of(task, concurrency?, options?)` / `new Parallel(...)`

创建并发调度器

| 参数 | 返回值 |
| --- | --- |
| `ParallelSource` / `number` / `{ skipError?: boolean }` | `Parallel` |

#### `Parallel.setConcurrency(value)`

设置并返回实际并发数

| 参数 | 返回值 |
| --- | --- |
| `number` | `number` |

#### `Parallel.process()`

按并发数填充执行队列

| 返回值 |
| --- |
| `void` |

#### `Parallel.onFulfilled(value)` / `Parallel.onRejected(error)`

完成或失败后的队列推进回调

| 参数 | 返回值 |
| --- | --- |
| `any` | `void` |

#### `Parallel.start()` / `Parallel.immediate()`

启动调度

| 返回值 |
| --- |
| `Promise<any>` |

#### `Parallel.pasue()` / `Parallel.resume()`

暂停或恢复

| 返回值 |
| --- |
| `Promise<void>` / `void` |

#### `Parallel.cancel()` / `Parallel.end()`

取消调度

| 返回值 |
| --- |
| `Promise<void>` |

#### `Parallel.restart()`

重置并重新启动

| 返回值 |
| --- |
| `Promise<any>` |

公开状态包括 `original`、`task`、`tasks`、`concurrency`、`options`、`isStart`、`target`、`_target`；后两项属于 Promise 调度实现状态。

## 任务类型说明

```ts
import { Task, Job, Parallel } from '@deot/helper-scheduler';
```

| 类型 | 说明 |
| --- | --- |
| `Task` | 串行函数链，支持启动、暂停、恢复、取消和重启 |
| `Job` | 周期性执行 Task 或 Promise 工厂 |
| `Parallel` | 按并发数执行 Task 或 Promise 工厂集合 |

这些类型的完整行为见 [`@deot/helper-fp`](../fp/README.md)。为兼容已有 API，暂停方法名为 `pasue()`。
