import { Readable } from 'node:stream';
import * as Is from '@deot/helper-is';

describe('stream.ts', () => {
	const stream = new Readable();
	stream.push(JSON.stringify({}));
	stream.push(null); // no more data

	it('Basic', () => {
		expect(Is.stream()).toBe(false);
		expect(Is.stream(stream)).toBe(true);
	});
});

