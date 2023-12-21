# @deot/helper-scheduler

调度器 - 进行调度工作的程序

### `Task`
创建任务队列，即执行顺序，他是串行的

### `Job`
创建任务轮询队列，周期性执行脚本

### `Parallel`
创建并行任务执行，可控制并发数

### `Interrupter`
中断任务（也可以理解为等待某个任务的完成）

实现的目的：
这是一段代码使用`await interrupter`中断器
永远等待它，直到它上面有任何代码执行了`interrupter.next()`
不论它是同步，微任务，异步执行，之后才会执行它后面的代码

```js
import { Interrupter } from '@deot/helper-scheduler';
```
```js
// or
import { Interrupter } from '@deot/helper';
```

```js
const interrupter = Interrupter.of();

interrupter.next();
await interrupter;

Promise.resolve().then(interrupter.next);
await interrupter;

setTimeout(interrupter.next);
await interrupter;

try {
	setTimeout(interrupter.nextWithError);
	await interrupter;
} catch {
	setTimeout(interrupter.finish);
	await interrupter;
}
```
