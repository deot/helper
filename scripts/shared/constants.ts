import { createRequire } from "node:module";
import * as path from 'node:path';

const require$ = createRequire(import.meta.url);

const cwd = process.cwd();

export const PACKAGE_NAME = require$(`${cwd}/packages/index/package.json`).name;
export const DIRECTORY = path.resolve(cwd, './packages');