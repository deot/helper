import { IS_SERVER } from './_constants';

export const off = (
	el: HTMLElement, 
	event: string, 
	handler: (...args: unknown[]) => unknown, 
	options?: boolean | AddEventListenerOptions
) => { 
	if (IS_SERVER) return;
	el.removeEventListener(event, handler, options || false);
};