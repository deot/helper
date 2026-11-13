import * as Utils from '@deot/helper-utils';

describe('get-prop-by-path.ts', () => {
	const target = { a: { b: { c: 1 } } };

	it('basic', () => {
		const result = Utils.getPropByPath(target, 'a.b.c');

		expect(result.v).toBe(1);
		expect(result.k).toBe('c');
		expect(result.o).toEqual({ c: 1 });
	});

	it('error', () => {
		expect.assertions(1);
		const target1 = { a: { b: { c: {} } } };
		try {
			Utils.getPropByPath(target1, 'a.b.c.d.f');
		} catch (e: any) {
			expect(e.message).toMatch('无效路径');
		}
	});

	it('方括号路径 / 末级属性可不存在', () => {
		const source = { users: [{ name: 'Deot' }] };
		const result = Utils.getPropByPath(source, 'users[0].name');

		expect(result.o).toBe(source.users[0]);
		expect(result.k).toBe('name');
		expect(result.v).toBe('Deot');
		expect(Utils.getPropByPath(source, 'users[0].missing').v).toBe(undefined);
		expect(Utils.getPropByPath({ a: 'str' }, 'a.length').v).toBe(3);
	});

	it('末级所属对象为 null / undefined', () => {
		expect(() => Utils.getPropByPath({ a: null }, 'a.b')).toThrow('无效路径');
		expect(() => Utils.getPropByPath({ a: undefined }, 'a.b')).toThrow('无效路径');
		expect(() => Utils.getPropByPath({ a: { b: null } }, 'a.b.c')).toThrow('无效路径');
	});

	it('不允许经由原型链访问', () => {
		expect(() => Utils.getPropByPath({}, '__proto__.polluted')).toThrow('无效路径');
		expect(() => Utils.getPropByPath({}, 'constructor.prototype.polluted')).toThrow('无效路径');
		expect(() => Utils.getPropByPath({ fn() {} }, 'fn.prototype.polluted')).toThrow('无效路径');
		expect(() => Utils.getPropByPath({ a: {} }, 'a.__proto__')).toThrow('无效路径');
		expect(() => Utils.getPropByPath(JSON.parse('{"__proto__":{"a":1}}'), '__proto__.a')).toThrow('无效路径');
		expect(({} as any).polluted).toBe(undefined);
	});

	it('自有的 constructor / prototype 属性可正常访问', () => {
		const source = { constructor: { prototype: { a: 1 } } };

		expect(Utils.getPropByPath(source, 'constructor.prototype.a').v).toBe(1);
		expect(Utils.getPropByPath({}, 'constructor').v).toBe(Object);
	});

	it('原型上的访问器属性', () => {
		class A {
			get child() {
				return { value: 1 };
			}
		}

		expect(Utils.getPropByPath(new A(), 'child.value').v).toBe(1);
	});
});
