async (page) => {
 const base='http://127.0.0.1:4317',results=[];
 const assert=(condition,message)=>{if(!condition)throw Error(message);};
 for(const withAids of [false,true])for(const ai of [false,true]){
  await page.goto(base+'/fp9');
  await page.getByRole('radio',{name:withAids?'Med hjælpemidler':'Uden hjælpemidler',exact:true}).check();
  await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).setChecked(ai);
  const creating=page.waitForResponse(r=>r.url()===base+'/api/fp9/attempts'&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();
  const created=await (await creating).json(),id=created.id,first=created.groups[0].parts[0];
  await page.getByRole('heading',{name:'Vælg et tilbud',exact:true}).waitFor();
  const visits=Number(first.questions[0].prompt.match(/\d+/)[0]),answer=String(first.scene.givens.offerA.perUnit*visits);
  await page.getByLabel('Dit svar (kr.)',{exact:true}).fill(answer);
  await page.getByLabel('Dine noter',{exact:true}).fill(`Syntetisk browserkontrol ${withAids}/${ai}`);
  await page.getByRole('button',{name:'Markér til senere',exact:true}).click();
  if(withAids){
   await page.getByLabel('Udtryk',{exact:true}).fill('2+3');await page.getByRole('button',{name:'Beregn',exact:true}).click();
   await page.locator('.fp9-tools output').filter({hasText:'5'}).waitFor();
   await page.getByRole('button',{name:'Regneark',exact:true}).click();
   await page.getByLabel('Celle A1',{exact:true}).fill('2');await page.getByLabel('Celle B1',{exact:true}).fill('=A1*3');
   assert(await page.getByLabel('Resultat B1',{exact:true}).innerText()==='6','Spreadsheet result');
   await page.getByRole('button',{name:'Algebra',exact:true}).click();await page.getByLabel('Udtryk',{exact:true}).fill('2x+3=9');await page.getByRole('button',{name:'Beregn',exact:true}).click();
   await page.locator('.fp9-tools output').filter({hasText:'x = 3'}).waitFor();
  }else assert(await page.getByRole('heading',{name:'Dine hjælpemidler'}).count()===0,'No aids must hide tools');
  if(ai){
   await page.getByLabel('Dit spørgsmål',{exact:true}).fill('Giv mig ét lille hint uden facit.');
   const helping=page.waitForResponse(r=>r.url().endsWith('/help')&&r.request().method()==='POST',{timeout:100000});
   await page.getByRole('button',{name:'Lille hint',exact:true}).click();
   const response=await helping;assert(response.ok(),'Real AI response failed: '+await response.text());
   await page.locator('.fp9-chat.guide').waitFor();
   await page.getByLabel('AI-støtte',{exact:true}).click();
   await page.getByText('AI er slået fra. Dit tidligere arbejde og hjælpelog bevares.',{exact:true}).waitFor();
   assert((await page.locator('.fp9-header').innerText()).includes('Assisteret træning'),'Assistance must persist after off');
   if(withAids)assert(await page.getByRole('heading',{name:'Dine hjælpemidler'}).isVisible(),'Aids disappeared with AI off');
  }
  await page.getByRole('button',{name:'Konstruktion på koordinatplan'}).click();
  await page.getByRole('button',{name:'Tilføj punkt',exact:true}).click();
  await page.getByLabel('x',{exact:true}).fill('-3');await page.getByLabel('x',{exact:true}).press('Tab');
  await page.getByLabel('y',{exact:true}).fill('2');await page.getByLabel('y',{exact:true}).press('Tab');
  await page.getByRole('button',{name:'Elevpunkt (-3; 2)',exact:true}).waitFor();
  await page.getByRole('button',{name:'Undersøg målinger',exact:false}).click();
  await page.getByLabel('Dit svar',{exact:true}).fill('Jeg sammenligner spændvidderne og vil begrunde konklusionen med tallene.');
  await page.getByRole('button',{name:'Gem svar igen',exact:true}).click();
  await page.getByText('Alt er gemt',{exact:true}).waitFor();
  const saved=await page.evaluate(async id=>(await fetch('/api/fp9/attempts/'+id)).json(),id);
  assert(saved.aiUsage.calls===(ai?1:0),'Unexpected AI calls');
  const timestamp=await page.evaluate(date=>new Date(date).toLocaleString('da-DK'),saved.createdAt);
  await page.reload();
  const row=page.locator('.fp9-attempt').filter({hasText:timestamp});assert(await row.count()===1,'Resume row ambiguous');
  await row.getByRole('button',{name:'Åbn',exact:true}).click();await page.getByRole('heading',{name:'Undersøg målinger',exact:true}).waitFor();
  await page.getByRole('button',{name:'Vælg et tilbud',exact:false}).click();
  assert(await page.getByLabel('Dit svar (kr.)',{exact:true}).inputValue()===answer,'Answer lost on reload');
  assert((await page.getByLabel('Dine noter',{exact:true}).inputValue()).includes('Syntetisk browserkontrol'),'Note lost on reload');
  if(withAids)assert(await page.getByLabel('Udtryk',{exact:true}).inputValue()==='2x+3=9','Tools not restored');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Eksportér',exact:true}).click();
  const download=await downloadPromise;const path='.local/fp9-browser/'+id+'.json';await download.saveAs(path);
  await page.getByRole('button',{name:'Mine øverunder',exact:true}).click();
  const importing=page.waitForResponse(r=>r.url().endsWith('/api/fp9/import')&&r.request().method()==='POST');
  await page.getByLabel('Importér eksportfil',{exact:true}).setInputFiles(path);
  const imported=await (await importing).json();assert(imported.id!==id,'Import must make independent copy');
  await page.getByRole('button',{name:'Aflever',exact:true}).click();await page.getByRole('heading',{name:'Klar til aflevering?'}).waitFor();
  await page.getByRole('button',{name:'Aflever øverunden',exact:true}).click();await page.getByRole('heading',{name:'Afleveret øverunde'}).waitFor();
  const submitted=await page.evaluate(async id=>(await fetch('/api/fp9/attempts/'+id)).json(),imported.id);
  assert(submitted.status==='submitted','Submission not persisted');assert(submitted.assessments[first.id].q1.status==='correct','Numeric answer assessed incorrectly');
  assert(await page.locator('input:not([disabled]),textarea:not([disabled])').count()===0,'Review still editable');
  results.push({withAids,ai,realModelCalls:saved.aiUsage.calls,inputTokens:saved.aiUsage.inputTokens,outputTokens:saved.aiUsage.outputTokens,latencyMs:saved.aiUsage.lastLatencyMs,answerSaved:true,geometrySaved:true,notesRestored:true,toolsRestored:withAids,exportImport:true,submitted:true,assistancePreserved:submitted.assistance.length>0});
  // Remove only the synthetic attempts created by this script.
  await page.evaluate(async ids=>{for(const id of ids){const r=await fetch('/api/fp9/attempts/'+id,{method:'DELETE'});if(!r.ok)throw Error('Test cleanup failed');}},[id,imported.id]);
 }
 return results;
}
