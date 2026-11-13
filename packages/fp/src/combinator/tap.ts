import { curry } from '../pipeline';

export interface TapFn {
	<T>(fn: (x: T) => any, x: T): T;
	<T>(fn: (x: T) => any): (x: T) => T;
	(...args: any[]): any;
}

/**
 * tap（K-组合子）
 * 能够将无返回值的函数（例如记录日志、修改文件或HTML页面的函数）
 * 嵌入函数组合中，而无须创建其他的代码
 * tap :: (a -> *) -> a -> a
 */

export const tap: TapFn = curry((fn: Function, x: any) => {
	fn(x);
	return x;
});
