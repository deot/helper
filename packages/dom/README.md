# @deot/helper-dom

考虑到`tree-shaking`, 不支持链式调用

### `DOM/$` 


```js
import * as $ from '@deot/helper-dom';
```

```js
// or
import { $, DOM } from '@deot/helper';
```

---

#### `prefixStyle`

`prefixStyle(key: string)`

样式兼容前缀

+ **key**: 样式的名字

**示例**
```javascript
prefixStyle('transform');
```

---

#### `composedPath`

`$.composedPath(event: object)`

e.taget父层相关path兼容

+ **event**: 当前触发的事件

**示例**
```javascript
composedPath(event);
```

---

#### `on`

`on(el: string | object, eventName: string, handler: Function)`

注册当前事件

+ **event**: 当前触发的事件

**示例**
```javascript
let off = on(el, 'click', handler);
off();
```

---

#### `off`

`off(el: string | object, eventName: string, handler: Function)`

卸载当前事件

+ **event**: 当前触发的事件

**示例**
```javascript
off(el, 'click', handler);
```

---

#### `once`

`once(el: string | object, eventName: string, handler: Function)`

一次执行当前事件

+ **event**: 当前触发的事件

**示例**
```javascript
once(el, 'click', handler);
```

---

#### `addClass`

`addClass(el: string | object, className: string)`

添加样式

+ **className**: 样式名

**示例**
```javascript
addClass(el, 'g-fs-12');
```

---

#### `removeClass`

`removeClass(el: string | object, className: string)`

移除样式

+ **className**: 样式名

**示例**
```javascript
removeClass(el, 'g-fs-12');
```

---

#### `hasClass`

`hasClass(el: string | object, className: string)`

是否包含当前样式

+ **className**: 样式名

**示例**
```javascript
hasClass(el, 'g-fs-12');
```

---

#### `getStyle`

`getStyle(el: string | object, key: string)`

计算当前元素的样式对应的值（计算属性，css/style）

+ **key**: 样式的名字

**示例**
```javascript
getStyle(el, 'height');
```

---

#### `setStyle`

`setStyle(el: string | object, key: string)`

设置样式

+ **key**: 样式的名字

**示例**
```javascript
setStyle(el, 'height', '100px');
```


---

#### `isScroll`

`isScroll(el: string | object, vertical: boolean)`

是否含有滚动条

+ **vertical**: 是否垂直方向

**示例**
```javascript
isScroll(el);
```

---

#### `getScroller`

`getScroller(el: string | object, vertical: boolean)`

获取最近的滚动条元素

**示例**
```javascript
getScroller(el);
```

---

#### `contains`

`contains(el: string | object, children: object)`

父层是否包含子层（计算的是x,y,w,h）

+ **children**: 子元素

**示例**
```javascript
contains(el, children);
```


---

#### `scrollIntoView`

`scrollIntoView(el: string | object, options: object)`

父层是否包含子层（计算的是x,y,w,h）

+ **options**: 可配置参数

*options:* 规则:
+ **from**: *number* 开始
+ **to**: *number* 结束
+ **duration**: *number* 持续时间
+ **scroller**: *object* 滚动条

**示例**
```javascript
scrollIntoView(el, { });
```

