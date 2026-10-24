import {hedraSession} from './hedra-codex-transport.mjs';
const ALLOWED=new Set(['get_balance','list_workspaces','estimate']);
export async function hedraReadOnly(tool,args={},options={}){if(!ALLOWED.has(tool))throw Error('此連線只允許Hedra餘額、工作區與估價查詢。');return hedraSession(call=>call(tool,args),{...options,paid:false});}
export async function inspectHedraConnection(options){const {balance:b}=await hedraReadOnly('get_balance',{},options);return {connected:true,billing_mode:b.billing_mode,subscription_credits:b.credits.subscription,available_credits:b.credits.available,api_wallet:b.api_wallet,fixed:false,submission_enabled:false,policy:'oauth_credits_checked',message:'共用OAuth連線；目前模式與點數已讀回，非獨立鎖定。新提交另需Owner確認、個體權限與有效額度。'};}
