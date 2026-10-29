import {Journal,digest} from './journal.mjs';
export class QualificationBudget {
 constructor(base,{limit=6,authorization=()=>false}={}){if(limit!==6)throw Error('QUALIFICATION_LIMIT_MUST_BE_SIX');this.journal=new Journal(base);this.authorization=authorization;}
 rows(){return this.journal.events.filter(e=>e.kind==='qualification-intent');}
 snapshot(){return {authorized_max:6,used:this.rows().length,remaining:6-this.rows().length,model:'gpt-6.1-sol',reasoning:'low',calls:this.rows()};}
 claim({request_id,adapter,purpose}){if(!this.authorization())throw Error('OWNER_LOGIN_DEFERRED');if(!/^[a-zA-Z0-9_-]{1,100}$/.test(request_id??'')||!['exec','app-server'].includes(adapter)||typeof purpose!=='string'||purpose.length>100)throw Error('QUALIFICATION_SCOPE');if(this.rows().some(r=>r.request_id===request_id))throw Error('QUALIFICATION_NO_REPLAY');if(this.rows().length>=6)throw Error('OWNER_SIX_CALL_CAP');const entry={kind:'qualification-intent',owner:'qualification',key:request_id,request_id,adapter,purpose,ordinal:this.rows().length+1,at:Date.now(),state:'dispatch_intent_no_automatic_replay'};this.journal.append(entry);return entry;}
 finish(request_id,result){const row=this.rows().find(r=>r.request_id===request_id);if(!row)throw Error('QUALIFICATION_UNKNOWN_REQUEST');const signature=digest(result),old=this.journal.latest('qualification-outcome','qualification',request_id);if(old){if(old.signature!==signature)throw Error('QUALIFICATION_OUTCOME_CONFLICT');return old;}return this.journal.append({kind:'qualification-outcome',owner:'qualification',key:request_id,signature,result});}
 async dispatch(request,operation){const intent=this.claim(request);try{const result=await operation(intent);this.finish(request.request_id,{status:'returned',result});return result;}catch(e){this.finish(request.request_id,{status:'failed_or_unknown',error:e.message});throw e;}}
 close(){this.journal.close();}
}
