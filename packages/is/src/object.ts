import { type } from './type';

export const object = (v?: any): v is Record<PropertyKey, any> => v !== null && type(v, 'object');
