import type { ValidatorRule } from '../validator';
import { Validator } from '../validator';
import { number as numberPattern } from '../reg-exps';

interface RuleOptions {
	[key: string]: any;
	type?: 'number' | 'string' | 'array';
	range?: [number?, number?];
	required?: boolean;
	name?: string;
	pattern?: RegExp; 
	maxlength?: number;
	messages?: {
		required?: string;
		pattern?: string;
		type?: string;
		range?: string;
		maxlength?: string;
	};

	lang?: string; // 后期考虑，默认中文
}

export const create = (options?: RuleOptions): ValidatorRule[] => {
	options = {
		name: '值',
		...options
	};

	const { name, range = [], maxlength } = options;

	options.messages = {
		required: `${name} 必填`, 
		pattern: `请输入正确的 ${name}`,
		type: `${name} 类型错误`,
		range: `${name} 取值范围: ${range[0] || '*'}~${range[1] || '*'}`,
		maxlength: `${name} 长度不超过 ${maxlength}`,
		...options.messages,
	};

	const { messages, type, pattern, required } = options;
	const pass = (v: any) => !required && Validator.falsy.includes(v);

	const rules: ValidatorRule[] = [];

	if (required) {
		rules.push({
			message: messages.required,
			required
		});
	}

	if (pattern || type === 'number') {
		rules.push({
			message: messages.pattern,
			validate: (v: any) => {
				if (pass(v)) return true;
				return (pattern || numberPattern).test(v);
			}
		});
	}

	if (type) {
		rules.push({
			message: messages.type,
			validate: (v: any) => {
				if (pass(v)) return true;

				if (type === 'string') {
					return typeof v === 'string';
				}

				if (type === 'number') {
					return typeof v === 'number';
				}

				/* istanbul ignore else -- @preserve */
				if (type === 'array') {
					return Array.isArray(v);
				}

				/* istanbul ignore next -- @preserve */
				return true;
			}
		});
	}

	if (typeof range[0] !== 'undefined' || typeof range[1] !== 'undefined') {
		rules.push({
			message: messages.range,
			validate: (v: any) => {
				if (pass(v)) return true;

				let minPass = true;
				let maxPass = true;
				if (typeof range[0] !== 'undefined') {
					if (Array.isArray(v)) {
						minPass = v.length >= range[0];
					} else {
						minPass = v >= range[0];
					}
				}

				if (typeof range[1] !== 'undefined') {
					if (Array.isArray(v)) {
						maxPass = v.length <= range[1];
					} else {
						maxPass = v <= range[1];
					}
				}
				return minPass && maxPass;
			}
		});
	}

	if (typeof maxlength !== 'undefined') {
		rules.push({
			message: messages.maxlength,
			validate: (v: any) => {
				if (pass(v) || typeof v !== 'string') return true;

				return v.length <= maxlength;
			}
		});
	}

	return rules;
};