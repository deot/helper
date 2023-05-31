import { IS_SERVER } from '@deot/helper-shared';

export abstract class Cache {
	version: string;

	constructor() {
		this.version = '';
	}

	setVersion(version: string) {
		if (IS_SERVER) return;
		this.version = version;
	}

	abstract get(...args: any[]): any;

	abstract set(...args: any[]): void;
	
	abstract remove(...args: any[]): void;
}