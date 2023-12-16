/**
 * 原生行为：
 *  1. 同一时刻，上下左右仅一个方向滑动(如45°滑动，几乎是一个方向在移动)
 *  2. 触底或触底时，需要松开后，父层才能继续再滑动（原生行为）
 *
 * Whell目的实现
 * 1. 同一时刻，上下左右滑动的优化
 *     - 调用(自由滑动)：`Wheel.of(el, { freedom: true }).enable()`）
 *     - 调用(一个方向，对其做了优化)：`Wheel.of(el).enable()`）
 * 2. 触底或触底时，可以不需要松开后，父层也能继续再滑动
 * 		- 不需要松开后触发：Wheel.of(el, { native: false })
 * 		- 需要松开后触发：Wheel.of(el, { native: true })
 * 3. `overflow: hidden;` 这样可自定义滚动条样式
 * 4. 对移动端也做了兼容处理，在`overflow: hidden;`的情况下也可滑动
 */
import normalizeWheel from 'normalize-wheel';

type WheelFunction<T = unknown> = (a: number, b: number) => T;

export interface WheelOptions {
	/**
	 * 是否允许X轴方向滚动
	 */
	shouldWheelX?: WheelFunction<boolean>;

	/**
	 * 是否允许Y轴方向滚动
	 */
	shouldWheelY?: WheelFunction<boolean>;

	/**
	 * 是否阻止冒泡
	 */
	stopPropagation?: WheelFunction<boolean>;

	/**
	 * 原生的滚动行为，触底触底那一瞬间是否立即触发父层scroll事件
	 * 默认: true
	 * true：需要松开一下，才能继续滑动
	 * false：不需要松开继续滑动
	 *
	 * 当`shouldWheelX() => true`或`shouldWheelY() => true`时，
	 * el的父层的滚动都会被禁用（e.preventDefault()）
	 *
	 * 所以只有当`shouldWheelX() => false`或`shouldWheelY() => false`
	 * 才会考虑native值的影响
	 */
	native?: boolean;

	/**
	 * 自由滑动
	 */
	freedom?: boolean;
}

interface ScrollOptions {
	x: number;
	y: number;
	angle: number;
}

// 实现`WheelOptions.native = true`行为
const wait = 30;
const timers = new Set();

if (typeof document !== 'undefined') {
	const handleWheel = () => {
		timers.forEach((context: any) => {
			context.timer && clearTimeout(context.timer);
			context.timer = setTimeout(() => {
				context.clear();
				timers.delete(context);
			}, wait);
		});
	};
	const handleAddEvent = () => {
		document.body.addEventListener('wheel', handleWheel, true);
		document.body.addEventListener('mousedown', handleWheel, true);
	};

	/* istanbul ignore else -- @preserve */
	if (document.body) {
		handleAddEvent();
	} else {
		window.addEventListener('DOMContentLoaded', handleAddEvent);
	}
}

const getAngle = (start: number[], end: number[]) => {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];

	return Math.abs((360 * Math.atan(dy / dx)) / (2 * Math.PI));
};

export class Wheel {
	static of(el: HTMLElement, options?: WheelOptions) {
		return new Wheel(el, options);
	}

	static shouldWheelX = (el: HTMLElement, delta: number) => {
		if (el.offsetWidth === el.scrollWidth) {
			return false;
		}
		delta = Math.round(delta);
		if (delta === 0) {
			return false;
		}

		return (
			(delta < 0 && el.scrollLeft > 0)
			|| (delta >= 0 && el.scrollLeft < el.scrollWidth - el.offsetWidth)
		);
	};

	static shouldWheelY = (el: HTMLElement, delta: number) => {
		if (el.offsetHeight === el.scrollHeight) {
			return false;
		}

		delta = Math.round(delta);
		if (delta === 0) {
			return false;
		}

		return (
			(delta < 0 && el.scrollTop > 0)
			|| (delta >= 0 && el.scrollTop < el.scrollHeight - el.offsetHeight)
		);
	};

