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

服务端可直接解析请求头中的 User-Agent：

```ts
import { Device } from '@deot/helper-device';
import type { DeviceInfo } from '@deot/helper-device';

const info: DeviceInfo = Device.parse(request.headers['user-agent']);
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

返回 `DeviceInfo`；`Device` 自身也包含模块初始化时解析出的同名字段。

是否传入 `ua` 决定了解析依据：

- **传入 `ua`**：只依据字符串推断，不读取当前环境，浏览器与服务端结果一致。
- **不传 `ua`**：解析当前环境，除 `navigator.userAgent` 外还会探测触控能力（`navigator.maxTouchPoints`、触控事件），因此能识别使用桌面版 UA 的 iPadOS 13+；SSR 下所有字段为空值。

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

const output = computed(() => {
	const value = Device.parse(ua.value);
	return {
		system: { os: value.os, osVersion: value.osVersion },
		device: {
			android: value.android,
			harmony: value.harmony,
			ipad: value.ipad,
			iphone: value.iphone,
			ipod: value.ipod,
			ios: value.ios,
			touch: value.touch
		},
		browser: {
			chrome: value.chrome,
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

`Device.parse()` 的返回类型，也是 `Device` 初始化后公开的环境信息集合，可通过 `import type { DeviceInfo }` 导入。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `android` | `boolean` | 按 UA | Android 设备，含基于 Android 的旧版鸿蒙 |
| `harmony` | `boolean` | 按 UA | 鸿蒙 NEXT（UA 含 `OpenHarmony`） |
| `ipad` / `ipod` / `iphone` | `boolean` | 按 UA/环境 | 对应 iOS 设备；iPadOS 13+ 仅在不传 `ua` 时可识别 |
| `ios` | `boolean` | 按 UA/环境 | 任一 iOS 设备 |
| `os` | `'android' \| 'ios' \| 'harmony' \| ''` | `''` | 识别到的操作系统 |
| `osVersion` | `string` | `''` | 操作系统版本，取不到时为 `''` |
| `chrome` | `boolean` | 按 UA | UA 含 `Chrome` 标记，包括 Edge 等 Chromium 系浏览器 |
| `androidChrome` | `boolean` | 按 UA | Android 且 UA 含 `Chrome` 标记 |
| `firefox` | `boolean` | `false` | Firefox 浏览器 |
| `webView` | `boolean` | 按 UA | iOS WebView（UA 不带 `Safari`）或 Android WebView（UA 带 `; wv)`） |
| `wechat` / `wechatDevTools` | `boolean` | 按 UA | 微信环境或微信开发者工具 |
| `wechatVersion` | `string` | `''` | 微信版本 |
| `touch` | `boolean` | 按 UA/环境 | Android、iOS、鸿蒙，或不传 `ua` 时当前环境支持触控 |

`Device` 自身还包含模块初始化时解析出的同名字段。UA 或环境变化后需要新结果时，请再次调用 `Device.parse()`。

`osVersion` 取自 UA，而主流浏览器已在逐步冻结 UA 中的系统版本（例如 Android 上的 Chrome 固定上报 `Android 10`），因此它只适合做粗略判断，不要用于精确的版本分支。
