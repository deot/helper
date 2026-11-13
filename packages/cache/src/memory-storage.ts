export class MemoryStorage {
	// 无原型对象，避免`toString`、`constructor`等key读到原型上的值
	store: Record<string, any> = Object.create(null);

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
