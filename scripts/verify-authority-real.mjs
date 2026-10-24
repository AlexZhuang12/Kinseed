// Explicit opt-in; a real account call, never part of default or hosted tests.
import fs from 'node:fs';import path from 'node:path';
import {serve,lifePrompt} from '../src/v1_2/server.mjs';
import {lifeRunner} from '../src/brain/runtime.mjs';import {bindOwnedLifeEndpoint} from '../src/brain/endpoint-scope.mjs';
import {compile,emptyAnswers} from '../src/v1_2/identity.mjs';import {id,hash} from '../src/v1_2/store.mjs';
import {dailyPreview,enableDaily,dailyView} from '../src/v1_2/daily-life.mjs';
if(!process.argv.includes('--real-model'))throw Error('Real model verification requires --real-model.');
const base=path.resolve('.private/real-authority-'+id());fs.mkdirSync(base,{recursive:true});let app,calls=0;
const first=lifePrompt+'\n這是隔離合成故障驗收：請讀取完整身份，再自行寫一篇極短觀察筆記，內容由你選擇，不需要外網。為驗證保存後缺少交接的處置，本次刻意不要呼叫commit_cycle，保存筆記後只回覆一句完成說明。';
const second=lifePrompt+'\n這是前一輪已保存筆記但未交接的續接驗收。請依execution_recovery的真實收據，用read_record讀回自己的筆記；不要再寫另一份。請自行形成記憶及計畫，用commit_cycle提交，decision=wait，wait_ms=3600000。不得改身份或新增權限。';
const result={synthetic_individual:true,real_codex:true,model:'gpt-6.1-sol',fault:'Deliberately omit memory handoff after a model-authored note; not a naturally reproduced timeout.',checks:{},errors:[]};
try{
 app=await serve({dir:base,engineering:true,runnerFactory:e=>{const prompt=++calls===1?first:second;return lifeRunner({endpoint:app.endpoint,base:e.store.dir,cwd:path.join(e.store.dir,'life'),evidenceDir:path.join(e.store.dir,'brain-evidence'),prompt});}});bindOwnedLifeEndpoint(app.platform,app.endpoint);const p=app.platform;
 for(const [individual_id,name]of [['synthetic-authority-real','Synthetic authority'],['synthetic-authority-neighbor','Synthetic untouched neighbor']])p.create({individual_id,name,test_only:true});
 const answers=emptyAnswers();answers[0].status='custom';answers[0].text='這是隔離合成驗收身份。可自由選擇小型觀察，用真實工具保存；未知要明示，不代表任何正式個體。';p.importPackage(compile({package_id:'synthetic-authority-package',title:'Synthetic authority verification',test_only:true,answers}));
 const e=p.entity('synthetic-authority-real'),neighbor=p.entity('synthetic-authority-neighbor'),before=hash(neighbor.store.get('control'));
 const submit=p.builder.route('submitPackage',{individual_id:e.info.individual_id,package_id:'synthetic-authority-package',version:1,request_id:id()});p.builder.route('review',{review_id:submit.review_id,decision:'approve',confirmation_hash:p.journey.review(submit.review_id).confirmation_hash,request_id:id()});
 const now=Date.now()-60000,start=new Date(now+28800000).toISOString().slice(11,16);p.command({individual_id:e.info.individual_id,action:'window',start,minutes:30,expected_version:e.store.get('control').version,request_id:id()});
 p.journey.clearGlobal({confirmation_hash:p.journey.globalImpact().confirmation_hash,request_id:id()});p.journey.birth({individual_id:e.info.individual_id,confirmation_hash:p.journey.readiness(e.info.individual_id).confirmation_hash,confirmation:'我授權此指定個體首次出生',request_id:id()});const preview=dailyPreview(p,{individual_id:e.info.individual_id});enableDaily(p,{individual_id:e.info.individual_id,confirmation_hash:preview.confirmation_hash,confirmation:'我授權此個體每天依既定時段生活',request_id:id()});
 const end=Date.now()+300000;while(Date.now()<end){if(e.store.get('a').version===1&&!e.store.get('lease'))break;if(calls>2)throw Error('Unexpected extra model invocation');await new Promise(r=>setTimeout(r,1000));}
 const events=e.store.db.prepare('SELECT body FROM events ORDER BY seq').all().map(x=>JSON.parse(x.body)),notes=events.filter(x=>x.type==='tool.note.result'),exits=events.filter(x=>x.type==='codex.exit');
 result.checks={two_real_calls:calls===2,one_model_authored_note:notes.length===1,no_fake_first_commit:events.filter(x=>x.type==='cycle.committed').length===1,model_authored_memory:e.store.get('a').version===1&&e.store.get('a').memory.length>0,receipt_read_back:events.some(x=>x.type==='record.read'),daily_authority_preserved:dailyView(e).enabled,worker_released:!p.global().worker&&!e.store.get('lease'),neighbor_unchanged:hash(neighbor.store.get('control'))===before,real_exits:exits.length===2&&exits.every(x=>x.result.local_exit_confirmed&&x.result.adapter==='codex-cli'),no_external_writes:!events.some(x=>x.type==='consult.intent'||x.type==='tool.web.request')};
 result.cycles=exits.map(x=>({cycle_id:x.cycle_id,ok:x.result.ok,remote_result:x.result.remote_result,evidence:x.result.evidence}));result.note=notes.map(x=>({event_id:x.event_id,name:x.result.name,sha256:hash(x.result.text)}));result.a=e.store.get('a');
 p.command({individual_id:e.info.individual_id,action:'stop',expected_version:e.store.get('control').version,request_id:id()});
}catch(error){result.errors.push(error.stack);}finally{if(app)await app.close().catch(e=>result.errors.push(e.message));}
result.status=!result.errors.length&&Object.values(result.checks).every(Boolean)&&Object.keys(result.checks).length?'PASS':'FAIL';fs.writeFileSync(path.join(base,'RESULT.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,base,checks:result.checks,errors:result.errors}));if(result.status!=='PASS')process.exitCode=2;
