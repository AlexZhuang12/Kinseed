// Reconstruct exact clean historical synthetic sources from a checked source-only delta.
// No runtime, OAuth, model or original individual data is part of this fixture.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {APP_ROOT} from '../scripts/environment.mjs';import {exportSource} from '../scripts/export-source.mjs';
export function historicalSource(destination,variant){
 const data=JSON.parse(fs.readFileSync(new URL('./fixtures/app-server-source-history.json',import.meta.url))),fixture=data.variants[variant];if(!fixture)throw Error('UNKNOWN_HISTORICAL_SOURCE');
 const current=exportSource(APP_ROOT);fs.mkdirSync(destination,{recursive:true});fs.cpSync(current.destination,destination,{recursive:true});
 for(const rel of Object.keys(current.files))if(!Object.hasOwn(fixture.sha256,rel))fs.unlinkSync(path.join(destination,rel));
 for(const [rel,text]of Object.entries(fixture.overrides)){const file=path.join(destination,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}
 for(const [rel,expected]of Object.entries(fixture.sha256)){if(rel.split('/').includes('..')||path.isAbsolute(rel))throw Error('HISTORY_PATH');const actual=createHash('sha256').update(fs.readFileSync(path.join(destination,rel))).digest('hex');if(actual!==expected)throw Error('HISTORICAL_SOURCE_CHANGED:'+rel);}
 return {files:Object.keys(fixture.sha256).length,scope:data.scope};
}
