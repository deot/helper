import { Utils as t } from '@deot/dev-test';
import * as Utils from '@deot/helper-utils';
// import * as Utils from 'lodash';

describe('debounce.ts', () => {
	it('default(trailing)', async () => {
		expect.assertions(1);
		const debounce = Utils.debounce((v: number) => {
			expect(v).toBe(3);
		}, 10);

		debounce(1);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(3);

		await t.sleep(30);
	});

	it('leading + trailing', async () => {
		expect.assertions(2);
		let next = 1;
		const debounce = Utils.debounce((v: number) => {
			expect(v).toBe(next);
			next = 3;
		}, 10, { leading: true });

		debounce(1);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(3);

		await t.sleep(30);
	});

	it('leading', async () => {
		expect.assertions(1);
		const debounce = Utils.debounce((v: number) => {
			expect(v).toBe(1);
		}, 10, { leading: true, trailing: false });

		debounce(1);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(3);

		await t.sleep(30);
	});

	it('none', async () => {
		expect.assertions(0);
		const debounce = Utils.debounce((v: number) => {
			expect(v).toBe(1);
		}, 10, { leading: false, trailing: false });

		debounce(1);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(3);

		await t.sleep(30);
	});

	it('cancel', async () => {
		expect.assertions(0);
		const debounce = Utils.debounce((v: number) => {
			expect(v).toBe(1);
		}, 10, { leading: false, trailing: false });

		debounce(1);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(3);

		debounce.cancel();
		debounce.flush();

		await t.sleep(30);
	});

	it('flush', async () => {
		expect.assertions(1);
		let next = 3;
		const debounce = Utils.debounce((v: number) => {
			expect(v).toBe(next);
			next++;
		}, 10);

		debounce(1);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(2);
		debounce(3);

		debounce.flush();
		debounce.flush(); // 不会再执行
		debounce.flush(); // 不会再执行
		debounce.flush(); // 不会再执行
		debounce.flush(); // 不会再执行

		await t.sleep(30);
	});

	it('types', () => {
		const calls: string[] = [];
		const options: Utils.DebounceOptions = { leading: true, trailing: false };
		const debounce: Utils.Debounced<(a: number, b: string) => void> = Utils.debounce((a: number, b: string) => {
			calls.push(`${a}${b}`);
		}, 10, options);

		debounce(1, '2');
		// @ts-expect-error 参数类型与原函数不一致
		debounce('1', 2);
		// @ts-expect-error 参数个数与原函数不一致
		debounce(1);
		debounce.cancel();

		// 以 Function 声明的入参仍可使用，参数不做约束
		const loose: Function = (v: string) => calls.push(v);
		const debounce$ = Utils.debounce(loose, 10, options);
		debounce$('loose');
		debounce$.cancel();

		expect(calls).toEqual(['12', 'loose']);
	});
});
