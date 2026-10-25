import {hubFixture} from './hub-fixture.mjs';import {id} from '../src/v1_2/store.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
export async function mediaFixture(){
 const f=await hubFixture(),entity=f.e.info.individual_id,manager=f.hub.hedra;
 f.cmd('permissions',{...f.e.store.get('control').permissions,note:true,web:true,web_mode:'public'});
 const net=f.p.network,config=net.config();net.configure({request_id:id(),expected_version:config.version,...Object.fromEntries(Object.entries(config).filter(([k])=>k!=='version')),allocations:{[entity]:10000000}},[entity]);
 const job={id:id(),entity,request_id:id(),fingerprint:id(),period:'continuous-v1',state:'completed',version:1,input:{kind:'image',model:'synthetic-image',prompt:'synthetic'},remote_job_id:'synthetic-remote',workspace_id:'synthetic-workspace',outputs:[{asset_id:'synthetic-asset',content_type:'image/png',status:'COMPLETED'}],amount:1000000,held:0,spent:1000000};
 manager.ledger.db.prepare('INSERT INTO jobs VALUES(?,?,?,?,?,?,?,?)').run(job.id,entity,job.request_id,job.fingerprint,job.period,job.state,job.version,JSON.stringify(job));
 // Direct immutable job seed in synthetic ledger only, no paid submission.
 const wire={downloads:0,lookups:0,fail:false,body:png,mime:'image/png',status:200};
 manager.provider.result=async()=>{wire.lookups++;return {asset_id:'synthetic-asset',content_type:wire.mime,url:'https://public.invalid/result?signature=PRIVATE_SYNTHETIC'};};
 f.hub.media.transport=async(url,o)=>{wire.downloads++;o.assert();o.validateURL(url);if(wire.fail){o.charge(3);throw Error('synthetic disconnect');}if(wire.body.length>o.maxBytes)throw Error('大小上限');o.charge(wire.body.length);return {status:wire.status,body:wire.body,headers:{'content-type':wire.mime}};};
 return {...f,job,wire,get invocation(){return f.invocation;}};
}
