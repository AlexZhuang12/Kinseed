import fs from 'node:fs';
import {hash} from './store.mjs';
export const safeID=x=>typeof x==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(x);
const exact=(o,keys,where,optional=[])=>{if(!o||typeof o!=='object'||Array.isArray(o))throw Error(where+':OBJECT_REQUIRED');const missing=keys.filter(k=>!optional.includes(k)&&!Object.hasOwn(o,k)),unknown=Object.keys(o).filter(k=>!keys.includes(k));if(missing.length||unknown.length)throw Error(where+':FIELDS missing='+missing.join(',')+' unknown='+unknown.map(k=>k.slice(0,60)).join(','));};
const text=(s,n,where)=>{if(typeof s!=='string'||!s.length||s.length>n)throw Error(where+':TEXT');};
export function validatePackage(p){
 exact(p,['schema_version','package_id','version','title','test_only','goal','preferences','sources','conditions','draft_status'],'PACKAGE',['draft_status']);
 if(p.draft_status!==undefined&&!['DRAFT / NOT FROZEN','OWNER REVIEWED / DRAFT / NOT FROZEN','SYNTHETIC / NOT FROZEN'].includes(p.draft_status))throw Error('PACKAGE:DRAFT_STATUS');
 if(p.schema_version!==1)throw Error('PACKAGE:SCHEMA_VERSION');
 if(!safeID(p.package_id)||!Number.isInteger(p.version)||p.version<1||typeof p.test_only!=='boolean')throw Error('PACKAGE:IDENTITY');
 text(p.title,200,'TITLE');text(p.goal,1000,'GOAL');
 if(!Array.isArray(p.preferences)||p.preferences.length>3)throw Error('PREFERENCES');p.preferences.forEach(v=>text(v,200,'PREFERENCE'));
 if(!Array.isArray(p.sources)||p.sources.length<1||p.sources.length>10||!Array.isArray(p.conditions)||p.conditions.length<1||p.conditions.length>100)throw Error('PACKAGE:ARRAY');
 const sources=new Map();
 for(const s of p.sources){exact(s,['source_id','path','version','sha256','bytes_base64'],'SOURCE');if(!safeID(s.source_id)||sources.has(s.source_id))throw Error('SOURCE:DUPLICATE_ID');
  if(typeof s.path!=='string'||!/^[-a-zA-Z0-9_./]+$/.test(s.path)||s.path.startsWith('/')||s.path.split('/').some(x=>x==='..'||!x))throw Error('SOURCE:PATH');
  text(s.version,100,'SOURCE_VERSION');if(typeof s.bytes_base64!=='string'||s.bytes_base64.length>2000000||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s.bytes_base64))throw Error('SOURCE:ENCODING');
  const b=Buffer.from(s.bytes_base64,'base64');if(hash(b)!==s.sha256)throw Error('SOURCE:HASH');new TextDecoder('utf-8',{fatal:true}).decode(b);sources.set(s.source_id,b);
 }
 const ids=new Set();for(const c of p.conditions){exact(c,['condition_id','source_id','byte_start','byte_end','raw_text','sha256','owner_choice'],'CONDITION');
  if(!/^[A-Z0-9-]{1,50}$/.test(c.condition_id)||ids.has(c.condition_id))throw Error('CONDITION:DUPLICATE_ID');ids.add(c.condition_id);
  const b=sources.get(c.source_id);if(!b||!Number.isInteger(c.byte_start)||!Number.isInteger(c.byte_end)||c.byte_start<0||c.byte_end<=c.byte_start||c.byte_end>b.length)throw Error('CONDITION:BYTE_RANGE');
  const selected=b.subarray(c.byte_start,c.byte_end);if(selected.toString('utf8')!==c.raw_text||hash(selected)!==c.sha256)throw Error('CONDITION:HASH');text(c.owner_choice,5000,'OWNER_CHOICE');
 }
 return structuredClone(p);
}
export function original56(file){
 const bytes=fs.readFileSync(file),s=bytes.toString('utf8'),matches=[...s.matchAll(/^## Q([1-7])｜.*$/gm)];
 if(matches.length!==56)throw Error('CONDITION_COUNT');
 const conditions=matches.map((m,i)=>{const prefix=s.slice(0,m.index),stages=[...prefix.matchAll(/^# Stage ([1-8])｜/gm)],stage=stages.at(-1)?.[1];if(!stage)throw Error('STAGE');
  const after=s.slice(m.index+m[0].length),next=after.search(/^#{1,2} (?:Q[1-7]｜|Stage )/m),end=next<0?s.length:m.index+m[0].length+next;
  const raw=s.slice(m.index,end),choice=raw.split(/\r?\n/).filter(l=>/Owner|選擇|自訂|自定/.test(l)).join('\n');
  return {condition_id:`S${stage}Q${m[1]}`,source_id:'original-56',byte_start:Buffer.byteLength(prefix),byte_end:Buffer.byteLength(s.slice(0,end)),raw_text:raw,sha256:hash(Buffer.from(raw)),owner_choice:choice||'見完整來源原文；不補造缺失選項'};
 });
 return validatePackage({schema_version:1,package_id:'kinseed-original-56',version:2,draft_status:'OWNER REVIEWED / DRAFT / NOT FROZEN',title:'56 項原生條件｜草案／未凍結',test_only:false,goal:'依經 Owner 批准的完整原生條件生活；有效能力仍受控制台授權限制。',preferences:['條件原文與來源保持完整','來源缺口不補造'],sources:[{source_id:'original-56',path:'docs/INITIAL_CONDITIONS_56_v0.1.md',version:'v0.1',sha256:hash(bytes),bytes_base64:bytes.toString('base64')}],conditions});
}
export function synthetic(name,goal){const b=Buffer.from(goal,'utf8');return validatePackage({schema_version:1,package_id:name,version:1,draft_status:'SYNTHETIC / NOT FROZEN',title:name+' 測試身份',test_only:true,goal,preferences:['只使用已授權的本機筆記工具'],sources:[{source_id:name,path:'synthetic/'+name+'.txt',version:'1',sha256:hash(b),bytes_base64:b.toString('base64')}],conditions:[{condition_id:'TEST-1',source_id:name,byte_start:0,byte_end:b.length,raw_text:goal,sha256:hash(b),owner_choice:'工程測試資料，不代表正式原生條件'}]});}
