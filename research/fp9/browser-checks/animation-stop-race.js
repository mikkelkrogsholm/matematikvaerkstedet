async(page)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:4317/fp9');await page.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).check();
 const creating=page.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 await page.getByRole('button',{name:'Konstruktion på koordinatplan',exact:false}).click();
 await page.getByLabel('Dit spørgsmål',{exact:true}).fill('Lav præcis tre operationer i rækkefølge: addObject med hjælpepunkt id ai-sequence ved (1,1); moveObject samme punkt til (2,2); moveObject samme punkt til (3,3). Opdatér etiketten ved hver flytning. Det er en demonstration, ikke opgavens facit.');
 const acknowledgment=page.waitForResponse(r=>r.url().endsWith('/ack'),{timeout:100000});await page.getByRole('button',{name:'Vis ét trin',exact:true}).click();const first=await(await acknowledgment).json(),t=first.activeTaskId;
 if(first.scenes[t].animation?.steps.length!==2)throw Error('Model did not produce three sequential steps');
 let nextRequests=0;
 await page.route('**/action',async route=>{const type=route.request().postDataJSON().type;if(type==='animation-next')nextRequests++;if(type==='animation-stop')await page.waitForTimeout(1600);await route.continue();});
 await page.getByRole('button',{name:'Stop forklaringen',exact:true}).click();await page.getByText('Alt er gemt',{exact:true}).waitFor();await page.waitForTimeout(1300);
 const state=await page.evaluate(async id=>(await(await fetch('/api/fp9/attempts/'+id)).json()),created.id);
 if(nextRequests||state.scenes[t].animation||state.scenes[t].explanationObjects[0].x!==1)throw Error('Stop raced with autoplay');
 await page.getByRole('button',{name:'Mine øverunder',exact:true}).click();await page.getByRole('heading',{name:'Start en øverunde',exact:true}).waitFor();
 await page.unrouteAll({behavior:'wait'});
 await page.screenshot({path:'docs/screenshots/fp9/animation-stopped.png',fullPage:true});
 await page.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);await page.emulateMedia({reducedMotion:'no-preference'});
 return{realModelCall:true,delayedStopResponseMs:1600,nextRequests,stopped:true,navigationNotBlocked:true,usage:state.aiUsage};
}
