import { Emitter } from '@deot/helper-emitter';

describe('emitter.ts', () => {
	it('this', () => {
		const evt = '[event-name]';
		const source = new Emitter({ a: 2 });

		source.on(evt, function (this: any) {
			expect(this.a).toBe(2);
		});

		source.emit(evt);
	});

	it('of', () => {
		const source = Emitter.of();
		expect(source instanceof Emitter).toBe(true);
	});

	it('on', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;

		source.on(evt, () => count++);
		source.on({
			[evt]: () => count++
		});

		source.emit(evt);
		expect(count).toBe(2);
	});

	it('off alone', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.on(evt, handle);
		source.on(handle);
		expect(source.events[evt].length).toBe(1);
		expect(source.listeners.length).toBe(1);
		source.off();
		expect(source.listeners.length).toBe(0);

		// 无参只清空监听器，具名事件保留
		source.emit(evt);
		expect(source.events[evt].length).toBe(1);
		expect(count).toBe(1);
	});

	it('off by event', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.on(evt, handle);
		expect(source.events[evt].length).toBe(1);
		source.off(evt);
		expect(source.events[evt]).toBe(undefined);

		source.emit(evt);
		expect(count).toBe(0);
	});

	it('off by event & callback', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		const other = () => count += 10;

		source.on(evt, handle);
		source.on(evt, other);
		expect(source.events[evt].length).toBe(2);
		source.off(evt, handle);
		expect(source.events[evt]).toEqual([other]);

		source.emit(evt);
		expect(count).toBe(10);

		source.off(evt, other);
		expect(source.events[evt]).toBe(undefined);
	});

	it('off by original callback after once', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.once(evt, handle);
		source.off(evt, handle);
		source.emit(evt);

		expect(source.events[evt]).toBe(undefined);
		expect(count).toBe(0);
	});

	it('once does not skip following callbacks', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		const logs: string[] = [];

		source.once(evt, () => logs.push('once'));
		source.on(evt, () => logs.push('b'));
		source.on(evt, () => logs.push('c'));

		source.emit(evt);
		expect(logs).toEqual(['once', 'b', 'c']);

		source.emit(evt);
		expect(logs).toEqual(['once', 'b', 'c', 'b', 'c']);
	});

	it('once return false', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		const logs: string[] = [];

		source.on(evt, () => logs.push('a'));
		source.once(evt, () => false);
		source.on(evt, () => logs.push('c'));

		source.emit(evt);
		expect(logs).toEqual(['a']);

		source.emit(evt);
		expect(logs).toEqual(['a', 'a', 'c']);
	});

	it('off inside callback does not skip following callbacks', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		const logs: string[] = [];
		const a = () => {
			logs.push('a');
			source.off(evt, a);
		};

		source.on(evt, a);
		source.on(evt, () => logs.push('b'));

		source.emit(evt);
		expect(logs).toEqual(['a', 'b']);

		source.emit(evt);
		expect(logs).toEqual(['a', 'b', 'b']);
	});

	it('off inside listener does not skip following listeners', () => {
		const source = new Emitter();
		const logs: string[] = [];

		source.on(() => {
			logs.push('a');
			source.off();
		});
		source.on(() => logs.push('b'));

		source.emit();
		expect(logs).toEqual(['a', 'b']);

		source.emit();
		expect(logs).toEqual(['a', 'b']);
	});

	it('on inside callback takes effect from next emit', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => {
			count++;
			source.on(evt, handle);
		};

		source.on(evt, handle);

		source.emit(evt);
		expect(count).toBe(1);

		source.emit(evt);
		expect(count).toBe(3);
	});

	it('event names on Object.prototype', () => {
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		['constructor', 'toString', 'hasOwnProperty', '__proto__'].forEach((evt) => {
			expect(() => source.emit(evt)).not.toThrow();
			expect(count).toBe(0);

			source.on(evt, handle);
			source.emit(evt);
			expect(count).toBe(1);

			source.off(evt, handle);
			source.emit(evt);
			expect(count).toBe(1);

			count = 0;
		});
	});

	it('once', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.once(evt, handle);
		source.emit(evt);
		source.emit(evt);
		source.emit(evt);
		source.emit(evt);
		expect(source.listeners.length).toBe(0);
		expect(count).toBe(1);
	});

	it('emit false', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.on(evt, handle);
		source.on(evt, () => false);
		source.on(evt, handle);
		source.on(evt, handle);

		source.emit(evt);
		expect(count).toBe(1);
	});

	it('emit listener false', () => {
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.on(handle);
		source.on(() => false);
		source.on(handle);
		source.on(handle);

		source.emit();
		expect(count).toBe(1);
	});

	it('emit args', () => {
		const evt = '[event-name]';
		const source = new Emitter();

		source.on((event: any, a: any, b: any, c: any) => {
			expect(event).toBe(evt);
			expect(a).toBe(1);
			expect(b).toBe(2);
			expect(c).toBe(3);
		});

		source.on(evt, (a: any, b: any, c: any) => {
			expect(a).toBe(1);
			expect(b).toBe(2);
			expect(c).toBe(3);
		});

		source.emit(evt, 1, 2, 3);
	});

	it('emit args direct', () => {
		const source = new Emitter();

		source.on((event: any) => {
			expect(event).toBe(undefined);
		});

		source.emit();
	});
});
