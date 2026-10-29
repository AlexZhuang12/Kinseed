import fs from 'node:fs';import path from 'node:path';import {inspectSelection} from './candidate-brain.mjs';
// Downgrades cannot silently strand accepted jobs on a source without the reader.
export function candidateUpgradeGuard(root,targetSource){if(!fs.existsSync(path.join(root,'.private/candidate-scope.json')))return;
 const {env,pending}=inspectSelection(root);if(pending.length)throw Error('APP_SERVER_UPDATE_BLOCKED: '+pending.join(','));
 const pkg=JSON.parse(fs.readFileSync(path.join(targetSource,'package.json')));if(pkg.kinseedCapabilities?.app_server)return;
 if(env.brain.adapter==='codex-app-server')throw Error('SELECT_EXEC_BEFORE_SOURCE_DOWNGRADE');
 const file=path.join(env.runtime,'app-server-background/app-server-ledger.jsonl');if(!fs.existsSync(file))return;const states=new Map(),deliveries=new Set();for(const line of fs.readFileSync(file,'utf8').trim().split(/\r?\n/).filter(Boolean)){const row=JSON.parse(line).event;if(row.kind==='external')states.set(row.owner+':'+row.key,row);if(row.kind==='central-delivery'&&row.state==='recorded')deliveries.add(row.owner+':'+row.key);}
 for(const row of states.values())if(!['completed','failed','rejected','not_submitted'].includes(row.state)||row.budget_settlement_pending||!deliveries.has(row.owner+':'+row.central_record_key))throw Error('BACKGROUND_PENDING_SOURCE_DOWNGRADE_BLOCKED');
}
