# @deot/helper-unicode

将 Unicode 字符串压缩后编码为 Base64，并提供对应解码能力。

## 安装

```bash
pnpm add @deot/helper-unicode
```

## 使用

```ts
import { encode, decode } from '@deot/helper-unicode';

const value = encode('你好，world');
decode(value); // '你好，world'
```

聚合包以 `Unicode` 命名空间提供相同函数。

## API

#### `encode(data)`

推荐使用的编码名称，是 `utoa` 的别名。将字符串转为 UTF-8，使用 zlib level 9 压缩，再编码为 Base64。

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `data` | `string` | `string` |

输入 Unicode 文本，实时查看压缩后的 Base64：

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
import { computed, ref } from 'vue';
import { encode } from '@deot/helper-unicode';

const input = ref('你好，@deot/helper');
const encoded = computed(() => encode(input.value));
</script>

<template>
	<div class="demo">
		<label>文本输入 <textarea v-model="input" rows="3" /></label>
		<strong>编码输出</strong>
		<code>{{ encoded }}</code>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: grid; gap: 6px; }
.demo textarea, .demo code { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo textarea { width: 100%; max-width: 480px; box-sizing: border-box; }
.demo code { overflow-wrap: anywhere; white-space: pre-wrap; background: #f8fafc; }
</style>
```
:::

#### `decode(base64)`

推荐使用的解码名称，是 `atou` 的别名。解码 Base64，并解压为原始 Unicode 字符串。

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `base64` | `string` | `string` |

修改 Base64 输入，查看解压后的 Unicode 文本或错误信息：

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
import { decode, encode } from '@deot/helper-unicode';

const input = ref(encode('你好，@deot/helper'));
// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => {
	try {
		return { value: decode(input.value), error: null };
	} catch (error) {
		return { value: null, error: String(error) };
	}
});
</script>

<template>
	<div class="demo">
		<label>Base64 输入 <textarea v-model="input" rows="4" /></label>
		<strong>解码输出</strong>
		<code>{{ JSON.stringify(output, null, 2) }}</code>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
.demo label { display: grid; gap: 6px; }
.demo textarea, .demo code { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.demo textarea { width: 100%; max-width: 480px; box-sizing: border-box; }
.demo code { overflow-wrap: anywhere; white-space: pre-wrap; background: #f8fafc; }
</style>
```
:::

#### `utoa(data)`

`encode` 的兼容别名。

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `data` | `string` | `string` |

#### `atou(base64)`

Base64 解码并解压为 Unicode 字符串

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `base64` | `string` | `string` |

## 运行环境

实现依赖全局 `btoa` 和 `atob`，并使用 `fflate` 完成压缩。目标运行环境需要提供这两个 Base64 API；现代浏览器和较新的 Node.js 均已支持。

`atou` 会识别当前 zlib 格式，同时保留对早期未压缩 Unicode Base64 数据的兼容解码。
