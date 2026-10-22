// A projection of saved state only. This guide never grants or saves authority.
export function ownerGuide(e, status, dirty = {}) {
 if (!e) return {phase:'empty',title:'先建立你的第一個個體',next:'建立新個體',destination:'create'};
 if (e.life.state !== 'unborn') return {phase:'born',title:e.name+'已出生；出生與活動是兩件事',next:'查看活動狀態',destination:'status'};
 if (!e.life.identity_version) return {phase:'identity',title:e.name+'尚未採用身份',next:'繼續身份與出生準備',destination:'identity'};
 if (dirty.settings || dirty.permissions) return {phase:'unsaved',title:'有尚未保存的設定，請先保存再繼續',next:dirty.settings?'返回時間與額度並保存':'返回工具權限並保存',destination:dirty.settings?'settings':'permissions'};
 if (status?.brain?.ready === false || status?.preflight?.ok === false) return {phase:'brain',title:'身份已批准；大腦尚未連接成功',next:'查看大腦連線操作說明',destination:'help'};
 return {phase:'prepare',title:e.name+'身份已批准，尚未出生',next:'繼續核對設定與出生',destination:'identity'};
}
export function firstActivityLabel(at, now=Date.now(),zone='Asia/Taipei') {
 if (!Number.isFinite(at)) return '請先檢查出生條件，取得實際日期';
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
 const day=t=>formatter.format(t),parts=formatter.formatToParts(now),value=k=>Number(parts.find(p=>p.type===k).value);
 const tomorrow=new Date(Date.UTC(value('year'),value('month')-1,value('day')+1)).toISOString().slice(0,10);
 const relative=day(at)===day(now)?'今天':day(at)===tomorrow?'明天':'指定日期';
 return relative+' '+new Date(at).toLocaleString(globalThis.kinseedI18n?.locale??'zh-TW',{timeZone:zone,hour12:false})+'（'+zone+'）';
}
