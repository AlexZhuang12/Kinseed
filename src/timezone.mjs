const formatters=new Map(),starts=new Map();
export const DEFAULT_TIMEZONE='Asia/Taipei';
export function validTimezone(zone){if(typeof zone!=='string'||zone.length>80||!(/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){1,2}$/.test(zone)||zone==='UTC'))throw Error('TIMEZONE_INVALID');try{new Intl.DateTimeFormat('en',{timeZone:zone}).format(0);}catch{throw Error('TIMEZONE_INVALID');}return zone;}
function parts(at,zone){validTimezone(zone);let f=formatters.get(zone);if(!f){f=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});formatters.set(zone,f);}return Object.fromEntries(f.formatToParts(at).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));}
export function zonedDay(at=Date.now(),zone=DEFAULT_TIMEZONE){const p=parts(at,zone);return p.year+'-'+p.month+'-'+p.day;}
export function addCalendarDays(day,n){return new Date(Date.parse(day+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);}
const localStamp=p=>Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);
export function dayStart(day,hhmm,zone=DEFAULT_TIMEZONE){
 validTimezone(zone);if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm)||new Date(day+'T00:00:00Z').toISOString().slice(0,10)!==day)throw Error('LOCAL_TIME_INVALID');const key=zone+'/'+day+'/'+hhmm;if(starts.has(key))return starts.get(key);
 const target=Date.parse(day+'T'+hhmm+':00Z'),offsets=new Set();for(let h=-36;h<=36;h+=6){const at=target+h*3600000;offsets.add(localStamp(parts(at,zone))-at);}const matches=[...offsets].map(o=>target-o).filter(at=>localStamp(parts(at,zone))===target);
 let result;if(matches.length)result=Math.min(...matches);else{let bestLocal=Infinity;for(let at=target-18*3600000;at<=target+18*3600000;at+=60000){const p=parts(at,zone),local=localStamp(p);if(zonedDay(at,zone)===day&&local>=target&&local<bestLocal){bestLocal=local;result=at;}}if(result===undefined)throw Error('LOCAL_DAY_NOT_AVAILABLE');}
 if(starts.size>=1024)starts.delete(starts.keys().next().value);starts.set(key,result);return result;
}
export function zonedWindow(control,now=Date.now()){
 const zone=control.timezone??DEFAULT_TIMEZONE,day=zonedDay(now,zone),today=dayStart(day,control.window_start,zone),previousDay=addCalendarDays(day,-1),previous=dayStart(previousDay,control.window_start,zone),duration=control.window_minutes*60000;
 const start=now<today&&now>=previous&&now<previous+duration?previous:today,end=start+duration;return {day:start===previous?previousDay:day,start,end,remaining_ms:Math.max(0,end-now),open:now>=start&&now<end};
}
export function nextDailyWindow(c,now=Date.now()){const w=zonedWindow(c,now);const start=w.open||now<w.start?w.start:dayStart(addCalendarDays(w.day,1),c.window_start,c.timezone??DEFAULT_TIMEZONE);return {start,end:start+c.window_minutes*60000};}
