import * as Load from '@deot/helper-load';

describe('script.ts', () => {
	const url = 'https://*.com/helper-load.js';

	const originalCreate = document.createElement.bind(document);
	Object.defineProperty(document, 'createElement', {
		value() {
			const target: any = originalCreate(`_script_`);
			setTimeout(() => {
				target.src && target.src.includes('.js')
					? target.onload && target.onload()
					: target.onerror && target.onerror('fake error');
			});

			return target;
		}
	});

	Object.defineProperty(globalThis, 'XMLHttpRequest', {
		value: class XMLHttpRequest {
			open() {}

			send() {}
		}
	});

	afterEach(() => {
		Load.script.cache.clear();
	});

	it('empty', async () => {
		expect.assertions(1);
		try {
			await Load.script('');
		} catch {
			expect(Load.script.cache.size).toBe(0);
		}
	});

	it('basic', async () => {
		await Load.script(url);
		await Load.script(url);
		await Load.script(url);
		await Load.script(url);

		expect(Load.script.cache.size).toBe(1);
	});

	it('sync', async () => {
		await Load.script(url, { async: false });

		expect(Load.script.cache.size).toBe(1);
	});
});
