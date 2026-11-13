import { type } from './type';

export const string = (v?: any): v is string => type(v, 'string');
