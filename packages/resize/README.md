# @deot/helper-resize

- `MutationObserver`: DOM元素的属性或者节点变化的检测
- `ResizeObserver`: 检测DOM尺寸变化JS


### `Resize`

> 目前`on`首次绑定会立即调用一次

```js
import { Resize } from '@deot/helper-resize';
```
```js
// or
import { Resize } from '@deot/helper';
```

```js
const off = Resize.of(el).on(() => {});
off();
```


## 其他

- `resize-observer-polyfill`: [监听方式](https://github.com/que-etc/resize-observer-polyfill/blob/master/src/ResizeObserverController.js#L147)