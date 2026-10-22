// Development bootstrap deliberately excludes private identity packages.
import {Platform} from './platform.mjs';
export async function freshInstall(dir){const p=new Platform(dir,{engineering:true});try{p.audit('installation.development',{empty:true,models_disabled:true});}finally{await p.close();}return {fresh:true,all_unborn:true};}
