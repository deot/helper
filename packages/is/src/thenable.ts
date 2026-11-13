import { object } from './object';
import { fn } from './fn';

export const thenable = (v?: any): v is PromiseLike<any> => {
	return (object(v) || fn(v)) && fn((v as any).then);
};
