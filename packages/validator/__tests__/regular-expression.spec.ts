import { RegExps } from '@deot/helper-validator';

describe('regular-expression.ts', () => {
	it('number', async () => {
		expect(RegExps.number.test('1')).toBe(true);
		expect(RegExps.number.test('1.11')).toBe(true);
		expect(RegExps.number.test('-1.11')).toBe(true);
		expect(RegExps.number.test('--1.11')).toBe(false);
		expect(RegExps.number.test('-.11')).toBe(false);

		expect(RegExps.number4.test('1111')).toBe(true);
		expect(RegExps.number4.test('11111')).toBe(false);
		expect(RegExps.number6.test('111111')).toBe(true);
		expect(RegExps.number6.test('1111111')).toBe(false);
	});

	it('integer', async () => {
		expect(RegExps.integer.test('1')).toBe(true);
		expect(RegExps.integer.test('10')).toBe(true);
		expect(RegExps.integer.test('-1')).toBe(false);
		expect(RegExps.integer.test('0')).toBe(false);
	});

	it('email', async () => {
		expect(RegExps.email.test('xx@xx.com')).toBe(true);
		expect(RegExps.email.test('1@xx.b')).toBe(true);
		expect(RegExps.email.test('1@xx')).toBe(false);
		expect(RegExps.email.test('@xx.com')).toBe(false);
	});

	it('date', async () => {
		expect(RegExps.date.test('1111-11-11')).toBe(true);
		expect(RegExps.date.test('1111/11/11')).toBe(true);
		expect(RegExps.date.test('1111.11.11')).toBe(true);
		expect(RegExps.date.test('11111111')).toBe(false);
		expect(RegExps.date.test('1111/11-11')).toBe(false);
	});

	it('time', async () => {
		expect(RegExps.time.test('1111-11-11 11:11')).toBe(true);
		expect(RegExps.time.test('1111/11/11/11/11')).toBe(false);
	});

	it('identity', async () => {
		expect(RegExps.identity.test('abcdefg')).toBe(true);
		expect(RegExps.identity.test('12345')).toBe(false);
	});

	it('price', async () => {
		expect(RegExps.price.test('1.11')).toBe(true);
		expect(RegExps.price.test('0.11')).toBe(true);
		expect(RegExps.price.test('1.111')).toBe(false);
		expect(RegExps.price.test('11223344556.111')).toBe(false);
	});

	it('mobile', async () => {
		expect(RegExps.mobile.test('18888888888')).toBe(true);
		expect(RegExps.mobile.test('188888888888')).toBe(false);
		expect(RegExps.mobile.test('12888888888')).toBe(false);
	});

	it('tel', async () => {
		expect(RegExps.tel.test('0888-88888888')).toBe(true);
		expect(RegExps.tel.test('1888-88888888')).toBe(false);
		expect(RegExps.tel.test('12345678')).toBe(false);
	});

	it('wechat', async () => {
		expect(RegExps.wechat.test('hypercoder')).toBe(true);
		expect(RegExps.wechat.test('1234')).toBe(false);
		expect(RegExps.wechat.test('abcd')).toBe(false);
	});

	it('name', async () => {
		expect(RegExps.name.test('是')).toBe(true);
		expect(RegExps.name.test('0')).toBe(true);
		expect(RegExps.name.test('a')).toBe(true);
		expect(RegExps.name.test('_')).toBe(true);
		expect(RegExps.name.test('')).toBe(false);
		expect(RegExps.name.test('1️⃣')).toBe(false);
		expect(RegExps.name.test('·')).toBe(false);
	});

	it('dataURL', async () => {
		expect(RegExps.dataURL.test('data:image/png;base64,aa==')).toBe(true);
		expect(RegExps.dataURL.test('')).toBe(false);
		expect(RegExps.dataURL.test('1️⃣')).toBe(false);
		expect(RegExps.dataURL.test('·')).toBe(false);
	});

	it('url', async () => {
		expect(RegExps.url.test('https://xx.com')).toBe(true);
		expect(RegExps.url.test('http://xx.com')).toBe(true);
		expect(RegExps.url.test('xx.com')).toBe(false);
	});
});
