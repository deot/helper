import { type } from './type';

export const bigint = (v?: any): v is bigint => type(v, 'bigint');
