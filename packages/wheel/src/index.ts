/**
 * 原生行为：
 *  1. 同一时刻，上下左右仅一个方向滑动(如45°滑动，几乎是一个方向在移动)
 *  2. 触顶或触底时，需要松开后，父层才能继续再滑动（原生行为）
 *
 * Wheel目的实现
 * 1. 同一时刻，上下左右滑动的优化
 *     - 调用(自由滑动)：`Wheel.of(el, { freedom: true }).enable()`）
 *     - 调用(一个方向，对其做了优化)：`Wheel.of(el).enable()`）
 * 2. 触顶或触底时，可以不需要松开后，父层也能继续再滑动
 * 		- 不需要松开后触发：Wheel.of(el, { native: false })
 * 		- 需要松开后触发：Wheel.of(el, { native: true })
 * 3. `overflow: hidden;` 这样可自定义滚动条样式
 * 4. 对移动端也做了兼容处理，在`overflow: hidden;`的情况下也可滑动
 * 		- 跳过触摸模拟，使用原生滚动：Wheel.of(el, { touch: false })
 * 		- 松手后的惯性逐渐减速：Wheel.of(el, { decay: true })
 * 5. 缩放手势（ctrl + 滚轮、触控板捏合、多指触摸）不接管
 */
import { normalizeWheel } from './normalize-wheel';

export type WheelFunction<T = unknown> = (a: number, b: number) => T;

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
	 * 原生的滚动行为，触顶触底那一瞬间是否立即触发父层scroll事件
	 * 默认: true
	 * true：需要松开一下，才能继续滑动（仅限滚到边界的那一段手势，停手后再滚不受影响）
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

	/**
	 * 是否在触控设备上模拟触摸滑动
	 * 默认: true
	 * false：不监听touch事件，交由浏览器原生滚动（容器需可原生滚动，如`overflow: auto;`）
	 */
	touch?: boolean;

	/**
	 * 触摸松手后的惯性是否逐渐减速
	 * 默认: false
	 * false：按整段手势的平均速度匀速再滑300ms
	 * true：按松手前一小段的速度起步，逐渐减速到停；松手前已停住则没有惯性
	 */
	decay?: boolean;
}

interface ScrollOptions {
	x: number;
	y: number;
	angle: number;
}

// 实现`WheelOptions.native = true`行为：距上一次滚动超过该时长，视为已松开
const wait = 30;

// 尚未松开的实例；非空期间才监听全局事件
const timers = new Set<Wheel>();

// 惯性：匀速时的持续时长
const INERTIA_DURATION = 300;
// 惯性：减速时的时间常数（速度每经过该时长降为原来的1/e）、取起步速度的时间窗口、停止的速度（px/ms）
const DECAY_TIME = 325;
const DECAY_SAMPLE = 100;
const DECAY_MIN_SPEED = 0.03;

const getAngle = (start: number[], end: number[]) => {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];

	return Math.abs((360 * Math.atan(dy / dx)) / (2 * Math.PI));
};

export class Wheel {
	static of(el: HTMLElement, options?: WheelOptions) {
		return new Wheel(el, options);
	}

	// 用clientWidth而非offsetWidth：后者含边框和滚动条，算出的最大滚动距离偏小，末尾几像素滚不到
	static shouldWheelX = (el: HTMLElement, delta: number) => {
		if (el.clientWidth === el.scrollWidth) {
			return false;
		}
		delta = Math.round(delta);
		if (delta === 0) {
			return false;
		}

		return (
			(delta < 0 && el.scrollLeft > 0)
			|| (delta >= 0 && Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth)
		);
	};

	static shouldWheelY = (el: HTMLElement, delta: number) => {
		if (el.clientHeight === el.scrollHeight) {
			return false;
		}

		delta = Math.round(delta);
		if (delta === 0) {
			return false;
		}

		return (
			(delta < 0 && el.scrollTop > 0)
			|| (delta >= 0 && Math.ceil(el.scrollTop) < el.scrollHeight - el.clientHeight)
		);
	};

