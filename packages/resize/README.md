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

#### `Resize.on(element, listener)`

静态注册监听并返回解绑函数

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element`、`listener` | `HTMLElement`、`() => any` | `() => void` |

#### `Resize.off(element, listener?)`

删除指定监听；省略 listener 时删除全部

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element`、`listener` | `HTMLElement`、`() => any` | `void` |

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

当前元素的监听函数；同一元素创建的实例会复用该数组

| 类型 | 类型 |
| --- | --- |
| `Function[]` | `[]` |

#### `Resize.ro`

首次监听后创建的 observer

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
