# @deot/helper-scheduler

任务调度工具：可等待的 `Interrupter`，以及可暂停、取消、重启的串行任务 `Task`、轮询任务 `Job` 与并发任务 `Parallel`。

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

```ts
import { Task, Parallel, isCancelError } from '@deot/helper-scheduler';

const task = Task.of(1).map(async value => value + 1);
await task.toPromise(); // 2

const results = await Parallel.of([async () => 1, async () => 2], 2).start();
// [{ status: 'fulfilled', value: 1 }, { status: 'fulfilled', value: 2 }]
```

聚合包可直接导入 `Interrupter`、`Task`、`Job`、`Parallel` 和 `CancelError`。

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
| `error` | `any` | `undefined` | `this` |

#### `Interrupter.then(resolve, reject?)`

Promise-like then

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `resolve`、`reject` | 同 `Promise.then` | `Promise<R1 \| R2>` |

#### `Interrupter.catch(callback?)`

Promise-like catch

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `callback` | `(reason: any) => R` | `Promise<T \| R>` |

#### `Interrupter.finally(callback?)`

Promise-like finally

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `callback` | `() => void` | `Promise<T>` |

#### 公开状态与实现成员

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `options` | `InterrupterOptions` | 构造时传入的配置 |
| `_finish` | `boolean` | 是否已通过 finish 方法永久结束 |
| `_task` | `Promise<any>` | 当前一轮等待的 Promise |
| `_success` / `_fail` | `((value?: any) => void) \| undefined` | 当前 Promise 的 resolve/reject 包装函数 |
| `_generateTask()` | `() => void` | 创建下一轮等待 Promise |

下划线成员虽然在当前声明中可见，但属于调度实现状态，不应由业务代码修改或调用。

几点行为说明：

- `next()` 之后紧接着（同一轮微任务内）`await interrupter` 能拿到这次的值；再往后的等待者要等下一次 `next()`。
- 同一 tick 内连续调用多次 `next()` 只有第一次的值生效；`next()` 后立刻 `finish()` 时以 `next()` 的值永久结束。
- `nextWithError()` / `finishWithError()` 在没有等待者时不会产生 unhandledRejection，之后的等待者仍会收到该异常。

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

### CancelError

`Task` 或 `Parallel` 被主动取消时，等待者收到的错误。

#### `new CancelError(message?)` / `isCancelError(error)`

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `message` | `string` | `'Canceled'` | `CancelError`（`name` 为 `'CancelError'`） |
| `error` | `any` | - | `boolean` |

```ts
import { Task, isCancelError } from '@deot/helper-scheduler';

const task = Task.of(1).map(async (value, { onCancel }) => {
	const timer = setTimeout(() => {}, 1000);
	onCancel(() => clearTimeout(timer));
	return value;
});

task.start();
task.cancel();

try {
	await task.toPromise();
} catch (e) {
	isCancelError(e); // true
}
```

多份打包产物并存时 `instanceof CancelError` 可能失效，`isCancelError` 同时按 `name` 识别。主动取消属于预期行为：即使没有人等待被取消的 Promise，也不会产生 unhandledRejection。

### Task

支持串行映射、归并、暂停、恢复、取消和重新执行的异步任务链。

#### `Task.of(value, parent?)` / `new Task(value, parent?)`

创建串行任务节点

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` / `parent` | `T \| PromiseLike<T>` / `Task` | `Task<T>` |

#### `Task.map(fn)` / `Task.flatMap(fn)`

追加一个可取消的异步步骤。`fn` 的第二个参数是 `TaskContext`；`flatMap` 与 `map` 的区别是：上一步的值或 `fn` 的返回值是 `Task` 时，会展平为它的结果

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `fn` | `(value: T, context: TaskContext) => R \| PromiseLike<R>` | `Task<R>` |

`TaskContext`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `onCancel` | `(hook: () => void) => void` | 注册取消时的清理逻辑；已取消后注册会立即执行 |
| `signal` | `AbortSignal \| undefined` | 取消时 abort；运行环境没有 `AbortController`（如部分小程序）时为 `undefined` |

```ts
import { Task } from '@deot/helper-scheduler';

const task = Task.of('/api/user')
	.map((url, { signal }) => fetch(url, { signal }))
	.flatMap(response => Task.of(response.json()));
```

由于 `fn` 会多收到一个参数，直接传入带可选第二形参的函数（如 `parseInt`）时请包一层：`.map(x => parseInt(x))`。

#### `Task.reduce(collection, done)`

串行归并集合

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `collection` / `done` | `any[] \| ((value) => any[] \| Promise<any[]>)` / `Function` | `Task` |

```ts
import { Task } from '@deot/helper-scheduler';

