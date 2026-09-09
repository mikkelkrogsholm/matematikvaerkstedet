async (page) => {
 const base='http://127.0.0.1:4317';await page.goto(base+'/fp9');
 const familyId=await page.evaluate(()=>sessionStorage.getItem('fp9-qa-family')||'F06');
 const titles={F06:'Vælg et tilbud',F13:'Konstruktion på koordinatplan',F16:'Undersøg målinger'};
 await page.getByRole('radio',{name:'Med hjælpemidler',exact:true}).check();
 await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).check();
 const creating=page.waitForResponse(r=>r.url()===base+'/api/fp9/attempts'&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 await page.getByRole('button',{name:titles[familyId],exact:false}).click();
 await page.getByRole('heading',{name:titles[familyId],exact:true}).waitFor();
 const task=created.groups.flatMap(g=>g.parts).find(t=>t.familyId===familyId),frames=[];
 let priorGuideCount=0;
 await page.route('**/api/fp9/attempts/*/ack',async route=>{
  const body=route.request().postDataJSON();
  const displayed=await page.locator('[data-ai-object-id]').count(),guides=await page.locator('.fp9-chat.guide').count();
  frames.push({success:body.success,displayedObjects:displayed,guideCountBeforeAck:guides,expectedPriorGuideCount:priorGuideCount});
  if(!body.success||!displayed||guides!==priorGuideCount)throw Error('Rendering/text gate violated');
  await page.waitForTimeout(150);await route.continue();
 });
 const objectId='ai-browser-'+familyId;
 for(const [i,question] of [
  `Tilføj ét hjælpepunkt med id ${objectId} ved (2,4). Kald det Hjælpepunkt. Det er kun en markering, ikke opgavens facit.`,
  `Flyt dit punkt ${objectId} til (3,5) med moveObject. Opdatér etiketten til Hjælpepunkt (3,5).`,
 ].entries()){
  priorGuideCount=await page.locator('.fp9-chat.guide').count();
  await page.getByLabel('Dit spørgsmål',{exact:true}).fill(question);
  const acknowledgment=page.waitForResponse(r=>r.url().endsWith('/ack')&&r.request().method()==='POST',{timeout:100000});
  await page.getByRole('button',{name:'Vis ét trin',exact:true}).click();
  const ack=await acknowledgment;if(!ack.ok())throw Error('Render ACK failed: '+await ack.text());
  await page.waitForFunction(n=>document.querySelectorAll('.fp9-chat.guide').length===n,priorGuideCount+1);
  const view=await page.evaluate(async id=>(await fetch('/api/fp9/attempts/'+id)).json(),created.id);
  const point=view.scenes[task.id].explanationObjects.find(o=>o.id===objectId);
  if(point?.x!==(i?3:2)||point?.y!==(i?5:4)||view.scenes[task.id].pendingRender!==null)throw Error('Wrong rendered point');
 }
 await page.unrouteAll({behavior:'wait'});
 const svg=page.locator('.fp9-scene svg');await svg.scrollIntoViewIfNeeded();
 const position=await svg.evaluate((svg,axes)=>{const p=svg.createSVGPoint();p.x=(4-axes.x.min)/(axes.x.max-axes.x.min)*100;p.y=100-(6-axes.y.min)/(axes.y.max-axes.y.min)*100;const t=p.matrixTransform(svg.getScreenCTM());return {x:t.x,y:t.y};},task.scene.axes);
 await page.mouse.click(position.x,position.y);
 await page.getByRole('button',{name:'Elevpunkt (4; 6)',exact:true}).waitFor();
 priorGuideCount=await page.locator('.fp9-chat.guide').count();
 await page.getByLabel('Dit spørgsmål',{exact:true}).fill('Hvilke koordinater har mit valgte elevpunkt nu? Skriv begge koordinater, og stil ét kort spørgsmål om dem.');
 await page.getByRole('button',{name:'Stil spørgsmål',exact:true}).click();
 await page.waitForFunction(n=>document.querySelectorAll('.fp9-chat.guide').length===n,priorGuideCount+1,{timeout:100000});
 const reply=await page.locator('.fp9-chat.guide').last().innerText();
 if(!/4[\s\S]*6/.test(reply))throw Error('Guide did not read changed student point: '+reply);
 const final=await page.evaluate(async id=>(await fetch('/api/fp9/attempts/'+id)).json(),created.id);
 await page.screenshot({path:'docs/screenshots/fp9/'+familyId+'-ai.png',fullPage:true});
 const next={F06:'F13',F13:'F16',F16:'F06'};await page.evaluate(next=>sessionStorage.setItem('fp9-qa-family',next),next[familyId]);
 await page.evaluate(async id=>{await fetch('/api/fp9/attempts/'+id,{method:'DELETE'});},created.id);
 return {familyId,frames,reply,calls:final.aiUsage.calls,usage:final.aiUsage,realBrowserAcknowledgment:true,studentReadback:true};
}
