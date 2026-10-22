import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validatePackage as validateLegacy,safeID} from '../v1_1/packages.mjs';
export {safeID};
export const COMPILER='kinseed-literal-1.2.0';
export const DOMAIN_IDS=['identity','personality','purpose','values','autonomy','motivation','learning','growth'];
export const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export const digest=x=>createHash('sha256').update(Buffer.isBuffer(x)||typeof x==='string'?x:canonical(x)).digest('hex');
export const loadTemplate=()=>JSON.parse(fs.readFileSync(new URL('./template.json',import.meta.url),'utf8'));
const clone=x=>structuredClone(x);
export function assertData(x,depth=0){if(depth>40)throw Error('DATA_DEPTH');if(x&&typeof x==='object')for(const [k,v]of Object.entries(x)){if(['__proto__','constructor','prototype'].includes(k))throw Error('PROTOTYPE_KEY');assertData(v,depth+1);}}
export function shape(schema,value,at='$'){
 if(schema.const!==undefined&&value!==schema.const)throw Error(at+':CONST');
 if(schema.enum&&!schema.enum.includes(value))throw Error(at+':ENUM');
 if(schema.type==='object'){if(!value||typeof value!=='object'||Array.isArray(value))throw Error(at+':OBJECT');for(const k of schema.required??[])if(!Object.hasOwn(value,k))throw Error(at+'.'+k+':REQUIRED');for(const k of Object.keys(value)){if(!Object.hasOwn(schema.properties??{},k)){if(schema.additionalProperties===false)throw Error(at+'.'+k+':UNKNOWN');}else shape(schema.properties[k],value[k],at+'.'+k);}}
 if(schema.type==='array'){if(!Array.isArray(value)||value.length<(schema.minItems??0)||value.length>(schema.maxItems??1000))throw Error(at+':ARRAY');value.forEach((v,i)=>shape(schema.items,v,at+'['+i+']'));}
 if(schema.type==='string'&&(typeof value!=='string'||value.length<(schema.minLength??0)||value.length>(schema.maxLength??2000000)||schema.pattern&&!new RegExp(schema.pattern).test(value)))throw Error(at+':TEXT');
 if(schema.type==='integer'&&(!Number.isSafeInteger(value)||value<(schema.minimum??0)||value>(schema.maximum??Number.MAX_SAFE_INTEGER)))throw Error(at+':INTEGER');
 if(schema.type==='boolean'&&typeof value!=='boolean')throw Error(at+':BOOLEAN');
}
const str=(max=12000)=>({type:'string',maxLength:max}),integer={type:'integer',minimum:1},arr=(items,max=1000,min=0)=>({type:'array',items,maxItems:max,minItems:min});
const obj=(properties,optional=[])=>({type:'object',properties,required:Object.keys(properties).filter(k=>!optional.includes(k)),additionalProperties:false});
const option=obj({id:str(80),label:str(500),definition:str(2000)});
const question=obj({question_id:str(80),text:str(2000),required:{type:'boolean'},options:arr(option,12)});
const templateDomain=obj({domain_id:{type:'string',enum:DOMAIN_IDS},name:str(200),questions:arr(question,12,1)});
const templateSchema=obj({template_id:str(80),template_version:integer,domains:arr(templateDomain,8,8)});
const answerSchema=obj({answer_id:str(100),question_id:str(80),status:{type:'string',enum:['unanswered','skipped','answered','custom']},text:str(),selected:arr(option,12),supplement:str(),exceptions:str(),updated_at:str(60)});
const refSchema=obj({condition_id:str(100)});
const statementSchema=obj({statement_id:str(100),kind:{type:'string',enum:['initial','owner_edit']},text:str(100000),certainty:{type:'string',enum:['specified','uncertain']},source_refs:arr(refSchema,100,1)});
const domainSchema=obj({domain_id:{type:'string',enum:DOMAIN_IDS},name:str(200),execution_description:str(30000),statements:arr(statementSchema,100)});
const issueSchema=obj({issue_id:str(100),kind:{type:'string',enum:['missing','uncertain','conflict','unsupported']},severity:{type:'string',enum:['warning','blocking']},refs:arr(str(100),100),message:str(6000)});
const sourceSchema=obj({source_id:str(80),path:str(200),version:str(100),sha256:str(64),bytes_base64:str(2000000)});
const conditionSchema=obj({condition_id:str(100),source_id:str(80),byte_start:{type:'integer',minimum:0},byte_end:integer,raw_text:str(500000),sha256:str(64),owner_choice:str(5000)});
export const packageSchema={...obj({schema_version:{const:2},package_id:str(80),version:integer,title:str(200),test_only:{type:'boolean'},draft_status:{type:'string',enum:['DRAFT / NOT FROZEN','OWNER REVIEWED / DRAFT / NOT FROZEN','SYNTHETIC / NOT FROZEN']},goal:str(1000),preferences:arr(str(200),3),created_at:str(60),template:templateSchema,answers:arr(answerSchema,100),sources:arr(sourceSchema,10,1),conditions:arr(conditionSchema,100,1),domains:arr(domainSchema,8,8),issues:arr(issueSchema,300),compiler:obj({version:str(80),input_hash:str(64),semantic_hash:str(64)}),edits:arr(obj({statement_id:str(100),before:str(100000),after:str(100000),reason:str(2000),source_condition:str(100)}),100),extensions:arr(obj({namespace:str(100),required:{type:'boolean'},data:{}}),20),lineage:arr(obj({package_id:str(80),version:integer,sha256:str(64)}),100)}),$schema:'https://json-schema.org/draft/2020-12/schema',title:'Kinseed Identity Package schema 2'};
function unique(items,key,label){const s=new Set();for(const v of items){if(s.has(v[key]))throw Error(label+':DUPLICATE');s.add(v[key]);}return s;}
export function validateTemplate(t){assertData(t);shape(templateSchema,t);if(!safeID(t.template_id))throw Error('TEMPLATE_ID');if(!t.domains.find(d=>d.domain_id==='identity')?.questions.some(q=>q.required))throw Error('TEMPLATE_SELF_REQUIRED');const ds=unique(t.domains,'domain_id','DOMAIN');if(DOMAIN_IDS.some(x=>!ds.has(x)))throw Error('DOMAINS');unique(t.domains.flatMap(d=>d.questions),'question_id','QUESTION');for(const d of t.domains)for(const q of d.questions)unique(q.options,'id','OPTION');return t;}
export function answerText(a){return [a.text,...a.selected.map(s=>s.label+'：'+s.definition),a.supplement&&'補充：'+a.supplement,a.exceptions&&'例外與限制：'+a.exceptions].filter(Boolean).join('\n');}
export function validateAnswers(template,answers){validateTemplate(template);shape(arr(answerSchema,100),answers);unique(answers,'answer_id','ANSWER');const qs=new Map(template.domains.flatMap(d=>d.questions).map(q=>[q.question_id,q]));unique(answers,'question_id','ANSWER_QUESTION');for(const a of answers){const q=qs.get(a.question_id);if(!q)throw Error('ANSWER_QUESTION_UNKNOWN');if(a.answer_id!==a.question_id)throw Error('ANSWER_ID');unique(a.selected,'id','ANSWER_OPTION');for(const op of a.selected)if(!q.options.some(x=>canonical(x)===canonical(op)))throw Error('OPTION_SNAPSHOT');if(['unanswered','skipped'].includes(a.status)&&answerText(a))throw Error('SKIPPED_WITH_CONTENT');if(['answered','custom'].includes(a.status)&&!answerText(a).trim())throw Error('ANSWER_EMPTY');}return answers;}
export function emptyAnswers(t=loadTemplate()){return t.domains.flatMap(d=>d.questions.map(q=>({answer_id:q.question_id,question_id:q.question_id,status:'unanswered',text:'',selected:[],supplement:'',exceptions:'',updated_at:''})));}
export function semanticHash(p){return digest({domains:p.domains,issues:p.issues,answers:p.answers,conditions:p.conditions,template:p.template,edits:p.edits});}
export function seal(p){p.compiler.semantic_hash=semanticHash(p);return p;}
export function validatePackage(p){
 assertData(p);if(p?.schema_version===1)return validateLegacy(p);shape(packageSchema,p);if(Buffer.byteLength(JSON.stringify(p))>1000000)throw Error('PACKAGE_SIZE_LIMIT：標準包最多1000000 bytes，請縮短內容；原草稿保留');validateTemplate(p.template);validateAnswers(p.template,p.answers);
 // Preserve the existing authoritative byte-range/hash and safe-path validation.
 validateLegacy(Object.fromEntries(['schema_version','package_id','version','title','test_only','goal','preferences','sources','conditions','draft_status'].map(k=>[k,k==='schema_version'?1:p[k]])));
 if(!safeID(p.package_id)||p.compiler.semantic_hash!==semanticHash(p))throw Error('SEMANTIC_HASH');
 const cs=new Map(p.conditions.map(c=>[c.condition_id,c])),sids=new Set(),domains=unique(p.domains,'domain_id','DOMAIN');if(DOMAIN_IDS.some(x=>!domains.has(x)))throw Error('DOMAINS');
 for(const d of p.domains){for(const s of d.statements){if(sids.has(s.statement_id))throw Error('STATEMENT_DUPLICATE');sids.add(s.statement_id);for(const r of s.source_refs)if(!cs.has(r.condition_id))throw Error('SOURCE_REF');if(!s.source_refs.some(r=>cs.get(r.condition_id).raw_text===s.text))throw Error('STATEMENT_NOT_LITERAL');}if(d.execution_description!==describe(d))throw Error('EXECUTION_MAPPING');}
 for(const c of p.conditions)if(!p.domains.some(d=>d.statements.some(s=>s.source_refs.some(r=>r.condition_id===c.condition_id))))throw Error('UNMAPPED_CONDITION');
 for(const x of p.extensions)if(x.required)throw Error('REQUIRED_EXTENSION_UNSUPPORTED');
 if(p.answers.length)for(const expected of issuesFor(p.template,p.answers))if(!p.issues.some(i=>i.issue_id===expected.issue_id&&i.severity===expected.severity))throw Error('REQUIRED_ISSUE_MISSING');
 const answers=new Map(p.answers.map(a=>[a.answer_id,a]));for(const a of answers.values()){const text=answerText(a);if(text&&!p.conditions.some(c=>c.condition_id===a.answer_id.toUpperCase().replaceAll('.','-')&&c.raw_text===text))throw Error('ANSWER_MAPPING');}
 for(const issue of p.issues)for(const ref of issue.refs)if(!cs.has(ref)&&!answers.has(ref)&&!DOMAIN_IDS.includes(ref))throw Error('ISSUE_REF');
 return JSON.parse(canonical(p));
}
export function describe(d){return d.statements.length?d.statements.map(s=>s.text.length<=160?s.text:`[${s.statement_id}] ${s.text.split(/\r?\n/).filter(l=>/^\*\*Owner 選擇|^- /.test(l)).slice(0,3).join('\n')||s.text.split(/\r?\n/)[0]}；完整選擇、條文、例外與限制必讀此條目來源；未讀不得依概要執行。`).join('\n\n'):'未設定／未確認';}
function condition(source_id,condition_id,text,start=0,choice='Owner 原始回答'){const b=Buffer.from(text);return {condition_id,source_id,byte_start:start,byte_end:start+b.length,raw_text:text,sha256:digest(b),owner_choice:choice};}
function statement(c){return {statement_id:c.condition_id,kind:'initial',text:c.raw_text,certainty:/尚未|未定|待補|未確認/.test(c.raw_text)?'uncertain':'specified',source_refs:[{condition_id:c.condition_id}]};}
function issuesFor(template,answers){const issues=[];for(const d of template.domains)for(const q of d.questions){const a=answers.find(a=>a.question_id===q.question_id);if(!a||['unanswered','skipped'].includes(a.status))issues.push({issue_id:'missing-'+q.question_id,kind:'missing',severity:q.required?'blocking':'warning',refs:[d.domain_id],message:q.text+'：'+(a?.status==='skipped'?'明確跳過':'未作答')});}
 // Conservative, deterministic literal contradiction detection. Not an LLM judgement.
 const lines=answers.flatMap(a=>answerText(a).split(/\r?\n/).filter(Boolean).map(text=>({text,answer_id:a.answer_id})));
 for(let i=0;i<lines.length;i++)for(let j=0;j<i;j++)if(lines[i].text==='不'+lines[j].text||lines[j].text==='不'+lines[i].text)issues.push({issue_id:'conflict-'+i+'-'+j,kind:'conflict',severity:'blocking',refs:[lines[j].answer_id,lines[i].answer_id],message:'相反的明確陳述，請修改原始答案：'+lines[j].text+'／'+lines[i].text});return issues;}
