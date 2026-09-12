# @deot/helper-device

解析 User-Agent，并提供当前设备、系统和浏览器环境的常用标记。

## 安装

```bash
pnpm add @deot/helper-device
```

## 使用

```ts
import { Device } from '@deot/helper-device';

if (Device.touch) {
	// 触屏环境
}

const info = Device.parse('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
const { ios, osVersion } = info;
```

聚合包用法：

```ts
import { Device } from '@deot/helper';
```

## API

#### `Device.parse(ua?)`

解析传入或当前环境的 User-Agent，返回操作系统、设备、浏览器和触控能力信息。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `ua` | `string` | `navigator.userAgent`；SSR 为 `''` | 待解析的 User-Agent |

返回下文记作 `DeviceInfo` 的结构；`Device` 自身也包含模块初始化时解析出的同名字段。`DeviceInfo` 是文档中的结构名称，并非可单独导入的 TypeScript 类型。

输入不同 UA，查看 `Device.parse()` 返回的系统、设备和浏览器分组结果：

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
import { Device } from '@deot/helper-device';

const ua = ref('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) MicroMessenger/8.0.42');
// Template 中直接使用。
// eslint-disable-next-line no-useless-assignment
const output = computed(() => {
	const value = Device.parse(ua.value);
	return {
		system: { os: value.os, osVersion: value.osVersion },
		device: {
			android: value.android,
			ipad: value.ipad,
			iphone: value.iphone,
			ipod: value.ipod,
			ios: value.ios,
			touch: value.touch
		},
		browser: {
			androidChrome: value.androidChrome,
			firefox: value.firefox,
			webView: value.webView,
			wechat: value.wechat,
			wechatDevTools: value.wechatDevTools,
			wechatVersion: value.wechatVersion
		}
	};
});
</script>

<template>
	<div class="demo">
		<label>User-Agent <textarea v-model="ua" rows="3"></textarea></label>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 10px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
label { display: grid; gap: 10px; padding: 0; }
textarea, pre { margin: 0; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
textarea { width: 100%; max-width: 480px; box-sizing: border-box; }
pre { background: #f8fafc; }
</style>
```
:::

#### `DeviceInfo`

`Device.parse()` 的返回结构，也是 `Device` 初始化后公开的环境信息集合。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `android` | `boolean` | 按 UA | Android 设备 |
| `androidChrome` | `boolean` | 按 UA | UA 中包含 Chrome |
| `ipad` / `ipod` / `iphone` | `boolean` | 按 UA | 对应 iOS 设备 |
| `ios` | `boolean` | 按 UA | 任一 iOS 设备 |
| `os` | `'android' \| 'ios' \| ''` | `''` | 识别到的操作系统 |
| `osVersion` | `string` | `''` | 操作系统版本 |
| `webView` | `RegExpMatchArray \| false \| null` | 按 UA | iOS WebView 匹配结果 |
| `wechat` / `wechatDevTools` | `boolean` | 按 UA | 微信环境或微信开发者工具 |
| `wechatVersion` | `string` | `''` | 微信版本 |
| `touch` | `boolean` | 按 UA/环境 | Android、iOS 或支持触控事件 |
| `firefox` | `boolean` | `false` | Firefox 浏览器 |

`Device` 自身还包含模块初始化时解析出的同名字段。UA 或环境变化后需要新结果时，请再次调用 `Device.parse()`。
