async(page)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4317/fp9');await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).check();
 const creating=page.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 await page.getByRole('button',{name:'Konstruktion på koordinatplan',exact:false}).click();
 await page.getByLabel('Dit spørgsmål',{exact:true}).fill('Lav præcis tre operationer i rækkefølge: addObject med hjælpepunkt id ai-sequence ved (1,1); moveObject samme punkt til (2,2); moveObject samme punkt til (3,3). Opdatér etiketten ved hver flytning. Det er en demonstration, ikke opgavens facit.');
 const acknowledgment=page.waitForResponse(r=>r.url().endsWith('/ack'),{timeout:100000});await page.getByRole('button',{name:'Vis ét trin',exact:true}).click();const first=await(await acknowledgment).json(),t=first.activeTaskId;
 if(first.scenes[t].animation?.steps.length!==2)throw Error('Model did not produce three sequential steps');
 await page.getByRole('button',{name:'Næste trin',exact:true}).waitFor();await page.waitForTimeout(1300);
 let state=await page.evaluate(async id=>(await(await fetch('/api/fp9/attempts/'+id)).json()),created.id);
 if(state.scenes[t].animation.steps.length!==2)throw Error('Reduced motion auto-advanced');
 const nextAck=page.waitForResponse(r=>r.url().endsWith('/ack'));await page.getByRole('button',{name:'Næste trin',exact:true}).click();state=await(await nextAck).json();
 if(state.scenes[t].explanationObjects[0].x!==2||state.scenes[t].animation.steps.length!==1)throw Error('Manual next failed');
 // Actual student edit while one AI step remains must cancel the rest.
 await page.getByRole('button',{name:'Tilføj punkt',exact:true}).click();await page.getByText('Alt er gemt',{exact:true}).waitFor();
 const p=page.getByRole('button',{name:'Elevpunkt (0; 0)',exact:true});await p.focus();await page.keyboard.press('ArrowRight');await page.getByRole('button',{name:'Elevpunkt (1; 0)',exact:true}).waitFor();await page.getByText('Alt er gemt',{exact:true}).waitFor();
 await page.waitForTimeout(1300);state=await page.evaluate(async id=>(await(await fetch('/api/fp9/attempts/'+id)).json()),created.id);
 if(state.scenes[t].animation||state.scenes[t].explanationObjects[0].x!==2||state.scenes[t].studentObjects[0].x!==1)throw Error('Student edit failed to stop sequence');
 if(state.chat[t].some(m=>m.role==='guide'))throw Error('Final claim released for interrupted sequence');
 await page.screenshot({path:'docs/screenshots/fp9/animation-interrupted.png',fullPage:true});
 await page.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);await page.emulateMedia({reducedMotion:'no-preference'});
 return{realModelCall:true,threeSteps:true,ackBetweenSteps:true,reducedMotionManual:true,studentEditCancelsRemaining:true,studentWorkPreserved:true,finalClaimWithheld:true,usage:state.aiUsage};
}
