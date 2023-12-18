# @deot/helper-scheduler

调度器

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

setTimeout(scheduler.next);
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
