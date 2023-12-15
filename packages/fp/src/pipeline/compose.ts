type Key = 'reduce' | 'reduceRight';
const factory = (key: Key) => (...funcs: Function[]): Function => {
	if (funcs.length === 0) {
		return (arg: any) => arg;
	}
	if (funcs.length === 1) {
		return funcs[0];
	}

	// 第一个执行的函数可以接受多个值，后面的仅传递一个值
	return funcs[key]((a, b) => {
		return function (this: any, ...args: any) {
			return a.call(this, b.apply(this, args));
		};
	});
};

/**
 * 函数组合
 * compose :: (B -> C) -> (A -> B) -> (A -> C)
 * 中间件的应用
 *
 * 参考：https://raw.githubusercontent.com/reduxjs/redux/master/src/compose.ts
 * 增加对this的支持
 * @param {Function[]} funcs ~
 * @returns {Function} ~
 */
export const compose = factory('reduce');

/**
 * 函数管道
 * @param {Function[]} funcs ~
 * @returns {Function} ~
 */
export const pipe = factory('reduceRight');
