// Generic optional transport: model selects the tool AND every argument.
// The original MCP schemas and authorization remain the final authority.
import {LocalBrainError} from './local-http.mjs';
export function toolFormat(definitions,first=false){
 const available=first?definitions.filter(t=>t.name==='get_context'):definitions;
 return {type:'object',oneOf:available.map(t=>({type:'object',properties:{name:{type:'string',enum:[t.name]},arguments:t.inputSchema},required:['name','arguments'],additionalProperties:false}))};
}
export function formattedCall(message){
 if(!message||message.role!=='assistant'||typeof message.content!=='string'||message.tool_calls?.length)throw new LocalBrainError('invalid_output','工具格式不完整，未執行。');
 let value;try{value=JSON.parse(message.content);}catch{throw new LocalBrainError('invalid_output','模型未提供完整工具資料，未執行。');}
 if(!value||Array.isArray(value)||Object.keys(value).sort().join(',')!=='arguments,name'||typeof value.name!=='string'||!value.arguments||typeof value.arguments!=='object'||Array.isArray(value.arguments))throw new LocalBrainError('invalid_output','工具資料欄位不正確，未猜補參數。');
 return {role:'assistant',content:'',tool_calls:[{function:{name:value.name,arguments:value.arguments}}]};
}
