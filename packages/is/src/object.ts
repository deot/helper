import { type } from "./type";
import { nil } from "./nil";

export const object = (v?: any) => !nil(v) && type(v, 'object');