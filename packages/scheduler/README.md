# @deot/helper-scheduler

调度器

实现的目的：
这是一段代码使用`await scheduler`调度器
永远等待它，直到它上面有任何代码执行了`scheduler.next()`
不论它是同步，微任务，异步执行，之后才会执行它后面的代码

### `Scheduler`
```js
import { Scheduler } from '@deot/helper-scheduler';
```
```js
// or
import { Scheduler } from '@deot/helper';
```

```js
const scheduler = Scheduler.of();

scheduler.next();
await scheduler;

Promise.resolve().then(scheduler.next);
await scheduler;

setTimeout(scheduler.next);
await scheduler;

try {
	setTimeout(scheduler.nextWithError);
	await scheduler;
} catch {
	setTimeout(scheduler.finish);
	await scheduler;
}
```
