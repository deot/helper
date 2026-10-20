# @deot/helper-utils

通用 JavaScript / TypeScript 工具集合，覆盖函数控制、数据处理、浏览器调度、图片转换和 Promise 辅助。

## 安装

```bash
pnpm add @deot/helper-utils
```

## 使用

```ts
import { debounce, getUid, cloneDeepEasier, sleep } from '@deot/helper-utils';

const onSearch = debounce((keyword: string) => {}, 200);
const id = getUid('item');
const copy = cloneDeepEasier({ id });
await sleep(100);
```

聚合包以 `Utils` 命名空间提供相同函数：

```ts
import { Utils } from '@deot/helper';

Utils.preZero(8); // '08'
```

## API

### 函数与异步控制

#### `debounce(fn, wait?, options?)`

防抖函数；`cancel()` 清理等待，`flush()` 立即执行 trailing 调用

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `fn` / `wait` / `options` | `Function` / `number` / `DebounceOptions` | `0` / 见下表 | `Function & { cancel; flush }` |

调整触发选项后连续调用，观察首沿/尾沿的执行时机；`cancel()` 丢弃等待调用，`flush()` 立即执行待处理的尾沿调用：

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
import { onBeforeUnmount, ref, watch } from 'vue';
import { debounce } from '@deot/helper-utils';

const input = ref('helper');
const wait = ref(400);
const leading = ref(false);
const trailing = ref(true);
const output = ref([]);
let debounced;
let start;

watch([wait, leading, trailing], () => {
	debounced?.cancel();
	output.value = [];
	start = performance.now();
	debounced = debounce((value) => {
		output.value = [...output.value.slice(-7), { value, elapsed: Math.round(performance.now() - start) }];
	}, Math.max(20, Number(wait.value) || 400), { leading: leading.value, trailing: trailing.value });
}, { immediate: true });

const trigger = () => debounced(input.value);
const burst = () => ['A', 'B', 'C'].forEach(value => debounced(value));
onBeforeUnmount(() => debounced.cancel());
</script>

<template>
	<div class="demo">
		<label>输入 <input v-model="input"></label>
		<label>等待毫秒 <input v-model.number="wait" type="number" min="20"></label>
		<div class="controls">
			<label><input v-model="leading" type="checkbox">leading</label><label><input v-model="trailing" type="checkbox">trailing</label>
		</div>
		<div class="controls">
			<button @click="trigger">触发一次</button><button @click="burst">连续触发 A / B / C</button>
			<button @click="debounced.cancel()">cancel</button><button @click="debounced.flush()">flush</button>
		</div>
		<strong>实际执行记录（elapsed：配置后经过的毫秒数）</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label, .demo .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.demo input:not([type="checkbox"]) { width: 160px; max-width: 100%; box-sizing: border-box; }
