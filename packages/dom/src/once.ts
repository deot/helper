import { IS_SERVER } from './_constants';
import { on } from './on';

type AnyFunction = (...args: any[]) => any;
export const once = (
	el: EventTarget,
	event: string,
	handler: AnyFunction,
	options?: boolean | AddEventListenerOptions
) => {
	if (IS_SERVER) return () => {};

	const handler$ = function (this: any, ...args: any[]) {
		// 先解绑再执行：handler 抛错或在内部再次触发同一事件时也只执行一次
		off();
		return handler && handler.apply(this, args);
	};

	const off = on(el, event, handler$, options);

	return off;
};
