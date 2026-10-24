import fs from 'node:fs';import path from 'node:path';import {chromium} from 'playwright-core';
import {delegationFixture} from '../tests/delegation-fixture.mjs';import {hash} from '../src/v1_2/store.mjs';
const base=path.resolve('../../evidence/daily-life-20261023');let browser,f;const out={synthetic:true,virtual_clock:true,real_model:false,checks:{},errors:[]};
try{
 const now=Date.parse('2026-10-23T01:00:00+08:00');f=await delegationFixture({clock:()=>now,runner:()=>async()=>{throw Error('NO_MODEL_EXPECTED');}});f.start();f.cmd('stop');f.cmd('window',{start:'02:00',minutes:180});
 const protectedState=hash({a:f.e.store.get('a'),life:f.e.store.get('life'),identities:f.e.store.get('identities')}),neighbor=hash(f.neighbor.store.get('control'));
 const request=(route,body,headers={})=>fetch(f.app.endpoint+'/owner/'+route,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
 out.checks.authentication_required=(await request('daily/preview',{individual_id:f.e.info.individual_id})).status===401;
 out.checks.foreign_origin_refused=(await request('daily/preview',{individual_id:f.e.info.individual_id},{Authorization:'Bearer '+f.app.ownerToken,Origin:'https://example.com'})).status===403;
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,chromiumSandbox:true,timeout:60000});const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(10000);page.on('pageerror',e=>out.errors.push(e.message));await page.goto(f.app.endpoint+'/#'+f.app.ownerToken);
 await page.getByRole('button',{name:'管理個體',exact:true}).click();await page.locator('#ownerControlTarget').selectOption(f.e.info.individual_id);await page.locator('#hubTab-status').click();
 out.checks.initial_off=await page.locator('#dailyLifeStatus').innerText().then(t=>t.includes('未開啟'));
 await page.locator('#dailyLifeEnable').click();await page.locator('#dailyLifeConfirm').waitFor();out.checks.concrete_confirmation=await page.locator('#dailyLifePanel').innerText().then(t=>t.includes('合成委派甲')&&t.includes('02:00')&&t.includes('180'));
 await page.locator('#dailyLifeConfirm').click();await page.waitForFunction(()=>document.querySelector('#dailyLifeStatus').textContent.includes('已開啟'));
 out.checks.enabled_waiting=f.e.status().daily_life.enabled&&f.e.store.get('control').mode==='stopped';
 await page.reload();await page.getByRole('button',{name:'管理個體',exact:true}).click();await page.locator('#hubTab-status').click();out.checks.refresh_keeps_daily=await page.locator('#dailyLifeStatus').innerText().then(t=>t.includes('已開啟')&&t.includes('02:00'));
 await page.screenshot({path:path.join(base,'daily-waiting-synthetic.png'),fullPage:true});await page.locator('#ownerControlTarget').selectOption(f.neighbor.info.individual_id);out.checks.target_switch_is_read_only=await page.locator('#dailyLifeEnable').isDisabled()&&hash(f.neighbor.store.get('control'))===neighbor;
 await page.locator('#ownerControlTarget').selectOption(f.e.info.individual_id);await page.locator('#dailyLifeStop').click();await page.waitForFunction(()=>document.querySelector('#dailyLifeStatus').textContent.includes('未開啟'));
 out.checks.stop_cancels=f.e.status().daily_life.enabled===false;out.checks.identity_birth_memory_preserved=protectedState===hash({a:f.e.store.get('a'),life:f.e.store.get('life'),identities:f.e.store.get('identities')});out.checks.no_page_errors=!out.errors.length;
}catch(e){out.errors.push(e.stack);}finally{await browser?.close();await f?.app.close();}
out.status=Object.values(out.checks).every(Boolean)&&!out.errors.length?'PASS':'FAIL';fs.writeFileSync(path.join(base,'ui-result.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));if(out.status!=='PASS')process.exitCode=2;
