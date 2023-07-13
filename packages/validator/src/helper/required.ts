import type { ValidatorRule } from './validator';

export const required = (message: string): ValidatorRule => {
	return [
		{
			message,
			required: true
		}
	];
};