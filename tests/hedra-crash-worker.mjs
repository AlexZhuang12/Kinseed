import {HedraManager} from '../src/tools/hedra-manager.mjs';
console.log('WORKER_MODULE_LOADED');
const [file,endpoint]=process.argv.slice(2);const call=async(p,b={})=>(await fetch(endpoint+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})).json();
const provider={kind:'synthetic',capability:()=>({fixed:true,mode:'credits',submission_enabled:true}),balance:()=>call('/balance'),estimate:x=>call('/estimate',x),submit:async x=>{await call('/submit',x);console.log('PROVIDER_ACCEPTED_EXITING');await new Promise(()=>setTimeout(()=>process.exit(23),100));},poll:id=>call('/poll',{id})};
const m=new HedraManager(file,{provider,engineering:true,resolve:key=>({life_hash:'synthetic-life-'+key,can_submit:true})});await m.pump();await m.close();