await Task.of(10).reduce([1, 2, 3], async (sum, value) => sum + value).toPromise(); // 16
```

#### `Task.start()` / `Task.immediate()`

从父节点开始任务链

| 返回值 |
| --- |
| `Task` |

#### `Task.pause()` / `Task.resume()`

暂停或恢复任务链；重复暂停、未暂停时恢复都是安全的

| 返回值 |
| --- |
| `Task` |

#### `Task.cancel()` / `Task.end()`

取消当前任务及父链：执行 `onCancel` 注册的清理逻辑，等待者收到 `CancelError`。已完成的任务不受影响

| 返回值 |
| --- |
| `Task` |

#### `Task.restart(value?)`

取消当前链，并沿「根 → 当前节点」的步骤重新创建并启动一条新链；传入 `value`（包括 `0`、`''` 等假值）时替换根节点的初始值

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `Task` |

#### `Task.toPromise()`

必要时启动任务并返回 Promise

| 返回值 |
| --- |
| `Promise<T>` |

#### `Task.valueOf()` / `Task.toString()`

读取已完成结果或字符串表示

| 返回值 |
| --- |
| `any` / `string` |

#### 公开状态

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `result` | `any` | 已完成节点的结果；未完成时初始为 `''` |
| `isCancel` / `isComplete` / `isStart` / `isPause` | `boolean` | 当前节点的取消、完成、启动和暂停状态 |
| `parent` / `child` | `Task \| null` | 任务链的相邻节点 |
| `ready` / `pauser` | `Promise<any>` | 启动门闩与暂停门闩 |
| `cancelHooks` | `Function[]` | 通过 `onCancel` 注册、尚未执行的清理逻辑 |
| `record` | `['map' \| 'flatMap', Function] \| null` | 当前节点由父节点派生的方式，`restart()` 据此重放 |
| `_ready` / `_pauser` / `_cancel` | `Function` | 实现回调，不建议直接调用 |

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
import { Task, isCancelError } from '@deot/helper-scheduler';

const input = ref(10);
const status = ref('未开始');
const isPaused = ref(false);
const output = ref({});
let task;
let generation = 0;
let cleaned = 0;
// 取消时通过 onCancel 清理定时器
const wait = ({ onCancel }) => new Promise((resolve) => {
	const timer = setTimeout(resolve, 600);
	onCancel(() => { clearTimeout(timer); cleaned += 1; });
});

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
		if (id !== generation) return;
		// 主动取消时等待者收到 CancelError
		status.value = isCancelError(error) ? '已取消' : '失败';
		output.value = { error: String(error), isCancel: node.isCancel, cleaned };
	});
};
const run = () => {
	task?.cancel();
	observe(Task.of(Number(input.value) || 0)
		.map(async (value, context) => { await wait(context); return value + 1; })
		.map(async (value, context) => { await wait(context); return value * 2; }));
};
const pause = () => { task.pause(); isPaused.value = true; status.value = '已暂停'; };
const resume = () => { task.resume(); isPaused.value = false; status.value = '运行中'; };
const cancel = () => {
	isPaused.value = false;
	task.cancel();
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

暂停在任务节点之间生效，不会中止已经进入的异步函数。取消后 `await task.toPromise()` 会以 `CancelError` 结束；已进入的函数本身不会被打断，需要通过 `onCancel` 或 `signal` 自行清理请求和定时器。`restart()` 返回新 Task，必须使用其返回值。

### Job

按固定间隔重复执行任务，适合轮询或周期工作。

`TaskSource` 为 `Task | (() => any)`；`ParallelSource` 还可以是上述值的数组。

#### `Job.of(task, interval?)` / `new Job(...)`

创建周期任务；传入的 Task 已经启动时会自动开始

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `task` / `interval` | `TaskSource` / `number` | `0` | `Job` |

#### `Job.start()` / `Job.immediate()`

启动任务循环；已在运行时无效果，取消后可以再次启动

| 返回值 |
| --- |
| `Job` |

#### `Job.pause()` / `Job.resume()`

暂停或恢复任务循环

| 返回值 |
| --- |
| `Job` |

#### `Job.cancel()` / `Job.end()`

取消任务循环：清除间隔定时器和暂停状态，之后不再触发事件

| 返回值 |
| --- |
| `Job` |

#### `Job.restart()`

等价于 `cancel()` 后 `start()`；任意时刻调用都只会有一条循环在运行

| 返回值 |
| --- |
| `Job` |

`Job` 还公开 `original`、`task`（当前一轮的任务）、`interval`、`isStart`，以及继承自 `ATask` 的 `isCancel`、`isPause`。它会发布 `fulfilled`、`rejected` 事件。

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
import { Job } from '@deot/helper-scheduler';

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
	const first = next(() => current.pause());
	current.start();
	output.value.push({ method: 'start → pause', value: await first });
	await wait();
	if (isDisposed) return;
	output.value.push({ method: '暂停后等待一个间隔', tick, isPause: current.isPause });
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

`interval` 是每轮任务完成后再等待的时间，不是固定时钟的触发频率。函数形式的任务在暂停或取消时不会中断已进入的函数，但它的结果不会再触发事件；需要中断请求时请使用 Task 形式并配合 `signal`。

### Parallel

按指定并发数调度一组异步任务。

- 传入数组：按输入顺序取任务，全部结束后 `start()` 返回与输入同序的结果。
- 传入单个函数或 Task：作为常驻任务池反复执行，不会自行结束，直到取消。

#### `Parallel.of(task, concurrency?, options?)` / `new Parallel(...)`

创建并发任务调度器

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `task` / `concurrency` / `options` | `ParallelSource` / `number` / `{ skipError?: boolean }` | `1` / `{ skipError: true }` | `Parallel` |

#### `Parallel.setConcurrency(value)`

设置大于 0 的并发数并返回实际值；运行中会立即补齐队列，暂停期间只记录、恢复时补齐

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` | `number` | `number` |

