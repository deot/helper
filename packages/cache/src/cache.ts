import { flattenJSONParse } from '@deot/helper-utils';

interface Options {
	[key: string]: any;
	version?: string | number;

	// 取值时，对值的转换
	get?: (v: any) => any;

	// 设置值对值的转换
	set?: (v: string) => string;
}

export abstract class ACache {
	options: Options;

	constructor() {
		this.options = {
			version: '',
			get: (v: any) => flattenJSONParse(v),
			set: (v: string) => v
		};
	}

	configure(options: Options) {
		if (typeof window === 'undefined') return;
		this.options = {
			...this.options,
			...options
		};
	}

	abstract get(...args: any[]): any;

	abstract set(...args: any[]): void;
	
	abstract remove(...args: any[]): void;
}