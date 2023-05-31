import { IS_SERVER } from '@deot/helper-shared';
import type { AnyFunction } from '@deot/helper-shared';

export const off = (
	el: HTMLElement, 
	event: string, 
	handler: AnyFunction, 
	options?: boolean | AddEventListenerOptions
) => { 
	if (IS_SERVER) return;
	el.removeEventListener(event, handler, options || false);
};