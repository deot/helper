# @deot/helper-wheel

统一鼠标滚轮、触控和中键拖动输入，优化嵌套滚动、方向锁定与 `overflow: hidden` 场景。

## 安装

```bash
pnpm add @deot/helper-wheel
```

## 使用

```ts
import { Wheel } from '@deot/helper-wheel';

const off = Wheel.of(element, {
	freedom: false,
	native: true
}).enable();

off();
```

自定义消费滚动增量：

```ts
const wheel = Wheel.of(element);
const off = wheel.on((deltaX, deltaY) => {
	updatePosition(deltaX, deltaY);
});
```

也可以从 `@deot/helper` 直接导入 `Wheel`。

## API

### Wheel

将滚轮、触控与中键拖动归一化为按动画帧合并的水平和垂直增量。

#### `new Wheel(element, options?)`

创建滚动控制器

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `element`、`options` | `HTMLElement`、`WheelOptions` | 见 Options | `Wheel` |

#### `Wheel.of(element, options?)`

构造函数的工厂方法

| 参数 | 参数类型 | 默认值 | 返回值 |
| --- | --- | --- | --- |
| `element`、`options` | `HTMLElement`、`WheelOptions` | 见 Options | `Wheel` |

#### `Wheel.shouldWheelX(element, delta)`

判断横向边界能否继续滚动

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element`、`delta` | `HTMLElement`、`number` | `boolean` |

#### `Wheel.shouldWheelY(element, delta)`

判断纵向边界能否继续滚动

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `element`、`delta` | `HTMLElement`、`number` | `boolean` |

#### `Wheel.on(listener)`

监听按帧合并后的增量

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `listener` | `(deltaX: number, deltaY: number) => unknown` | `() => void` |

#### `Wheel.off(listener?)`

删除指定或全部 listener，必要时解绑 DOM 事件

| 参数 | 参数类型 | 返回值 |
| --- | --- | --- |
| `listener` | `Function` | `void` |

#### `Wheel.enable()`

注册默认滚动 listener 并返回解绑函数

| 返回值 |
| --- |
| `() => void` |

`Wheel` 依赖 DOM、触控事件和 `requestAnimationFrame`，应只在浏览器中针对实际元素创建实例。

#### 公开状态与实现成员

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `el` / `options` | `HTMLElement` / `WheelOptions` | 当前滚动容器与合并默认值后的配置 |
| `listeners` / `defaultOnWheel` | `WheelFunction[]` / `WheelFunction \| null` | 增量监听器和 `enable()` 注册的默认监听器 |
| `deltaX` / `deltaY` | `number` | 当前动画帧累计的滚动增量 |
| `isTouching` | `boolean` | 是否处于触控手势中 |
| `startTime` / `startX` / `startY` / `moveX` / `moveY` | `number` | 触控或中键拖动的手势状态 |
| `needThresholdWait` / `timer` | `boolean` / `any` | 原生边界切换的等待状态与定时器 |
| `animationFrameID` | `number \| null` | 当前合并增量的动画帧 ID |
| `handleTouchStart(event)` / `handleTouchMove(event)` / `handleTouchEnd(event)` | `(event: TouchEvent) => void` | 触控事件处理器 |
| `handleMouseMove(event)` | `MouseEvent` | 中键拖动处理器 |
| `handleWheel(event)` | `WheelEvent` | 原生滚轮处理器 |
| `clear()` / `didWheel()` | `() => void` | 清理累计状态 / 在动画帧中发布累计增量 |

事件处理器和手势状态虽然在当前声明中可见，但由 `enable()` 管理；业务代码通常只需使用 `on()`、`off()` 和 `enable()`。

在容器上滚动，或点击按钮派发一次滚轮事件，观察合并后的帧增量和边界判断：

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
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Wheel } from '@deot/helper-wheel';

const box = ref(null);
const output = ref({ deltaX: 0, deltaY: 0, scrollTop: 0 });
let wheel;
let offListener = () => {};
let offEnable = () => {};

const dispatch = () => {
	box.value.dispatchEvent(new WheelEvent('wheel', { deltaY: 48, bubbles: true, cancelable: true }));
};

onMounted(() => {
	wheel = Wheel.of(box.value, { native: false, freedom: true });
	offListener = wheel.on((deltaX, deltaY) => {
		output.value = {
			deltaX,
			deltaY,
			scrollTop: box.value.scrollTop,
			shouldWheelX: Wheel.shouldWheelX(box.value, deltaX),
			shouldWheelY: Wheel.shouldWheelY(box.value, deltaY)
		};
	});
	offEnable = wheel.enable();
});

onBeforeUnmount(() => {
	offListener();
	offEnable();
	wheel?.off();
});
</script>

<template>
	<div class="demo">
		<button @click="dispatch">派发 deltaY = 48</button>
		<div ref="box" class="wheel-box">
			<div v-for="item in 8" :key="item" class="row">Row {{ item }}</div>
		</div>
		<strong>输出</strong>
		<pre>{{ JSON.stringify(output, null, 2) }}</pre>
	</div>
</template>

<style>
.demo { display: grid; width: min(100%, 640px); gap: 12px; padding: 12px; box-sizing: border-box; font: 14px/1.5 sans-serif; }
button { width: fit-content; padding: 6px 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
.wheel-box { height: 120px; overflow: hidden; border: 1px solid #cbd5e1; border-radius: 8px; }
.row { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
pre { margin: 0; padding: 12px; border-radius: 8px; background: #f8fafc; }
</style>
```
:::

#### `WheelOptions`

配置滚动方向判断、事件传播和原生边界行为。

表中的 `WheelFunction<T>` 表示 `(deltaX: number, deltaY: number) => T`，是源码内部类型，不可从包中单独导入。

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `native` | `true` | 到达边界后是否保持原生“松开后父层再滚动”的阈值行为 |
| `freedom` | `false` | 是否允许 X/Y 同时自由滚动；关闭时按手势角度锁定主方向 |
| `shouldWheelX(deltaX, deltaY)` | 容器 X 轴边界判断 | 是否消费本次横向增量 |
| `shouldWheelY(deltaY, deltaX)` | 容器 Y 轴边界判断 | 是否消费本次纵向增量 |
| `stopPropagation(deltaX, deltaY)` | `() => true` | 消费滚动时是否阻止事件冒泡 |
