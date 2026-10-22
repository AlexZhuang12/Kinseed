import path from 'node:path';
import {INFERENCE_POLICY,providerFailure} from '../v1_2/inference.mjs';
export const PROJECT=path.resolve(import.meta.dirname,'../..');
export function codexArgs(cwd){
 const args=['--no-daemon','-a','never','exec','--model',INFERENCE_POLICY.model,'-c',`model_reasoning_effort="${INFERENCE_POLICY.reasoning}"`,'--ignore-user-config','--ignore-rules','--skip-git-repo-check','--ephemeral','--json','-C',cwd];
 // MXC enforces restricted reads on this Windows host. Explicit selection fails closed; never fall back to broader access.
 args.push('-c','windows.sandbox="mxc"','-c','features.prefer_mxc=true');
 args.push('-c','default_permissions="kinseed-life"','-c','permissions.kinseed-life.filesystem={":minimal"="read",":workspace_roots"="deny"}','-c','permissions.kinseed-life.network.enabled=false');
 for(const name of ['shell_tool','apps','plugins','multi_agent','browser_use','browser_use_external','computer_use','image_generation','view_image','memories','workspace_dependencies','goals','skill_search','remote_plugin','skill_mcp_dependency_install','unbounded_connection_retries'])args.push('-c',`features.${name}=false`);
 args.push('-c','features.code_mode_host=true','-c','project_doc_max_bytes=0','-c','web_search="disabled"','-c','hide_agent_reasoning=true');
 args.push('-c',`mcp_servers.kinseed.command=${JSON.stringify(process.execPath)}`,'-c',`mcp_servers.kinseed.args=${JSON.stringify([path.join(PROJECT,'src','v1_2','mcp.mjs')])}`,'-c','mcp_servers.kinseed.env_vars=["KINSEED_CYCLE_TOKEN","KINSEED_ENDPOINT"]','-c','mcp_servers.kinseed.required=true','-c','mcp_servers.kinseed.tool_timeout_sec=65');
 return args;
}
export function safeEnv(extra={}){const allowed=['PATH','SystemRoot','WINDIR','USERPROFILE','HOMEDRIVE','HOMEPATH','LOCALAPPDATA','APPDATA','TEMP','TMP'];return {...Object.fromEntries(allowed.filter(k=>process.env[k]).map(k=>[k,process.env[k]])),...extra};}
