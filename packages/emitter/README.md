# @deot/helper-emitter

轻量发布订阅器，支持具名事件、一次性订阅和监听所有事件的 listener。

## 安装

```bash
pnpm add @deot/helper-emitter
```

## 使用

```ts
import { Emitter } from '@deot/helper-emitter';

const source = Emitter.of({ name: 'context' });

source.on('change', function (value) {
	return `${this.name}: ${value}`;
});

source.on((event, value) => {
	return `${event}: ${value}`;
});

source.emit('change', 1);
source.off('change');
source.off(); // 清空全局 listeners
```

也可以从 `@deot/helper` 直接导入 `Emitter`。

## API

### Emitter

轻量发布订阅类，支持命名事件、全局监听、一次性订阅和批量解绑。

#### `new Emitter(context?)`

创建实例，回调中的 `this` 指向 context

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `context` | `any` | `null` | `Emitter` |

#### `Emitter.of(context?)`

工厂方法，等价于构造函数

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `context` | `any` | `null` | `Emitter` |

#### `Emitter.on(event, callback)`

订阅具名事件

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `event`、`callback` | `string`、`Function` | `this` |

#### `Emitter.on(events)`

批量订阅事件对象

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `events` | `Record<string, Function>` | `this` |

#### `Emitter.on(listener)`

监听所有发布事件

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `listener` | `(event, ...args) => any` | `this` |

#### `Emitter.once(event, callback)`

注册一次性订阅

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `event`、`callback` | `string`、`Function` | `this` |

#### `Emitter.off(event?, callback?)`

删除回调、整个事件；不传参数时清空全局 listeners

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `event`、`callback` | `string`、`Function` | `this` |

#### `Emitter.emit(event?, ...args)`

发布事件；任一回调返回 `false` 时停止当前组后续执行

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `event`、`args` | `any`、`any[]` | `this` |

#### `Emitter.events`

具名事件及其回调数组

| 类型 | 默认值 |
| --- | --- |
| `Record<string, Function[]>` | `{}` |

#### `Emitter.listeners`

通过 `on(listener)` 注册的全局监听器

| 类型 | 默认值 |
| --- | --- |
| `Function[]` | `[]` |

#### `Emitter.context`

普通函数回调执行时使用的 `this`

| 类型 | 默认值 |
| --- | --- |
| `any` | `null` |

实例方法均返回当前实例，便于连续注册。回调返回 `false` 时，同一组中后续回调停止执行；普通 `function` 回调的 `this` 为构造时传入的 context。

每次运行都会依次调用工厂创建、三种 `on`、`once`、`emit` 和两种 `off`：

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
import { Emitter } from '@deot/helper-emitter';

const output = ref([]);

const run = () => {
	const logs = [];
	const emitter = Emitter.of({ name: 'demo' });
	const named = function (value) { logs.push(`on: ${this.name}/${value}`); };

	emitter.on('change', named);
	emitter.on({ ready: value => logs.push(`object on: ${value}`) });
	emitter.on((event, value) => logs.push(`listener: ${event}/${value}`));
	emitter.once('change', value => logs.push(`once: ${value}`));
	emitter.emit('ready', 0).emit('change', 1).emit('change', 2);
	emitter.off('change', named).off('ready').off();
	emitter.emit('change', 3);
	output.value = logs;
};
</script>

<template>
	<div class="demo">
		<button @click="run">运行事件序列</button>
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
