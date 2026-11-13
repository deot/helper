import { type } from './type';

export const undef = (v?: any): v is undefined => type(v, 'undefined');
