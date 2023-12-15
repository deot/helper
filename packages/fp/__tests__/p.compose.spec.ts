import * as FP from '@deot/helper-fp';
import * as R from 'ramda';

const sleep = (s: number) => new Promise((_) => { setTimeout(_, s || 0); });
const { compose, pipe } = FP;
describe('compose/pipe.ts', () => {
	it('base', () => {
		const add = (x: number) => {
			return x + 2;
		};
		const mul = (x: number) => {
			return x * 3;
		};
		const sub = (x: number) => {
			return x - 10;
		};

		const composed = compose(add, mul, sub);
		const piped = pipe(add, mul, sub);

		// ((5 - 10) * 3) + 2 = -13
		expect(composed(5)).toBe(-13);

		// (5 + 2) * 3 - 10 = 11
		expect(piped(5)).toBe(11);

		// other
		expect(compose(add)(1)).toBe(3);
		try {
			expect(compose()(1)).toBe(1);
		} catch {
			// any
		}
	});

	it('this', () => {
		const add = function (this: any, x: number) {
			return x + this.x;
		};
		const mul = function (this: any, x: number) {
			return x * this.y;
		};
		const sub = function (this: any, x: number) {
			return x - this.z;
		};

		const ctx = {
			composed: compose(add, mul, sub),
			piped: pipe(add, mul, sub),
			x: 2,
			y: 3,
			z: 10
		};

		// ((5 - 10) * 3) + 2 = -13
		expect(ctx.composed(5)).toBe(-13);
		// (5 + 2) * 3 - 10 = 11
		expect(ctx.piped(5)).toBe(11);
	});

	it('multiple args', () => {
		const f = (a: any, b: any, c: any) => [a, b, c];
		const g = compose(f);
		expect(g(1, 2, 3)).toEqual([1, 2, 3]);

		const f1 = (a: any) => (b: any, c: any) => [a, b, c];
		const g2 = compose(f1);
		expect(g2(1)(2, 3)).toEqual([1, 2, 3]);
	});

	it('middlewares', () => {
		let step = 0;
		const a = (next: any) => {
			expect(++step).toEqual(1);
			return (options: any) => {
				expect(options).toEqual({ b: 1, c: 1 });
				expect(++step).toEqual(4);
				return next({
					...options,
					a: 1
				});
			};
		};
		const b = (next: any) => {
			expect(++step).toEqual(2);
			return (options: any) => {
				expect(options).toEqual({ c: 1 });
				expect(++step).toEqual(3);
				return next({
					...options,
					b: 1
				});
			};
		};

		const page = (options: any) => {
			expect(++step).toEqual(5);
			return options;
		};

		// next = page;
		// step1: _next = afn = a(page);
		// step2: __next = bfn = b(afn);
		const g = R.compose(b, a)(page); // b(a(page))

		// options = { c: 1 };
		// step3: _options = __next(options) = bfn(options);
		// step4: __options = _next(_options) = afn(_options);
		// step5: next(__options) = page(__options);
		const result = g({ c: 1 });

		/**
		 * 这样`next => options => any`的设计，虽然是先执行a，再执行b。
		 * 但是最后执行是bfn, afn, page这样的顺序，这样的两层函数调用，就像是pipe一样
		 * 所以中间件这样的设计相当于传递
		 */
		expect(result).toEqual({ a: 1, b: 1, c: 1 });
	});

	it('mirco redux', async () => {
		const createStore = (reducer: any, initialState = {}) => {
			let currentState = initialState;
			return {
				dispatch: (action: any) => {
					currentState = reducer(currentState, action);
				},
				getState: () => currentState
			};
		};

		const applyMiddleware = (...middlewares: any[]) => {
			return (next: any) => (reducer: any, initialState = {}) => {
				const store = next(reducer, initialState);
				const chain = middlewares.map(fn => fn(store));

				const _next = store.dispatch;
				const _dispatch = compose(...chain)(_next);

				return {
					...store,
					dispatch: _dispatch
				};
			};
		};

		// 由外部处理异步然后再触发dispatch
		const thunk = (store: any) => (next: any) => (action: any) => {
			if (typeof action === 'function') {
				return action(store.dispatch, store.getState);
			}

			return next(action);
		};

		// 由中间件处理异步然后再触发dispatch变种action
		const api = () => (next: any) => (action: any) => {
			if (action.type === 'API') {
				setTimeout(() => next({ type: 'REQUEST' }), 10);
			} else {
				next(action);
			}
		};

		// devtools
		const debug = (enable?: boolean) => {
			if (!enable) {
				return function (next: any) {
					return function (...args: any[]) {
						return next(...args);
					};
				};
			} else {
				return function (next: any) {
					return function (reducer: any, initialState: any) {
						const store = next(reducer, initialState);
						const _dispatch = (action: any) => {
							// 变化前`store.getState()`;
							store.dispatch(action);
							// 变化后`store.getState();`
							return action;
						};
						return {
							...store,
							dispatch: _dispatch
						};
					};
				};
			}
		};

		const finalCreateStore = compose(
			applyMiddleware(thunk, api),
			debug(true),
			debug(false),
		)(createStore);

		const reducer = (state: any, action: any) => {
			if (action.type === 'REQUEST') {
				state = {
					...state,
					request: ++state.request
				};
			}

			if (action.type === 'THUNK') {
				state = {
					...state,
					thunk: ++state.thunk
				};
			}

			return state;
		};
		const store = finalCreateStore(reducer, { request: 0, thunk: 0 });

		// 异步方式1
		store.dispatch({ type: 'API' });

		// 异步方式2
		store.dispatch((dispatch: any) => {
			setTimeout(() => dispatch({ type: 'THUNK' }), 10);
		});

		await sleep(30);

		expect(store.getState()).toEqual({ request: 1, thunk: 1 });
	});
});
