# @deot/helper-cache

缓存管理（`Storage` / `Cookie` / `IndexDB`）

### `Storage/Cookie/IndexDB`

> IndexDB 返回的是`Promise`

```js
import { Cookie, Storage, IndexDB } from "@deot/helper-cache";

// or
import { Cookie, Storage, IndexDB } from "@deot/helper";
```

---

#### `get`

`Storage.get(key: string, options?: object)`

获取缓存中对应的值

+ **key**: 键值
+ **options**: 配置项

**示例**
```js
Storage.get('key');
```

---

#### `set`

`Storage.set(key: string, value: any, options?: object)`

设置缓存

+ **key**: 键值
+ **value**: 缓存
+ **options**: 配置项

**示例**
```js
Storage.set('key', {});
```

---

#### `remove`

`Storage.remove(key: string, options?: object)`

清楚缓存

+ **key**: 键值
+ **options**: 配置项

**示例**
```js
Storage.remove('key');
```

---

#### `configure`

`Storage.configure(options: object)`

设置版本号

+ **options**: 配置项

**示例**
```js
Storage.configure({ version: '1.0.0' });
```
