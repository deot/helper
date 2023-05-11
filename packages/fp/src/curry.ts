const PLACEHOLDER = {};
const mergeArgs = (args: any[], nextArgs: any[]): any[] => {
	args = args.map(arg => {
		return arg === PLACEHOLDER && nextArgs.length
			? nextArgs.shift()
			: arg;
	});

	return args.concat(nextArgs);
};

export const curry = (fn: (...args: any[]) => any) => {
	return function curried(this: any, ...args: any[]) {
		if (args.length >= fn.length && !args.includes(PLACEHOLDER)) {
			return fn.apply(this, args);
		} else {
			return function (this: any, ...nextArgs: any[]) {
				const mergedArgs = mergeArgs(args, nextArgs);
				return curried.apply(this, mergedArgs);
			};
		}
	};
};

curry.placeholder = PLACEHOLDER;
