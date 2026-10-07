# @deot/helper-resize

基于原生 `ResizeObserver` 监听元素尺寸变化，并在同一元素的多个实例之间复用 observer 和 listeners。

## 安装

```bash
pnpm add @deot/helper-resize
```

## 使用

```ts
import { Resize } from '@deot/helper-resize';

const off = Resize.of(element).on(() => {
	return element.offsetWidth;
});

off();
```

也可以使用静态快捷方法或从聚合包导入：

```ts
import { Resize } from '@deot/helper';

const listener = () => {};
Resize.on(element, listener);
Resize.off(element, listener);
```

### 共用模式

默认每个元素一个 `ResizeObserver`：同时有 N 个元素变化，浏览器就回调 N 次，并且在每次回调之间清空微任务。传入 `{ shared: true }` 后，这些元素共用同一个 `ResizeObserver`，它们的变化由一次回调带回：

```ts
import { Resize } from '@deot/helper-resize';

const listener = (entries) => {
	entries.forEach(({ target }) => {
		// target 为尺寸变化的元素
	});
};
elements.forEach(element => Resize.on(element, listener, { shared: true }));
elements.forEach(element => Resize.off(element, listener, { shared: true }));
```

- 适合同时监听一批元素（如列表的行、某个节点的各层祖先）：增减元素不再新建 observer，调用方按微任务合并的处理也只触发一次。
- 同一个监听函数在一次回调里只执行一次，即使它注册在多个元素上；收到的 `ResizeObserverEntry[]` 只包含它自己监听的元素。默认模式下监听函数不带参数。
- 一帧内可能不止一次回调：监听函数（或随后的微任务）又改变了更深层被监听元素的尺寸时，浏览器会在同一帧内再回调一轮。
- 只能通过静态方法使用；实例方法 `Resize.of(element).on()` 始终是默认模式。
- 与默认模式各自登记、互不影响：`off` 时必须传入相同的 `options`，否则删的是另一种模式下的监听（没有则忽略，不会报错）。
- 同一个监听函数在同一个元素上重复注册只算一次。
- 派发过程中被 `off` 的监听函数不再执行。
- 某个监听函数抛错不影响同一次回调里的其它监听函数，全部执行完后抛出第一个错误。

## API

### Resize

以元素为单位管理 `ResizeObserver`，实例方法与静态方法共享监听状态。

#### `new Resize(element)`

创建实例；复用元素上已有监听状态

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element` | `HTMLElement` | `Resize` |

#### `Resize.of(element)`

创建实例的工厂方法

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element` | `HTMLElement` | `Resize` |

#### `Resize.on(element, listener, options?)`

静态注册监听并返回解绑函数；共用模式下元素首次注册时开始观察

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element`、`listener`、`options` | `HTMLElement`、`(entries?) => any`、`{ shared?: boolean }` | `() => void` |

#### `Resize.off(element, listener?, options?)`

删除指定监听；省略 listener 时删除全部（仅限 `options` 对应的模式）。共用模式下元素上没有监听后停止观察

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element`、`listener`、`options` | `HTMLElement`、`(entries?) => any`、`{ shared?: boolean }` | `void` |

#### `options`

静态 `on` / `off` 的可选参数

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `shared` | 是否使用[共用模式](#共用模式) | `boolean` | `false` |

#### `Resize.on(listener)`

注册实例监听；首次注册时创建 ResizeObserver

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `listener` | `() => any` | `() => void` |

#### `Resize.off(listener?)`

删除指定或全部监听；清空后断开 observer

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `listener` | `() => any` | `void` |

#### `Resize.handleResize(entries)`

observer 回调；仅在 entries 包含当前元素时通知 listeners

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `entries` | `ResizeObserverEntry[]` | `void` |

#### `Resize.el`

当前监听元素

| 类型 |
| --- |
| `HTMLElement` |

#### `Resize.listeners`

当前元素在默认模式下的监听函数；同一元素创建的实例会复用该数组

| 类型 | 类型 |
| --- | --- |
| `Function[]` | `[]` |

#### `Resize.ro`

默认模式下首次监听后创建的 observer

| 类型 | 类型 |
| --- | --- |
| `ResizeObserver \| null` | `null` |

回调仅在 observer entries 包含目标元素时执行。环境没有 `ResizeObserver` 时，`on()` 返回空解绑函数，不会抛错。

切换目标宽度，观察实例方法和静态方法共享同一元素监听状态：

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
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Resize } from '@deot/helper-resize';

const box = ref(null);
const width = ref(180);
const output = ref({ instanceCount: 0, staticCount: 0, width: 180 });
let offInstance = () => {};
let staticListener = () => {};

const toggle = async () => {
	width.value = width.value === 180 ? 300 : 180;
	await nextTick();
};

onMounted(() => {
	const instance = Resize.of(box.value);
	offInstance = instance.on(() => {
		output.value = { ...output.value, instanceCount: output.value.instanceCount + 1, width: box.value.offsetWidth };
	});
	staticListener = () => {
		output.value = { ...output.value, staticCount: output.value.staticCount + 1, width: box.value.offsetWidth };
	};
	Resize.on(box.value, staticListener);
});

onBeforeUnmount(() => {
	offInstance();
	Resize.off(box.value, staticListener);
});
</script>

<template>
	<div class="demo">
		<button @click="toggle">切换宽度</button>
		<div ref="box" class="box" :style="{ width: `${width}px` }">{{ width }}px</div>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
.box {
	max-width: 100%;
	padding: 18px;
	color: #1d4ed8;
	background: #dbeafe;
	border-radius: 8px;
	box-sizing: border-box;
	transition: width 180ms ease;
}
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::
