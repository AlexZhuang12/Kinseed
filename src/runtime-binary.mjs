import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {CODEX_VERSION,SUPPORTED_CODEX_VERSIONS,parseCodexVersion} from './codex-versions.mjs';import {managedCodex,fileStamp} from './codex-runtime-store.mjs';
export {CODEX_VERSION,SUPPORTED_CODEX_VERSIONS};
export function npmBinaryCandidates(root,env=process.env){const bases=[path.join(root,'.private/codex-cli/node_modules/@openai'),path.join(env.APPDATA??'','npm/node_modules/@openai')],out=[];for(const base of bases)for(const pkg of ['codex','codex-win32-x64','codex-win32-arm64'])for(const suffix of ['vendor/x86_64-pc-windows-msvc/codex/codex.exe','vendor/aarch64-pc-windows-msvc/codex/codex.exe','vendor/x86_64-pc-windows-msvc/bin/codex.exe','vendor/aarch64-pc-windows-msvc/bin/codex.exe']){out.push(path.join(base,pkg,suffix));out.push(path.join(base,'codex/node_modules/@openai',pkg,suffix));}return out;}
export function createCodexResolver({root=path.resolve(import.meta.dirname,'..'),env=process.env,run=spawnSync}={}){let cached;
 return ()=>{
  // Damaged managed bundles fail closed; never silently switch to Desktop.
  for(const version of SUPPORTED_CODEX_VERSIONS){const own=managedCodex(root,version);if(own)return own;}
  if(cached&&fs.existsSync(cached.binary)&&!fs.lstatSync(cached.binary).isSymbolicLink()&&fileStamp(cached.binary)===cached.stamp)return cached.descriptor;
  const candidates=[...npmBinaryCandidates(root,env),...(env.PATH??'').split(path.delimiter).filter(Boolean).map(p=>path.join(p,'codex.exe'))],vendor=path.join(env.LOCALAPPDATA??'','OpenAI','Codex','bin');
  if(path.isAbsolute(vendor)&&fs.existsSync(vendor))for(const e of fs.readdirSync(vendor,{withFileTypes:true}).filter(e=>e.isDirectory()&&!e.isSymbolicLink()&&/^[a-f0-9]{8,64}$/i.test(e.name)).sort((a,b)=>a.name.localeCompare(b.name)).reverse())candidates.push(path.join(vendor,e.name,'codex.exe'));
  const safe=Object.fromEntries(['PATH','SystemRoot','WINDIR','USERPROFILE','HOMEDRIVE','HOMEPATH','LOCALAPPDATA','APPDATA','TEMP','TMP'].filter(k=>env[k]).map(k=>[k,env[k]])),found=[];
  for(const file of [...new Set(candidates)])if(path.isAbsolute(file)&&fs.existsSync(file)&&!fs.lstatSync(file).isSymbolicLink()){const r=run(file,['--version'],{env:safe,encoding:'utf8',windowsHide:true,timeout:10000}),version=r.status===0?parseCodexVersion(r.stdout):null;if(version)found.push({binary:file,version,origin:file.startsWith(path.join(root,'.private')+path.sep)?'private-install':'existing-install',integrity:'exact_version_checked'});}
  const descriptor=SUPPORTED_CODEX_VERSIONS.map(v=>found.find(f=>f.version===v)).find(Boolean);if(descriptor){cached={binary:descriptor.binary,stamp:fileStamp(descriptor.binary),descriptor};return descriptor;}
  throw Error('CODEX_RUNTIME_NOT_FOUND: 需要已驗證 Codex CLI '+SUPPORTED_CODEX_VERSIONS.join(' 或 ')+'；Desktop可能已更新。請使用本副本固定版本安裝或先完成新版相容性核驗；不自動下載或接受其他版本。');
 };
}
const resolve=createCodexResolver();export const resolveCodexRuntime=()=>resolve();export const resolveCodex=()=>resolve().binary;


