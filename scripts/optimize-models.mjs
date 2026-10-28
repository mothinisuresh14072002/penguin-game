// Precompute compact meshoptimizer GLBs without overwriting the original files.
// Requires Node.js + npm; glTF-Transform CLI is downloaded with npx on first run.
import {existsSync,mkdirSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=resolve(import.meta.dirname||new URL('..',import.meta.url).pathname,'..');
const originals=join(root,'public','models');
const optimized=join(originals,'optimized');
const animals=['bunny','unicorn','horse','cat','dog','penguin','cow'];
mkdirSync(optimized,{recursive:true});
let converted=0,failed=0;
for(const id of animals){
 const source=join(originals,id+'.glb');
 if(!existsSync(source)){console.log('SKIP '+id+': no authored GLB');continue;}
 const target=join(optimized,id+'.glb');
 const args=['--yes','@gltf-transform/cli@4.5.1','optimize',source,target,'--compress','meshopt','--texture-compress','webp','--simplify','false'];
 const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{stdio:'inherit',shell:process.platform==='win32'});
 if(result.status!==0){failed++;console.error('FAILED '+id+'; original model is unchanged');continue;}
 const before=statSync(source).size,after=statSync(target).size;
 console.log(id+': '+(before/1048576).toFixed(2)+' MiB → '+(after/1048576).toFixed(2)+' MiB');
 converted++;
}
console.log('Optimized '+converted+' model(s); failures: '+failed+'. Originals preserved.');
if(failed)process.exitCode=1;
