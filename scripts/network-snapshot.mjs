import {sha256} from './release-check.mjs';
// The network DB predates a metadata table. Recognize only its exact known layout.
export function inspectNetworkSnapshot(db,tables){
 const expected={settings:['id:INTEGER','body:TEXT'],traffic:['day:TEXT','individual:TEXT','direction:TEXT','bytes:INTEGER'],audit:['seq:INTEGER','body:TEXT','prev:TEXT','hash:TEXT'],transfers:['id:TEXT','individual:TEXT','body:TEXT'],documents:['id:TEXT','individual:TEXT','body:BLOB','meta:TEXT'],receipts:['id:TEXT','input:TEXT','body:TEXT']};
 if(JSON.stringify([...tables].sort())!==JSON.stringify(Object.keys(expected).sort()))throw Error('網路資料格式尚未驗證，不接管或遷移。');
 for(const [table,cols]of Object.entries(expected))if(JSON.stringify(db.prepare('PRAGMA table_info('+table+')').all().map(c=>c.name+':'+c.type))!==JSON.stringify(cols))throw Error('網路資料欄位不相容，不接管或遷移。');
 for(const name of ['audit_no_update','audit_no_delete'])if(!db.prepare("SELECT name FROM sqlite_master WHERE type='trigger' AND name=?").get(name))throw Error('網路歷史保護缺漏。');
 let prev='';for(const e of db.prepare('SELECT body,prev,hash FROM audit ORDER BY seq').iterate()){if(e.prev!==prev||e.hash!==sha256(prev+e.body))throw Error('網路歷史鏈未通過。');JSON.parse(e.body);prev=e.hash;}
 const rows=db.prepare('SELECT id,body FROM settings').all();if(rows.length!==1||rows[0].id!==1)throw Error('網路設定不完整。');const config=JSON.parse(rows[0].body),keys=['version','total','upload','reserve','single','page','upload_single','allocations'];if(Object.keys(config).sort().join()!==keys.sort().join()||!Number.isSafeInteger(config.version)||config.version<1)throw Error('網路設定格式不相容。');for(const key of keys.filter(k=>!['version','allocations'].includes(k)))if(!Number.isSafeInteger(config[key])||config[key]<0)throw Error('網路額度不正確。');if(!config.allocations||Array.isArray(config.allocations)||typeof config.allocations!=='object'||Object.values(config.allocations).some(v=>!Number.isSafeInteger(v)||v<0))throw Error('網路分配不正確。');
 for(const r of db.prepare('SELECT body FROM transfers').iterate())if(JSON.parse(r.body).state==='sending')throw Error('仍有尚未收尾的網路上傳，不建立冷備份。');
 for(const r of db.prepare('SELECT bytes,direction FROM traffic').iterate())if(!Number.isSafeInteger(r.bytes)||r.bytes<0||!['download','upload'].includes(r.direction))throw Error('網路用量不正確。');
 return {integrity:'ok',schema:'network-layout-1',history_chain:'PASS'};
}
