import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
export const CODEX_VERSION='0.163.0-alpha.10.2';
export function npmBinaryCandidates(root){const bases=[path.join(root,'.private/codex-cli/node_modules/@openai'),path.join(process.env.APPDATA??'','npm/node_modules/@openai')],out=[];for(const base of bases)for(const pkg of ['codex','codex-win32-x64','codex-win32-arm64']){for(const suffix of ['vendor/x86_64-pc-windows-msvc/codex/codex.exe','vendor/aarch64-pc-windows-msvc/codex/codex.exe','vendor/x86_64-pc-windows-msvc/bin/codex.exe','vendor/aarch64-pc-windows-msvc/bin/codex.exe']){out.push(path.join(base,pkg,suffix));out.push(path.join(base,'codex/node_modules/@openai',pkg,suffix));}}return out;}
let cached;
export function resolveCodex(){
 if(cached&&fs.existsSync(cached))return cached;
 const candidates=[...npmBinaryCandidates(path.resolve(import.meta.dirname,'..')),...(process.env.PATH??'').split(path.delimiter).filter(Boolean).map(p=>path.join(p,'codex.exe'))];
 const vendor=path.join(process.env.LOCALAPPDATA??'','OpenAI','Codex','bin');
 if(path.isAbsolute(vendor)&&fs.existsSync(vendor))for(const entry of fs.readdirSync(vendor,{withFileTypes:true}).filter(e=>e.isDirectory()&&/^[a-f0-9]{8,64}$/i.test(e.name)).slice(-8).reverse())candidates.push(path.join(vendor,entry.name,'codex.exe'));
 const env=Object.fromEntries(['PATH','SystemRoot','WINDIR','USERPROFILE','HOMEDRIVE','HOMEPATH','LOCALAPPDATA','APPDATA','TEMP','TMP'].filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
 for(const file of [...new Set(candidates)])if(path.isAbsolute(file)&&fs.existsSync(file)&&!fs.lstatSync(file).isSymbolicLink()){const r=spawnSync(file,['--version'],{env,encoding:'utf8',windowsHide:true,timeout:10000});if(r.status===0&&r.stdout.includes('0.163.0-alpha.10.2')){cached=file;return file;}}
 throw Error('CODEX_RUNTIME_NOT_FOUND: 需要已驗證 Codex CLI 0.163.0-alpha.10.2（本副本安裝、PATH 或現有 Codex Desktop）；不自動下載或接受新版本');
}


