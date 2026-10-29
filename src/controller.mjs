import {zonedWindow} from './timezone.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { Store,id,hash,validateProfile } from './store.mjs';
import {validateArguments} from './mcp.mjs';
export function windowAt(control,now=Date.now()) {
  const once=control.temporary_window;
  if(once&&Number.isSafeInteger(once.start)&&Number.isSafeInteger(once.end)&&once.end>once.start&&typeof once.budget_day==='string')return {day:once.budget_day,start:once.start,end:once.end,remaining_ms:Math.max(0,once.end-now),open:now>=once.start&&now<once.end,temporary:true};
  if(control.timezone)return zonedWindow(control,now);
  // Asia/Taipei is fixed UTC+8; no DST. A window belongs to its start date.
  const local=new Date(now+8*3600000),day=local.toISOString().slice(0,10);
  const [h,m]=control.window_start.split(':').map(Number);
  let start=Date.parse(day+'T00:00:00+08:00')+(h*60+m)*60000;
  if(now<start && now<start-86400000+control.window_minutes*60000) start-=86400000;
  const end=start+control.window_minutes*60000;
  return {day:new Date(start+8*3600000).toISOString().slice(0,10),start,end,remaining_ms:Math.max(0,end-now),open:now>=start&&now<end};
}
export function equalSecret(a,b){return typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export class Controller {
  constructor(dir,profile,{now=()=>Date.now(),runner=null,run_id=id(),store=null,...opts}={}) {
    this.now=now;this.run_id=run_id;this.store=store??new Store(dir,profile,{now});this.runner=runner;this.tasks=new Map();this.opts=opts;this.fatal=null;this.stopping=false;
    const old=this.store.get('lease');if(old){this.store.tx(()=>{const c=this.store.get('control');c.mode='stopped';c.stop_lock=true;c.next_wake=null;c.version++;c.reason='前輪結果未知，已封鎖重送，需 Owner 檢查歷史並明確恢復';this.store.set('control',c);this.store.event('recovery.unknown',{previous:old,remote_result:'unknown',control:c},'controller',old);this.store.set('lease',null);});}
    else if(this.store.get('control').mode==='running'){this.store.tx(()=>{const c=this.store.get('control');c.mode='stopped';c.stop_lock=true;c.initial_start=false;c.next_wake=null;c.version++;c.reason='控制器重新啟動；需 Owner 明確恢復，不補跑漏失輪次';this.store.set('control',c);this.store.event('recovery.stopped',{control:c},'controller',{run_id:this.run_id});});}
  }
  status(){const c=this.store.get('control'),p=this.store.get('profile');return {label:'測試個體，非正式 Kinseed 個體',profile:p,control:c,a:this.store.get('a'),lease:this.publicLease(),window:windowAt(c,this.now()),daily_window:windowAt({...c,temporary_window:null},this.now()),tasks:[...this.tasks.values()].map(t=>({id:t.id,pid:t.child?.pid??null,kind:t.kind,status:t.status,remote_result:t.remote_result??'unknown'})),fatal:this.fatal,cost:'unknown',notes:this.store.db.prepare("SELECT body FROM events WHERE json_extract(body,'$.type')='tool.note.result' AND json_extract(body,'$.individual_id')=? ORDER BY seq DESC LIMIT 20").all(p.individual_id).map(r=>JSON.parse(r.body)),last_events:this.store.db.prepare('SELECT seq,body FROM events ORDER BY seq DESC LIMIT 20').all().map(r=>({seq:r.seq,...JSON.parse(r.body)}))};}
  publicLease(){const l=this.store.get('lease');if(!l)return null;const {token_hash,...out}=l;return out;}
  assertAllowed(lease=null){if(this.fatal||this.stopping)throw Error('FAIL_CLOSED');this.store.verify();const c=this.store.get('control'),w=windowAt(c,this.now());if(c.stop_lock||c.mode!=='running')throw Error('STOPPED');if(!w.open)throw Error('WINDOW_CLOSED');if(this.now()>=c.authorization_until)throw Error('AUTH_EXPIRED');if(c.cycles_day===w.day&&c.cycles_used>=c.max_cycles&&!lease)throw Error('CYCLE_LIMIT');if(lease){const current=this.store.get('lease');if(!current||current.cycle_id!==lease.cycle_id||current.control_version!==c.version||current.finished)throw Error('STALE_LEASE');if(current.deadline<=this.now())throw Error('DEADLINE_EXCEEDED');if(current.tool_calls>=16)throw Error('TOOL_LIMIT');}return {c,w};}
  owner(command){
    if(!command||typeof command.request_id!=='string'||command.request_id.length>100||command.scope!=='individual')throw Error('COMMAND_SCHEMA');
    const {action,request_id}=command;const key='owner:'+request_id;
    if(this.store.receipt(key))throw Error('DUPLICATE_COMMAND');
    if(!['start','resume','pause','stop','permissions','window','profile'].includes(action))throw Error('COMMAND_SCHEMA');
    let cancel=false;
    const result=this.store.tx(()=>{
      const c=this.store.get('control');
      if(action==='stop'||action==='pause'){c.mode=action==='stop'?'stopped':'paused';if(action==='stop'){c.stop_lock=true;c.initial_start=false;}c.next_wake=null;c.reason=action==='stop'?'Owner 緊急停止':'Owner 暫停';cancel=true;}
      if(action==='start'||action==='resume'){
        if(this.fatal)throw Error('FAIL_CLOSED');
        if(c.mode==='running')throw Error('ALREADY_RUNNING');
        if(this.store.get('lease'))throw Error('TASKS_NOT_SETTLED');
        if(c.stop_lock&&action!=='resume'&&!c.initial_start)throw Error('EXPLICIT_RESUME_REQUIRED');
        const once=c.temporary_window,remainingTemporary=once&&this.now()>=once.start&&this.now()<once.end;
        const w=windowAt(remainingTemporary?c:{...c,temporary_window:null},this.now());if(!w.open)throw Error('WINDOW_CLOSED');
        if(!remainingTemporary)delete c.temporary_window;
        c.mode='running';c.stop_lock=false;c.initial_start=false;c.authorization_until=w.end;c.next_wake={at:this.now(),source:'owner',key:id()};c.reason='Owner 明確授權';
      }
      if(action==='permissions'){if(typeof command.note!=='boolean')throw Error('COMMAND_SCHEMA');c.permissions=this.permissionSettings?this.permissionSettings(command,c.permissions):{note:command.note};cancel=true;}
      if(action==='window'){
        if(!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(command.start)||!Number.isInteger(command.minutes)||command.minutes<1||command.minutes>240)throw Error('COMMAND_SCHEMA');
        c.window_start=command.start;c.window_minutes=command.minutes;c.reason='窗口已調整；不延長最後授權期限';cancel=true;
      }
      if(action==='profile'){
        if(c.mode==='running'||this.store.get('lease'))throw Error('STOP_FIRST');const p=validateProfile(command.profile);const old=this.store.get('profile');if(p.individual_id===old.individual_id&&p.profile_id!==old.profile_id)throw Error('NEW_INDIVIDUAL_REQUIRED');
        this.store.event('profile.archived',{profile:old,a:this.store.get('a')});this.store.set('profile',p);this.store.set('a',{version:0,memory:[],plan:[],status:'替換測試個體，無移植經驗',last_result:null,active_ms:0});c.stop_lock=true;c.mode='stopped';c.next_wake=null;
      }
      this.onOwnerControl?.(c,action);c.version++;this.store.set('control',c);
      this.store.event('owner.'+action,{scope:'individual',request_id,control:c,...(action==='profile'?{profile:this.store.get('profile'),a:this.store.get('a')}:{} )},'owner-local',{request_id,run_id:this.run_id});
      this.store.putReceipt(key,{version:c.version});return c;
    });
    if(cancel)this.cancelAll(action);return result;
  }
  enqueue(source,at,key){return this.store.tx(()=>{const c=this.store.get('control');if(c.stop_lock||c.mode!=='running')return false;if(this.store.receipt('trigger:'+key)){this.store.event('trigger.duplicate',{source,key});return false;}this.store.putReceipt('trigger:'+key,{at});if(!c.next_wake||at<c.next_wake.at)c.next_wake={at,source,key};this.store.set('control',c);this.store.event('trigger.queued',{source,at,key});return true;});}
  async tick(){
    if(this.fatal||this.stopping)return;
    try{
      const c=this.store.get('control'),l=this.store.get('lease');
      if(l){try{this.assertAllowed(l);}catch(e){if(!l.finished&&!l.cancel_reason){this.store.tx(()=>{l.cancel_reason=e.message;this.store.set('lease',l);this.store.event('lease.invalid',{reason:e.message},'controller',l);});this.cancelAll(e.message);}}return;}
      if(!c.next_wake||c.next_wake.at>this.now())return;
      try{this.assertAllowed();}catch(e){this.store.tx(()=>{c.next_wake=null;c.mode='paused';c.version++;c.reason=e.message;this.store.set('control',c);this.store.event('dispatch.denied',{error:e.message,control:c});});return;}
      if(!this.runner)throw Error('PROVIDER_UNAVAILABLE');
      const token=id()+id();
      const lease=this.store.tx(()=>{const {c,w}=this.assertAllowed();if(this.store.get('lease'))return null;const wake=c.next_wake;if(!wake)return null;
        const l={cycle_id:id(),run_id:this.run_id,control_version:c.version,token_hash:hash(token),started:this.now(),deadline:Math.min(this.now()+120000,w.end,c.authorization_until),source:wake.source,tool_calls:0,session_id:null,finished:false};
        c.cycles_used=c.cycles_day===w.day?c.cycles_used+1:1;c.cycles_day=w.day;c.next_wake=null;this.store.set('control',c);this.store.set('lease',l);this.store.event('cycle.intent',{source:l.source,deadline:l.deadline,control:c},'controller',l);return l;});
      if(!lease)return;
      // Intention is committed before any external inference is dispatched.
      this.assertAllowed(lease);
      const task={id:lease.cycle_id,kind:'codex',status:'running',remote_result:'unknown',child:null,cancel:null};this.tasks.set(task.id,task);
      Promise.resolve(this.runner({lease,token,controller:this,task})).then(result=>this.runnerDone(lease,result)).catch(e=>this.runnerDone(lease,{ok:false,error:e.message}));
    }catch(e){this.fatal=e.message;this.cancelAll(e.message);}
  }
  runnerDone(lease,result){
    // A late/duplicate completion must never account twice or alter a newer task.
    if(this.store.get('lease')?.cycle_id!==lease.cycle_id)return;
    const task=this.tasks.get(lease.cycle_id);if(task){task.status=result.cancelled?'confirmed_local_stopped':result.ok?'completed':'failed';task.remote_result=result.remote_result??'unknown';}
    try{this.store.tx(()=>{
      const l=this.store.get('lease');if(!l||l.cycle_id!==lease.cycle_id)return;
      this.store.event('codex.exit',result,'controller',l);
      const a=this.store.get('a');a.active_ms+=Math.max(0,this.now()-l.started);this.store.set('a',a);this.store.event('activity.accounted',{a},'controller',l);
      const c=this.store.get('control');
      const reconciled=l.finished&&!result.ok&&this.reconcileCommitted?.(l,result,c);
      if(reconciled)this.store.event('cycle.completion_reconciled',{reason:result.adapter==='codex-app-server-candidate'?'記憶已交易提交且本輪與工具已收尾，程序可繼續待命；保留原結果，不重做本輪':'記憶已交易提交且本機程序已結束，保留原退出結果，不重做本輪'},'controller',l);
      if(!l.finished||!result.ok&&!reconciled){const retry=this.onRunnerFailure?.(l,result,c);c.version++;this.store.event('cycle.incomplete',{finished:l.finished,result:'unknown'},'controller',l);if(retry){c.next_wake=retry;c.reason='模型暫時無法服務，等待系統有限重試';this.store.event('provider.retry_scheduled',{retry:c.provider_retry,status:c.inference_status},'controller',l);}else{c.mode='stopped';c.stop_lock=true;c.next_wake=null;c.reason=c.inference_status?.message??(result.cancelled?'已確認本機子程序結束；遠端推理取消未確認':'輪次失敗或缺少完成回報；不自動重送');}}
      else if(!c.stop_lock&&c.mode==='running'&&c.version===l.control_version){this.onRunnerSuccess?.(c);c.next_wake={at:this.now()+(l.decision==='continue'?5000:Math.max(10000,l.wait_ms??60000)),source:l.decision==='continue'?'continue':'schedule',key:l.cycle_id+':next'};this.store.event('trigger.queued',c.next_wake,'controller',l);}
      this.store.set('control',c);this.store.event('control.snapshot',{control:c},'controller',l);this.store.set('lease',null);
    });}catch(e){this.fatal=e.message;}
  }
  session(cycle_id,session_id){this.store.tx(()=>{const l=this.store.get('lease');if(!l||l.cycle_id!==cycle_id)return;l.session_id=session_id;this.store.set('lease',l);this.store.event('codex.session',{session_id},'codex-cli',l);});}
  registerTask(cycle_id,pid,metadata={}){try{this.store.tx(()=>{const l=this.store.get('lease');if(!l||l.cycle_id!==cycle_id)throw Error('STALE_LEASE');l.pid=pid;this.store.set('lease',l);this.store.event('task.registered',{pid,kind:metadata.kind??'codex-cli',cancelability:metadata.cancelability??'local_process_tree_only',remote_cancel_confirmation:metadata.remote_cancel_confirmation??'unknown'},'controller',l);});}catch(e){this.fatal=e.message;this.cancelAll(e.message);}}
  cancelAll(reason){for(const t of this.tasks.values())if(t.status==='running'){t.status='cancel_requested';try{this.store.tx(()=>this.store.event('task.cancel_requested',{id:t.id,kind:t.kind,reason},'controller',{cycle_id:t.id,run_id:this.run_id}));}catch{this.fatal='HISTORY_UNAVAILABLE';}t.cancel?.(reason);}}
  shutdown(){try{this.store.tx(()=>{const c=this.store.get('control');c.mode='stopped';c.stop_lock=true;c.initial_start=false;c.next_wake=null;c.version++;c.reason='控制器已關閉；下次需明確恢復';this.store.set('control',c);this.store.event('controller.shutdown',{control:c},'controller',{run_id:this.run_id});});}catch(e){this.fatal=e.message;}this.stopping=true;this.cancelAll('controller_shutdown');}
  async tool(token,name,args={}){
    let l=this.store.get('lease');if(!l||!equalSecret(hash(token??''),l.token_hash))throw Error('UNAUTHORIZED_CYCLE');
    const ctx={...l,request_id:args.request_id??null};
    try{
      if(name==='commit_cycle'&&this.validateCommitArguments)this.validateCommitArguments(args);else validateArguments(name,args);
      if(name==='commit_cycle'&&l.finished){
        const prior=this.store.receipt('commit:'+l.cycle_id+':'+args.request_id);
        const c=this.store.get('control');
        if(c.stop_lock||c.version!==l.control_version||!windowAt(c,this.now()).open||this.now()>=c.authorization_until)throw Error('STALE_LEASE');
        if(!prior||prior.input_hash!==hash(args))throw Error('IDEMPOTENCY_CONFLICT');
        return {version:prior.version,event_id:prior.event_id};
      }
      this.assertAllowed(l);
      if(!args||typeof args!=='object'||Array.isArray(args)||JSON.stringify(args).length>20000)throw Error('TOOL_SCHEMA');
      if(name==='get_context')return this.store.tx(()=>{this.bumpTool();const result={individual:this.store.get('profile'),a:this.store.get('a'),plan_version:this.store.get('a').version,authorization:this.store.get('control'),window:windowAt(this.store.get('control'),this.now()),cycle:this.publicLease(),raw_history:{tool:'query_history',cursor:0}};this.store.event('context.loaded',{state_version:result.a.version},'mcp',ctx);return result;});
      if(name==='query_history'){const offset=args.cursor??0;if(!Number.isInteger(offset)||offset<0)throw Error('TOOL_SCHEMA');return this.store.tx(()=>{this.bumpTool();const events=this.store.events(offset,20);this.store.event('history.queried',{cursor:offset,count:events.length},'mcp',ctx);return {events,next_cursor:events.at(-1)?.seq??offset};});}
      if(name==='read_workspace')return this.store.tx(()=>{this.bumpTool();return {notes:this.store.events(0,100).filter(e=>e.individual_id===this.store.get('profile').individual_id&&e.type==='tool.note.result').map(e=>({event_id:e.event_id,...e.result})),projection_limit:100,history_tool:'query_history'};});
      if(name==='write_note'){
        if(typeof args.request_id!=='string'||args.request_id.length>100||typeof args.text!=='string'||args.text.length>8000||typeof args.reason!=='string'||args.reason.length>500||!/^[-a-zA-Z0-9_]{1,60}\.md$/.test(args.name??''))throw Error('TOOL_SCHEMA');
        if(!this.store.get('control').permissions.note)throw Error('PERMISSION_DENIED');
        const key='note:'+l.cycle_id+':'+args.request_id,prior=this.store.receipt(key);if(prior){if(prior.input_hash!==hash(args))throw Error('IDEMPOTENCY_CONFLICT');return prior;}
        // Store the artifact and its result in the same durable transaction. File projection is rebuildable.
        return this.store.tx(()=>{this.assertAllowed(l);this.bumpTool();this.store.event('tool.note.request',{name:args.name,reason:args.reason,reason_type:'model_output'},'mcp',ctx);
          const e=this.store.event('tool.note.result',{name:args.name,text:args.text,text_type:'model_output',artifact_id:id()},'controlled-note',ctx);
          const r={event_id:e.event_id,artifact_id:e.result.artifact_id,name:args.name,input_hash:hash(args)};this.store.putReceipt(key,r);return r;});
      }
      if(name==='commit_cycle'){
        if(typeof args.request_id!=='string'||args.request_id.length>100||!Number.isInteger(args.expected_version)||!['continue','wait'].includes(args.decision)||!Array.isArray(args.memory)||args.memory.length>(this.memoryItemLimit??20)||args.memory.some(x=>typeof x!=='string'||x.length>1000)||!Array.isArray(args.plan)||args.plan.length>(this.planItemLimit??10)||args.plan.some(x=>typeof x!=='string'||x.length>500)||typeof args.result!=='string'||args.result.length>2000)throw Error('TOOL_SCHEMA');
        if(args.wait_ms!==undefined&&(!Number.isInteger(args.wait_ms)||args.wait_ms<10000||args.wait_ms>3600000))throw Error('TOOL_SCHEMA');
        return this.store.tx(()=>{this.assertAllowed(l);this.bumpTool();const a=this.store.get('a');if(a.version!==args.expected_version)throw Error('VERSION_CONFLICT');a.version++;a.memory=args.memory;a.plan=args.plan;a.status=args.decision==='continue'?'準備續接':'等待排程';a.last_result=args.result;this.store.set('a',a);l=this.store.get('lease');l.finished=true;l.decision=args.decision;l.wait_ms=args.wait_ms??60000;this.store.set('lease',l);const e=this.store.event('cycle.committed',{a,decision:args.decision,wait_ms:l.wait_ms,reason_type:'model_output'},'mcp',ctx);const r={version:a.version,event_id:e.event_id};this.store.putReceipt('commit:'+l.cycle_id+':'+args.request_id,{...r,input_hash:hash(args)});return r;});
      }
      throw Error('UNKNOWN_TOOL');
    }catch(e){try{this.store.tx(()=>this.store.event('tool.denied',{name,error:e.message},'mcp',{...ctx,success:false,error_class:e.message}));}catch{this.fatal='HISTORY_UNAVAILABLE';this.cancelAll('HISTORY_UNAVAILABLE');}throw e;}
  }
  bumpTool(){const l=this.store.get('lease');l.tool_calls++;this.store.set('lease',l);}
  protocol(token,message){const l=this.store.get('lease');if(!l||!equalSecret(hash(token??''),l.token_hash))throw Error('UNAUTHORIZED_CYCLE');this.assertAllowed(l);this.store.tx(()=>this.store.event('mcp.initialized',{requested_version:String(message.requested_version).slice(0,40),negotiated_version:'2024-11-05',transport:'stdio',server_version:'0.1.0'},'mcp-proxy',l));return {ok:true};}
  exportNotes(destination){fs.mkdirSync(destination,{recursive:true});let cursor=0,count=0;while(true){const events=this.store.events(cursor,100);if(!events.length)break;for(const e of events)if(e.type==='tool.note.result'){const file=path.join(destination,e.result.artifact_id+'.md');if(!fs.existsSync(file))fs.writeFileSync(file,`# ${e.result.name}\n\n測試個體：${e.individual_id}\n事件：${e.event_id}\n\n${e.result.text}`);count++;}cursor=events.at(-1).seq;}return count;}
}
