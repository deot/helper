import { curry } from './curry';

// then :: f -> Thenable -> Thenable
// eslint-disable-next-line no-restricted-exports
export const then = curry(function (f, thenable) {
	return thenable.then(f);
});
