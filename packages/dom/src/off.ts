import { IS_SERVER } from './_constants';

export const off = (
	el: HTMLElement, 
	event: string, 
	handler: (...args: any[]) => any, 
	options?: boolean | AddEventListenerOptions
) => { 
	if (IS_SERVER) return;
	el.removeEventListener(event, handler, options || false);
};