type Func<T> = (_?: T) => void;

export interface InterrupterOptions {
	timeout?: number; // TODO
}

const noop = () => {};

/**
 * 实现的目的：
 * 这是一段代码使用`await interrupter`调度器
 * 永远等待它，直到它上面有任何代码执行了`interrupter.next()`
 * 不论它是同步，微任务，异步执行，之后才会执行它后面的代码
 */
export class Interrupter<T = any> implements PromiseLike<T> {
	static of<T = any>(options?: InterrupterOptions) {
		return new Interrupter<T>(options);
	}

	options = {} as InterrupterOptions;

	_success?: Func<any>;

	_fail?: Func<any>;

	_task!: Promise<T>;

	_finish = false;

	constructor(options?: InterrupterOptions) {
		if (options) {
			this.options = options;
		}
		this._generateTask();
	}

	_generateTask = () => {
		this._task = new Promise<T>((resolve, reject) => {
			this._success = (value?: any) => {
				this._fail = undefined;
				resolve(value);
			};
			this._fail = (value?: any) => {
				this._success = undefined;
				reject(value);
			};
		});

		// 没有等待者时nextWithError/finishWithError不应产生unhandledRejection，等待者仍会收到异常
		this._task.catch(noop);
	};

	next = async (v?: T) => {
		if (this._finish) {
			await this._task;
			return;
		}

		const task = this._task;
		this._success?.(v);
		await task; // index.spec.ts(next, microtask, async/await)
		await Promise.resolve(); // index.spec.ts(next, invoke, preTask)

		// 期间已结束（finish）或已被其他调用生成过，就不再生成
		if (!this._finish && this._task === task) {
			this._generateTask();
		}
	};

	nextWithError = async (v?: any) => {
		if (this._finish) {
			await this._task;
			return;
		}

		const task = this._task;
		this._fail?.(v);
		try {
			await task;
		} catch {
			// 这一轮的异常由等待者处理
		}
		await Promise.resolve();

		if (!this._finish && this._task === task) {
			this._generateTask();
		}
	};

	finish = (v?: T) => {
		this._success?.(v);
		this._finish = true;

		return this;
	};

	finishWithError = (v?: any) => {
		this._fail?.(v);
		this._finish = true;

		return this;
	};

	then<R1 = T, R2 = never>(
		resolve?: ((value: T) => R1 | PromiseLike<R1>) | null,
		reject?: ((reason: any) => R2 | PromiseLike<R2>) | null
	): Promise<R1 | R2> {
		return this._task.then(resolve, reject);
	}

	catch<R = never>(callback?: ((reason: any) => R | PromiseLike<R>) | null): Promise<T | R> {
		return this._task.catch(callback);
	}

	finally(callback?: (() => void) | null): Promise<T> {
		return this._task.finally(callback);
	}
}
