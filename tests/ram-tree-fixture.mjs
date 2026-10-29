import {fork}from'node:child_process';
const child=process.argv[2]==='child';let bytes;
if(child){bytes=Buffer.alloc(32*1024*1024,1);process.send({ready:true,pid:process.pid});process.on('disconnect',()=>process.exit());setInterval(()=>{bytes[0]++;},1000).unref();}
else{const c=fork(import.meta.filename,['child'],{stdio:['ignore','ignore','ignore','ipc']});c.on('message',()=>{bytes=Buffer.alloc(24*1024*1024,1);process.send({ready:true,root:process.pid,child:c.pid,allocated_bytes:56*1024*1024});});process.on('message',m=>{if(m==='stop'){c.disconnect();process.disconnect();}});process.on('disconnect',()=>{try{c.disconnect();}catch{}process.exit();});}
