import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {APP_ROOT,noLinks} from './environment.mjs';import {boundedBrowserExecutable} from '../src/tools/browser-job.mjs';
export const OCR_ASSETS=[
 {name:'eng',bytes:1984273,sha256:'18c1ac52b75e35d44735fb6c2a60acfaf23033524653200738e98f0243edb75b'},
 {name:'chi_tra',bytes:1667198,sha256:'542b2aecc8e4a3b760694301381543d76bdcd8afdf6d899fb03381801b5e2b47'}
];
export async function prepareAssets({download=false}={}){
 const dir=path.join(APP_ROOT,'.private/ocr-data');noLinks(APP_ROOT,dir);fs.mkdirSync(dir,{recursive:true});const result=[];
 for(const asset of OCR_ASSETS){const file=path.join(dir,asset.name+'.traineddata.gz');noLinks(APP_ROOT,file);const valid=()=>fs.existsSync(file)&&fs.statSync(file).size===asset.bytes&&createHash('sha256').update(fs.readFileSync(file)).digest('hex')===asset.sha256;
  if(!valid()&&download){const url='https://tessdata.projectnaptha.com/4.0.0_fast/'+asset.name+'.traineddata.gz',r=await fetch(url,{signal:AbortSignal.timeout(60000),redirect:'error'});if(!r.ok)throw Error('OCR來源未成功回應：'+r.status);const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>asset.bytes)throw Error('OCR來源大小改變，未保存。');chunks.push(chunk);}const bytes=Buffer.concat(chunks);if(size!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('OCR來源雜湊不符，未保存。');fs.writeFileSync(file,bytes);}
  result.push({...asset,verified:valid()});
 }
 const binary=boundedBrowserExecutable();return {ocr:result,ocr_ready:result.every(x=>x.verified),windows_job_ready:fs.existsSync(binary),download_performed:download,private_assets:true};
}
if(path.resolve(process.argv[1]??'')===import.meta.filename)prepareAssets({download:process.argv.includes('--download-ocr')}).then(r=>{console.log(JSON.stringify(r,null,2));if(!r.ocr_ready)process.exitCode=2;}).catch(e=>{console.error(e.message);process.exitCode=2;});
