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
		expect(source.events[evt].length).toBe(1);
		source.off();
		expect(source.listeners.length).toBe(0);
	});

	it('off by event', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.on(evt, handle);
		expect(source.events[evt].length).toBe(1);
		source.off(evt);
		expect(source.listeners.length).toBe(0);
	});

	it('off by event & callback', () => {
		const evt = '[event-name]';
		const source = new Emitter();
		let count = 0;
		const handle = () => count++;

		source.on(evt, handle);
		expect(source.events[evt].length).toBe(1);
		source.off(evt, handle);
		expect(source.listeners.length).toBe(0);
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
