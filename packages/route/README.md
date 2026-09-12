# @deot/helper-route

处理 URL origin、path 和 query 的小型工具集，不依赖浏览器原生 `URL` 或 `URLSearchParams` 实例。

## 安装

```bash
pnpm add @deot/helper-route
```

## 使用

```ts
import { merge, parse, get } from '@deot/helper-route';

const url = merge({
	origin: 'https://example.com',
	path: ['users', '1'],
	query: { tab: 'profile', enabled: false }
});

parse(url);
get('tab', url);
```

聚合包以 `Route` 命名空间提供相同函数。

## API

#### `merge(route)`

合并 origin、path 和 query

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `route` | `Route` | `string` |

修改路径和查询值，查看合并后的 URL：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { computed, ref } from 'vue';
import { merge } from '@deot/helper-route';

const path = ref('/users/1');
const query = ref('helper');
// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => merge({
	origin: 'https://example.com',
	path: path.value,
	query: { q: query.value, enabled: false, page: 1 }
}));
</script>

<template>
	<div class="demo">
		<label>路径 <input v-model="path"></label>
		<label>查询值 <input v-model="query"></label>
		<strong>输出</strong><code>{{ output }}</code>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; grid-template-columns: 64px minmax(0, 280px); align-items: center; gap: 8px; }
input, code { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
code { overflow-wrap: anywhere; background: #f8fafc; }
</style>
```
:::

#### `parse(url?, options?)`

解析完整 URL 或相对地址

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `url`、`options` | `string \| ParseOptions`、`ParseOptions` | 当前页面路径与查询串 | `{ origin: string; path: string; query: Record<string, any> }` |

编辑 URL，实时查看结构化解析结果：

:::playground
<!--
<config lang="json5">
{ views: ['runtime', 'files'] }
</config>
-->
```vue
<script setup>
import { computed, ref } from 'vue';
import { parse } from '@deot/helper-route';

const input = ref('https://example.com/users/1?q=helper&page=2');
// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => parse(input.value));
</script>

<template>
	<div class="demo">
		<label>URL 输入 <input v-model="input"></label>
		<strong>输出</strong><pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; gap: 6px; }
input, pre { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
input { width: 100%; max-width: 480px; box-sizing: border-box; }
pre { margin: 0; background: #f8fafc; }
</style>
```
:::

#### `get(key, url?, options?)`

读取单个查询参数

| 参数 | 类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `key`、`url`、`options` | `string`、`string \| GetOptions`、`GetOptions` | 当前 `location.search` | `any \| null` |

编辑 URL 和参数名，实时查看单个查询参数：

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
import { get } from '@deot/helper-route';

const input = ref('https://example.com/users/1?q=helper&page=2');
const key = ref('q');
// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => get(key.value, input.value));
</script>

<template>
	<div class="demo">
		<label>URL 输入 <input v-model="input"></label>
		<label>参数名 <input v-model="key"></label>
		<strong>输出</strong>
		<pre>{{ output }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: grid; gap: 6px; }
.demo input, .demo pre { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo input { width: 100%; max-width: 480px; box-sizing: border-box; }
.demo pre { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; background: #f8fafc; }
</style>
```
:::

#### `Route`

描述 `merge()` 接收的 URL 组成部分。`Route` 是文档中的结构名称，并非可单独导入的类型。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `origin` | `string` | `''` | 协议与域名部分 |
| `path` | `string \| string[]` | `''` | 路径字符串或路径片段数组 |
| `query` | `Record<string, any>` | — | 查询参数；忽略 `null`、`undefined`、空字符串，保留 `false`、`0` |

#### `ParseOptions` / `GetOptions`

控制 `parse()` 和 `get()` 的输入与查询值转换方式。这两个名称用于文档表达，源码中的接口未从包入口导出。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 当前页面 URL | 待解析的 URL 或查询串 |
| `parse` | `boolean \| ((value: string) => any)` | `flattenJSONParse` | 函数时转换参数；`false` 时保留字符串 |

## 编码约定

实现只对 query 的值执行 `decodeURIComponent`，不会先解码整条 URL，以避免 `%26` 被提前转换成 `&` 后破坏参数边界：

```ts
get('a', '?a=%26'); // '&'
merge({ query: { a: '&' } }); // '?a=%26'
parse('?a=%26').query.a === '&'; // true
```