	el: HTMLElement;

	needThresholdWait = false;

	animationFrameID: number | null = null;

	deltaX = 0;

	deltaY = 0;

	isTouching = false;

	startTime = 0;

	startX = 0;

	startY = 0;

	moveX = 0;

	moveY = 0;

	listeners: WheelFunction[] = [];

	timer: any = null;

	options: WheelOptions;

	defaultOnWheel: WheelFunction | null = null;

	constructor(el: HTMLElement, options?: WheelOptions) {
		this.el = el;
		this.options = {
			native: true,
			freedom: false,
			stopPropagation: () => false,
			shouldWheelX: deltaX => Wheel.shouldWheelX(el, deltaX),
			shouldWheelY: deltaY => Wheel.shouldWheelY(el, deltaY),
			...options
		};
	}

	handleTouchStart = (e: TouchEvent) => {
		this.isTouching = true;

		const x = e.touches[0].screenX;
		const y = e.touches[0].screenY;

		this.startX = x;
		this.startY = y;

		this.moveX = x;
		this.moveY = y;

		this.startTime = Date.now();
	};

	handleTouchMove = (e: TouchEvent) => {
		if (!this.isTouching) return;
		const x = e.touches[0].screenX;
		const y = e.touches[0].screenY;

		const dx = this.moveX - x;
		const dy = this.moveY - y;

		this.moveX = x;
		this.moveY = y;

		this.emitScroll(e, {
			x: dx,
			y: dy,
			angle: getAngle([this.startX, this.startY], [this.moveX, this.moveY])
		});
	};

	handleTouchEnd = (e: TouchEvent) => {
		this.isTouching = false;

		const x = e.changedTouches[0].screenX;
		const y = e.changedTouches[0].screenY;

		const angle = getAngle([this.startX, this.startY], [x, y]);

		const dt = Date.now() - (this.startTime as number);
		if (dt <= 500 && dt > 50) {
			const dx = this.startX - x;
			const dy = this.startY - y;
			const speedX = dx / dt;
			const speedY = dy / dt;

			// 相当于再移动speed * 300的距离
			for (let i = 0; i <= 300; i++) {
				setTimeout(() => {
					this.emitScroll(e, {
						x: speedX,
						y: speedY,
						angle
					});
				}, i);
			}
		}
	};

	// 鼠标滚轮按住滑动
	handleMouseMove = (e: MouseEvent) => {
		if (e.which === 2) {
			this.emitScroll(e, {
				x: e.movementX,
				y: e.movementY,
				angle: getAngle([0, 0], [e.movementX, e.movementY])
			});
		}
	};

	// 滚轮事件
	handleWheel = (e: WheelEvent) => {
		const { pixelX, pixelY } = normalizeWheel(e);

		this.emitScroll(e, {
			x: pixelX,
			y: pixelY,
			angle: getAngle([this.deltaX, this.deltaY], [this.deltaX + pixelX, this.deltaX + pixelY])
		});
	};

	clear = () => {
		this.needThresholdWait = false;
	};

	didWheel = () => {
		this.listeners?.forEach((fn: any) => fn(this.deltaX, this.deltaY));

		this.animationFrameID = null;
		this.deltaX = 0;
		this.deltaY = 0;
	};

	/**
	 * 阻止X，Y轴上的滚动时，父层滚动（mac下的父层滚动越界会带有回弹）
	 * 以下两种情况需要阻止
	 * 1. 容器内在滚动：shouldWheelX = true 或 shouldWheelY = true
	 * 2. X和Y都都不能滚动：判断是否需要native行为
	 * 	如果是则需要停顿，用户松开后再滑动父层才动
	 * 	如果不是则不阻止父层滑动，直接滚动
	 * @param e ~
	 * @param shouldWheelX ~
	 * @param shouldWheelY ~
	 * @returns 是否可继续
	 */
	private preventParentScroll(e: Event, shouldWheelX: boolean, shouldWheelY: boolean): boolean {
		// 第2种场景
		if (!shouldWheelX && !shouldWheelY) {
			if (this.options.native && this.needThresholdWait) {
				e.cancelable && e.preventDefault();
				this.timer && clearTimeout(this.timer);
				this.timer = setTimeout(this.clear, wait);
				timers.add(this);
			}
			return true;
		}

		// 第1种场景
		e.cancelable && e.preventDefault();

		/* istanbul ignore else -- @preserve */
		if (this.options.native) {
			/* istanbul ignore next -- @preserve */
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.needThresholdWait = true;
		}

		return false;
	}

