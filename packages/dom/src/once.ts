import { IS_SERVER } from './_constants';
import { on } from './on';

type AnyFunction = (...args: any[]) => any;
export const once = (
	el: HTMLElement,
	event: string,
	handler: AnyFunction,
	options?: boolean | AddEventListenerOptions
) => {
	if (IS_SERVER) return () => {};

	const off: AnyFunction;
	const handler$ = function (this: any, ...args: any[]) {
		handler && handler.apply(this, args);
		off();
	};

	off = on(el, event, handler$, options);

	return off;
};
