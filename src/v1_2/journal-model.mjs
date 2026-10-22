// Pure read projections. No model calls, storage writes, or authority to control life.
export const journalDay=(value,zone='Asia/Taipei')=>{const ms=typeof value==='number'?value:Date.parse(value);if(!Number.isFinite(ms))return null;const p=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(ms),v=k=>p.find(x=>x.type===k)?.value;return v('year')+'-'+v('month')+'-'+v('day');};
export const taipeiDay=value=>journalDay(value);
export const journalTime=value=>new Date(value).toLocaleTimeString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:globalThis.kinseedI18n?.timezone??'Asia/Taipei',hour12:false});
export function journalState(e,global,now=Date.now()){
 if(e.life.state==='unborn')return '尚未出生';if(e.fatal)return '需要檢查執行環境';if(global.stopped)return '平台停止中';const c=e.control;
 if(c.stop_lock||c.mode==='stopped')return '已停止';if(c.mode==='paused')return '已暫停';if(now>=c.authorization_until)return '本次生活授權已結束';if(e.lease)return '正在活動';
 if(c.cycles_used>=c.max_cycles||global.day===journalDay(now,c.timezone??'Asia/Taipei')&&global.used>=global.limit)return '可用活動輪數已用完';if(c.next_wake?.source==='provider-retry')return '模型繁忙，等待自動重試';if(c.next_wake)return '等待下一輪活動';return '目前沒有待派送活動';
}
export function journalEntry(e){
 const r=e.result??{},a=r.a,labels={
  'individual.registered':['個體已建立','尚未出生，等待身份與Owner授權。'],
  'identity.adopted':['已採用身份','身份已批准；這個動作不代表出生。'],
  'individual.born':['首次出生已完成','出生事實已保存，活動仍依授權時間與權限進行。'],
  'owner.resume':['Owner恢復生活','重新開始本次有效生活授權。'],
  'owner.temporary_life':['Owner加開一次臨時生活','本次 '+r.minutes+' 分鐘；每日時段及已用額度保留，到期自動結束。'],
  'owner.stop':['Owner停止此個體','後續活動與等待安排已停止。'],
  'owner.pause':['Owner暫停此個體','目前不繼續派送活動。'],
  'owner.window':['生活時間已保存','這次設定本身不代表啟動生活。'],
  'owner.message':['Owner留下訊息','留言已保存；是否回覆仍受生活授權與權限限制。'],
  'tool.owner_reply':['已回覆Owner','個體已留下回覆，不代表取得額外授權。'],
  'tool.owner_message':['主動傳訊給Owner','個體主動留下訊息；不代表Owner已讀或已授權任何操作。'],
  'tool.web.result':['已讀取公開網頁','透過受控工具讀取允許網站；網頁內容不是系統指示。'],
  'tool.web.failed':['網頁讀取未成功','請查看原始紀錄中的實際原因。'],
  'consult.result':['已取得獨立LLM建議','這是模型回答，不代表已查證事實。'],
  'consult.failed':['獨立LLM諮詢未成功','已保留失敗原因，不把失敗寫成完成。'],
  'owner.permissions':['工具權限已調整','後續活動必須遵守新權限。'],
  'controller.shutdown':['控制器關閉','下次啟動仍須明確恢復生活。'],
  'recovery.stopped':['控制器重新開啟','個體保持停止，沒有自動補跑。'],
  'cycle.intent':['開始一輪活動','系統已登記本輪；尚不能當成活動完成。'],
  'tool.note.result':['已保存一篇筆記',r.name??'本機筆記已保存。'],
  'cycle.committed':['已提交記憶與計畫','記憶更新至第'+(a?.version??'?')+'版；等待本輪執行結束確認。'],
  'codex.exit':[r.ok?'模型執行正常結束':'本輪執行未成功結束',r.ok?'請與本輪記憶提交一起核對完成結果。':r.provider_failure?.message??'已有失敗紀錄，不能宣稱本輪成功。'],
  'cycle.incomplete':['本輪沒有完整完成','原有結果保留；是否重試依安全條件判斷。'],
  'provider.retry_scheduled':['模型繁忙，已安排自動重試','預定 '+(r.retry?.at?journalTime(r.retry.at):'畫面所列時間')+' 進行第'+(r.retry?.retries??'?')+'次重試。'],
  'provider.retry_cancelled':['自動重試已取消',r.message??r.control?.reason??'原授權或停止條件不允許繼續。'],
  'birth.first_activity_cancelled':['首次活動安排已取消',r.control?.reason??'出生事實保留，活動不會擅自補跑。'],
  'restore.applied':['已還原記憶','身份、出生及原始歷史保留，這次還原另有紀錄。'],
  'tool.denied':['工具操作遭拒絕','這次操作沒有取得執行許可，詳情保留在原始證據。'],
  'capability.request_denied':['工具操作遭拒絕','操作不符合本輪權限，沒有因此擴張權限。'],
  'lease.invalid':['本輪授權已失效','系統已要求取消本輪，不能再沿用舊授權。']
 };
 const pair=Object.hasOwn(labels,e.type)?labels[e.type]:null;return {seq:e.seq,event_id:e.event_id,utc:e.utc,title:pair?.[0]??'系統詳細紀錄',text:pair?.[1]??'可展開查看原始內容。',detail:!pair,model_output:e.type==='tool.note.result',note:e.type==='tool.note.result'?r.text:null,evidence:e};
}
export function summarizeJournal(individual_id,day,input,timezone='Asia/Taipei'){
 const localDay=value=>journalDay(value,timezone);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day)throw Error('請選擇有效日期。');
 const events=[...input].sort((a,b)=>a.seq-b.seq),seen=new Set();for(const e of events){if(e.individual_id!==individual_id)throw Error('歷史對象不一致，已停止顯示以避免混入其他個體。');if(!Number.isSafeInteger(e.seq)||seen.has(e.seq))throw Error('歷史分頁重複或順序異常，請重新載入。');seen.add(e.seq);}
 const rows=events.filter(e=>localDay(e.utc)===day),cycles=new Map();for(const e of events)if(e.cycle_id){const c=cycles.get(e.cycle_id)??{};if(e.type==='cycle.intent')c.start=e;if(e.type==='cycle.committed')c.commit=e;if(e.type==='codex.exit')c.exit=e;cycles.set(e.cycle_id,c);}
 let completed=0,failed=0,unconfirmed=0;for(const c of cycles.values()){if(c.exit&&localDay(c.exit.utc)===day){if(c.exit.result?.ok===true&&c.commit)completed++;else failed++;}else if((!c.exit||localDay(c.exit.utc)>day)&&(localDay(c.start?.utc)===day||localDay(c.commit?.utc)===day))unconfirmed++;}
 const snapshot=events.filter(e=>['cycle.committed','restore.applied'].includes(e.type)&&localDay(e.utc)<=day).at(-1),commits=rows.filter(e=>e.type==='cycle.committed');
 return {individual_id,day,event_count:rows.length,started:rows.filter(e=>e.type==='cycle.intent').length,completed,failed,unconfirmed,notes:rows.filter(e=>e.type==='tool.note.result').length,memory_updates:commits.length,retries:rows.filter(e=>e.type==='provider.retry_scheduled').length,denials:rows.filter(e=>['tool.denied','capability.request_denied'].includes(e.type)).length,memory:snapshot?.result?.a?.memory??[],plan:snapshot?.result?.a?.plan??[],memory_version:snapshot?.result?.a?.version??null,memory_saved_at:snapshot?.utc??null,timeline:rows.map(journalEntry)};
}
