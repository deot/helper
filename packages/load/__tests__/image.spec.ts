import * as Load from '@deot/helper-load';

describe('image.ts', () => {
	const url = 'https://*.com/helper-load.png';
	const failUrl = 'https://*.com/helper-load.txt';
	const mock = {
		// 接下来有多少次加载会失败（即使地址合法）
		failures: 0,
		instances: [] as any[]
	};

	Object.defineProperty(globalThis, 'Image', {
		value: class Image {
			src!: any;

			crossOrigin!: any;

			naturalWidth = 1;

			naturalHeight = 2;

			onload!: any;

			onerror!: any;

			constructor() {
				mock.instances.push(this);
				setTimeout(() => {
					const isFailed = mock.failures > 0;
					isFailed && mock.failures--;

					!isFailed && this.src && this.src.includes('.png')
						? this.onload && this.onload()
						: this.onerror && this.onerror('fake error');
				});
			}
		}
	});

	afterEach(() => {
		Load.image.cache.clear();
		mock.failures = 0;
		mock.instances = [];
	});

	it('empty', async () => {
		expect.assertions(3);
		try {
			await Load.image('');
		} catch (e: any) {
			expect(e).toBeInstanceOf(Error);
			expect(Load.image.cache.size).toBe(0);
			expect(mock.instances.length).toBe(0);
		}
	});

	it('basic', async () => {
		await Load.image(url);
		await Load.image(url);
		await Load.image(url);
		const result = await Load.image(url);

		expect(Load.image.cache.size).toBe(1);
		expect(mock.instances.length).toBe(1);
		expect(result).toEqual({ source: url, width: 1, height: 2 });
	});

	it('concurrent', async () => {
		const task = Load.image(url);

		expect(Load.image(url)).toBe(task);
		await task;
	});

	it('error', async () => {
		expect.assertions(5);
		const task = Load.image(failUrl);
		expect(Load.image.cache.size).toBe(1);

		try {
			await task;
		} catch (e: any) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toBe(`[@deot/helper-load]: image 加载失败: ${failUrl}`);
			expect(e.cause).toBe('fake error');
			expect(Load.image.cache.size).toBe(0);
		}
	});

	it('crossOrigin', async () => {
		await Load.image(url);
		expect(mock.instances[0].crossOrigin).toBe(undefined);

		Load.image.cache.clear();
		await Load.image(url, { crossOrigin: 'anonymous' });
		expect(mock.instances[1].crossOrigin).toBe('anonymous');
	});

	it('maxTries', async () => {
		mock.failures = 2;
		const result = await Load.image(url, { maxTries: 3 });

		expect(result!.source).toBe(url);
		expect(mock.instances.length).toBe(3);
		expect(Load.image.cache.size).toBe(1);
	});

	it('maxTries, exhausted', async () => {
		expect.assertions(3);
		mock.failures = 2;

		try {
			await Load.image(url, { maxTries: 2 });
		} catch (e: any) {
			expect(e.cause).toBe('fake error');
			expect(mock.instances.length).toBe(2);
			expect(Load.image.cache.size).toBe(0);
		}
	});
});
