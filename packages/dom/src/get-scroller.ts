import { IS_SERVER } from './_constants';
import { isScroller } from './is-scroller';
import type { ScrollerOptions } from './is-scroller';

export const getScroller = (el?: Element, options?: ScrollerOptions) => {
	if (IS_SERVER || !el) return null;

	let parent: any = el;
	while (parent) {
		if (parent === window || parent === document || parent === document.documentElement) {
			return window;
		}
		// ShadowRoot、DocumentFragment 等非元素节点没有样式，跳过
		if (parent.nodeType === 1 && isScroller(parent, options)) {
			return parent as HTMLElement;
		}

		// 按渲染结构向上：slot 分发的节点先到 slot，ShadowRoot 再到宿主
		parent = parent.assignedSlot || parent.parentNode || parent.host;
	}
	return null;
};
