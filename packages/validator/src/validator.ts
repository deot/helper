/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-promise-reject-errors */

type Pattern = RegExp | string;
type Path = number | string;

interface InternalValidateError {
	message: string | ((e: ValidateError) => string);
	value: any;
	field: string;
	paths: Path[];
}

export interface ValidateContext {
	source: Record<any, any>;

	field: string;

	// 用于 object / array 在当前source的寻址
	paths: Path[];

	original: any;
}
export type Transform = (value: any, context: ValidateContext) => any;
export type Validate = (value: any, context: ValidateContext) => Promise<any> | boolean | string | void;

export interface ValidateOptions {
	// 规则的名称需要是trigger。如果为空，将验证所有规则
	fields?: string[];
	// 当第一个验证规则生成错误时，停止处理
	first?: boolean;

	// 内部使用，用于数组是记录path
	_index?: number;

	original?: any;
}

export interface ValidateError {
	message?: string;
	value: any;
	field: string;
	paths: Path[];
}

export interface ValidatorRule {
	[key: string]: any;
	enum?: (string | number | boolean | null | undefined)[];
	required?: boolean;
	message?: string | ((e: ValidateError) => string);
	pattern?: Pattern;
	transform?: Transform;
	validate?: Validate;
	fields?: ValidatorRules;
}

export type ValidatorMutipleRule = ValidatorRule | Validate | Pattern | boolean;
export type ValidatorRules = Record<string, ValidatorMutipleRule | ValidatorMutipleRule[]>;

export class Validator {
	static falsy = [undefined, null, ''];

	rules: Record<string, ValidatorRule[]> = {};

	paths: Path[];

	original: any;

	constructor(rules?: ValidatorRules, paths?: Path[], original?: any) {
		this.updateRules(rules);
		this.paths = paths || [];
		this.original = original;
	}

	/**
	 * 构建统一规则类型的Rule[], 也可供外部使用
	 * @param rules ~
	 */
	updateRules(rules?: ValidatorRules) {
		if (!rules) return;

		Object.keys(rules).forEach((field) => {
			const rule = rules[field];
			this.rules[field] = (Array.isArray(rule) ? rule : [rule]).map((rule$) => {
				// Validate
				if (typeof rule$ === 'function') {
					return { validate: rule$ };
				}
				// Pattern
				if (typeof rule$ === 'string' || rule$ instanceof RegExp) {
					rule$ = { pattern: rule$ };
				}

				// boolean
				if (typeof rule$ === 'boolean') {
					rule$ = { required: rule$ };
				}

				// Rule
				const { validate, pattern, required, enum: enum$ = [] } = rule$;

				if (validate && rule$.fields) {
					rule$.fields = undefined;
				}
				// pattern
				if (!validate && pattern) {
					const pattern$ = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
					return {
						...rule$,
						validate: v => pattern$.test(v)
					};
				}

				// required, 注意v = 0 时，是存在值的，这里只认定falsy中的undefined, null和''
				if (!validate && required) {
					return {
						...rule$,
						validate: v => (Array.isArray(v)
							? (!!v.length && v.every(j => Validator.falsy.every(i => j !== i)))
							: Validator.falsy.every(i => v !== i))
					};
				}

				// enum
				if (!validate && enum$.length) {
					return {
						...rule$,
						validate: v => enum$.some(i => v === i)
					};
				}

				return rule$;
			});
		});
	}

	async validate(source: Record<string, any>, options?: ValidateOptions): Promise<any> {
		options = options || {};

		if (!Object.keys(this.rules).length) {
			return;
		}

		const needCheckFields = options.fields || Object.keys(this.rules);
		const errors: InternalValidateError[] = [];

		for (let i = 0; i < needCheckFields.length; i++) {
			const field = needCheckFields[i];
			const rules = this.rules[field];
			const value = source[field];
			const original = this.original;

			for (let j = 0; j < rules.length; j++) {
				const rule = rules[j];
				const { validate = () => {}, transform = (x: any) => x, fields: fields$ } = rule;

				const paths = [...this.paths, field];
				if (typeof options._index !== 'undefined') {
					paths.splice(paths.length - 1, 0, options._index);
				}

				const value$ = transform!(value, { field, source, paths, original });

				if (fields$) {
					const isArray = Array.isArray(value$);
					const value$$ = isArray ? value$ : [value$];
					if (value$$.every((v: any) => v && typeof v === 'object')) {
						const validator = new Validator(fields$, paths);
						for (let k = 0; k < value$$.length; k++) {
							try {
								await validator.validate(value$$[k], { _index: isArray ? k : undefined, first: options.first, original });
							} catch (errors$: any) {
								errors.push(...errors$);
								if (errors$.length && options.first) break;
							}
						}
						continue;
					}
				}

				let result = validate!(value$, { field, source, paths, original });
				let message$ = '';
				if (result instanceof Promise) {
					try {
						await result;
					} catch (e: any) {
						result = false;
						message$ = e.message || e;
					}
				} else if (typeof result === 'string') {
					message$ = result;
					result = false;
				}

				if (result === false) {
					errors.push({
						paths,
						message: message$ || rule.message || '',
						field,
						value: value$
					});
					if (options.first) break;
				}
			}
			if (errors.length && options.first) break;
		}

		if (errors.length) {
			const errors$ = errors.map((i) => {
				const { message, ...extra } = i;
				i.message = typeof message === 'function' ? message(extra) : message;
				return i;
			}) as ValidateError[];
			return Promise.reject(errors$);
		}
	}
}
