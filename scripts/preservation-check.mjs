import {canonical} from '../src/brain/app-server/journal.mjs';
const equal=(a,b)=>canonical(a)===canonical(b),event=r=>r.body?JSON.parse(r.body):r;
export function historyPrefix(before,after){return after.length>=before.length&&before.every((r,i)=>equal(r,after[i]));}
// Process bookkeeping may append a new controller or close an old one. It is not a spending grant.
export function processRegistrationsPreserved(before,after){
 if(new Set(after.map(r=>r.id)).size!==after.length)return false;
 if([...before,...after].some(r=>Object.keys(r).sort().join(',')!=='closed,id,pid'||![0,1].includes(r.closed)))return false;
 return before.every(r=>after.some(n=>n.id===r.id&&n.pid===r.pid&&(n.closed===r.closed||r.closed===0&&n.closed===1)));
}
// A model may update its memory through a recorded MCP commit; engineering may not rewrite it.
export function memoryTransitionPreserved({beforeA,afterA,beforeEvents,afterEvents,checkpointA}){
 const errors=[],events=afterEvents.map(event);if(!historyPrefix(beforeEvents,afterEvents))errors.push('HISTORY_PREFIX');
 const projection=events.findLast(e=>e.result?.a)?.result.a;if(projection&&!equal(projection,afterA))errors.push('A_PROJECTION');
 if(afterA.version<beforeA.version)errors.push('A_VERSION_REGRESSION');
 const priorRetained=events.some(e=>equal(e.result?.a,beforeA))||beforeA.version===0&&beforeA.memory.length===0;
 const legitimate=a=>events.some(e=>e.type==='cycle.committed'&&e.source==='mcp'&&e.result?.a?.version===a.version&&equal(e.result.a.memory,a.memory));
 if(!equal(beforeA.memory,afterA.memory)&&(!priorRetained||!legitimate(afterA)))errors.push('UNRECORDED_MEMORY_REWRITE');
 if(checkpointA&&!equal(checkpointA,afterA)&&!legitimate(afterA))errors.push('ROLLBACK_LOST_LATEST_MEMORY');
 return {ok:errors.length===0,errors};
}
