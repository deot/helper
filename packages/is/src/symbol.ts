import { type } from './type';

export const symbol = (v?: any): v is symbol => type(v, 'symbol');
