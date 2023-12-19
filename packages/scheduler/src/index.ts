type Func<T> = (_?: T) => void;

export interface SchedulerOptions {
	timeout?: number; // TODO
}

export class Scheduler<T = any> {
	static of(options?: SchedulerOptions) {
		return new Scheduler(options);
	}

	options = {} as SchedulerOptions;

	_success?: Func<any>;

	_fail?: Func<any>;

	_task!: Promise<any>;

	_finish = false;

	constructor(options?: SchedulerOptions) {
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
	};

	next = async (v?: T) => {
		if (!this._finish) {
			this._success?.(v);
			await this._task;
			await Promise.resolve();
			this._generateTask();
		} else {
			await this._task;
		}
	};

	nextWithError = async (v?: any) => {
		if (!this._finish) {
			this._fail?.(v);
			try {
				await this._task;
			} catch {
				await Promise.resolve();
				this._generateTask();
			}
		} else {
			await this._task;
		}
	};

	finish = (v?: T) => {
		this._success?.(v);
		this._finish = true;

		return this;
	};

	finishWithError = (v?: T) => {
		this._fail?.(v);
		this._finish = true;

		return this;
	};

	then(resolve: Func<T>, reject?: Func<T>) {
		return this._task.then(resolve, reject);
	}

	catch(callback?: Func<T>) {
		return this._task.catch(callback);
	}

	finally(callback?: Func<void>) {
		return this._task.finally(callback);
	}
}