	// 任意位置继续滚动（或按下鼠标）时，尚未松开的实例都顺延：手势可能已移出el，或被内层阻止了冒泡
	private static handleHold = () => {
		timers.forEach(context => context.hold());
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

	timer: ReturnType<typeof setTimeout> | null = null;

	options: WheelOptions;

	defaultOnWheel: WheelFunction | null = null;

	// 惯性的动画帧ID
	private inertiaID: number | null = null;

	// 最近的触摸轨迹[time, x, y]，`decay: true`时用于计算松手速度
	private samples: number[][] = [];

	constructor(el: HTMLElement, options?: WheelOptions) {
		this.el = el;
		this.options = {
			native: true,
			freedom: false,
			touch: true,
			decay: false,
			stopPropagation: () => true,
			shouldWheelX: deltaX => Wheel.shouldWheelX(el, deltaX),
			shouldWheelY: deltaY => Wheel.shouldWheelY(el, deltaY),
			...options
		};
	}

	handleTouchStart = (e: TouchEvent) => {
		// 按住即停下惯性
		this.stopInertia();

		// 多指（缩放等）不接管
		if (e.touches.length > 1) {
			this.isTouching = false;
			return;
		}
		this.isTouching = true;

		const x = e.touches[0].screenX;
		const y = e.touches[0].screenY;

		this.startX = x;
		this.startY = y;

		this.moveX = x;
		this.moveY = y;

		this.startTime = Date.now();
		this.samples = [[this.startTime, x, y]];
	};

	handleTouchMove = (e: TouchEvent) => {
		if (!this.isTouching) return;
		const x = e.touches[0].screenX;
		const y = e.touches[0].screenY;

		const dx = this.moveX - x;
		const dy = this.moveY - y;

		this.moveX = x;
		this.moveY = y;

		if (this.options.decay) {
			const now = Date.now();
			this.samples = this.samples.filter(i => now - i[0] <= DECAY_SAMPLE);
			this.samples.push([now, x, y]);
		}

		this.emitScroll(e, {
			x: dx,
			y: dy,
			angle: getAngle([this.startX, this.startY], [this.moveX, this.moveY])
		});
	};

	handleTouchEnd = (e: TouchEvent) => {
		if (!this.isTouching) return;
		this.isTouching = false;

		const x = e.changedTouches[0].screenX;
		const y = e.changedTouches[0].screenY;

		const angle = getAngle([this.startX, this.startY], [x, y]);
		const now = Date.now();

		let speedX = 0;
		let speedY = 0;
		if (this.options.decay) {
			// 松手前一小段的平均速度；这段时间内没有移动（已停住）则没有惯性
			const [from] = this.samples.filter(i => now - i[0] <= DECAY_SAMPLE);
			const dt = from ? now - from[0] : 0;
			if (dt > 0) {
				speedX = (from[1] - x) / dt;
				speedY = (from[2] - y) / dt;
			}
		} else {
			// 整段手势的平均速度
			const dt = now - this.startTime;
			if (dt <= 500 && dt > 50) {
				speedX = (this.startX - x) / dt;
				speedY = (this.startY - y) / dt;
			}
		}

		if (speedX || speedY) {
			this.startInertia(e, speedX, speedY, angle);
		}
	};

	handleTouchCancel = () => {
		this.isTouching = false;
	};

	// 鼠标滚轮按住滑动
	handleMouseMove = (e: MouseEvent) => {
		if (e.buttons & 4) {
			this.emitScroll(e, {
				x: e.movementX,
				y: e.movementY,
				angle: getAngle([0, 0], [e.movementX, e.movementY])
			});
		}
	};

	// 滚轮事件
	handleWheel = (e: WheelEvent) => {
		// ctrl + 滚轮、触控板捏合（浏览器派发的也是带ctrlKey的wheel）是缩放，不接管
		if (e.ctrlKey) return;

		const { pixelX, pixelY } = normalizeWheel(e);

		this.emitScroll(e, {
			x: pixelX,
			y: pixelY,
			angle: getAngle([0, 0], [pixelX, pixelY])
		});
	};

	// 视为已松开
	clear = () => {
		this.needThresholdWait = false;
		this.timer && clearTimeout(this.timer);
		this.timer = null;

		if (timers.delete(this) && !timers.size) {
			document.removeEventListener('wheel', Wheel.handleHold, true);
			document.removeEventListener('mousedown', Wheel.handleHold, true);
		}
	};

	didWheel = () => {
		const { deltaX, deltaY } = this;

		// 先复位再派发：监听函数抛错也不会让animationFrameID残留（残留后不会再申请下一帧）
		this.animationFrameID = null;
		this.deltaX = 0;
		this.deltaY = 0;

		const errors: unknown[] = [];
		// 遍历的是快照：监听函数里off（如只听一次）不会让后面的被跳过，本轮已被off的不再执行
		this.listeners.slice().forEach((fn) => {
			if (!this.listeners.includes(fn)) return;
			try {
				fn(deltaX, deltaY);
			} catch (e) {
				errors.push(e);
			}
		});

		// 某个监听函数抛错不影响其它监听函数，错误照常抛出：
		// 第一个在全部执行完后原样抛出，其余的各自异步抛出，不被吞掉
		if (errors.length) {
			errors.slice(1).forEach(e => setTimeout(() => {
				throw e;
			}));
			throw errors[0];
		}
	};

	/**
	 * 手势进行中：距最后一次调用超过wait，才视为已松开
	 * 只在未松开期间监听全局事件，全部松开后移除
	 */
	private hold() {
		this.timer && clearTimeout(this.timer);
		this.timer = setTimeout(this.clear, wait);

		if (!timers.size) {
			document.addEventListener('wheel', Wheel.handleHold, { capture: true, passive: true });
			document.addEventListener('mousedown', Wheel.handleHold, { capture: true, passive: true });
		}
		timers.add(this);
	}

	/**
	 * 松手后按速度（px/ms）继续滑动，每帧派发`速度 × 本帧耗时`
	 * 再次按住、解除全部监听、滑到边界时停下
	 * @param e ~
	 * @param speedX ~
	 * @param speedY ~
	 * @param angle ~
	 */
	private startInertia(e: Event, speedX: number, speedY: number, angle: number) {
		const { decay } = this.options;
		let last = Date.now();
		let elapsed = 0;

		const step = () => {
			const now = Date.now();
			let dt = now - last;
			let distance: number;
			let done: boolean;

			last = now;
			if (decay) {
				// 速度按exp(-t / DECAY_TIME)衰减，本帧的移动量是它在这一帧上的积分
				const from = Math.exp(-elapsed / DECAY_TIME);
				elapsed += dt;
				const to = Math.exp(-elapsed / DECAY_TIME);

				distance = DECAY_TIME * (from - to);
				done = Math.hypot(speedX, speedY) * to < DECAY_MIN_SPEED;
			} else {
				dt = Math.min(dt, INERTIA_DURATION - elapsed);
				elapsed += dt;

				distance = dt;
				done = elapsed >= INERTIA_DURATION;
			}

			// 本帧无耗时（同一毫秒内的两帧）时跳过；滑不动了（到边界）即停下
			const scrolled = !dt || this.emitScroll(e, {
				x: speedX * distance,
				y: speedY * distance,
				angle
			});

			this.inertiaID = scrolled && !done ? window.requestAnimationFrame(step) : null;
		};

		this.inertiaID = window.requestAnimationFrame(step);
	}

	private stopInertia() {
		if (this.inertiaID !== null) {
			window.cancelAnimationFrame(this.inertiaID);
			this.inertiaID = null;
		}
	}

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
				this.hold();
			}
			return true;
		}

		// 第1种场景
		e.cancelable && e.preventDefault();

		/**
		 * 这里也要顺延：停手后needThresholdWait随之清除，下一段手势在边界上可直接带动父层；
		 * 否则它会一直保留到下一次边界滚动，隔多久都要先被拦一次
		 */
		/* istanbul ignore else -- @preserve */
		if (this.options.native) {
			this.needThresholdWait = true;
			this.hold();
		}

		return false;
	}

	/**
	 * 在emitScroll之前:
	 * 滑动手势X轴偏移小于30度夹角，禁止移动Y轴 -> pixelY = 0
	 * 滑动手势Y轴偏移小于30度夹角，禁止移动X轴 -> pixelX = 0
	 * @param e ~
	 * @param options ~
	 * @returns 容器是否消费了本次滚动
	 */
	private emitScroll(e: Event, options: ScrollOptions): boolean {
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

		if (this.preventParentScroll(e, shouldWheelX, shouldWheelY)) return false;

		this.deltaX += shouldWheelX ? pixelX : 0;
		this.deltaY += shouldWheelY ? pixelY : 0;

		/* istanbul ignore else -- @preserve */
		if (this.deltaX !== 0 || this.deltaY !== 0) {
			/* istanbul ignore next -- @preserve */
			if (this.options.stopPropagation!(this.deltaX, this.deltaY)) {
				e.stopPropagation();
			}
			if (this.animationFrameID === null) {
				this.animationFrameID = window.requestAnimationFrame(this.didWheel);
			}
		}

		return true;
	}

	private operateDOMEvents(type: string) {
		if (typeof window === 'undefined') return;
		const fn = (type === 'add' ? this.el.addEventListener : this.el.removeEventListener).bind(this.el);

		/**
		 * 统一监听标准wheel事件（与全局监听一致），deltaMode（行/页）的换算由handleWheel中的normalizeWheel(e)处理
		 * 1. 不监听Firefox旧的DOMMouseScroll：该事件没有deltaY，只能按detail×10换算像素，实测滚动距离是原生的10倍
		 * 2. 不回退mousewheel：不支持wheel的只有Chrome 31、Safari 7以前及Opera 12(Presto)，
		 *    而本包产物含ES2022静态类字段（至少需Chrome 72、Firefox 75、Safari 14.1），这些浏览器本就无法运行
		 */
		fn('wheel', this.handleWheel, false);

		// 模拟鼠标滚轮点击；与触摸并存（触屏设备也可能接鼠标）
		fn('mousemove', this.handleMouseMove, false);

		// 让触控屏也能实现滑动(模拟) 不用'ontouchend' in document，主要考虑测试
		// `touch: false`时跳过模拟，交由原生滚动
		if (this.options.touch && (document.ontouchend || document.ontouchend === null)) {
			fn('touchstart', this.handleTouchStart, { passive: true });
			fn('touchmove', this.handleTouchMove, { passive: false });
			fn('touchend', this.handleTouchEnd, false);
			fn('touchcancel', this.handleTouchCancel, false);
		}
	}

	// 全部监听解除后，不再有任何回调：待派发的增量、惯性、未松开的等待一并取消
	private reset() {
		if (this.animationFrameID !== null) {
			window.cancelAnimationFrame(this.animationFrameID);
			this.animationFrameID = null;
		}
		this.stopInertia();
		this.clear();

		this.deltaX = 0;
		this.deltaY = 0;
		this.isTouching = false;
	}

	on(fn: WheelFunction) {
		// 同一个监听函数重复注册只算一次
		if (!this.listeners.includes(fn)) {
			if (!this.listeners.length) {
				this.operateDOMEvents('add');
			}
			this.listeners.push(fn);
		}

		return () => this.off(fn);
	}

	off(fn?: WheelFunction) {
		if (!this.listeners.length) return;

		if (fn) {
			// 未注册的监听器（indexOf为-1）直接忽略：splice(-1, 1)会误删最后一个
			const index = this.listeners.indexOf(fn);
			if (index === -1) return;
			this.listeners.splice(index, 1);
		} else {
			this.listeners = [];
		}

		if (!this.listeners.length) {
			this.reset();
			this.operateDOMEvents('remove');
		}
	}

	enable() {
		this.defaultOnWheel ||= /* istanbul ignore next -- @preserve */ (deltaX: number, deltaY: number) => {
			/* istanbul ignore next -- @preserve */
			if (deltaY && this.el.scrollHeight > this.el.clientHeight) {
				this.el.scrollTop = Math.min(
					Math.max(0, this.el.scrollTop + deltaY),
					this.el.scrollHeight - this.el.clientHeight
				);
			}
			/* istanbul ignore next -- @preserve */
			if (deltaX && this.el.scrollWidth > this.el.clientWidth) {
				this.el.scrollLeft = Math.min(
					Math.max(0, this.el.scrollLeft + deltaX),
					this.el.scrollWidth - this.el.clientWidth
				);
			}
		};

		return this.on(this.defaultOnWheel);
	}
}
