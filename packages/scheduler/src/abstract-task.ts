import { Emitter } from '@deot/helper-emitter';

const noop = () => {};

export abstract class ATask extends Emitter {
	_pauser: Function = noop;

	pauser: Promise<any> = Promise.resolve();

	isCancel = false;

	isPause = false;

	/**
	 * @deprecated 拼写错误，使用`isPause`
	 * @returns ~
	 */
	get isPasue() {
		return this.isPause;
	}

	/**
	 * @deprecated 拼写错误，使用`pauser`
	 * @returns ~
	 */
	get pasuer() {
		return this.pauser;
	}

	async suspend(x: any, target?: any) {
		if (target && target.then) {
			await target;
		}
		return x;
	}

	abstract start(...args: any[]): any;

	abstract cancel(...args: any[]): any;

	abstract pause(...args: any[]): any;

	abstract resume(...args: any[]): any;

	/**
	 * @deprecated 拼写错误，使用`pause`
	 * @param args ~
	 * @returns ~
	 */
	pasue(...args: any[]) {
		return this.pause(...args);
	}

	// 重复设置同一状态不会重建pauser，避免之前的等待者被遗弃
	setPauseStatus(status: boolean) {
		if (this.isPause === status) return;
		this.isPause = status;

		if (status) {
			this.pauser = new Promise((resolve) => {
				this._pauser = resolve;
			});
		} else {
			this._pauser();
			this._pauser = noop;
		}
	}

	/**
	 * @deprecated 拼写错误，使用`setPauseStatus`
	 * @param status ~
	 * @returns ~
	 */
	setPasueStatus(status: boolean) {
		return this.setPauseStatus(status);
	}

	setCancelStatus(status: boolean) {
		this.isCancel = status;
	}

	end() {
		return this.cancel();
	}

	immediate() {
		return this.start();
	}
}
