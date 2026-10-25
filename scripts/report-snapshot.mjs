export function inspectReportSnapshot(db,tables){
 for(const table of ['jobs','reports','metadata','calls'])if(!tables.includes(table))throw Error('REPORT_BACKUP_SCHEMA');
 const required={jobs:['id','day','automatic_key','body'],reports:['id','day','body'],metadata:['key','value'],calls:['id','day','job_id']};
 for(const [table,columns] of Object.entries(required)){const actual=db.prepare(`PRAGMA table_info(${table})`).all().map(x=>x.name);if(columns.some(x=>!actual.includes(x)))throw Error('REPORT_BACKUP_SCHEMA');}
 const schema=db.prepare("SELECT value FROM metadata WHERE key='report_schema'").get();if(schema&&schema.value!=='1')throw Error('REPORT_BACKUP_SCHEMA');
 const jobs=db.prepare('SELECT id,body FROM jobs').all();
 for(const row of jobs){const j=JSON.parse(row.body);if(j.id!==row.id||['queued','running','retry_wait','waiting_for_life'].includes(j.phase))throw Error('REPORT_BACKUP_UNSETTLED');}
 for(const row of db.prepare('SELECT id,day,body FROM reports').all()){const r=JSON.parse(row.body);if(r.id!==row.id||r.day!==row.day||!Array.isArray(r.individuals)||!r.summary)throw Error('REPORT_BACKUP_CONTENT');}
 return {integrity:'ok',schema:'reports-v1',jobs:jobs.length,reports:db.prepare('SELECT count(*) n FROM reports').get().n};
}
