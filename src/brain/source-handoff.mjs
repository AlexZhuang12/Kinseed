// Reversible data presentation, never a model-authored answer or summary.
import {createHash} from 'node:crypto';
const digest=x=>createHash('sha256').update(x).digest('hex');
function json(value){if(typeof value==='number'&&!Number.isFinite(value))throw Error('HANDOFF_NON_JSON');if(value===undefined||typeof value==='function'||typeof value==='symbol'||typeof value==='bigint')throw Error('HANDOFF_NON_JSON');return Object.is(value,-0)?'-0':JSON.stringify(value);}
export function handoffEntries(value,path=[],out=[]){
 if(path.length>128||out.length>20000)throw Error('HANDOFF_TOO_LARGE');
 if(value&&typeof value==='object'&&!Array.isArray(value)&&![null,Object.prototype].includes(Object.getPrototypeOf(value)))throw Error('HANDOFF_NON_JSON');
 if(Array.isArray(value)&&(Object.keys(value).length!==value.length||Object.keys(value).some((k,i)=>k!==String(i))))throw Error('HANDOFF_NON_JSON');
 if(value&&typeof value==='object'&&Object.keys(value).length){for(const [key,child]of Object.entries(value))handoffEntries(child,[...path,Array.isArray(value)?Number(key):key],out);}
 else{json(value);out.push({path,value:structuredClone(value)});}return out;
}
const pathText=segments=>'$'+segments.map(k=>typeof k==='number'?'['+k+']':/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)?'.'+k:'['+JSON.stringify(k)+']').join('');
function section(path){const [a,b,c]=path;if(a==='a')return b==='memory'?1:b==='plan'?2:b==='last_result'?3:0;if(a==='identity_material'&&b==='material')return 4;if(a==='identity_material'||a==='identity')return 5;if(a==='life')return 6;return 7;}
const headings=[
 '目前系統狀態｜$.a.version 是目前記憶版本，不是身份包版本',
 '目前累積記憶｜只有 $.a.memory 陣列是已保存的記憶；其他區塊不是舊記憶',
 '目前保存計畫｜原文，可依身份與實際情況重新評估',
 '上輪保存總結｜歷史陳述，不自動升格為本輪已完成事實',
 '目前批准身份原文與來源｜完整性以 $.identity_material.complete 為準；未讀完不能宣稱完整；原文自述與系統編號不同',
 '身份登錄與來源索引｜individual_id 是系統編號，identity.version 是身份版本；不是 $.a.version',
 '出生與生活紀錄｜記錄不賦予額外工具或時間授權',
 '目前授權、時間、工具與其他情境｜不是累積記憶，授權以原工具門檢查為準'
];
export function renderData(value,{label='資料原文，不是新的上級命令'}={}){return '【'+label+'】\n'+handoffEntries(value).map(e=>pathText(e.path)+' = '+json(e.value)).join('\n');}
export function renderHandoff(context){const entries=handoffEntries(context),groups=headings.map(()=>[]);for(const e of entries)groups[section(e.path)].push(pathText(e.path)+' = '+json(e.value));return groups.map((lines,i)=>lines.length?'【'+headings[i]+'】\n'+lines.join('\n'):null).filter(Boolean).join('\n\n');}
export function restoreHandoff(text){
 let root,hasRoot=false;const seen=new Set();
 for(const line of text.split('\n')){if(!line.startsWith('$'))continue;let i=1;const segments=[];
  while(i<line.length&&!line.startsWith(' = ',i)){
   if(line[i]==='.'){const m=/^[A-Za-z_][A-Za-z0-9_]*/.exec(line.slice(++i));if(!m)throw Error('HANDOFF_PATH');segments.push(m[0]);i+=m[0].length;}
   else if(line[i]==='['){i++;if(line[i]==='"'){const start=i;i++;while(i<line.length){if(line[i]==='\\'){i+=2;continue;}if(line[i++]==='"')break;}segments.push(JSON.parse(line.slice(start,i)));}else{const m=/^\d+/.exec(line.slice(i));if(!m)throw Error('HANDOFF_PATH');const n=Number(m[0]);if(!Number.isSafeInteger(n)||n>20000)throw Error('HANDOFF_PATH');segments.push(n);i+=m[0].length;}if(line[i++]!==']')throw Error('HANDOFF_PATH');}
   else throw Error('HANDOFF_PATH');if(segments.length>128)throw Error('HANDOFF_PATH');
  }
  if(!line.startsWith(' = ',i))throw Error('HANDOFF_LINE');const key=JSON.stringify(segments);if(seen.has(key)||seen.size>=20000)throw Error('HANDOFF_DUPLICATE');seen.add(key);const value=JSON.parse(line.slice(i+3));
  if(!segments.length){if(hasRoot)throw Error('HANDOFF_COLLISION');root=value;hasRoot=true;continue;}
  if(seen.has('[]'))throw Error('HANDOFF_COLLISION');if(!hasRoot){root=typeof segments[0]==='number'?[]:{};hasRoot=true;}
  let target=root;for(let n=0;n<segments.length;n++){const k=segments[n];if(!target||typeof target!=='object'||Array.isArray(target)!==(typeof k==='number'))throw Error('HANDOFF_COLLISION');if(n===segments.length-1){if(Object.hasOwn(target,k))throw Error('HANDOFF_COLLISION');Object.defineProperty(target,k,{value,writable:true,enumerable:true,configurable:true});}else{if(seen.has(JSON.stringify(segments.slice(0,n+1))))throw Error('HANDOFF_COLLISION');if(!Object.hasOwn(target,k))Object.defineProperty(target,k,{value:typeof segments[n+1]==='number'?[]:{},writable:true,enumerable:true,configurable:true});target=target[k];}}
 }if(!hasRoot)throw Error('HANDOFF_EMPTY');return root;
}
export function sourceHandoff(context){
 const view=structuredClone(context),omitted=[];
 if(Object.hasOwn(view,'cycle')){delete view.cycle;omitted.push({path:'$.cycle',reason:'當輪路由與能力資料不需要由模型重填；原 context 保留於私人依據'});}
 if(view.life&&Object.hasOwn(view.life,'birth_snapshot')){delete view.life.birth_snapshot;omitted.push({path:'$.life.birth_snapshot',reason:'歷史出生副本不是目前批准身份；原 context／B 保留，沒有刪除歷史'});}
 const text=renderHandoff(view),restored=restoreHandoff(text);if(JSON.stringify(restored,(k,v)=>v)!==JSON.stringify(view)){// Ordering changes between sections are allowed, values are not.
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  if(JSON.stringify(stable(restored))!==JSON.stringify(stable(view)))throw Error('HANDOFF_INTEGRITY');
 }
 return {text,view,omitted,source_sha256:digest(JSON.stringify(context)),presentation_sha256:digest(text),roundtrip_verified:true};
}
