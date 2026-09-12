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

输入值和 `typeof` 类型名，查看 `type()` 的判断结果：

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
import { type } from '@deot/helper-is';

const input = ref('helper');
const typeName = ref('string');
// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => type(input.value, typeName.value));
</script>

<template>
	<div class="demo">
		<label>值 <input v-model="input"></label>
		<label>类型名 <input v-model="typeName"></label>
		<strong>输出</strong>
		<pre>{{ output }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: grid; gap: 6px; }
.demo input, .demo pre { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo input { width: 100%; max-width: 320px; box-sizing: border-box; }
.demo pre { margin: 0; background: #f8fafc; }
</style>
```
:::

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
