# @deot/helper-is

轻量类型与实例判断函数。每个判断器独立导出，适合按需引入。

## 安装

```bash
pnpm add @deot/helper-is
```

## 使用

```ts
import { array, number, plainObject, nil } from '@deot/helper-is';

array([]); // true
number(NaN); // true，按 typeof 判断
plainObject({}); // true
nil(null); // true
```

聚合包以 `Is` 命名空间提供相同函数：

```ts
import { Is } from '@deot/helper';

Is.string('value');
```

## API

#### `type(value, typeName?)`

`typeof value === typeName`；省略类型名返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value`、`typeName` | `any`、`string` | `boolean` |

选择真实的 JavaScript 值和 `typeof` 类型名，对照 `type()` 与常用判断函数的结果：

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
import { array, arrayBuffer, arrayBufferView, date, nil, number, object, plainObject, string, type, typedArray, undef } from '@deot/helper-is';

const values = [
	{ label: '\'helper\'', value: 'helper' },
	{ label: '123', value: 123 },
	{ label: 'false', value: false },
	{ label: 'null', value: null },
	{ label: 'undefined', value: undefined },
	{ label: 'NaN', value: NaN },
	{ label: '[1, 2]', value: [1, 2] },
	{ label: '{ a: 1 }', value: { a: 1 } },
	{ label: 'new String(\'helper\')', value: new String('helper') },
	{ label: 'new Date()', value: new Date() },
	{ label: 'new ArrayBuffer(4)', value: new ArrayBuffer(4) },
	{ label: 'new DataView(new ArrayBuffer(4))', value: new DataView(new ArrayBuffer(4)) },
	{ label: 'new Uint8Array([1, 2])', value: new Uint8Array([1, 2]) }
];
const selected = ref(0);
const typeName = ref('string');
const tests = { nil, undef, string, number, array, object, plainObject, date, arrayBuffer, arrayBufferView, typedArray };
const output = computed(() => {
	const { label, value } = values[selected.value];
	return {
		input: label,
		typeof: typeof value,
		type: type(value, typeName.value),
		...Object.fromEntries(Object.entries(tests).map(([name, test]) => [name, test(value)]))
	};
});
</script>

<template>
	<div class="demo">
		<label>输入值 <select v-model="selected">
			<option v-for="(item, index) in values" :key="index" :value="index">{{ item.label }}</option>
		</select></label>
		<label>类型名 <select v-model="typeName">
			<option v-for="name in ['string', 'number', 'boolean', 'object', 'undefined', 'function', '']" :key="name" :value="name">
				{{ name || '不传类型名' }}
			</option>
		</select></label>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.demo select { max-width: 100%; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo pre { margin: 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 8px; color: #0f172a; background: #f8fafc; }
</style>
```
:::

`typeof null` 是 `'object'`，但 `object(null)` 为 `false`；`number(NaN)` 为 `true`，不能用它代替有限数值校验。`DataView` 是 ArrayBuffer view，但不是 typed array。

#### `instance(value, constructor)`

`instanceof`；字符串从全局对象读取构造器

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value`、`constructor` | `any`、`Function \| string` | `boolean` |

#### `nil(value)`

仅当值严格等于 `null` 时返回 `true`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `undef(value)`

使用 `typeof` 判断值是否为 `undefined`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `string(value)`

判断值是否为原始 `string` 类型，不包含 `new String()` 包装对象

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `fn(value)`

判断值是否为函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `number(value)`

判断值是否为原始 `number` 类型；`NaN` 也属于 number

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `bool(value)`

仅接受原始布尔值 `true` 或 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `array(value)`

使用 `Array.isArray()` 判断数组

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `object(value)`

判断非 `null` 且 `typeof` 为 object 的值；数组也会返回 `true`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `plainObject(value)`

判断普通对象，并排除带自定义 `Symbol.toStringTag` 或迭代器的对象

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `arrayBuffer(value)`

判断 `ArrayBuffer` 实例

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `arrayBufferView(value)`

使用 `ArrayBuffer.isView()` 判断 DataView 或 TypedArray；旧环境回退检查 `.buffer`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `typedArray(value)`

判断任一种 TypedArray，不包含 `DataView`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `buffer(value)`

通过构造器的 `isBuffer()` 判断 Node.js Buffer

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `date(value)`

判断 `Date` 实例

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `regexp(value)`

判断 `RegExp` 实例

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `blob(value)`

判断浏览器 `Blob` 实例；无全局构造器的环境安全返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `file(value)`

判断浏览器 `File` 实例；无全局构造器的环境安全返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `files(value)`

判断浏览器 `FileList` 实例；无全局构造器的环境安全返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `params(value)`

判断 `URLSearchParams` 实例；无全局构造器的环境安全返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `formEl(value)`

判断 `HTMLFormElement` 实例；无全局构造器的环境安全返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `formData(value)`

判断 `FormData` 实例；无全局构造器的环境安全返回 `false`

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |

#### `stream(value)`

非空对象且具有 `pipe` 函数

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `value` | `any` | `boolean` |
