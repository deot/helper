/**
 * 函数组合
 * compose :: (B -> C) -> (A -> B) -> (A -> C)
 * 
 * 参考：https://raw.githubusercontent.com/reduxjs/redux/master/src/compose.ts
 * 1. 增加对this的支持
 * @param {Function[]} funcs ~
 * @returns {Function} ~
 */
export const compose = (...funcs: Function[]): Function => {
	if (funcs.length === 0) {
		return (arg: any) => arg;
	}
	if (funcs.length === 1) {
		return funcs[0];
	}
	return funcs.reduce((a, b) => {
		return function (this: any, ...args: any) {
			return a.call(this, b.apply(this, args));
		};
	});
};