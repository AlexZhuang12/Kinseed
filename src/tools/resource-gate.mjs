// One heavyweight local job at a time; a waiting request is explicitly rejected,
// rather than retaining unbounded queues on a 16GB Windows host.
let active=false;
export async function localJob(fn){
 if(active)throw Error('另一項本機轉換或隔離工作尚未收尾，請稍後再試。');
 active=true;try{return await fn();}finally{active=false;}
}
