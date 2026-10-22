import {Platform} from './platform.mjs';
import {original56,synthetic} from './packages.mjs';
import path from 'node:path';
export async function freshInstall(dir,project){const p=new Platform(dir,{engineering:true});try{for(const q of [synthetic('test-botanical','植物觀察與本機筆記練習，未知資料不補造。'),synthetic('test-geometric','幾何與色彩觀察練習，保存獨立本機筆記。'),original56(path.join(project,'docs/INITIAL_CONDITIONS_56_v0.1.md'))])p.importPackage(q);p.create({individual_id:'kinseed-test-001',name:'測試個體 001｜未出生',test_only:true});p.create({individual_id:'kinseed-test-002',name:'測試個體 002｜未出生',test_only:true});p.create({individual_id:'kinseed-formal-001',name:'正式個體 001｜未出生',test_only:false});p.audit('installation.fresh',{all_unborn:true});}finally{await p.close();}return {fresh:true,all_unborn:true};}
