import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// This entry point deliberately has no real-provider or install option.
if(process.argv.length>2)throw Error('SYNTHETIC_ONLY: no arguments are accepted');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const started=Date.now(),out=path.join(root,'.private','app-server-acceptance',crypto.randomUUID());
fs.mkdirSync(out,{recursive:true});
const run=spawnSync(process.execPath,['--test','tests/app-server-candidate.test.mjs'],{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});
fs.writeFileSync(path.join(out,'tests.log'),(run.stdout||'')+(run.stderr||''));
const comparison=path.join(root,'.private','app-server-comparison.json');
let comparisonFile=null;
if(fs.existsSync(comparison)&&fs.statSync(comparison).mtimeMs>=started){comparisonFile='comparison.json';fs.copyFileSync(comparison,path.join(out,comparisonFile));}
const result={candidate:'app-server-phase1-20261027.1',status:run.status===0&&!run.error&&comparisonFile?'PASS_SYNTHETIC':'FAIL',exit_code:run.status,error:run.error?.message||null,synthetic:true,real_model_calls:0,paid_calls:0,installs:0,speed:'NOT_MEASURED',ram:'NOT_MEASURED',comparison:comparisonFile,log:'tests.log'};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,evidence:out},null,2));
process.exitCode=result.status==='PASS_SYNTHETIC'?0:1;
