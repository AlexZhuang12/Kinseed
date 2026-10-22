import net from 'node:net';
// The OS releases this exclusive loopback socket on crash. PID files are advisory only.
export async function reserveSingleton(port=47429){
 const guard=net.createServer(socket=>socket.destroy());
 await new Promise((resolve,reject)=>{guard.once('error',reject);guard.listen({host:'127.0.0.1',port,exclusive:true},resolve);});
 return guard;
}
