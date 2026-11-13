# @deot/helper-load

按 URL 去重加载脚本、样式表和图片，并提供内联样式管理。该包面向浏览器环境。

## 安装

```bash
pnpm add @deot/helper-load
```

## 使用

```ts
import { script, link, style, removeStyle, image } from '@deot/helper-load';

await script('https://example.com/sdk.js', { attrs: { crossorigin: 'anonymous' } });
await link('https://example.com/theme.css');
style('#app { opacity: 1 }', { id: 'app-theme' });
removeStyle('app-theme');

const meta = await image('https://example.com/image.png', { maxTries: 3 });
```

聚合包以 `Load` 命名空间提供相同函数。

## API

#### `script(src, options?)`

加载脚本；相同 URL 复用 `script.cache`

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | - | 脚本地址，为空时直接 reject |
| `options.async` | `boolean` | `true` | 为 `false` 时使用同步 XHR 取回代码后内联执行 |
| `options.attrs` | `Record<string, string \| boolean \| undefined>` | - | 写到 `<script>` 上的属性，如 `crossorigin`、`integrity`、`nonce`、`type` |

返回 `Promise<1> | undefined`。`script.cache` 为 `Map<string, Promise<1>>`，加载失败时对应项会被删除，失败的 `<script>` 也会从文档中移除。

`attrs` 的值为 `true` 时写入空属性，为 `false` 或 `undefined` 时跳过：

```ts
await script('https://example.com/sdk.js', {
	attrs: { type: 'module', crossorigin: 'anonymous', integrity: 'sha384-...' }
});
```

该 API 依赖可访问的外部脚本地址，文档不主动执行第三方代码，因此不提供运行态 Playground。`options.async: false` 会使用同步 XHR，仅用于兼容旧场景；响应状态不是 2xx / 304 时会 reject，不会执行响应内容。

#### `link(src, options?)`

加载外部样式；相同 URL 复用 `link.cache`

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | - | 样式地址，为空时直接 reject |
| `options.attrs` | `Record<string, string \| boolean \| undefined>` | - | 写到 `<link>` 上的属性，如 `crossorigin`、`integrity`、`media`；可覆盖默认的 `rel="stylesheet"` |

返回 `Promise<1> | undefined`。`link.cache` 为 `Map<string, Promise<1>>`，加载失败时对应项会被删除，失败的 `<link>` 也会从文档中移除。

该 API 依赖可访问的外部 CSS 地址；为避免文档案例受网络和跨域策略影响，不提供运行态 Playground。

#### `style(code, options?)`

注入、更新或按 code 去重内联样式

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `code`、`options.id` | `string`、`string \| HTMLElement` | `void` |

`style.cache` 为 `Set<string>`，只记录由 `style` 创建的样式内容；按 `id` 更新已有元素时不会新增记录，但会清掉被替换掉的旧内容。

- 传入 `id` 且元素已存在：更新该元素的内容。
- 传入 `id` 但元素不存在：总会创建带该 `id` 的 `<style>`，不受 code 去重影响。
- 未传 `id`：相同 code 只注入一次。

切换一段带固定 ID 的内联样式，观察样式节点和页面状态：

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
import { removeStyle, style } from '@deot/helper-load';

const active = ref(false);
const output = ref({ status: '点击按钮切换样式' });
const styleId = 'helper-load-playground-style';

const toggleStyle = () => {
	if (active.value) removeStyle(styleId);
	else style('.load-demo-target { color: #2563eb; background: #eff6ff; }', { id: styleId });
	active.value = !active.value;
	output.value = {
		methods: active.value ? ['style'] : ['removeStyle'],
		styleElementExists: Boolean(document.getElementById(styleId))
	};
};

</script>

<template>
	<div class="demo">
		<button @click="toggleStyle">{{ active ? 'removeStyle' : 'style' }}</button>
		<div class="load-demo-target">样式加载目标</div>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button, .load-demo-target { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
button { width: fit-content; cursor: pointer; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `removeStyle(idOrElement)`

删除 style 元素并清理 `style.cache`；元素不要求位于 `<head>` 内，找不到或已脱离文档时静默返回

| 参数 | 类型 | 返回值 |
| --- | --- | --- |
| `idOrElement` | `string \| HTMLElement` | `void` |

#### `image(src, options?)`

预加载图片；相同 URL 复用 `image.cache`

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | - | 图片地址，为空时直接 reject |
| `options.maxTries` | `number` | `1` | 总尝试次数；失败后立即重试，用尽才 reject |
| `options.crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | - | 对应 `img.crossOrigin`，图片之后要绘制到 canvas 时需要设置 |

返回 `Promise<{ source: string; width: number; height: number }> | undefined`。`image.cache` 为 `Map<string, Promise<LoadImageResult>>`，加载失败时对应项会被删除；`image.placeholder` 是内置的 1×1 PNG Data URL。

使用内置 1×1 PNG 占位图，查看图片加载后的尺寸和数据源：

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
import { image } from '@deot/helper-load';

const output = ref({ status: '点击按钮读取图片' });

const inspect = async () => {
	const result = await image(image.placeholder);
	output.value = {
		width: result.width,
		height: result.height,
		sourcePrefix: result.source.slice(0, 32),
		cacheSize: image.cache.size
	};
};
</script>

<template>
	<div class="demo">
		<button @click="inspect">读取图片信息</button>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

## 运行环境与缓存

- `script`、`link`、`style`、`image` 分别暴露 `cache`，相同资源会复用已有记录。
- `script`、`link`、`image` 的缓存只以 `src` 为 key：同一地址以首次调用的 `options` 为准，之后传入不同的 `options` 不会重新加载。
- `script`、`link`、`image` 加载失败时 reject 一个 `Error`（`message` 含资源地址），原始事件或异常在 `error.cause` 上；失败后再次调用会重新加载。
- 导出的类型：`LoadAttrs`、`LoadScriptOptions`、`LoadLinkOptions`、`LoadImageOptions`、`LoadImageResult`、`LoadStyleCodeOptions`。
- `image.placeholder` 是内置的 1×1 PNG Data URL，可用于无网络占位场景。
- 在 Node.js 或 SSR 环境中，这些函数不会创建 DOM 资源，并返回 `undefined`。
- 主动修改公开 `cache` 前应确认没有其他调用方仍依赖其中的资源。
