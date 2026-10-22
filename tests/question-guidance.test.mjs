import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {questionGuidance,guidanceRows} from '../src/v1_2/question-guidance.mjs';
import {loadTemplate,emptyAnswers,compile} from '../src/v1_2/identity.mjs';
test('Guidance covers all standard questions with distinct examples, but never labels custom questions incorrectly',()=>{
 const questions=loadTemplate().domains.flatMap(d=>d.questions);assert.equal(questions.length,24);assert.equal(new Set(guidanceRows.map(r=>r[0])).size,24);
 for(const q of questions){const g=questionGuidance(q);assert.ok(g?.hint);assert.ok(g.starter);assert.equal(g.examples.length,2);assert.notEqual(g.examples[0],g.examples[1]);assert.equal(questionGuidance({...q,text:'自行改寫的問題'}),null);}
 assert.equal(questionGuidance({question_id:'unknown',text:'未知'}),null);
});
test('Reading all guidance leaves blank answers and compiled conditions blank; only explicit answers become identity content',()=>{
 const answers=emptyAnswers(),before=structuredClone(answers);loadTemplate().domains.flatMap(d=>d.questions).forEach(questionGuidance);assert.deepEqual(answers,before);
 let p=compile({package_id:'guidance-test',title:'合成',test_only:true,answers});assert.ok(p.issues.some(i=>i.severity==='blocking'));assert.deepEqual(p.conditions.map(c=>c.raw_text),['未設定／未確認']);
 answers[0].text='這是我自己寫的合成身份';answers[0].status='custom';p=compile({package_id:'guidance-test',title:'合成',test_only:true,answers});assert.equal(p.conditions.length,1);assert.equal(p.conditions[0].raw_text,answers[0].text);
 for(const row of guidanceRows)for(const example of row.slice(4))assert.ok(!JSON.stringify(p).includes(example));
});
test('Browser bundle includes examples and keeps unimplemented archive management explicitly disabled',()=>{
 const bundle=fs.readFileSync('src/v1_2/console-ui.js','utf8');new vm.Script(bundle);assert.ok(bundle.includes('不知道怎麼寫？看兩種填寫示例'));assert.ok(bundle.includes("b.disabled=true;b.id='manageIndividuals'"));assert.ok(bundle.includes('管理個體選項（後續整合）'));
});
