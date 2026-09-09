async(page)=>{
 await page.goto('http://127.0.0.1:4317/fp9');await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).check();
 const creating=page.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 await page.evaluate(()=>{window.qaMissingLayer=new MutationObserver(()=>{document.querySelectorAll('[data-ai-object-id]').forEach(e=>e.remove());});window.qaMissingLayer.observe(document.body,{childList:true,subtree:true});});
 const ack=page.waitForResponse(r=>r.url().endsWith('/ack'),{timeout:100000});
 await page.getByLabel('Dit spørgsmål',{exact:true}).fill('Tilføj et hjælpepunkt ved (2,4), med id ai-fault-test. Det er en markering og ikke facit.');await page.getByRole('button',{name:'Vis ét trin',exact:true}).click();
 const response=await ack,body=response.request().postDataJSON(),result=await response.json();
 await page.evaluate(()=>window.qaMissingLayer.disconnect());
 if(body.success!==false)throw Error('Browser failed to detect missing layer');
 const scene=result.scenes[created.activeTaskId];
 if(scene.explanationObjects.length||scene.pendingRender)throw Error('Failed render not rolled back');
 const messages=await page.locator('.fp9-chat.guide').allTextContents();if(messages.length!==1||!messages[0].includes('Handlingen er rullet tilbage.'))throw Error('Unrendered explanation exposed');
 await page.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);
 return {fault:'MutationObserver removes AI object DOM before browser render acknowledgment',realModelCall:true,actualBrowserAck:body.success,rolledBack:true,noFalseGuideText:true,usage:result.aiUsage};
}
