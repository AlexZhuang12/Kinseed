import {mediaFixture} from './hedra-media-fixture.mjs';import {OAuthCreditsHedraProvider} from '../src/tools/hedra-oauth-provider.mjs';import {id} from '../src/v1_2/store.mjs';
export async function referenceFixture({enabled=true}={}){
 const f=await mediaFixture(),m=f.hub.hedra,entity=f.e.info.individual_id;
 const artifact=await f.hub.media.save(f.e,f.job.id);
 m.ledger.configureConnection({request_id:id(),expected_version:0,enabled:true,risk_accepted:true,workspace_id:'synthetic-workspace'});
 await f.callOwner('hedra-settings',{request_id:id(),expected_version:0,settings:{image:true,video:true,audio:false,reference_images:enabled,limit:500,single_limit:50}});
 const remote={calls:[],expired:false,wrongWorkspace:false,minDimension:1,maxImages:4,price:2,hook:null,disconnect:false};
 const media={media_type:'image',maxItems:4,min_dimension_px:1,max_dimension_px:6000,max_file_size_bytes:8000000,items:{oneOf:[{properties:{source:{enum:['asset']},asset_id:{type:'string'}}}]}};
 m.provider=new OAuthCreditsHedraProvider({policy:()=>m.ledger.connection(),session:async(fn,o={})=>fn(async(tool,args)=>{
  remote.calls.push({tool,args,paid:o.paid});await remote.hook?.(tool,args);
  if(tool==='get_balance')return {balance:{workspace_id:remote.wrongWorkspace?'wrong-workspace':'synthetic-workspace',billing_mode:'credits',credits:{available:2000}}};
  if(tool==='get_model'){const spec={...media,min_dimension_px:remote.minDimension,maxItems:remote.maxImages};return {model:{id:args.model,modality:args.model.includes('video')?'video':'image',input_schema:{required:['prompt','aspect_ratio'],properties:{prompt:{type:'string'},aspect_ratio:{type:'string',enum:['1:1']},resolution:{enum:['540p']},duration_ms:{type:'integer'},images:spec,start_image:{...spec,oneOf:spec.items.oneOf},end_image:{...spec,oneOf:spec.items.oneOf}}}}};}
  if(tool==='get_generations'){const original=args.job_ids[0]==='synthetic-remote';return {jobs:[{job_id:args.job_ids[0],job:{job_id:args.job_ids[0],status:'COMPLETED',currency:'credits',cost:original?1:2,outputs:[{asset_id:original?(remote.expired?null:'synthetic-asset'):'synthetic-reference-output',content_type:'image/png',status:remote.expired&&original?'EXPIRED':'COMPLETED'}]}}]};}
  if(tool==='estimate')return {estimate:{cost:remote.price,currency:'credits'}};
  if(['generate_image','generate_video'].includes(tool)){if(remote.disconnect)throw Error('synthetic response lost after accepted');return {job:{job_id:'synthetic-reference-generated',model:args.model,status:'IN_QUEUE',poll_after_seconds:1}};}
  throw Error('unexpected tool '+tool);
 })});
 await f.start();
 const input=(request_id='synthetic-reference-quote',kind='image')=>({request_id,kind,model:'synthetic-reference-'+kind,prompt:'Continue a synthetic green square',parameters:{aspect_ratio:'1:1',...(kind==='video'?{duration_ms:5000}:{})},references:[{source_id:artifact.id,role:kind==='image'?'reference_image':'start_image'}]});
 return {...f,get invocation(){return f.invocation;},m,entity,artifact,remote,input,async queue(request='synthetic-reference-submit',kind='image'){const q=await m.quote(entity,input('quote-'+request,kind));return m.submit(entity,{request_id:request,quote_id:q.quote_id});}};
}
