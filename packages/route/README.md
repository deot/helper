# @deot/helper-route

### `Route` 

```js
import * as Route from "@deot/helper-route";

// or
import { Route } from "@deot/helper";
```

---

#### `merge`

`Route.merge(route: object, options: object)`

基于规则构建新的url

+ **route**: 路由规则
+ **options**: 可配置参数

*rule:* 规则:
+ **path**: *string, string[]* 路径
+ **query**: *object* 参数

**示例**
```js
Route.merge({
	// path: '/home',
	path: ['/', 'home'],
	query: { name: 'wya-team' }
});
```

---

#### `parse`

`Route.parse(url: string, options: object)`

解析当前路由 -> `{ query: {}, path: [] }`

+ **url**: 路径，默认值：当前路由
+ **options**: 可配置参数

**示例**
```js
Route.parse();
```

---

#### `get`

`Route.get(key: string, url: string, options: object)`

设置版本号

+ **key**: 参数键值
+ **url**: 路径，默认值：当前路由
+ **options**: 可配置参数

**示例**
```javascript
Route.get('name');
```

### 约定

```
let url = `?a=${encodeURIComponent('&')}`; // '?a=%26'

decodeURIComponent(url); // a=&

encodeURIComponent(url); // '%3Fa%3D%2526'
```

- 期望： `{ a: '&' }`
- 实际： `{ a: '' }`

为了避免该情况，内部对`url`不直接`decodeURIComponent`, 仅当对值进行`decodeURIComponent`. 所以`%3Fa%3D%2526`是无效的; 

`merge`调用时，`value`的值会被`decodeURIComponent`

```js
get('a', '?a=%26'); // &

merge({ query: { a: '&' } }); // ?a=%26

parse('?a=%26'); // query.a === '&' (true)
```