import path from 'node:path';
// Registration is in-process host state, never a tool argument or environment flag.
const ownedEndpoints=new WeakMap();
function parse(value){const u=new URL(value);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.username||u.password||u.hash||u.search||u.pathname!=='/'||!u.port||[47429,47430,47431].includes(Number(u.port)))throw Error('生活工具只能連接已核對的本機控制器。');return u;}
export function bindOwnedLifeEndpoint(platform,endpoint){const u=parse(endpoint);if(!platform||!platform.dir||!platform.run_id||!(platform.individuals instanceof Map))throw Error('INVALID_CONTROLLER_BINDING');if(ownedEndpoints.has(platform))throw Error('CONTROLLER_ALREADY_BOUND');ownedEndpoints.set(platform,{endpoint:u.origin,dir:path.resolve(platform.dir),run_id:platform.run_id});}
export function assertLifeEndpoint(endpoint,controller){const u=parse(endpoint),platform=controller?.platform,owned=platform&&ownedEndpoints.get(platform);
 if(owned){const id=controller.info?.individual_id;if(owned.endpoint!==u.origin||owned.run_id!==controller.run_id||platform.individuals.get(id)!==controller||path.resolve(controller.store.dir)!==path.join(owned.dir,'individuals',id))throw Error('CONTROLLER_ENDPOINT_SCOPE');}
 else if(Number(u.port)===62372)throw Error('正式控制台需由持有此個體的控制器明確綁定。');
 return u.origin;
}
