# @deot/helper-load

### `Load` 

```js
import * as Load from "@deot/helper-load";

// or
import { Load } from "@deot/helper";
```

---

#### `link`

`Load.link(url: string, options: object)`

加载css

+ **url**: 链接
+ **options**: 可配置参数

**示例**
```javascript
Load.link('https://*.github.io');
```

---

#### `style`

`Load.style(code: string, options: object)`

注入style

+ **code**: 代码块
+ **options**: 可配置参数

*options:* 规则:
+ **id**: *string* 避免重复创建

**示例**
```javascript
Load.style('#test { font-size: 12px }');
```

---

#### `removeStyle`

`Load.removeStyle(id: string)`

删除cssCode

+ **id**: *string* 避免重复创建


**示例**
```javascript
Load.removeStyle('test');
```

---


#### `script`

`Load.script(url: string, options: object)`

加载js

+ **url**: 链接
+ **options**: 可配置参数

**示例**
```javascript
Load.script('https://*.github.io');
```

---


#### `image`

`Load.image(url: string, options: object)`

加载image

+ **url**: 链接
+ **options**: 可配置参数

**示例**
```javascript
Load.image('https://*.github.io');
```