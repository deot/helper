export class MemoryStorage {
	store: object;

	constructor() {
		this.store = {};
	}

	getItem(key: string) {
		return this.store[key] || null;
	}

	setItem(key: string, val: any) {
		this.store[key] = val;
	}

	removeItem(key: string) {
		delete this.store[key];
	}
}