import test from 'node:test';
import assert from 'node:assert/strict';
import {assessResources,resourceSnapshot} from '../scripts/local-model-readiness.mjs';
test('low headroom recommends deferral without model work or permissions',()=>{
 const r=assessResources({total_memory_bytes:16*1024**3,free_memory_bytes:4*1024**3});
 assert.equal(r.status,'defer_model_load');assert.equal(r.inference_verified,false);assert.equal(r.automatic_action,false);
});
test('headroom is readiness only, not proof of model integration',()=>{
 const r=assessResources({total_memory_bytes:16*1024**3,free_memory_bytes:8*1024**3});
 assert.equal(r.status,'headroom_available');assert.equal(r.inference_verified,false);
});
test('invalid measurements never produce a readiness claim',()=>{
 for(const x of [null,{total_memory_bytes:4,free_memory_bytes:5},{total_memory_bytes:Infinity,free_memory_bytes:0},{total_memory_bytes:8,free_memory_bytes:-1}])assert.throws(()=>assessResources(x));
});
test('read-only snapshot excludes machine identity, tokens and individual data',()=>{
 const s=resourceSnapshot();assert.equal(s.schema,1);assert.ok(s.logical_processors>0);assert.ok(s.total_memory_bytes>0);
 assert.deepEqual(Object.keys(s).sort(),['schema','checked_at','platform','architecture','cpu_model','logical_processors','total_memory_bytes','free_memory_bytes','disk_total_bytes','disk_available_bytes','gpu','note'].sort());
 assert.equal(s.gpu,'not_probed_by_this_script');
});
