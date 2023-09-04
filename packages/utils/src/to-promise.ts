interface IPromise<T = any, K = any> {
	then: (resolve: (a: T) => void, reject: (b: K) => void) => Promise<any>;
	catch: (callback?: (b: K) => void) => Promise<any>;
	finally: (callback?: () => void) => Promise<any>;
}

export const toPromise = <T extends {}, K = any>(target: T, promise: Promise<K>): T & IPromise<K> => {
	const instance = target as (T & IPromise<K>);
	const target$ = target as any;

	if (!target$ || target$.then || target$.catch || target$.finally) {
		throw new Error(`TypeError`);
	}

	instance.then = (resolve, reject) => promise.then(resolve, reject);
	instance.catch = (callback) => promise.catch(callback);
	instance.finally = (callback) => promise.finally(callback);

	return instance;
};