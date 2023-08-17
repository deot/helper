import { type } from './type';

export const undef = (v?: any) => type(v, 'undefined');