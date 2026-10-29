import path from 'node:path';
import {Journal,digest} from './journal.mjs';
import {BackgroundJobs} from './background-jobs-v2.mjs';
import {kinseedBackgroundRecorder} from './kinseed-background-recorder.mjs';
import {kinseedQueryCoordinator} from './kinseed-query-scope.mjs';

// Host registrations only. No new model tool, permission, provider or spending authority.
export class PlatformBackground {
 constructor(platform,{base=path.join(platform.dir,'app-server-background'),providers={},...options}={}){
  this.platform=platform;this.providers=providers;this.closed=false;this.cursor=0;
  for(const [name,p] of Object.entries(providers))if(!/^[-a-zA-Z0-9_]{1,40}$/.test(name)||!p.provider||typeof p.authorize!=='function'||typeof p.reserve!=='function'||typeof p.settle!=='function')throw Error('BACKGROUND_HOST_REGISTRATION_REQUIRED');
  this.journal=new Journal(base);this.retryAt=new Map();for(const row of this.journal.events)if(row.kind==='background-query-deferred')this.retryAt.set(row.owner,row.next_check_at);
  const registration=row=>{const name=this.journal.latest('provider-binding',row.owner,row.key)?.provider;const p=this.providers[name];if(!p)throw Error('BACKGROUND_PROVIDER_UNAVAILABLE_NO_RESUBMIT');return p;};
  const record=kinseedBackgroundRecorder(platform);
  this.jobs=new BackgroundJobs(this.journal,{...options,now:()=>platform.now(),authorized:owner=>!this.closed&&this.platform.individuals.has(owner),onChange:record,beforeProviderSubmit:row=>{if(registration(row).authorize(row.owner,'submit')!==true)throw Error('BACKGROUND_PERMISSION_REVOKED_BEFORE_SEND');},
   reserveBeforeSubmit:async row=>{const p=registration(row);if(p.authorize(row.owner,'submit')!==true)throw Error('BACKGROUND_PERMISSION_REQUIRED');const e=platform.entity(row.owner),key='background-reserve:'+row.request_key,signature=digest(row),prior=e.store.receipt(key);if(prior){if(prior.signature!==signature)throw Error('BUDGET_RESERVATION_CONFLICT');return prior;}
    // The host target must honor request_key idempotency, including after a crash here.
    const reservation=await p.reserve({...row,reservation_key:row.request_key});if(typeof reservation?.reservation_id!=='string')throw Error('BUDGET_RESERVATION_MISSING');return e.store.tx(()=>{const r={reservation_id:reservation.reservation_id,signature};e.store.putReceipt(key,r);e.store.event('background.budget_reserved',{request_key:row.request_key,reservation_id:r.reservation_id},'background');return r;});},
   settleReceipt:async row=>{const p=registration(row);if(p.authorize(row.owner,'settle')!==true)throw Error('BACKGROUND_PERMISSION_REQUIRED');const e=platform.entity(row.owner),key='background-settle:'+row.settlement_key,signature=digest(row),prior=e.store.receipt(key);if(prior){if(prior.signature!==signature)throw Error('BUDGET_SETTLEMENT_CONFLICT');return prior;}
    const receipt=await p.settle(row);if(receipt?.recorded!==true)throw Error('BUDGET_SETTLEMENT_NOT_CONFIRMED');return e.store.tx(()=>{const r={signature,settlement_key:row.settlement_key,recorded:true};e.store.putReceipt(key,r);e.store.event('background.budget_settled',{request_key:row.request_key,settlement_key:row.settlement_key},'background');return r;});}
  });
  this.coordinator=kinseedQueryCoordinator({jobs:this.jobs,platform,provider:(owner,row)=>{const p=registration(row);if(p.authorize(owner,'query')!==true)throw Error('BACKGROUND_PERMISSION_REQUIRED');return p.provider;}});
 }
 submit(owner,provider,key,input){if(!/^[-a-zA-Z0-9_]{1,100}$/.test(owner)||!/^[-a-zA-Z0-9_]{1,100}$/.test(key))throw Error('BACKGROUND_SCOPE');if(this.closed)throw Error('BACKGROUND_SERVICE_CLOSED');const p=this.providers[provider];if(!p||p.authorize(owner,'submit')!==true)throw Error('BACKGROUND_PERMISSION_REQUIRED');const old=this.journal.latest('provider-binding',owner,key);if(old&&old.provider!==provider)throw Error('BACKGROUND_PROVIDER_CONFLICT');if(!old)this.journal.append({kind:'provider-binding',owner,key,provider});return this.jobs.submit(owner,key,input,p.provider);}
 status(){return {pending:[...this.platform.individuals.keys()].flatMap(owner=>this.jobs.list(owner).filter(r=>!['completed','failed','rejected','not_submitted'].includes(r.state)||r.central_record_pending||r.budget_settlement_pending).map(r=>({owner,key:r.key,state:r.state,job_id:r.job_id??null,central_record_pending:r.central_record_pending,budget_settlement_pending:r.budget_settlement_pending===true,requires_manual_review:r.requires_manual_review===true}))),active:this.jobs.active.size+this.jobs.querying.size+this.jobs.reconciling.size,providers:Object.keys(this.providers),automatic_resubmit:false};}
 async tick(){if(this.closed||!this.providers||this.ticking)return;const owners=[...this.platform.individuals.keys()];if(!owners.length)return;const owner=owners[this.cursor++%owners.length];if((this.retryAt?.get(owner)??0)>this.platform.now())return;this.ticking=true;try{return await this.coordinator.tick(owner,{maxQueries:1});}catch(error){this.retryAt??=new Map();this.retryAt.set(owner,this.platform.now()+30000);this.journal.append({kind:'background-query-deferred',owner,key:'provider',error:String(error.message).slice(0,200),next_check_at:this.platform.now()+30000});return {state:'provider_unavailable',queried:0,life_authority_preserved:true};}finally{this.ticking=false;}}
 async close(){if(this.closed)return;if(this.ticking||this.jobs.active.size||this.jobs.querying.size||this.jobs.reconciling.size)throw Error('BACKGROUND_WORK_NOT_SETTLED');this.closed=true;this.journal.close();}
}
