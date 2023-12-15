const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
const DIGIT = '0123456789';

const BOUNDARY_ALPHABET = ALPHA + ALPHA.toUpperCase() + DIGIT + '-_';

export const generateString = (size?: number, alphabet?: string) => {
	size = size || 16;
	alphabet = alphabet || BOUNDARY_ALPHABET;

	let str = '';
	const { length } = alphabet;
	while (size--) {
		str += alphabet[Math.random() * length | 0];
	}

	return str;
};
