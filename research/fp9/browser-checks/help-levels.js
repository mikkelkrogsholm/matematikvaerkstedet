async(page)=>{
 await page.goto('http://127.0.0.1:4317/fp9');await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).check();
 const creating=page.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 const results=[];
 for(const [level,label,prompt] of [['question','Stil spørgsmål','Stil et kort spørgsmål, der hjælper mig i gang.'],['hint','Lille hint','Giv et lille hint uden facit.'],['step','Vis ét trin','Beskriv første regnetrin kort i tekst. Ingen figurændringer.'],['solution','Vis løsning','Vis løsningen med regnestykket og en kort forklaring i tekst. Ingen figurændringer.']]){
  await page.getByLabel('Dit spørgsmål',{exact:true}).fill(prompt);
  const count=await page.locator('.fp9-chat.guide').count();const response=page.waitForResponse(r=>r.url().endsWith('/help'),{timeout:100000});
  await page.getByRole('button',{name:label,exact:true}).click();const r=await response;if(!r.ok())throw Error(await r.text());
  await page.locator('.fp9-chat.guide').nth(count).waitFor({timeout:100000});
  const state=await page.evaluate(async id=>(await(await fetch('/api/fp9/attempts/'+id)).json()),created.id);
  const help=state.assistance.at(-1);if(help.level!==level)throw Error('Wrong help level recorded');
  results.push({level,inputTokens:help.tokens.input,outputTokens:help.tokens.output,latencyMs:help.latencyMs,text:state.chat[state.activeTaskId].at(-1).text});
 }
 const task=created.groups[0].parts[0],visits=Number(task.questions[0].prompt.match(/\d+/)[0]),answer=task.scene.givens.offerA.fixed+task.scene.givens.offerA.perUnit*visits;
 if(!results.at(-1).text.includes(String(answer)))throw Error('Solution did not include expected amount');
 await page.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);
 return{date:'2026-09-09',provider:'Codex CLI with ChatGPT subscription',realModelCalls:4,syntheticData:true,sequence:'One F06 attempt, growing chat history; samples are not a controlled comparison or latency guarantee',results};
}