.demo input[type="checkbox"] { width: auto; padding: 0; }
.demo input, .demo button { padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo button { width: fit-content; cursor: pointer; color: #0f172a; background: #fff; }
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

#### `throttle(fn, wait?, options?)`

基于 debounce 的节流函数

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `fn` / `wait` / `options` | `Function` / `number` / `ThrottleOptions` | `0` / 见下表 | `Function & { cancel; flush }` |

在同一个时间窗口内连续触发，或多次点击按钮；与防抖不同，后续调用不会不断延后窗口结束时间：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { throttle } from '@deot/helper-utils';

const input = ref('helper');
const wait = ref(400);
const leading = ref(true);
const trailing = ref(true);
const output = ref([]);
let throttled;
let start;

watch([wait, leading, trailing], () => {
	throttled?.cancel();
	output.value = [];
	start = performance.now();
	throttled = throttle((value) => {
		output.value = [...output.value.slice(-7), { value, elapsed: Math.round(performance.now() - start) }];
	}, Math.max(20, Number(wait.value) || 400), { leading: leading.value, trailing: trailing.value });
}, { immediate: true });

const trigger = () => throttled(input.value);
const burst = () => ['A', 'B', 'C'].forEach(value => throttled(value));
onBeforeUnmount(() => throttled.cancel());
</script>

<template>
	<div class="demo">
		<label>输入 <input v-model="input"></label>
		<label>等待毫秒 <input v-model.number="wait" type="number" min="20"></label>
		<div class="controls">
			<label><input v-model="leading" type="checkbox">leading</label><label><input v-model="trailing" type="checkbox">trailing</label>
		</div>
		<div class="controls">
			<button @click="trigger">触发一次</button><button @click="burst">连续触发 A / B / C</button>
			<button @click="throttled.cancel()">cancel</button><button @click="throttled.flush()">flush</button>
		</div>
		<strong>实际执行记录（elapsed：配置后经过的毫秒数）</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label, .demo .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.demo input:not([type="checkbox"]) { width: 160px; max-width: 100%; box-sizing: border-box; }
.demo input[type="checkbox"] { width: auto; padding: 0; }
.demo input, .demo button { padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo button { width: fit-content; cursor: pointer; color: #0f172a; background: #fff; }
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

#### `sleep(wait?, immediate?)`

延迟固定或区间内随机毫秒；回调可取得 timer、实际时长与提前完成函数

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `wait` / `immediate` | `number \| { min: number; max: number }` / `(timer, duration, done) => any` | `0` | `Promise<void>` |

```ts
import { sleep } from '@deot/helper-utils';

await sleep(100); // 约 100ms 后继续
await sleep({ min: 100, max: 200 }); // 在区间内随机等待
await sleep(1000, (timer, duration, done) => {
	clearTimeout(timer); // 提前完成时，调用方负责清理原定时器
	done(); // 不再等待 1000ms
});
```

#### `autoCatch(impl, options?)`

执行并等待实现，捕获异常后交给 onError

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `impl` / `options` | `any \| (() => any)` / `{ onError?: (error) => any }` | `onError: console.error` | `Promise<any \| undefined>` |

```ts
import { autoCatch } from '@deot/helper-utils';

const errors: string[] = [];
const options = { onError: (error: Error) => errors.push(error.message) };

await autoCatch(() => 42, options); // 42
await autoCatch(() => { throw new Error('同步错误'); }, options); // undefined
await autoCatch(() => Promise.reject(new Error('异步错误')), options); // undefined
// errors: ['同步错误', '异步错误']
```

不要用返回值是否为 `undefined` 判断成功：实现函数本身也可能成功返回 `undefined`。如果需要区分失败，请在 `onError` 中记录状态。

#### `toPromise(target, promise)`

为无 then/catch/finally 的对象附加对应方法

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `target` / `promise` | `object` / `Promise<T>` | `target & PromiseLike<T>` |

```ts
import { toPromise } from '@deot/helper-utils';

const target = toPromise({ id: 'job-1' }, Promise.resolve(42));
target.id; // 'job-1'
await target; // 42；同一对象同时保留业务属性与 then/catch/finally
```

`target` 如果已经具有 `then`、`catch` 或 `finally`，会抛出错误；该方法不是任意对象的通用 Promise 转换器。

#### `rAF(callback)`

请求动画帧；缺失时使用约 16ms 定时器

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `callback` | `FrameRequestCallback` | `number` |

#### `raf(callback)`

`rAF()` 的兼容别名，已弃用；新代码使用 `rAF()`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `callback` | `FrameRequestCallback` | `number` |

#### `cAF(id)`

取消动画帧或回退定时器

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `id` | `number` | `void` |

#### `caf(id)`

`cAF()` 的兼容别名，已弃用；新代码使用 `cAF()`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `id` | `number` | `void` |

#### `rIC(callback, options?)`

请求空闲回调；缺失时使用定时器回退

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `callback` / `options` | `IdleRequestCallback` / `IdleRequestOptions` | `any` |

#### `ric(...)`

`rIC()` 的兼容别名，已弃用；新代码使用 `rIC()`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `callback` / `options` | `IdleRequestCallback` / `IdleRequestOptions` | `any` |

#### `cIC(id)`

取消空闲回调或回退定时器

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `id` | `number` | `void` |

#### `cic(id)`

`cIC()` 的兼容别名，已弃用；新代码使用 `cIC()`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `id` | `number` | `void` |

#### `DebounceOptions`

`debounce()` 的配置结构。`DebounceOptions` 是文档名称，不是可单独导入的类型。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `leading` | `boolean` | `false` | 是否在等待开始时执行 |
| `trailing` | `boolean` | `true` | 是否在等待结束时执行 |
| `throttle` | `boolean` | `false` | 内部节流模式开关 |

#### `ThrottleOptions`

`throttle()` 的配置结构。`ThrottleOptions` 是文档名称，不是可单独导入的类型。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `leading` | `boolean` | `true` | 是否在时间窗开始时执行 |
| `trailing` | `boolean` | `true` | 是否在时间窗结束时执行 |

### 数据、对象与字符串

#### `asterisk(value, from?, length?)`

将指定区间替换为 `*`

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `value` / `from` / `length` | `string` / `number` / `number` | `3` / `4` | `string` |

修改文本与遮罩范围，查看脱敏结果：

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
import { computed, ref } from 'vue';
import { asterisk } from '@deot/helper-utils';

const text = ref('13812345678');
const from = ref(3);
const length = ref(4);
// Template 中直接使用。

const output = computed(() => asterisk(text.value, Number(from.value), Number(length.value)));
</script>

<template>
	<div class="demo">
		<label>文本输入 <input v-model="text"></label>
		<label>起始位置 <input v-model="from" type="number"></label>
		<label>遮罩长度 <input v-model="length" type="number"></label>
		<strong>输出</strong>
		<pre>{{ output }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: grid; gap: 6px; }
.demo input, .demo pre { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo input { width: 100%; max-width: 480px; box-sizing: border-box; }
.demo pre { margin: 0; background: #f8fafc; }
</style>
```
:::

#### `cloneDeepEasier(source)`

通过 JSON 序列化进行简易深拷贝

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `source` | `object` | `any` |

修改源对象后执行深拷贝，查看引用关系和结果：

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
import { cloneDeepEasier } from '@deot/helper-utils';

const output = ref({ status: '点击运行' });

const run = () => {
	const source = { user: { name: 'deot' }, items: [1, 2] };
	const clone = cloneDeepEasier(source);
	clone.user.name = 'helper';
	output.value = {
		source,
		clone,
		sameReference: clone === source,
		nestedSameReference: clone.user === source.user
	};
};
</script>

<template>
	<div class="demo">
		<button @click="run">执行深拷贝</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `def(target, key, value?, options?)`

定义属性并返回原对象

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `target` / `key` / `value` / `options` | `T` / `PropertyKey` / `any` / `PropertyDescriptor` | 非枚举、可写、可配置 | `T` |

#### `flatten(value, parser?, exit?)`

重复转换直到稳定、异常或命中退出条件，最多 1000 次

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `value` / `parser` / `exit` | `any` / `(value) => any` / `(value) => boolean` | `decodeURIComponent` | `any` |

```ts
import { flatten } from '@deot/helper-utils';

flatten('%2526'); // '&'，连续解码两层
flatten('%E0%A4%A'); // '%E0%A4%A'，解码异常时保留最后的值
flatten('%2526', decodeURIComponent, value => value === '%26'); // '%26'，主动停止
```

#### `flattenJSONParse(value)`

递归 JSON 解析，并保护超长整数和整段科学计数字符串

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `string \| null` | `any` |

```ts
import { flattenJSONParse } from '@deot/helper-utils';

flattenJSONParse('false'); // false
flattenJSONParse('0'); // 0
flattenJSONParse('{"name":"Deot"}'); // { name: 'Deot' }
flattenJSONParse('9007199254740992'); // '9007199254740992'，保护超出安全范围的正整数字符串
flattenJSONParse('1E1'); // '1E1'，保留整段科学计数字符串
flattenJSONParse('not-json'); // 'not-json'，无法解析时原样返回
```

它不是严格 JSON 校验器；数字保护也不覆盖任意格式的大数，业务金额等精度敏感数据应显式保留字符串。

#### `generateString(size?, alphabet?)`

从字符集随机生成字符串

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `size` / `alphabet` | `number` / `string` | `16` / 字母、数字、`-_` | `string` |

#### `getPropByPath(target, path)`

解析点号或方括号路径，返回所属对象、键和值

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `target` / `path` | `object` / `string` | `{ o: object; k: PropertyKey; v: any }` |

```ts
import { getPropByPath } from '@deot/helper-utils';

const source = { users: [{ name: 'Deot' }] };
const { o, k, v } = getPropByPath(source, 'users[0].name');
// o === source.users[0]；k === 'name'；v === 'Deot'
getPropByPath(source, 'users[0].missing').v; // undefined，末级属性可以不存在
// getPropByPath(source, 'missing.name'); // 抛出 Error('无效路径!')，中间路径必须存在
```

#### `getUid(prefix?)`

生成进程内递增的时间戳 ID

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `prefix` | `string` | `string` |

#### `hasOwn(target, key)`

安全判断自有属性

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `target` / `key` | `object` / `PropertyKey` | `boolean` |

#### `numberToUnit(number, decimalDigit?)`

转换为万、亿等中文数量单位

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `number` / `decimalDigit` | `number` / `number` | `2` | `number \| string` |

输入数值和小数位数，查看中文数量单位：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { computed, ref } from 'vue';
import { numberToUnit } from '@deot/helper-utils';

const value = ref(123456789);
const digits = ref(2);
// Template 中直接使用。

const output = computed(() => numberToUnit(Number(value.value), Number(digits.value)));
</script>
<template>
	<div class="demo">
		<label>数值 <input v-model="value" type="number"></label>
		<label>小数位 <input v-model="digits" type="number"></label>
		<strong>输出：{{ output }}</strong>
	</div>
</template>
<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; grid-template-columns: 64px minmax(0, 180px); align-items: center; gap: 8px; }
input { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
</style>
```
:::

#### `preZero(number)`

小于 10 的数字补前导零

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `number` | `number` | `string` |

输入数字，查看补零结果：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { computed, ref } from 'vue';
import { preZero } from '@deot/helper-utils';

const value = ref(8);
// Template 中直接使用。

const output = computed(() => preZero(Number(value.value)));
</script>
<template>
	<div class="demo"><label>数字 <input v-model="value" type="number"></label><strong>输出：{{ output }}</strong></div>
</template>
<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; grid-template-columns: 64px minmax(0, 180px); align-items: center; gap: 8px; }
input { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
</style>
```
:::

#### `range(min, max)`

生成闭区间 `[min, max]` 内随机整数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `min` / `max` | `number` / `number` | `number` |

#### `probs(weights)`

按正权重随机返回数组下标；无有效权重时抛错

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `weights` | `number[]` | `number` |

### 图片与文件

#### `canvasToImage(canvas, filename?)`

导出 PNG Data URL；传 filename 时同时生成 File

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `canvas` / `filename` | `HTMLCanvasElement` / `string` | `Promise<{ dataURL: string; file?: File }>` |

生成一张本地 Canvas 图片，再依次转换为 Data URL、File 并执行压缩：

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
import { canvasToImage, compressImage, dataURLToFile } from '@deot/helper-utils';

const canvas = ref(null);
const output = ref({ status: '点击运行' });

const run = async () => {
	const context = canvas.value.getContext('2d');
	context.fillStyle = '#2563eb';
	context.fillRect(0, 0, 120, 60);
	context.fillStyle = '#ffffff';
	context.fillText('@deot/helper', 18, 34);
	const image = await canvasToImage(canvas.value, 'helper.png');
	const file = dataURLToFile(image.dataURL, 'helper.png');
	const compressed = await compressImage(file, { width: 60, height: 30, filetype: 'image/jpeg', encoderOptions: 0.8 });
	output.value = {
		canvasToImage: { prefix: image.dataURL.slice(0, 22), file: image.file?.name },
		dataURLToFile: { name: file.name, type: file.type, size: file.size },
		compressImage: { type: compressed.file.type, size: compressed.file.size, prefix: compressed.dataURL.slice(0, 23) }
	};
};
</script>

<template>
	<div class="demo">
		<canvas ref="canvas" width="120" height="60"></canvas>
		<button @click="run">生成并压缩</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
canvas { border-radius: 8px; background: #f8fafc; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `compressImage(file, options?)`

等比缩放到最大尺寸并通过 Canvas 编码

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `file` / `options` | `File` / `CompressImageOptions` | 见下表 | `Promise<{ dataURL: string; file: File }>` |

#### `dataURLToFile(dataURL, filename?, filetype?)`

将完整或纯 Base64 Data URL 转为 File

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `dataURL` / `filename` / `filetype` | `string` / `string` / `string` | `'__filename'` / 从文件名推断或 `image/jpeg` | `File` |

#### `CompressImageOptions`

CompressImageOptions 的配置字段。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `width` | `number` | 原图宽度 | 最大宽度 |
| `height` | `number` | 原图高度 | 最大高度 |
| `filetype` | `string` | `'image/jpeg'` | Canvas 输出 MIME 类型 |
| `encoderOptions` | `any` | 浏览器默认值 | JPEG/WebP 编码质量，通常为 `0` 到 `1` |

### 调度类型

#### `RAF` / `CAF`

动画帧请求与取消函数的公开 TypeScript 类型。

| 类型 | 完整签名 |
| --- | --- |
| `RAF` | `(callback: FrameRequestCallback) => number` |
| `CAF` | `(rafId: number) => void` |

#### `RIC` / `CIC`

空闲回调请求与取消函数的公开 TypeScript 类型。

| 类型 | 完整签名 |
| --- | --- |
| `RIC` | `(handler: IdleRequestCallback, options?: IdleRequestOptions) => any` |
| `CIC` | `(id: number) => void` |

## 注意事项

- Canvas、File、requestAnimationFrame 等 API 需要浏览器环境；RAF/RIC 调度函数提供定时器回退。
- `cloneDeepEasier` 只适合可 JSON 序列化的数据，不保留函数、原型、循环引用或特殊对象。
- `range` 和 `probs` 基于 `Math.random()`，不适用于密码学用途。
