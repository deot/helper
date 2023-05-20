import { curry } from './curry';

// catchP :: f -> Promise -> Promise
export const tryCatch = curry(function (f, promise) {
	return promise.catch(f);
});