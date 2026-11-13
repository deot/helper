import * as Is from '@deot/helper-is';

describe('types', () => {
	const unknown$ = {} as unknown;
	const any$ = { a: { b: 1 } } as any;

	it('原始类型', () => {
		if (Is.string(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<string>();
		if (Is.number(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<number>();
		if (Is.bool(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<boolean>();
		if (Is.symbol(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<symbol>();
		if (Is.bigint(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<bigint>();
		if (Is.undef(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<undefined>();
		if (Is.nil(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<null | undefined>();
	});

	it('联合类型收窄', () => {
		const value = '' as string | number | null | undefined;
		if (Is.string(value)) {
			expectTypeOf(value).toEqualTypeOf<string>();
		} else {
			expectTypeOf(value).toEqualTypeOf<number | null | undefined>();
		}

		if (!Is.nil(value)) {
			expectTypeOf(value).toEqualTypeOf<string | number>();
		}

		const list = [] as string | string[];
		if (Is.array(list)) expectTypeOf(list).toEqualTypeOf<string[]>();

		const callback = (() => 1) as (() => number) | string;
		if (Is.fn(callback)) expectTypeOf(callback).toEqualTypeOf<() => number>();
	});

	it('内建对象', () => {
		if (Is.array(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<any[]>();
		if (Is.fn(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<Function>();
		if (Is.date(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<Date>();
		if (Is.regexp(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<RegExp>();
		if (Is.arrayBuffer(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<ArrayBuffer>();
		if (Is.arrayBufferView(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<ArrayBufferView>();
		if (Is.typedArray(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<Is.TypedArray>();
		if (Is.blob(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<Blob>();
		if (Is.file(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<File>();
		if (Is.files(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<FileList>();
		if (Is.params(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<URLSearchParams>();
		if (Is.formEl(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<HTMLFormElement>();
		if (Is.formData(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<FormData>();
		if (Is.thenable(unknown$)) expectTypeOf(unknown$).toEqualTypeOf<PromiseLike<any>>();
	});

	it('对象类收窄后仍可访问任意属性', () => {
		if (Is.object(unknown$)) expectTypeOf(unknown$.any).toBeAny();
		if (Is.plainObject(unknown$)) expectTypeOf(unknown$.any).toBeAny();
		if (Is.stream(unknown$)) {
			expectTypeOf(unknown$.pipe).toEqualTypeOf<Function>();
			expectTypeOf(unknown$.any).toBeAny();
		}
	});

	it('入参为 any 时，函数与对象不影响原有的属性访问', () => {
		if (Is.fn(any$)) expectTypeOf(any$).toBeAny();
		if (Is.object(any$)) expectTypeOf(any$.a.b).toBeAny();
		if (Is.plainObject(any$)) expectTypeOf(any$.a.b).toBeAny();
	});

	it('instance', () => {
		class A {
			a = 1;
		}

		if (Is.instance(unknown$, A)) expectTypeOf(unknown$).toEqualTypeOf<A>();
		if (Is.instance(unknown$, Date)) expectTypeOf(unknown$).toEqualTypeOf<Date>();
		// 字符串标签无法推断类型
		if (Is.instance(unknown$, 'Date')) expectTypeOf(unknown$).toBeUnknown();
		expectTypeOf(Is.instance(unknown$, 'Date')).toEqualTypeOf<boolean>();
	});

	it('保持 boolean', () => {
		expectTypeOf(Is.type(unknown$, 'string')).toEqualTypeOf<boolean>();
		expectTypeOf(Is.buffer(unknown$)).toEqualTypeOf<boolean>();
	});
});
