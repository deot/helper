type Constructor<T> = abstract new (...args: any[]) => T;

/**
 * 传入构造函数时使用 instanceof；
 * 传入字符串时比较 Object.prototype.toString 的标签，可跨 realm（如 iframe）
 * @param v 待判断的值
 * @param constructor 构造函数或标签名
 * @returns 是否匹配
 */
export function instance<T>(v: any, constructor: Constructor<T>): v is T;
export function instance(v: any, constructor: Function | string): boolean;
export function instance(v: any, constructor: Function | string) {
	return typeof constructor === 'function'
		? v instanceof constructor
		: Object.prototype.toString.call(v) === `[object ${constructor}]`;
}
