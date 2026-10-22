const renderWithoutGuidance=renderQuestions;
renderQuestions=function(){
 renderWithoutGuidance();
 if(!draft)return;
 const questions=draft.template.domains[domainIndex].questions;
 for(const [i,box] of Array.from($('questions').children).entries()){
  const q=questions[i],guide=questionGuidance(q),answer=box.querySelector('textarea');
  if(!guide||!answer)continue;
  const hint=el('p','可以想想：'+guide.hint);hint.id='question-help-'+q.question_id;hint.className='muted';
  box.insertBefore(hint,box.children[1]);
  answer.placeholder=guide.starter+'（請用自己的話填寫）';
  answer.setAttribute('aria-describedby',hint.id);
  const examples=el('details');examples.className='question-examples';
  examples.append(el('summary','不知道怎麼寫？看兩種填寫示例'));
  examples.append(el('p','以下是虛構示例，不是標準答案。可以改成你的期待、持不同想法；選填題也可跳過。查看示例不會填入或保存回答。'));
  guide.examples.forEach((text,n)=>examples.append(el('p','示例 '+(n+1)+'：'+text)));
  box.insertBefore(examples,answer.parentElement);
  const extra=box.querySelectorAll('textarea');
  if(extra[1])extra[1].placeholder='選填，例如：還有一點我希望它知道的是……';
  if(extra[2])extra[2].placeholder='選填，例如：平常可以這樣，但遇到……時先……；尚未想清楚的地方是……';
 }
};