	/**
	 * 在emitScroll之前:
	 * 滑动手势X轴偏移小于30度夹角，禁止移动Y轴 -> pixelY = 0
	 * 滑动手势Y轴偏移小于30度夹角，禁止移动X轴 -> pixelX = 0
	 * @param e ~
	 * @param options ~
	 */
	private emitScroll(e: Event, options: ScrollOptions): void {
		const { x, y, angle } = options;

		let pixelX = x;
		let pixelY = y;
		if (!this.options.freedom) {
			angle < 30 && (pixelY = 0);
			angle > 60 && (pixelX = 0);
		}

		const deltaX = this.deltaX + pixelX;
		const deltaY = this.deltaY + pixelY;
		const shouldWheelX = this.options.shouldWheelX!(deltaX, deltaY);
		const shouldWheelY = this.options.shouldWheelY!(deltaY, deltaX);

		if (this.preventParentScroll(e, shouldWheelX, shouldWheelY)) return;

		this.deltaX += shouldWheelX ? pixelX : 0;
		this.deltaY += shouldWheelY ? pixelY : 0;

		/* istanbul ignore else -- @preserve */
		if (this.deltaX !== 0 || this.deltaY !== 0) {
			if (this.options.stopPropagation!(this.deltaX, this.deltaY)) {
				e.stopPropagation();
			}
			if (this.animationFrameID === null) {
				this.animationFrameID = window.requestAnimationFrame(this.didWheel);
			}
		}
	}

	private operateDOMEvents(type: string) {
		if (typeof window === 'undefined') return;
		const fn = (type === 'add' ? this.el.addEventListener : this.el.removeEventListener).bind(this.el);

		fn(normalizeWheel.getEventType(), this.handleWheel, false);

		// 让触控屏也能实现滑动(模拟) 不用'ontouchend' in document，主要考虑测试
		if (document.ontouchend || document.ontouchend === null) {
			fn('touchstart', this.handleTouchStart, false);
			fn('touchmove', this.handleTouchMove, { passive: false });
			fn('touchend', this.handleTouchEnd, false);
		} else {
			// 模拟鼠标滚轮点击
			fn('mousemove', this.handleMouseMove, false);
		}
	}

	on(fn: WheelFunction) {
		if (!this.listeners.length) {
			this.operateDOMEvents('add');
		}
		this.listeners.push(fn);

		return () => this.off(fn);
	}

	off(fn?: WheelFunction) {
		if (fn) {
			this.listeners.splice(this.listeners.indexOf(fn), 1);
		} else {
			this.listeners = [];
		}

		if (!this.listeners.length) {
			this.operateDOMEvents('remove');
		}
	}

	enable() {
		this.defaultOnWheel && this.off(this.defaultOnWheel);

		this.defaultOnWheel = /* istanbul ignore next -- @preserve */ (deltaX: number, deltaY: number) => {
			if (deltaY && this.el.scrollHeight > this.el.offsetHeight) {
				this.el.scrollTop = Math.min(
					Math.max(0, this.el.scrollTop + deltaY),
					this.el.scrollHeight - this.el.offsetHeight
				);
			}
			if (deltaX && this.el.scrollWidth > this.el.offsetWidth) {
				this.el.scrollLeft = Math.min(
					Math.max(0, this.el.scrollLeft + deltaX),
					this.el.scrollWidth - this.el.offsetWidth
				);
			}
		};

		return this.on(this.defaultOnWheel);
	}
}
