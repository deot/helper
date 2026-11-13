import { type } from './type';

export const number = (v?: any): v is number => type(v, 'number');
