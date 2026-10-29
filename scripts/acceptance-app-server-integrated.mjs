import {spawnSync} from 'node:child_process';import path from 'node:path';
if(process.argv.length!==2)throw Error('ACCEPTANCE_TAKES_NO_ARGUMENTS');
const root=path.resolve(import.meta.dirname,'..');
const commands=[['--test','--test-concurrency=1','tests/app-server-candidate.test.mjs','tests/app-server-offline.test.mjs','tests/app-server-integrated.test.mjs','tests/app-server-platform.test.mjs','tests/app-server-switch.test.mjs'],['scripts/check-boundaries.mjs'],['scripts/build-owner-controls-ui.mjs','--check'],['scripts/build-journal-ui.mjs','--check'],['scripts/build-locales.mjs','--check','--complete']];
for(const args of commands){const r=spawnSync(process.execPath,args,{cwd:root,windowsHide:true,stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
console.log(JSON.stringify({status:'PASS_INTEGRATED_SYNTHETIC',real_model_calls:0,paid_external_calls:0,formal_actions:0,github_push:false}));
