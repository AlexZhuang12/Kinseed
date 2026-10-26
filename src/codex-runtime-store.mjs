import fs from 'node:fs';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {CODEX_VERSION,parseCodexVersion,SUPPORTED_CODEX_VERSIONS} from './codex-versions.mjs';
export const RUNTIME_FILES=Object.freeze(['codex.exe','codex-command-runner.exe','codex-code-mode-host.exe','codex-windows-sandbox-setup.exe']);
const verified=new Map();
function plain(root,target){const rel=path.relative(root,target);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('CODEX_RUNTIME_SCOPE');let p=target;for(;;){if(fs.lstatSync(p,{throwIfNoEntry:false})?.isSymbolicLink())throw Error('CODEX_RUNTIME_LINK');if(p===root)break;p=path.dirname(p);}}
export function binarySHA(file){const fd=fs.openSync(file,'r'),buffer=Buffer.alloc(1024*1024),h=createHash('sha256');try{let n;while((n=fs.readSync(fd,buffer,0,buffer.length,null)))h.update(buffer.subarray(0,n));return h.digest('hex');}finally{fs.closeSync(fd);}}
export function fileStamp(file){const s=fs.statSync(file);return [s.dev,s.ino,s.size,s.mtimeMs,s.ctimeMs].join(':');}
export function managedCodex(root,version=CODEX_VERSION){
 if(!SUPPORTED_CODEX_VERSIONS.includes(version))throw Error('CODEX_RUNTIME_VERSION');root=path.resolve(root);const dir=path.join(root,'.private/codex-runtime',version);plain(root,dir);if(!fs.existsSync(dir))return null;
 const manifest=path.join(dir,'manifest.json');plain(root,manifest);if(!fs.existsSync(manifest))throw Error('CODEX_RUNTIME_INTEGRITY: incomplete managed runtime');
 const names=fs.readdirSync(dir).sort(),expected=[...RUNTIME_FILES,'manifest.json'].sort();if(JSON.stringify(names)!==JSON.stringify(expected))throw Error('CODEX_RUNTIME_INTEGRITY: unexpected files');
 for(const f of names){plain(root,path.join(dir,f));if(!fs.statSync(path.join(dir,f)).isFile())throw Error('CODEX_RUNTIME_INTEGRITY: not a file');}
 const stamp=names.map(f=>f+':'+fileStamp(path.join(dir,f))).join('|');if(verified.get(dir)?.stamp===stamp)return verified.get(dir).descriptor;
 let m;try{m=JSON.parse(fs.readFileSync(manifest));}catch{throw Error('CODEX_RUNTIME_INTEGRITY: unreadable manifest');}if(m.schema!==1||m.kind!=='kinseed-codex-runtime'||m.version!==version||JSON.stringify(Object.keys(m.files??{}).sort())!==JSON.stringify([...RUNTIME_FILES].sort()))throw Error('CODEX_RUNTIME_INTEGRITY: manifest');
 for(const f of RUNTIME_FILES)if(!/^[a-f0-9]{64}$/.test(m.files[f])||binarySHA(path.join(dir,f))!==m.files[f])throw Error('CODEX_RUNTIME_INTEGRITY: checksum '+f);
 const descriptor={binary:path.join(dir,'codex.exe'),version,origin:'managed',integrity:'sha256_verified'};verified.set(dir,{stamp,descriptor});return descriptor;
}
export function pinCodex(root,source,{run=spawnSync,env=process.env}={}){
 root=path.resolve(root);source=path.resolve(source);if(path.basename(source)!=='codex.exe'||fs.lstatSync(source).isSymbolicLink())throw Error('CODEX_RUNTIME_SOURCE');
 const check=run(source,['--version'],{env,encoding:'utf8',windowsHide:true,timeout:10000}),version=check.status===0?parseCodexVersion(check.stdout):null;if(!version)throw Error('CODEX_RUNTIME_VERSION');const existing=managedCodex(root,version);if(existing)return {...existing,reused:true};
 const parent=path.join(root,'.private/codex-runtime');plain(root,parent);fs.mkdirSync(parent,{recursive:true});const dir=path.join(parent,version),temp=path.join(parent,'.pin-'+randomUUID());plain(root,temp);fs.mkdirSync(temp);const files={};
 // Failed temporary bundles remain evidence and are never selected for execution.
 for(const name of RUNTIME_FILES){const from=path.join(path.dirname(source),name),to=path.join(temp,name);if(!fs.existsSync(from)||fs.lstatSync(from).isSymbolicLink()||!fs.statSync(from).isFile())throw Error('CODEX_RUNTIME_SOURCE: missing companion '+name);const before=fileStamp(from),sha=binarySHA(from);fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);if(fileStamp(from)!==before||binarySHA(to)!==sha)throw Error('CODEX_RUNTIME_COPY_CHANGED');files[name]=sha;}
 fs.writeFileSync(path.join(temp,'manifest.json'),JSON.stringify({schema:1,kind:'kinseed-codex-runtime',version,files,pinned_at:new Date().toISOString()},null,2),{flag:'wx',mode:0o600});
 const copied=run(path.join(temp,'codex.exe'),['--version'],{env,encoding:'utf8',windowsHide:true,timeout:10000});if(copied.status!==0||parseCodexVersion(copied.stdout)!==version)throw Error('CODEX_RUNTIME_COPY_VERSION');
 if(fs.existsSync(dir))throw Error('CODEX_RUNTIME_CONCURRENT_PIN');fs.renameSync(temp,dir);return {...managedCodex(root,version),reused:false};
}
