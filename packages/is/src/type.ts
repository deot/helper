/* eslint-disable valid-typeof */
export const type = (v: any, typeName?: string) => !!typeName && typeof v === typeName;