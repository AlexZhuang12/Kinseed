import {createHash} from 'node:crypto';import assetManifest from './media-engine-assets.json' with {type:'json'};
import fs from 'node:fs';import path from 'node:path';import {browserJob} from './project-runner.mjs';
export const MEDIA_LIMITS=Object.freeze({input_bytes:8000000,output_bytes:8000000,total_input_bytes:12000000,duration_ms:30000,width:1280,height:720,clips:8,audio:8,captions:40,timeout:20000});
const core=path.resolve(import.meta.dirname,'../../node_modules/@ffmpeg/core/dist/umd');
// Internal commands only. Callers expose typed operations, never raw command lines.
export async function mediaEngine({files=[],commands=[],outputs=[],captions=[]},{signal,timeout=MEDIA_LIMITS.timeout}={}){
 if(commands.some((c,i)=>c.probe&&i!==commands.length-1))throw Error('媒體規格讀取必須是隔離核心的最後步驟。');
 if(files.reduce((n,x)=>n+x.bytes.length,0)>MEDIA_LIMITS.total_input_bytes||files.some(x=>!/^[a-zA-Z0-9_.-]{1,70}$/.test(x.name)||x.bytes.length>MEDIA_LIMITS.input_bytes))throw Error('影音輸入超過隔離範圍。');
 const asset=n=>{const p=path.join(core,n);if(fs.realpathSync(p).toLowerCase()!==p.toLowerCase())throw Error('影音核心路徑含連結，未載入。');const b=fs.readFileSync(p);if(createHash('sha256').update(b).digest('hex')!==assetManifest.files[n])throw Error('影音核心SHA不符，未執行。');return b;};const js=asset('ffmpeg-core.js'),wasm=asset('ffmpeg-core.wasm');
 return browserJob(async(page,context)=>{
  await context.unroute('**/*');await context.route('**/*',r=>r.request().url()==='https://kinseed-media.invalid/core.js'?r.fulfill({body:js,contentType:'text/javascript'}):r.request().url()==='https://kinseed-media.invalid/core.wasm'?r.fulfill({body:wasm,contentType:'application/wasm',headers:{'Access-Control-Allow-Origin':'*'}}):r.abort());
  await page.goto('about:blank');await page.addScriptTag({url:'https://kinseed-media.invalid/core.js'});
  const result=await page.evaluate(async({files,commands,outputs,captions,max})=>{
   const logs=[];const ff=await createFFmpegCore({mainScriptUrlOrBlob:'https://kinseed-media.invalid/core.js#'+btoa(JSON.stringify({wasmURL:'https://kinseed-media.invalid/core.wasm'}))});ff.setLogger(x=>{if(logs.join('').length>200000)throw Error('影音診斷輸出超過上限。');logs.push(x.message);});
   for(const x of files)ff.FS.writeFile(x.name,Uint8Array.from(atob(x.data),c=>c.charCodeAt(0)));
   for(const x of captions){const c=document.createElement('canvas');c.width=x.width;c.height=x.height;const g=c.getContext('2d');g.fillStyle='rgba(0,0,0,0.72)';g.fillRect(0,0,c.width,c.height);g.fillStyle='white';g.font=(x.font_size??24)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';const lines=x.text.split('\n');if(lines.length>2||lines.length*((x.font_size??24)+4)>c.height-8||lines.some(t=>g.measureText(t).width>c.width-24))throw Error('字幕超出版面，請縮短文字或自行換行（最多兩行）。');lines.forEach((t,i)=>g.fillText(t,c.width/2,c.height/2+(i-(lines.length-1)/2)*((x.font_size??24)+4)));ff.FS.writeFile(x.name,Uint8Array.from(atob(c.toDataURL('image/png').split(',')[1]),v=>v.charCodeAt(0)));}
   const runs=[];for(const cmd of commands){const start=logs.length;ff.reset();const rc=cmd.probe?ff.ffprobe(...cmd.args):ff.exec('-nostdin','-hide_banner','-threads','1','-filter_threads','1','-filter_complex_threads','1',...cmd.args);const log=logs.slice(start).join('\n');runs.push({rc,log});if(rc!==0&&!cmd.allow_failure)throw Error('影音處理失敗 rc='+rc+' probe='+!!cmd.probe+'：'+log.slice(-1800));}
   const out=[];for(const name of outputs){const b=ff.FS.readFile(name);if(!b.length||b.length>max)throw Error('影音輸出超過8MB或沒有內容。');let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));out.push({name,data:btoa(s),bytes:b.length});}return {runs,outputs:out};
  },{files:files.map(x=>({name:x.name,data:x.bytes.toString('base64')})),commands,outputs,captions,max:MEDIA_LIMITS.output_bytes});
  return {...result,outputs:result.outputs.map(x=>({...x,bytes:Buffer.from(x.data,'base64')})),engine:'FFmpeg/WASM single-thread; Chromium sandbox + 768MiB Windows Job',cleanup_confirmed:true};
 },{signal,timeout});
}
export function probeLog(log){const d=log.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/),v=log.split('\n').find(x=>/Stream .*Video:/.test(x)),a=log.split('\n').find(x=>/Stream .*Audio:/.test(x)),size=v?.match(/(?:^|, )([1-9]\d{1,4})x([1-9]\d{1,4})(?:[ ,\[])/),fps=v?.match(/([\d.]+) fps/);return {duration_ms:d?Math.round((+d[1]*3600 + +d[2]*60 + +d[3])*1000):null,width:size?+size[1]:null,height:size?+size[2]:null,fps:fps?+fps[1]:null,video:!!v,audio:!!a,video_codec:v?.split('Video: ')[1]?.split(',')[0]??null,audio_codec:a?.split('Audio: ')[1]?.split(',')[0]??null};}
