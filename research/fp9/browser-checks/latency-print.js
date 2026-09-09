async(page)=>{
 await page.goto('http://127.0.0.1:4317/fp9');
 const creating=page.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Opret øverunde',exact:true}).click();const created=await(await creating).json();
 await page.getByLabel('Dine noter',{exact:true}).focus();
 await page.evaluate(()=>{
 window.qaTimings=[];
 document.addEventListener('input',e=>{if(e.target.getAttribute('aria-label')!=='Dine noter')return;const start=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>window.qaTimings.push(performance.now()-start)));});
 });
 for(let i=0;i<100;i++){await page.keyboard.press(i%2?'Backspace':'a');await page.waitForFunction(n=>window.qaTimings.length>=n,i+1);}
 const timing=await page.evaluate(()=>{const values=window.qaTimings.slice().sort((a,b)=>a-b);return{samples:values.length,p95Ms:values[Math.ceil(values.length*.95)-1],maxMs:values.at(-1),userAgent:navigator.userAgent};});
 await page.getByLabel('Dine noter',{exact:true}).fill('Syntetisk printkontrol');await page.getByLabel('Dit svar (kr.)',{exact:true}).fill('123');
 await page.getByText('Alt er gemt',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Aflever',exact:true}).click();await page.getByRole('button',{name:'Aflever øverunden',exact:true}).click();await page.getByRole('heading',{name:'Afleveret øverunde'}).waitFor();
 await page.emulateMedia({media:'print'});
 if(await page.getByRole('button',{name:'Print',exact:true}).isVisible())throw Error('Print control visible in printed layout');
 if(await page.locator('.fp9-review>section').count()!==3)throw Error('Print missing tasks');
 if(!(await page.locator('.fp9-review').innerText()).includes('123'))throw Error('Print missing student answer');
 if(!(await page.locator('.fp9-review').innerText()).includes('Syntetisk printkontrol'))throw Error('Print missing notes');
 for(const cell of await page.locator('.fp9-scene td button').all())if(!await cell.isVisible())throw Error('Print hides given data');
 await page.screenshot({path:'docs/screenshots/fp9/print-review.png',fullPage:true});
 await page.emulateMedia({media:'screen'});await page.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);
 return{timing,method:'100 real keyboard input events to second requestAnimationFrame, including intervening paint opportunity; local note draft with background autosave, no AI. Not save-to-disk latency or input hardware latency.',hardware:'Apple M3 Max, 128 GiB RAM',print:{allThreeTasks:true,studentAnswer:true,notes:true,givenDataVisible:true,controlsHidden:true,mediaEmulation:true},syntheticData:true};
}
