import * as Load from '@deot/helper-load';

describe('script.ts', () => {
	const url = 'https://*.com/helper-load.js';
	const failUrl = 'https://*.com/helper-load.txt';
	const xhr = {
		status: 200,
		error: null as Error | null
	};

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
			status = xhr.status;

			responseText = 'var a = 1;';

			open() {}

			send() {
				if (xhr.error) throw xhr.error;
			}
		}
	});

	afterEach(() => {
		Load.script.cache.clear();
		document.head.innerHTML = '';
		xhr.status = 200;
		xhr.error = null;
	});

	it('empty', async () => {
		expect.assertions(3);
		try {
			await Load.script('');
		} catch (e: any) {
			expect(e).toBeInstanceOf(Error);
			expect(Load.script.cache.size).toBe(0);
			expect(document.head.childElementCount).toBe(0);
		}
	});

	it('basic', async () => {
		await Load.script(url);
		await Load.script(url);
		await Load.script(url);
		await Load.script(url);

		expect(Load.script.cache.size).toBe(1);
		expect(document.head.childElementCount).toBe(1);
	});

	it('concurrent', async () => {
		const task = Load.script(url);

		expect(Load.script(url)).toBe(task);
		expect(await task).toBe(1);
	});

	it('error', async () => {
		expect.assertions(6);
		const task = Load.script(failUrl);
		expect(Load.script.cache.size).toBe(1);

		try {
			await task;
		} catch (e: any) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`[@deot/helper-load]: script 加载失败: ${failUrl}`);
			expect(e.cause).toBe('fake error');
			expect(Load.script.cache.size).toBe(0);
			expect(document.head.childElementCount).toBe(0);
		}
	});

	it('error, retry', async () => {
		const task1 = Load.script(failUrl);
		await expect(task1).rejects.toThrow();

		const task2 = Load.script(failUrl);
		expect(task2).not.toBe(task1);
		await expect(task2).rejects.toThrow();
	});

	it('error, keep newer cache', async () => {
		expect.assertions(2);
		const task1 = Load.script(failUrl);
		Load.script.cache.clear();
		const task2 = Load.script(failUrl);

		try {
			await task1;
		} catch {
			expect(Load.script.cache.get(failUrl)).toBe(task2);
		}

		await expect(task2).rejects.toThrow();
	});

	it('attrs', async () => {
		await Load.script(url, {
			attrs: {
				'crossorigin': 'anonymous',
				'nomodule': true,
				'defer': false,
				'data-any': undefined
			}
		});

		const el = document.head.lastElementChild!;
		expect(el.getAttribute('crossorigin')).toBe('anonymous');
		expect(el.getAttribute('nomodule')).toBe('');
		expect(el.hasAttribute('defer')).toBe(false);
		expect(el.hasAttribute('data-any')).toBe(false);
	});

	it('sync', async () => {
		await Load.script(url, { async: false });

		expect(Load.script.cache.size).toBe(1);
		expect((document.head.lastElementChild as any).text).toBe('var a = 1;');
	});

	it('sync, not modified', async () => {
		xhr.status = 304;
		await Load.script(url, { async: false });

		expect(Load.script.cache.size).toBe(1);
	});

	it('sync, status error', async () => {
		expect.assertions(4);
		xhr.status = 404;

		try {
			await Load.script(url, { async: false });
		} catch (e: any) {
			expect(e.message).toMatch(url);
			expect(e.cause.message).toBe('HTTP 404');
			expect(Load.script.cache.size).toBe(0);
			expect(document.head.childElementCount).toBe(0);
		}
	});

	it('sync, network error', async () => {
		expect.assertions(2);
		xhr.error = new Error('network');

		try {
			await Load.script(url, { async: false });
		} catch (e: any) {
			expect(e.cause).toBe(xhr.error);
			expect(Load.script.cache.size).toBe(0);
		}
	});
});
