// Synthetic protocol fixture. It never calls an LLM or executes external tools.
const mode=process.argv[2],send=e=>console.log(JSON.stringify(e));
process.stdin.resume();
if(mode==='slow'){setInterval(()=>{},1000);}
else if(mode==='capacity'){send({type:'error',message:'selected model is at capacity'});process.exit(1);}
else if(mode==='disconnect'){send({type:'turn.failed',error:{message:'stream disconnected'}});process.exit(1);}
else if(mode==='authentication'){send({type:'error',message:'authentication failed'});process.exit(1);}
else if(mode==='quota'){send({type:'error',message:'quota exceeded'});process.exit(1);}
else if(mode==='malformed'){console.log('not-json');setInterval(()=>{},1000);}
else if(mode==='missing'){send({type:'thread.started',thread_id:'synthetic-session'});process.exit(0);}
else if(mode==='tool'){send({type:'item.started',item:{type:'command_execution',command:'synthetic-never-executed'}});setInterval(()=>{},1000);}
else{
 send({type:'thread.started',thread_id:'synthetic-session'});
 if(mode==='reasoning')send({type:'item.completed',item:{type:'reasoning',text:'SYNTHETIC_HIDDEN_REASONING'}});
 if(mode==='mcp')send({type:'item.completed',item:{type:'mcp_tool_call',server:'kinseed',tool:'get_context',result:'synthetic'}});
 send({type:'item.completed',item:{type:'agent_message',text:mode==='invalid-text'?'not valid JSON':'{"answer":"synthetic"}'}});
 send({type:'turn.completed',usage:{input_tokens:10,output_tokens:2,cached_input_tokens:5}});process.exit(0);
}
