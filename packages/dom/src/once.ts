import { IS_SERVER } from '@deot/helper-shared';
import type { AnyFunction } from '@deot/helper-shared';
import { on } from './on';

export const once = (
	el: HTMLElement, 
	event: string, 
	handler: AnyFunction, 
	options?: boolean | AddEventListenerOptions
) => { 
	if (IS_SERVER) return (() => {});

	let off: AnyFunction;
	let handler$ = function (this: any, ...args: any[]) {
		handler && handler.apply(this, args);
		off();
	};

	off = on(el, event, handler$, options);

	return off;
};