# @deot/helper-emitter

### `Emitter`
```js
import { Emitter } from '@deot/helper-emitter';

// or
import { Emitter } from '@deot/helper';

```

### 示例

```js
let source = new Emitter({ a: 2 });

// 订阅事件 ，不使用'() => {}', 使用'function() {}'可以拿到当前对象，进行链式操作
source.on('[event-name]', ({ name }) => {
	console.log(name, this);
});

// 订阅listener
source.on(({ name }) => {
	console.log(name, this);
});

// 发布事件，第一个值事件，第二个值参数
source.emit('[event-name]', { name: 'wya-ps' }); 

// 取消事件订阅
source.off('[event-name]');

// 取消订阅listener
source.off();
```

## API

---

### `on` 

`source.on(eventName: string, callback: Function)`

订阅事件

+ **eventName**: 绑定的事件名。
+ **callback**: 回调。

**示例**
```js
source.on('[event-name]', ({ name }) => {
	console.log(name, this);
});
```

---

### `once` 

`source.once(eventName: string, callback: Function)`

一次订阅

+ **eventName**: 绑定的事件名。
+ **callback**: 回调。

**示例**
```js
source.once('[event-name]', ({ name }) => {
	console.log(name, this);
});
```

---

### `off` 

`source.off(eventName: string, callback: Function)`

取消订阅

+ **eventName**: 绑定的事件名。
+ **callback**: 回调。

**示例**
```js
// 取消事件订阅, 指定回调
source.off('[event-name]', fn);

// 取消事件订阅
source.off('[event-name]');

// 取消订阅listener
source.off();
```

---

### `emit` 

`source.emit(eventName: string, params: Object)`

发布事件

+ **eventName**: 触发事件名。
+ **params**: 给回调的参数。

**示例**
```js
// 发布事件，第一个值事件，第二个值参数
source.emit('[event-name]', { name: 'wya-ps' }); 
```

---

### `listener` 

`source.on(callback: Function)`

监听

+ **params**: 监听器的回调。

**示例**
```js
// 订阅listener
source.on(({ name }) => {
	console.log(name, this);
});

// 取消订阅listener
source.off();
```