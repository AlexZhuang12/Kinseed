const proofs=new WeakMap();
export function attestSettlement(result,{owner,request_id,revoked,inflight,terminal,processClosed}){if(!revoked||inflight!==0||!terminal&&!processClosed)throw Error('INVOCATION_NOT_SETTLED');proofs.set(result,{owner,request_id});return result;}
export function appServerSettled(result,lease,owner){const p=proofs.get(result);return !!p&&result.adapter==='codex-app-server-candidate'&&p.owner===owner&&p.request_id===lease.cycle_id&&result.invocation_settled===true;}
