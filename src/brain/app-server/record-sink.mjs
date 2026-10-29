import {Journal,digest} from './journal.mjs';
// In staging, one durable append is both the effect and its receipt.
export class IdempotentRecordSink{
 constructor(base){this.journal=new Journal(base);}
 record(kind,key,owner,payload){if(!['b-record','budget-record'].includes(kind)||typeof key!=='string'||!key||typeof owner!=='string'||!owner)throw Error('RECORD_SCOPE');const signature=digest(payload),old=this.journal.latest(kind,owner,key);if(old){if(old.signature!==signature)throw Error('RECORD_CONFLICT');return {...old,replayed:true};}return this.journal.append({kind,key,owner,signature,payload,at:Date.now()});}
 list(owner){return this.journal.events.filter(e=>e.owner===owner);}
 close(){this.journal.close();}
}
