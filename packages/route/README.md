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

类型可以直接导入：

```ts
import type { Route, ParsedRoute, ParseOptions, GetOptions } from '@deot/helper-route';

// get 的泛型用于标注返回值，未命中时为 null
const id = get<number>('id', '?id=1'); // number | null
```

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
| `url`、`options` | `string \| ParseOptions`、`ParseOptions` | 当前页面路径与查询串 | `ParsedRoute`，即 `{ origin: string; path: string; query: Record<string, any> }` |

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
| `key`、`url`、`options` | `string`、`string \| GetOptions`、`GetOptions` | 当前 `location.search` | `T \| null`（`T` 默认为 `any`） |

`url` 不含 `?` 时整串按查询串处理：`get('id', 'id=1')` 返回 `1`。

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

描述 `merge()` 接收的 URL 组成部分。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `origin` | `string` | `''` | 协议与域名部分；与 `path` 之间始终只保留一个 `/` |
| `path` | `string \| string[]` | `''` | 路径字符串或路径片段数组；可以自带查询串或 `#` |
| `query` | `Record<string, any>` | — | 查询参数；忽略 `null`、`undefined`、空字符串、`NaN`，保留 `false`、`0`；对象与数组序列化为 JSON |

`path` 带 `#` 时，`query` 的位置取决于 `#` 之后的内容：

```ts
// 普通锚点：参数插到 # 之前
merge({ path: '/any#top', query: { id: 1 } }); // '/any?id=1#top'

// hash 路由（# 之后以 / 或 ! 开头，或已带 ?）：参数追加在末尾
merge({ path: '/#/page', query: { id: 1 } }); // '/#/page?id=1'
```

#### `ParseOptions` / `GetOptions`

控制 `parse()` 和 `get()` 的输入与查询值转换方式。

##### 字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 当前页面 URL | 待解析的 URL 或查询串 |
| `parse` | `boolean \| ((value: string) => any)` | `flattenJSONParse` | 函数时转换参数；`false` 时保留字符串；`true` 或不传时使用默认转换 |

## 解析约定

`get()` 与 `parse()` 共用同一套拆分规则，对同一条 URL 的结果一致：

```ts
// 重复的 key 取第一个
parse('?a=1&a=2').query; // { a: 1 }

// 没有 = 的参数值为空字符串
parse('?debug&id=1').query; // { debug: '', id: 1 }

// 只在第一个 = 处切分，值中的 = 与 ? 会保留
get('token', '?token=YWJj=='); // 'YWJj=='
get('redirect', '/a?redirect=/b?c=1'); // '/b?c=1'

// ? 之后的 # 视为 fragment，不计入参数值
get('id', '/p?id=1#top'); // 1

// # 在 ? 之前（hash 路由）时，参数仍可读取
parse('https://example.com/#/page?id=1');
// { origin: 'https://example.com', path: '/#/page', query: { id: 1 } }
```

## 编码约定

实现只对 query 的 key 和值分别执行 `decodeURIComponent`，不会先解码整条 URL，以避免 `%26` 被提前转换成 `&` 后破坏参数边界：

```ts
get('a', '?a=%26'); // '&'
merge({ query: { a: '&' } }); // '?a=%26'
parse('?a=%26').query.a === '&'; // true

// key 同样会编解码
merge({ query: { 'a&b': 1 } }); // '?a%26b=1'
parse('?a%26b=1').query; // { 'a&b': 1 }
```

对象与数组以 JSON 写入，默认转换会把它读回来：

```ts
const url = merge({ query: { filter: { v: [1, 2] } } });
get('filter', url); // { v: [1, 2] }
```

解码会重复执行直到结果不再变化，所以已编码的值不会被重复编码，但字面量本身形如编码串的值无法原样往返：

```ts
merge({ query: { a: '%26' } }); // '?a=%26'，而不是 '?a=%2526'
get('a', '?a=%2526'); // '&'，而不是 '%26'
```
