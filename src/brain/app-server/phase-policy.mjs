// Preparation and submit acknowledgement bounds are distinct from model/life time.
export function phasePolicy({rpcTimeout,phaseTimeouts={},preparationMs=20000}={}){
 if(rpcTimeout!==undefined&&(!Number.isInteger(rpcTimeout)||rpcTimeout<1||rpcTimeout>30000))throw Error('APP_SERVER_PHASE_BOUND');
 const defaults={initialize:10000,account:10000,thread:10000,submit:5000};
 if(Object.keys(phaseTimeouts).some(k=>!Object.hasOwn(defaults,k)))throw Error('APP_SERVER_UNKNOWN_PHASE');
 const phases=Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,phaseTimeouts[k]??rpcTimeout??v]));
 for(const n of [...Object.values(phases),preparationMs])if(!Number.isInteger(n)||n<1||n>30000)throw Error('APP_SERVER_PHASE_BOUND');
 return {phases,preparationMs};
}
