import fs from'node:fs';import path from'node:path';import{APP_ROOT,noLinks,beneath}from'../scripts/environment.mjs';
const base=path.join(APP_ROOT,'.private/product-fixtures'),owned=new Set();
export function makeSyntheticTemp(prefix){if(!/^[-a-zA-Z0-9_]{1,80}$/.test(prefix))throw Error('FIXTURE_PREFIX');noLinks(APP_ROOT,base);fs.mkdirSync(base,{recursive:true});const dir=fs.mkdtempSync(path.join(base,prefix));owned.add(path.resolve(dir));return dir;}
export function removeSyntheticTemp(dir){const resolved=path.resolve(dir);if(!owned.has(resolved)||!beneath(base,resolved))throw Error('NOT_OWN_FIXTURE');noLinks(APP_ROOT,resolved);fs.rmSync(resolved,{recursive:true,force:true});owned.delete(resolved);}
