import fs from 'node:fs';import path from 'node:path';import {serve} from '../src/v1_2/server.mjs';import {compile,emptyAnswers} from '../src/v1_2/identity.mjs';import {id} from '../src/v1_2/store.mjs';
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const events=e=>e.store.db.prepare('SELECT body FROM events ORDER BY seq').all().map(r=>JSON.parse(r.body));
export async function delegationFixture({runner,permissions={codex:true,workbench:true,execute:true},executor,clock=()=>Date.now()}={}){
 const home=path.resolve(import.meta.dirname,'../.private');fs.mkdirSync(home,{recursive:true});const base=fs.mkdtempSync(path.join(home,'delegation-'));
 const app=await serve({dir:base,engineering:true,clock,runnerFactory:e=>runner(e)}),p=app.platform;if(executor)p.delegationExecutor=executor;
 p.create({individual_id:'synthetic-delegator',name:'合成委派甲',test_only:true});p.create({individual_id:'synthetic-delegate-neighbor',name:'合成鄰居',test_only:true});const e=p.entity('synthetic-delegator'),neighbor=p.entity('synthetic-delegate-neighbor');
 const answers=emptyAnswers();answers[0].status='custom';answers[0].text='這是合成委派驗收身份，沒有正式個體資料。';p.importPackage(compile({package_id:'synthetic-delegate-package',title:'虛構委派身份',test_only:true,answers}));
 const proposal=p.builder.route('submitPackage',{individual_id:e.info.individual_id,package_id:'synthetic-delegate-package',version:1,request_id:id()});p.builder.route('review',{review_id:proposal.review_id,decision:'approve',confirmation_hash:p.journey.review(proposal.review_id).confirmation_hash,request_id:id()});
 const cmd=(action,extra={})=>p.command({individual_id:e.info.individual_id,action,request_id:id(),expected_version:e.store.get('control').version,...extra});cmd('window',{start:new Date(clock()+28800000).toISOString().slice(11,16),minutes:120});cmd('permissions',{...e.store.get('control').permissions,...permissions});
 const start=()=>{p.journey.clearGlobal({confirmation_hash:p.journey.globalImpact().confirmation_hash,request_id:id()});p.journey.birth({individual_id:e.info.individual_id,confirmation_hash:p.journey.readiness(e.info.individual_id).confirmation_hash,confirmation:'我授權此指定個體首次出生',request_id:id()});};
 return {app,p,e,neighbor,base,cmd,start,async close(){if(!e.store.get('lease'))await app.close();}};
}
export async function until(fn,ms=10000){const end=Date.now()+ms;while(Date.now()<end){if(fn())return;await sleep(20);}throw Error('FIXTURE_WAIT_TIMEOUT');}
