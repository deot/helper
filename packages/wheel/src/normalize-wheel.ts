// deltaMode为行/页时的像素换算（沿用normalize-wheel的取值）
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/**
 * 将标准wheel事件的滚动量统一为像素
 * 仅处理标准wheel事件，不兼容mousewheel / DOMMouseScroll
 * @param e ~
 * @returns 像素单位的滚动量
 */
export const normalizeWheel = (e: WheelEvent) => {
	/**
	 * 必须先读deltaX / deltaY，再读deltaMode，顺序不可调换：
	 * Firefox 88+在未读过deltaMode时，会把行单位自行换算为像素（此时deltaMode为0），得到的是原生滚动距离；
	 * 若先读deltaMode，则拿到行单位，只能按LINE_HEIGHT估算
	 */
	let pixelX = e.deltaX;
	let pixelY = e.deltaY;

	if ((pixelX || pixelY) && e.deltaMode) {
		const ratio = e.deltaMode === 1 ? LINE_HEIGHT : PAGE_HEIGHT;
		pixelX *= ratio;
		pixelY *= ratio;
	}

	return { pixelX, pixelY };
};
