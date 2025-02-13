import { Wheel } from '@deot/helper-wheel';

document.body.style.margin = '0px';
document.body.style.padding = '0 50px 25px 50px';

const make = (mode: string) => {
	const el = document.createElement('div');

	el.style.margin = '25px 0';
	el.style.width = 'calc(100vw - 100px)';
	el.style.height = 'calc(50vh - 50px)';
	el.style.background = '#f2f2f2';
	el.style.overflow = mode !== 'original' ? 'hidden' : 'auto';

	Array.from({
		length: 50
	}).forEach((_: any, index: number) => {
		const child = document.createElement('div');
		child.style.width = '300vw';
		child.innerHTML = `<span style="color: red">${index}</span>` + (` .${mode}. `).repeat(25);

		el.appendChild(child);
	});

	const childEl = document.createElement('div');

	childEl.style.width = 'calc(100vw - 200px)';
	childEl.style.height = 'calc(25vh - 50px)';
	childEl.style.background = '#aeaaea';
	childEl.style.overflow = mode !== 'original' ? 'hidden' : 'auto';

	Array.from({
		length: 50
	}).forEach((_: any, index: number) => {
		const child = document.createElement('div');
		child.style.width = '300vw';
		child.innerHTML = `<span style="color: red">${index}</span>` + (` nested.${mode}. `).repeat(25);

		childEl.appendChild(child);
	});

	el.appendChild(childEl);
	document.body.appendChild(el);
	return {
		parent: el,
		child: childEl
	};
};

make('original');

// wheel：滚动时默认抑制父层滚动
const etrue = make('stopPropagation/true');
Wheel.of(etrue.parent).enable();
Wheel.of(etrue.child).enable();

// wheel：滚动时不抑制父层滚动，有点儿奇怪
const efalse = make('stopPropagation/false');
Wheel.of(efalse.parent, { stopPropagation: () => false }).enable();
Wheel.of(efalse.child, { stopPropagation: () => false }).enable();

make('original');
