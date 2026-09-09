async (page) => {
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),mobile=await context.newPage();
 try{
 await mobile.goto('http://127.0.0.1:4317/fp9');
 await mobile.getByRole('checkbox',{name:'Jeg vil kunne bede om hjælp'}).uncheck();
 const creating=mobile.waitForResponse(r=>r.url().endsWith('/api/fp9/attempts')&&r.request().method()==='POST');
 await mobile.getByRole('button',{name:'Opret øverunde',exact:true}).tap();const created=await(await creating).json();
 await mobile.getByRole('button',{name:'Konstruktion på koordinatplan',exact:false}).tap();
 const svg=mobile.locator('.fp9-scene svg');await svg.scrollIntoViewIfNeeded();
 const p=await svg.evaluate(svg=>{const p=svg.createSVGPoint();p.x=60;p.y=40;const t=p.matrixTransform(svg.getScreenCTM());return{x:t.x,y:t.y};});
 await mobile.touchscreen.tap(p.x,p.y);await mobile.getByRole('button',{name:'Elevpunkt (2; 2)',exact:true}).waitFor();
 await mobile.getByText('Alt er gemt',{exact:true}).waitFor();
 const dimensions=await mobile.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches}));
 if(dimensions.body>dimensions.viewport)throw Error('Horizontal overflow: '+JSON.stringify(dimensions));
 await mobile.screenshot({path:'docs/screenshots/fp9/mobile.png',fullPage:true});
 await mobile.evaluate(async id=>fetch('/api/fp9/attempts/'+id,{method:'DELETE'}),created.id);
 return{...dimensions,touchPointPlacement:true,viewportSize:{width:390,height:844},syntheticData:true};
 }finally{await context.close();}
}
