import type { Options } from '@deot/helper-shared';
import * as Utils from '@deot/helper-shared';

export const helper = (options: Options) => {
	return Utils.helper(options.value);
};