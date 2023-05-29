export const mergeArgs = (
	baseArgs: any[], 
	nextArgs: any[],
	placeholder: any
): any[] => {
	baseArgs = baseArgs.map(arg => {
		return arg === placeholder && nextArgs.length
			? nextArgs.shift()
			: arg;
	});
	return baseArgs.concat(nextArgs);
};
