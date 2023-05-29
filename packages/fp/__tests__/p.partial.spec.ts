import * as FP from '@deot/helper-fp';

const { partial } = FP; // 同lodash, 不同于ramda（第二个参数是数组）
const { placeholder } = partial;
describe('partial.ts', () => {
	it('placeholder', () => {
		const greet = (greeting: string, name: string) => greeting + ' ' + name;

		let sayHelloTo = partial(greet, 'hello');
		let greetFred = partial(greet, placeholder, 'fred');

		expect(sayHelloTo('fred')).toBe('hello fred');
		expect(greetFred('hi')).toBe('hi fred');
	});

	it('this', () => {
		const sum = function (this: any, b: any, c: any) {
			return String(this.a) + String(b) + String(c);
		};
		const ctx1 = { a: '1' };
		const expected = '123';

		const g = partial(sum);

		// 以最后绑定的this为主
		expect(g.call(ctx1, 2, 3)).toBe(expected);
	});

	it('comb', () => {
		// eslint-disable-next-line max-len
		const greet = (salutation: string, title: string, firstName: string, lastName: string) => `${salutation}, ${title} ${firstName} ${lastName}!`;
		const sayHello = partial(greet, 'Hello');
		const sayHelloToMs = partial(sayHello, 'Ms.');

		expect(sayHelloToMs('Jane', 'Jones')).toBe('Hello, Ms. Jane Jones!');
	});
});
