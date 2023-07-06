import { IS_SERVER } from './_constants';
import type { AnyFunction } from '@deot/helper-shared';

export const on = (
	el: HTMLElement, 
	event: string, 
	handler: (...args: unknown[]) => unknown, 
	options?: boolean | AddEventListenerOptions
) => { 
	if (IS_SERVER) return (() => {});

	el.addEventListener(event, handler, options || false);

	return () => {
		el.removeEventListener(event, handler, options || false);
	};
};