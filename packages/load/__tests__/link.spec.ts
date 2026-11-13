import * as Load from '@deot/helper-load';

describe('link.ts', () => {
	const url = 'https://*.com/helper-load.css';
	const failUrl = 'https://*.com/helper-load.txt';
	let target: any;

	const originalCreate = document.createElement.bind(document);
	Object.defineProperty(document, 'createElement', {
		value() {
			target = originalCreate('_link_');
			setTimeout(() => {
				target.href && target.href.includes('.css')
					? target.onload && target.onload()
					: target.onerror && target.onerror('fake error');
			});

			return target;
		}
	});

	afterEach(() => {
		Load.link.cache.clear();
		document.head.innerHTML = '';
	});

	it('empty', async () => {
		expect.assertions(3);
		try {
			await Load.link('');
		} catch (e: any) {
			expect(e).toBeInstanceOf(Error);
			expect(Load.link.cache.size).toBe(0);
			expect(document.head.childElementCount).toBe(0);
		}
	});

	it('basic', async () => {
		await Load.link(url);
		await Load.link(url);
		await Load.link(url);
		await Load.link(url);

		expect(Load.link.cache.size).toBe(1);
		expect(target.rel).toBe('stylesheet');
		expect(document.head.childElementCount).toBe(1);
	});

	it('concurrent', async () => {
		const task = Load.link(url);

		expect(Load.link(url)).toBe(task);
		expect(await task).toBe(1);
	});

	it('error', async () => {
		expect.assertions(6);
		const task = Load.link(failUrl);
		expect(Load.link.cache.size).toBe(1);

		try {
			await task;
		} catch (e: any) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`[@deot/helper-load]: link 加载失败: ${failUrl}`);
			expect(e.cause).toBe('fake error');
			expect(Load.link.cache.size).toBe(0);
			expect(document.head.childElementCount).toBe(0);
		}
	});

	it('error, retry', async () => {
		const task1 = Load.link(failUrl);
		await expect(task1).rejects.toThrow();

		const task2 = Load.link(failUrl);
		expect(task2).not.toBe(task1);
		await expect(task2).rejects.toThrow();
	});

	it('attrs', async () => {
		await Load.link(url, {
			attrs: {
				crossorigin: 'anonymous',
				disabled: true,
				media: false
			}
		});

		expect(target.getAttribute('crossorigin')).toBe('anonymous');
		expect(target.getAttribute('disabled')).toBe('');
		expect(target.hasAttribute('media')).toBe(false);
	});
});
