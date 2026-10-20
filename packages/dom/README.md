# @deot/helper-dom

无链式封装的 DOM 工具集合，使用具名导出以支持 tree-shaking。该包主要运行在浏览器环境。

## 安装

```bash
pnpm add @deot/helper-dom
```

## 使用

```ts
import { el, on, addClass, setStyle } from '@deot/helper-dom';

const button = el('#submit');
addClass(button, 'is-ready');
setStyle(button, { opacity: '1', cursor: 'pointer' });

const off = on(button, 'click', () => {});
off();
```

聚合包以 `$` 命名空间提供相同函数：

```ts
import { $ } from '@deot/helper';

const target = $.el('#app');
```

## API

#### `el(value)`

返回传入元素或查询选择器；浏览器内找不到时抛出错误，SSR 返回 `null`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `string \| HTMLElement` | `HTMLElement \| null` |

输入 CSS 选择器，查看 `el()` 返回的元素信息和错误：

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
import { el } from '@deot/helper-dom';

const selector = ref('#dom-playground-target');
const output = ref({ status: '点击查询' });

const inspect = () => {
	try {
		const node = el(selector.value);
		output.value = { found: Boolean(node), tagName: node?.tagName, id: node?.id };
	} catch (error) {
		output.value = { found: false, error: String(error) };
	}
};
</script>

<template>
	<div class="demo">
		<label>选择器 <input v-model="selector"></label>
		<button @click="inspect">查询元素</button>
		<div id="dom-playground-target">查询目标</div>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; grid-template-columns: 64px minmax(0, 260px); align-items: center; gap: 8px; }
input, button, #dom-playground-target { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
button { width: fit-content; cursor: pointer; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `on(el, event, handler, options?)`

注册事件并返回解绑函数

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `el` / `event` / `handler` / `options` | `HTMLElement` / `string` / `(...args: any[]) => any` / `boolean \| AddEventListenerOptions` | `false` | `() => void` |

#### `off(el, event, handler, options?)`

解绑事件

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| 同 `on` | 同 `on` | `false` | `void` |

#### `once(el, event, handler, options?)`

注册执行一次后自动解绑的事件，并返回手动解绑函数

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| 同 `on` | 同 `on` | `false` | `() => void` |

#### `composedPath(event)`

获取事件传播路径，并兼容 `composedPath()` 返回空数组的环境

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `event` | `Event` | `EventTarget[]` |

#### `addClass(el, className?)`

添加一个或多个空格分隔的 class

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `className` | `HTMLElement` / `string` | `void` |

#### `removeClass(el, className?)`

删除一个或多个空格分隔的 class

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `className` | `HTMLElement` / `string` | `void` |

#### `hasClass(el, className?)`

判断单个 class；className 含空格时抛出错误

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `className` | `HTMLElement` / `string` | `boolean` |

#### `getStyle(el, name?)`

读取行内样式或计算样式；`float` 会映射为 `cssFloat`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `name` | `HTMLElement` / `string` | `string` |

#### `setStyle(el, name, value?)`

设置单个样式

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `name` / `value` | `HTMLElement` / `string` / `any` | `void` |

#### `setStyle(el, styles)`

批量设置样式对象

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `styles` | `HTMLElement` / `Record<string, any>` | `void` |

#### `prefixStyle(name)`

返回当前环境的 camelCase 和 kebab-case 前缀属性名

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `name` | `string` | `{ camel: string; kebab: string }` |

#### `isScroller(el?, options?)`

按 overflow、方向或 class 正则判断滚动容器

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `options` | `HTMLElement` / `ScrollerOptions` | `boolean` |

#### `getScroller(el?, options?)`

向上查找最近的滚动容器

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `el` / `options` | `HTMLElement` / `ScrollerOptions` | `HTMLElement \| Window \| null` |

#### `contains(container?, child?)`

按可视矩形判断 child 是否与容器相交

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `container` / `child` | `HTMLElement \| Window \| Document` / `HTMLElement` | viewport / — | `boolean` |

#### `scrollIntoView(el, options?)`

使用 requestAnimationFrame 从 `from` 动画滚动到 `to`。同一元素上的新调用会取消未完成的旧动画；取消后（含 `signal` 中止）Promise 立即 resolve

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `el` / `options` | `HTMLElement \| Window` / `ScrollOptions` | 见下表 | `Promise<any>` |

点击滚动后可主动中止，或再次点击另一方向替换旧动画；输出记录每次调用的完成原因和实际位置：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { scrollIntoView } from '@deot/helper-dom';

const scroller = ref(null);
const target = ref(400);
const isRunning = ref(false);
const output = ref([]);
let current;
let sequence = 0;

const run = (to) => {
	if (current && isRunning.value) current.reason = '被新调用替换';
	const call = { id: ++sequence, controller: new AbortController(), reason: '完成' };
	current = call;
	isRunning.value = true;
	const node = scroller.value;
	const from = node.scrollTop;
	output.value = [...output.value.slice(-5), `#${call.id} 开始：${from} → ${to}`];
	scrollIntoView(node, { from, to, duration: 1200, signal: call.controller.signal }).then(() => {
		output.value = [...output.value.slice(-5), `#${call.id} ${call.reason}：Promise resolve，当前位置 ${node.scrollTop}`];
		if (current === call) isRunning.value = false;
	});
};

const abort = () => {
	if (!isRunning.value) return;
	current.reason = '主动中止';
	current.controller.abort();
};

onBeforeUnmount(() => current?.controller.abort());
</script>

<template>
	<div class="demo">
		<label>目标位置 <input v-model.number="target" type="number" min="0" max="540"></label>
		<div class="controls">
			<button @click="run(Math.min(540, Math.max(0, Number(target) || 0)))">滚动到目标</button>
			<button @click="run(0)">滚动回顶部</button>
			<button :disabled="!isRunning" @click="abort">中止</button>
		</div>
		<div ref="scroller" class="scroller"><div class="content">起点<div>终点</div></div></div>
		<pre>{{ output.join('\n') || '等待操作' }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label, .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
input, button { padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
input { width: 100px; }
button { cursor: pointer; background: #fff; }
button:disabled { opacity: .5; cursor: default; }
.scroller { height: 160px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 8px; }
.content {
	display: flex; height: 700px; padding: 12px; flex-direction: column; justify-content: space-between;
	box-sizing: border-box; color: #166534; background: #f0fdf4;
}
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

`from` 默认是 `0`，不是当前滚动位置；需要接续动画时请传入元素当前的 `scrollTop`。`signal` 已中止时不会开始滚动。取消只停止后续动画帧，不会自动回到起点，也不会抛出 `AbortError`。

#### `ScrollerOptions`

ScrollerOptions 的配置字段。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | `'x' \| 'y'` | 自动读取 `overflow` | 指定检查的滚动方向 |
| `className` | `RegExp` | — | 额外用于识别滚动容器的 class 正则 |

#### `ScrollOptions`

`scrollIntoView()` 的配置结构。`ScrollOptions` 是文档中的结构名称，并非包的独立导出；`ScrollerOptions` 则是可通过 `import type` 导入的公开类型。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `from` | `number` | `0` | 起始滚动位置 |
| `to` | `number` | `0` | 目标滚动位置 |
| `duration` | `number` | `300` | 动画时长，单位毫秒 |
| `signal` | `AbortSignal` | — | 中止时停止动画，已中止则不滚动 |

## 服务端渲染

模块可在无 DOM 环境中被导入。依赖浏览器的写操作会跳过，查询函数返回 `null`、`false` 或空结果；实际 DOM 操作仍应放在客户端生命周期中。
