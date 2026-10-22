import {migrateV1 as legacyMigrate} from '../v1_1/migrate.mjs';
import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
export function promote(dir){const r=new DatabaseSync(path.join(dir,'registry.sqlite'));try{const g=JSON.parse(r.prepare("SELECT value FROM state WHERE key='global'").get().value);if(!g.stopped||g.worker)throw Error('STOP_FIRST');for(const {id}of r.prepare('SELECT id FROM entities').all()){const db=new DatabaseSync(path.join(dir,'individuals',id,'kinseed.sqlite'));try{const v=db.prepare("SELECT value FROM metadata WHERE key='schema'").get()?.value;if(!['11','12'].includes(v))throw Error('DATABASE_SCHEMA');const c=JSON.parse(db.prepare("SELECT value FROM state WHERE key='control'").get().value),lease=JSON.parse(db.prepare("SELECT value FROM state WHERE key='lease'").get().value);if(!c.stop_lock||lease)throw Error('STOP_FIRST');db.prepare("UPDATE metadata SET value='12' WHERE key='schema'").run();}finally{db.close();}}
 r.exec("CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT);INSERT INTO metadata VALUES('schema','12') ON CONFLICT(key) DO UPDATE SET value='12';");
}finally{r.close();}}
export async function migrateV1(source,target,root){await legacyMigrate(source,target,root);promote(target);}
