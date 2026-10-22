// SYNTHETIC OLLAMA PROTOCOL ONLY. This is not a language model.
import http from 'node:http';
export async function syntheticOllama({mode='text',respond=null,delay=0,version='SYNTHETIC-PROTOCOL-NOT-A-MODEL',inputTokens=10}={}){
 const requests=[];let chats=0;
 const service=http.createServer(async(req,res)=>{
  let body='';for await(const c of req)body+=c;let parsed;try{parsed=body?JSON.parse(body):null;}catch{res.writeHead(400);res.end('{}');return;}
  requests.push({route:req.url,body:parsed,headers:{authorization:req.headers.authorization,cookie:req.headers.cookie}});
  const json=(value,code=200)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
  if(mode==='redirect'){res.writeHead(302,{Location:'http://127.0.0.1:1/never'});res.end();return;}
  if(req.url==='/api/version')return json({version});
  if(req.url==='/api/tags')return json({models:mode==='missing'?[]:[{name:'synthetic:fixture',digest:mode==='changed'&&chats?'changed-digest':'synthetic-artifact',...(mode==='cloud'?{remote_host:'https://external.invalid'}:{})}]});
  if(req.url==='/api/show')return json({capabilities:mode==='no-tools'?['completion']:['completion','tools'],model_info:{'fixture.context_length':mode==='short-context'?4096:65536}});
  if(req.url!=='/api/chat')return json({error:'NOT_ALLOWED'},404);
  chats++;
  if(mode==='disconnect'){req.socket.destroy();return;}
  if(mode==='hang')return;
  if(delay)await new Promise(r=>setTimeout(r,delay));
  if(mode==='malformed'){res.end('not JSON');return;}
  if(mode==='oversized'){res.end('X'.repeat(1100000));return;}
  const message=respond?await respond(parsed,chats):{role:'assistant',content:'{"text":"合成文字結果"}',thinking:'SYNTHETIC_HIDDEN_REASONING'};
  return json({model:mode==='wrong-model'?'other:fixture':'synthetic:fixture',done:mode!=='incomplete',done_reason:mode==='length'?'length':'stop',message,prompt_eval_count:mode==='no-usage'?undefined:inputTokens,eval_count:mode==='no-usage'?undefined:5});
 });
 await new Promise(resolve=>service.listen(0,'127.0.0.1',resolve));
 return {endpoint:'http://127.0.0.1:'+service.address().port,requests,get chats(){return chats;},async close(){service.closeAllConnections();await new Promise(resolve=>service.close(resolve));}};
}
