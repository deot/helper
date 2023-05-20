import { curry } from './curry';

// then :: f -> Thenable -> Thenable
export const tryCatch = curry(function (f, thenable) {
	return thenable.then(f);
});
