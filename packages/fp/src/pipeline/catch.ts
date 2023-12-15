import { curry } from './curry';

// catchP :: f -> Promise -> Promise
export const catch$ = curry(function (f, promise) {
	return promise.catch(f);
});
