# @deot/helper-wheel

滚轮行为优化

### `Wheel`
```js
import { Wheel } from '@deot/helper-wheel';
```

```js
// or
import { Wheel } from '@deot/helper';
```

```js
let off = Wheel.of(el, wheelOptions).enable();
off();
```

### macOS 触控板

使用 `overflow: hidden` + 手动滚动时，macOS「双指滑动网页前进/后退」可能误触发。`Wheel.enable()` 默认会：

- 在容器有溢出且手势含对应方向分量时始终 `preventDefault`，与是否到达边界无关
- 设置 `overscroll-behavior: contain`（可通过 `{ overscrollBehavior: false }` 关闭）

典型用法：

```js
Wheel.of(el, { overscrollBehavior: true }).enable();
```