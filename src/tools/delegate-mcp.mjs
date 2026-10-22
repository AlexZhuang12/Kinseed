// Fixed stdio proxy. The child receives only a short-lived delegation capability.
import readline from 'node:readline';
const endpoint=process.env.KINSEED_DELEGATE_ENDPOINT,token=process.env.KINSEED_DELEGATE_TOKEN;
const u=new URL(endpoint);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||!u.port||u.pathname!=='/'||u.search||u.hash||u.username||u.password)throw Error('DELEGATE_ENDPOINT');
async function post(body){const r=await fetch(endpoint,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok)throw Error(data.error);return data;}
await post({method:'attach',pid:process.pid});
let queue=Promise.resolve();const lines=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
const timer=setInterval(()=>post({method:'ping'}).catch(()=>lines.close()),500);timer.unref();
lines.on('line',line=>{queue=queue.then(async()=>{let m;try{if(line.length>100000)throw Error('MESSAGE_LIMIT');m=JSON.parse(line);if(m.id===undefined)return;let result;if(m.method==='initialize')result={protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'kinseed-delegate',version:'1'}};else if(m.method==='ping')result={};else if(m.method==='tools/list')result=await post({method:'list'});else if(m.method==='tools/call')result=await post({...m.params,method:'tool'});else if(['resources/list','resources/templates/list'].includes(m.method))result=m.method==='resources/list'?{resources:[]}:{resourceTemplates:[]};else throw Error('METHOD_NOT_FOUND');process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result})+'\n');}catch(e){if(m?.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,error:{code:-32602,message:e.message}})+'\n');}});});
await new Promise(resolve=>lines.once('close',resolve));clearInterval(timer);process.stdin.destroy();await queue;await post({method:'detach'}).catch(()=>{});
