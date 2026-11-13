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

export type ValidatorMultipleRule = ValidatorRule | Validate | Pattern | boolean;

/**
 * @deprecated 拼写错误，请使用 `ValidatorMultipleRule`
 */
export type ValidatorMutipleRule = ValidatorMultipleRule;
export type ValidatorRules = Record<string, ValidatorMultipleRule | ValidatorMultipleRule[]>;

const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key);
const isObject = (v: any) => !!v && typeof v === 'object';

// fields只作用于对象或非空的对象数组，其余交给validate（如required）
const isNestable = (v: any) => (Array.isArray(v) ? (!!v.length && v.every(isObject)) : isObject(v));

// 带g/y的正则test会记录lastIndex，同一个值的结果会交替变化
const toRegExp = (pattern: Pattern) => {
	if (typeof pattern === 'string') return new RegExp(pattern);
	return /[gy]/.test(pattern.flags)
		? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''))
		: pattern;
};

// throw / reject的内容可能是Error、字符串或空，其余情况交由rule.message
const toMessage = (e: any): string => {
	if (typeof e === 'string') return e;
	return e && typeof e.message === 'string' ? e.message : '';
};

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

				// Rule，拷贝一份，不改动外部传入的规则
				const rule$$: ValidatorRule = { ...rule$ };
				const { validate, pattern, required, enum: enum$ = [] } = rule$$;

				// 自定义validate优先，fields和内置规则不再生效
				if (validate) {
					rule$$.fields = undefined;
					return rule$$;
				}

				// 内置规则可以同时声明，需全部通过
				const checks: ((v: any) => boolean)[] = [];

				// required, 注意v = 0 时，是存在值的，这里只认定falsy中的undefined, null和''
				if (required) {
					checks.push(v => (Array.isArray(v)
						? (!!v.length && v.every(j => Validator.falsy.every(i => j !== i)))
						: Validator.falsy.every(i => v !== i)));
				}

				// pattern, null / undefined按空字符串处理，避免匹配到'null' / 'undefined'
				if (pattern) {
					const pattern$ = toRegExp(pattern);
					checks.push(v => pattern$.test(v ?? ''));
				}

				// enum
				if (enum$.length) {
					checks.push(v => enum$.some(i => v === i));
				}

				if (checks.length) {
					rule$$.validate = v => checks.every(check => check(v));
				}

				return rule$$;
			});
		});
	}

	async validate(source: Record<string, any>, options?: ValidateOptions): Promise<void> {
		options = options || {};
		source = source || {};

		// 没有规则的字段直接跳过（含原型上的键）
		const needCheckFields = (options.fields || Object.keys(this.rules))
			.filter(field => hasOwn(this.rules, field));

		if (!needCheckFields.length) {
			return;
		}

		const original = typeof options.original === 'undefined'
			? this.original
			: options.original;
		const errors: InternalValidateError[] = [];

		for (let i = 0; i < needCheckFields.length; i++) {
			const field = needCheckFields[i];
			const rules = this.rules[field];
			const value = source[field];

			for (let j = 0; j < rules.length; j++) {
				const rule = rules[j];
				const { validate, transform, fields: fields$ } = rule;

				const paths = [...this.paths, field];
				if (typeof options._index !== 'undefined') {
					paths.splice(paths.length - 1, 0, options._index);
				}

				let value$ = value;
				let result: any;
				let message$ = '';

				// 同步抛错与异步reject一致，都视为当前规则未通过
				try {
					if (transform) {
						value$ = transform(value, { field, source, paths, original });
					}

					if (fields$ && isNestable(value$)) {
						const isArray = Array.isArray(value$);
						const value$$ = isArray ? value$ : [value$];
						const validator = new Validator(fields$, paths, original);
						for (let k = 0; k < value$$.length; k++) {
							try {
								await validator.validate(value$$[k], { _index: isArray ? k : undefined, first: options.first, original });
							} catch (errors$: any) {
								errors.push(...errors$);
								if (options.first) break;
							}
						}
						if (errors.length && options.first) break;
						continue;
					}

					result = validate ? validate(value$, { field, source, paths, original }) : undefined;
					// 异步结果与同步结果使用同一套判定
					if (result && typeof result.then === 'function') {
						result = await result;
					}
				} catch (e: any) {
					result = false;
					message$ = toMessage(e);
				}

				if (typeof result === 'string') {
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
