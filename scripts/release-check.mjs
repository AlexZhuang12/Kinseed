// Offline source review; reports paths/rules, never the matching secret text.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {APP_ROOT,noLinks} from './environment.mjs';
import {inspectBoundaries} from './check-boundaries.mjs';
export const sha256=b=>createHash('sha256').update(b).digest('hex');
export function reviewRelease(root=APP_ROOT){
 const problems=[...inspectBoundaries(root).problems],files={},rules=[
  ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['api-key',/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}/],
  ['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
  ['literal-bearer',/Bearer [A-Za-z0-9._~-]{32,}/],
  ['personal-windows-path',/[A-Za-z]:[\\/]Users[\\/](?!Public\b|Default\b|<)[A-Za-z0-9_.-]+/i]
 ];
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(dir===root&&['.private','node_modules','.git'].includes(e.name))continue;const f=path.join(dir,e.name),rel=path.relative(root,f).replaceAll('\\','/');noLinks(root,f);if(e.isDirectory())walk(f);else{const b=fs.readFileSync(f);files[rel]=sha256(b);if(b.includes(0))problems.push(rel+':binary-source');const text=b.toString('utf8');for(const [rule,re] of rules)if(re.test(text))problems.push(rel+':'+rule);}}}
 walk(root);
 const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'))),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),dependencies=[];
 for(const [key,v] of Object.entries(lock.packages)){if(!key)continue;const name=key.replace(/^node_modules\//,'');if(!/^https:\/\/registry\.npmjs\.org\//.test(v.resolved??'')||!/^sha512-/.test(v.integrity??'')||v.hasInstallScript)problems.push(key+':dependency-source-or-script');const installed=path.join(root,key,'package.json');let installedVersion=null;if(fs.existsSync(installed)){noLinks(root,installed);installedVersion=JSON.parse(fs.readFileSync(installed)).version;if(installedVersion!==v.version)problems.push(key+':installed-version-mismatch');}dependencies.push({name,version:v.version,license:v.license??null,resolved:v.resolved,integrity:v.integrity,installed_version:installedVersion});if(!v.license)problems.push(key+':missing-license');}
 for(const [name,version] of Object.entries(pkg.dependencies))if(lock.packages['node_modules/'+name]?.version!==version||lock.packages[''].dependencies[name]!==version)problems.push(name+':lock-mismatch');
 return {status:problems.length?'FAIL':'PASS',scope:'Offline source patterns, dependency provenance and lock consistency; not a proof of absence of secrets or vulnerabilities.',problems,files,dependencies,publication:{license:pkg.license??'UNDECIDED',private:pkg.private===true,ready_to_publish:false}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename){const r=reviewRelease();console.log(JSON.stringify(r,null,2));if(r.status!=='PASS')process.exitCode=2;}
