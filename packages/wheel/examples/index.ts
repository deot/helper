import { Wheel } from "@deot/helper-wheel";

document.body.style.margin = '0px';
document.body.style.padding = '0 50px 25px 50px';

let make = (mode: string) => {
	let el = document.createElement('div');

	el.style.margin = '25px 0';
	el.style.width = 'calc(100vw - 100px)';
	el.style.height = 'calc(50vh - 50px)';
	el.style.background = '#f2f2f2';
	el.style.overflow = mode !== 'original' ? 'hidden' : 'auto';

	Array.from({
		length: 300
	}).forEach((_: any, index: number) => {
		let child = document.createElement('div');
		child.style.width = '300vw';
		child.innerHTML = `<span style="color: red">${index}</span>` + (` .${mode}. `).repeat(25);

		el.appendChild(child);
	});

	document.body.appendChild(el);

	return el;
};

const wheelOptions = { 
	shouldWheelX: () => true, 
	shouldWheelY: () => true
};

make('original');

// wheel：一个方向滑动上的优化
let ewheel = make('wheel');
Wheel.of(ewheel, wheelOptions).enable();

// freedom：上下左右自由滑动
let efree = make('freedom');
Wheel.of(efree, { ...wheelOptions, freedom: true }).enable();

// native：触底或触底时，触底或触底时，如果父层存在滚动层，需要松开后，父层才能继续再滑动（原生行为）
let enative = make('native');
Wheel.of(enative).enable();

// continue：继续滑动
let econtinue = make('continue');
Wheel.of(econtinue, { native: false }).enable();

// original
make('original');