#### `Parallel.start()` / `Parallel.immediate()`

启动调度。数组任务全部结束时 resolve，值的形状同 `Promise.allSettled`；被取消时以 `CancelError` reject；`skipError: false` 时在首个错误处 reject

| 返回值 |
| --- |
| `Promise<PromiseSettledResult<T>[]>` |

```ts
import { Parallel } from '@deot/helper-scheduler';

const results = await Parallel.of([
	async () => 1,
	async () => { throw new Error('failed'); },
	async () => 3
], 2).start();
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: Error('failed') },
//   { status: 'fulfilled', value: 3 }
// ]
```

#### `Parallel.pause()` / `Parallel.resume()`

暂停或恢复当前任务；`pause()` 会等待在途的函数任务执行结束

| 返回值 |
| --- |
| `Promise<void>` / `Parallel` |

#### `Parallel.cancel()` / `Parallel.end()`

取消当前调度：Task 任务被取消，函数任务无法中断，返回的 Promise 会等待在途的函数执行结束

| 返回值 |
| --- |
| `Promise<void>` |

#### `Parallel.restart()`

取消后从头重新启动，返回新一轮的 `start()` 结果

| 返回值 |
| --- |
| `Promise<PromiseSettledResult<T>[]>` |

#### `Parallel.process()`

按 concurrency 填充执行队列；属于可见的调度实现方法

| 返回值 |
| --- |
| `void` |

`Parallel` 公开 `original`、`task`、`tasks`（在途任务）、`results`、`concurrency`、`options`、`isStart`、`target` 和 `_target` 状态。`target` 是当前 `start()` Promise，`_target` 保存其 resolve/reject；后两者属于实现状态，不建议业务代码修改。

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
import { Parallel, isCancelError } from '@deot/helper-scheduler';

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
	promise.then((results) => {
		status.value = '已完成';
		// 结果与输入同序，形状同 Promise.allSettled
		output.value.push({ startPromise: 'resolve', results: results.map(i => i.status) });
	}, (error) => {
		status.value = isCancelError(error) ? '已取消' : '异常结束';
		output.value.push({ startPromise: 'reject', message: error.message });
	});
};
const setConcurrency = () => {
	const actual = parallel.setConcurrency(Math.max(1, Math.floor(Number(concurrency.value) || 1)));
	output.value.push({ method: 'setConcurrency', value: actual });
};
const pause = () => { parallel.pause(); status.value = '已暂停'; };
const resume = () => { parallel.resume(); status.value = '运行中'; };
const cancel = async () => {
	isControlling.value = true;
	await parallel.cancel();
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

`fulfilled` / `rejected` 事件按实际完成顺序发出，`start()` 的结果则与输入数组同序。`skipError: true` 会发出 `rejected` 后继续；`false` 会使 `start()` reject，已经开始的函数不会因此被自动中止。

暂停会延后结果通知与后续调度，但不能撤销已发出的请求。取消后原来的 `start()` Promise 以 `CancelError` 结束；`await cancel()` 等的是在途函数执行完毕，两者是两回事。

### ATask

`Job` 与 `Parallel` 的事件与中断基类，继承 `Emitter`。

#### `ATask.start()` / `ATask.cancel()` / `ATask.pause()` / `ATask.resume()`

由具体任务类实现的抽象控制方法

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `...args` | `any[]` | `any` |

#### `ATask.setPauseStatus(status)` / `ATask.setCancelStatus(status)`

更新 `isPause`（并创建或解除暂停 Promise）或 `isCancel`

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `status` | `boolean` | `void` |

#### `ATask.suspend(value, target?)`

可选等待 target 后原样返回 value

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `value` / `target` | `any` / `PromiseLike<any>` | `Promise<any>` |

#### `ATask.end()` / `ATask.immediate()`

分别代理 `cancel()` 与 `start()`

| 返回值 |
| --- |
| `any` |

`ATask` 公开 `isCancel`、`isPause` 状态以及 `pauser` Promise；`_pauser` 是解除暂停时使用的实现回调，不建议业务代码直接调用。

## 兼容说明

早期版本把暂停拼成了 `pasue`。现在统一使用 `pause()` / `isPause` / `pauser` / `setPauseStatus()`，旧拼写（`pasue()`、`isPasue`、`pasuer`、`setPasueStatus()`）保留为 deprecated 别名。
