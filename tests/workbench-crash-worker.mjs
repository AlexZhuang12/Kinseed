// Owned synthetic controller only. Expected process exit is a deliberate fault injection.
import{fixture}from'./workbench-fixture.mjs';import{id}from'../src/v1_2/store.mjs';
const f=await fixture({after(){}}),c=f.e.store.get('control');c.permissions.workbench=true;c.permissions.execute=true;f.e.store.tx(()=>f.e.store.set('control',c));
const source=await f.tool('work_save',{request_id:id(),name:'Synthetic crash program',format:'javascript',content:'while(true){}',expected_version:0});
f.tool('run_javascript',{request_id:id(),file_id:source.file_id,version:1,output_name:'Must not be saved'});console.log(JSON.stringify({dir:f.p.dir}));setTimeout(()=>process.exit(73),100);
