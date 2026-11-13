/**
 * seq（S-组合子)
 * 以两个或更多的函数作为参数并返回一个新的函数
 * 会用相同的值顺序调用所有这些函数
 */

export const sequence = <T = any>(...funcs: Array<(x: T) => any>) => {
	return (x?: T) => {
		funcs.forEach(fn => fn(x as T));
	};
};
