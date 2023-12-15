export class MemoryStorage {
	store: Record<string, any> = {};

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
