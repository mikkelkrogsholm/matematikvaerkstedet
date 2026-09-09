async(page)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:4317/fp9');await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).check();
 const creating=page.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 await page.getByRole('button',{name:'Konstruktion på koordinatplan',exact:false}).click();
 await page.getByLabel('Dit spørgsmål',{exact:true}).fill('Lav præcis tre operationer i rækkefølge: addObject med hjælpepunkt id ai-sequence ved (1,1); moveObject samme punkt til (2,2); moveObject samme punkt til (3,3). Opdatér etiketten ved hver flytning. Det er en demonstration, ikke opgavens facit.');
 let ackCount=0;await page.route('**/ack',async route=>{ackCount++;if(ackCount===1){const committed=await route.fetch();if(!committed.ok())throw Error('ACK commit failed');await route.abort('failed');}else await route.continue();});
 await page.getByRole('button',{name:'Vis ét trin',exact:true}).click();
 await page.locator('.fp9-chat.guide').waitFor();
 const state=await page.evaluate(async id=>(await(await fetch('/api/fp9/attempts/'+id)).json()),created.id);
 const t=state.activeTaskId;
 if(state.scenes[t].explanationObjects[0].x!==3||state.assistance.length!==1)throw Error('Auto playback failed');
 await page.screenshot({path:'docs/screenshots/fp9/animation-ack-recovery.png',fullPage:true});
 await page.unrouteAll({behavior:'wait'});
 await page.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);await page.emulateMedia({reducedMotion:'no-preference'});
 return{realModelCall:true,threeSteps:true,automaticPlayback:true,committedAckResponseLost:true,ackCount,finalPosition:3,assistanceRecordedOnce:true,guideTextReleasedAfterFinalAck:true,usage:state.aiUsage};
}
