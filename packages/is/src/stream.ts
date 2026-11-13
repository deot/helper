import { object } from './object';
import { fn } from './fn';

export const stream = (v?: any): v is Record<PropertyKey, any> & { pipe: Function } => {
	return object(v) && fn(v.pipe);
};
