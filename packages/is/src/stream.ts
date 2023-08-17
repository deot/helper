import { object } from "./object";
import { fn } from "./fn";

export const stream = (v?: any) => object(v) && fn(v.pipe);