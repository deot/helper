import { Emitter } from '@deot/helper-emitter';

export abstract class ATask extends Emitter {
	_pasuer: Function;
	
	pasuer: Promise<any>;

	canceler: Promise<any>;

	isCancel: boolean;

	isPasue: boolean;

	constructor() {
		super();
		/* istanbul ignore next */
		this._pasuer = () => {};
		this.pasuer = Promise.resolve();
		this.canceler = Promise.resolve();

		this.isCancel = false;
		this.isPasue = false;
	}

	async suspend(x: any, target?: Promise<any>) {
		if (target) {
			await target;
		}
		return x;
	}

	abstract start(...args: any[]): any;

	abstract cancel(...args: any[]): any;

	abstract pasue(...args: any[]): any;

	abstract resume(...args: any[]): any;

	setPasueStatus(status: boolean) {
		this.isPasue = status;

		if (this.isPasue) {
			this.pasuer = new Promise((resolve) => {
				this._pasuer = resolve;
			});
		} else {
			this._pasuer();
		}
	}

	setCancelStatus(status: boolean) {
		this.isCancel = status;

		if (this.isCancel) {
			this.canceler = new Promise(() => {});
		} else {
			this.canceler = Promise.resolve();
		}
	}

	end() {
		return this.cancel();
	}

	immediate() {
		return this.start();
	}
}