export function compile(input){
 const {template=loadTemplate(),answers=emptyAnswers(template),package_id,version=1,title,test_only=true,created_at=new Date().toISOString()}=input;validateAnswers(template,answers);if(!safeID(package_id)||!title||title.length>200||typeof test_only!=='boolean')throw Error('IDENTITY_METADATA');
 const sources=[],conditions=[],domains=template.domains.map(d=>({domain_id:d.domain_id,name:d.name,execution_description:'',statements:[]}));
 for(const d of template.domains)for(const q of d.questions){const a=answers.find(a=>a.question_id===q.question_id),text=a&&answerText(a);if(!text)continue;const source_id='answer-'+q.question_id.replaceAll('.','-'),b=Buffer.from(text),c=condition(source_id,a.answer_id.toUpperCase().replaceAll('.','-'),text);sources.push({source_id,path:'answers/'+source_id+'.txt',version:'1',sha256:digest(b),bytes_base64:b.toString('base64')});conditions.push(c);domains.find(x=>x.domain_id===d.domain_id).statements.push(statement(c));}
 // One combined answer snapshot keeps the legacy source-count contract (max 10).
 if(!sources.length){const b=Buffer.from('未設定／未確認');sources.push({source_id:'empty-input',path:'answers/empty.txt',version:'1',sha256:digest(b),bytes_base64:b.toString('base64')});const c=condition('empty-input','EMPTY','未設定／未確認');conditions.push(c);domains[0].statements.push(statement(c));}
 else {const b=Buffer.from(conditions.map(c=>c.raw_text).join('\n\n'));let offset=0;for(const c of conditions){c.source_id='builder-answers';c.byte_start=offset;c.byte_end=offset+Buffer.byteLength(c.raw_text);offset=c.byte_end+2;}sources.splice(0,sources.length,{source_id:'builder-answers',path:'answers/builder.txt',version:'1',sha256:digest(b),bytes_base64:b.toString('base64')});}
 for(const d of domains)d.execution_description=describe(d);
 const p={schema_version:2,package_id,version,title,test_only,draft_status:test_only?'SYNTHETIC / NOT FROZEN':'DRAFT / NOT FROZEN',goal:'身份以八領域及完整來源為準；此欄為格式相容索引。',preferences:[],created_at,template:clone(template),answers:clone(answers),sources,conditions,domains,issues:issuesFor(template,answers),compiler:{version:COMPILER,input_hash:digest({template,answers}),semantic_hash:''},edits:[],extensions:[],lineage:[]};
 seal(p);return validatePackage(p);
}
export function approvalIssues(p){validatePackage(p);return p.schema_version===2?[...p.issues,...p.extensions.map(x=>({kind:'unsupported',severity:'warning',message:'未知選填擴充已保存：'+x.namespace}))]:[];}
export function editStatement(p,statement_id,text,reason){
 validatePackage(p);if(p.schema_version!==2||typeof text!=='string'||!text.trim()||text.length>12000||!reason?.trim())throw Error('EDIT_SCHEMA');const out=clone(p),d=out.domains.find(d=>d.statements.some(s=>s.statement_id===statement_id));if(!d)throw Error('STATEMENT_NOT_FOUND');const s=d.statements.find(s=>s.statement_id===statement_id),n=out.edits.length+1,source_id='owner-edit-'+n,b=Buffer.from(text),c=condition(source_id,'EDIT-'+n,text,0,'Owner 候選人工修訂');
 if(out.sources.length>=10)throw Error('SOURCE_LIMIT');out.sources.push({source_id,path:'edits/'+source_id+'.txt',version:'1',sha256:digest(b),bytes_base64:b.toString('base64')});out.conditions.push(c);out.edits.push({statement_id,before:s.text,after:text,reason,source_condition:c.condition_id});s.text=text;s.kind='owner_edit';s.source_refs.push({condition_id:c.condition_id});d.execution_description=describe(d);seal(out);return validatePackage(out);
}
export function mergeCompilation(previous,edited,next,resolution){
 if(!edited.edits.length)return next;const conflicts=edited.edits.map(e=>({statement_id:e.statement_id,base:e.before,owner:e.after,next:next.domains.flatMap(d=>d.statements).find(s=>s.statement_id===e.statement_id)?.text??null}));
 if(!['keep','replace'].includes(resolution)){const err=Error('RECOMPILE_CONFLICT：需明確選擇保留人工版或新編譯版');err.conflicts=conflicts;throw err;}if(resolution==='replace')return next;
 for(const e of edited.edits){if(next.domains.some(d=>d.statements.some(s=>s.statement_id===e.statement_id)))next=editStatement(next,e.statement_id,e.after,e.reason);else throw Error('MERGE_REMOVED_STATEMENT');}return next;
}
export function convertLegacy(old,version){validateLegacy(old);const template=loadTemplate(),domains=template.domains.map(d=>({domain_id:d.domain_id,name:d.name,execution_description:'',statements:[]}));for(const c of old.conditions){const m=c.condition_id.match(/^S([1-8])Q/);domains[m?Number(m[1])-1:0].statements.push(statement(c));}for(const d of domains)d.execution_description=describe(d);
 const p={schema_version:2,package_id:old.package_id,version,title:old.title,test_only:old.test_only,draft_status:old.draft_status??'DRAFT / NOT FROZEN',goal:old.goal,preferences:old.preferences,created_at:new Date().toISOString(),template,answers:[],sources:clone(old.sources),conditions:clone(old.conditions),domains,issues:[{issue_id:'imported-legacy',kind:'uncertain',severity:'warning',refs:[],message:'外部原文匯入，未捏造 Builder 回答；完整條文須按來源讀取。'}],compiler:{version:COMPILER,input_hash:digest(old),semantic_hash:''},edits:[],extensions:[],lineage:[{package_id:old.package_id,version:old.version,sha256:digest(old)}]};
 for(const c of p.conditions)if(/尚未|未定|待補|未確認/.test(c.raw_text))p.issues.push({issue_id:'uncertain-'+c.condition_id,kind:'uncertain',severity:'warning',refs:[c.condition_id],message:'來源含未決或未確認語義，原樣保留；不得自行補定。'});seal(p);return validatePackage(p);
}
