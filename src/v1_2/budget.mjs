import {rebindDailySettings} from './daily-life.mjs';
// Owner-only administrative settings. No counter reset, activation, or time extension.
export function setBudget(platform,cmd){
 const keys=cmd?.scope==='individual'?['scope','individual_id','limit','expected_version','request_id']:['scope','limit','expected_version','request_id'];
 if(!cmd||!['individual','platform'].includes(cmd.scope)||Object.keys(cmd).some(k=>!keys.includes(k))||keys.some(k=>!(k in cmd))||!Number.isInteger(cmd.limit)||cmd.limit<1||cmd.limit>1000||!Number.isInteger(cmd.expected_version)||typeof cmd.request_id!=='string'||!cmd.request_id.length||cmd.request_id.length>100)throw Error('BUDGET_SCHEMA');
 if(cmd.scope==='platform')return platform.tx(()=>{
  const g=platform.global();if(g.version!==cmd.expected_version)throw Error('GLOBAL_VERSION_CONFLICT');
  if(g.worker||[...platform.individuals.values()].some(e=>e.store.get('lease')||e.store.get('control').mode!=='stopped'))throw Error('STOP_FIRST');
  const previous=g.limit;g.limit=cmd.limit;g.version++;platform.set('global',g);platform.audit('owner.platform_budget',{request_id:cmd.request_id,previous,limit:g.limit,used:g.used});return g;
 });
 const e=platform.entity(cmd.individual_id);return e.store.tx(()=>{
  const c=e.store.get('control');if(c.version!==cmd.expected_version)throw Error('CONTROL_VERSION_CONFLICT');
  if(e.store.get('lease'))throw Error('目前工作尚未收尾，請稍後保存；原每日生活安排保留。');
  const previous=c.max_cycles;c.max_cycles=cmd.limit;c.version++;e.store.set('control',c);
  rebindDailySettings(e);e.store.event('owner.activity_budget',{request_id:cmd.request_id,previous,limit:c.max_cycles,cycles_used:c.cycles_used},'owner-local',{request_id:cmd.request_id});return c;
 });
}
