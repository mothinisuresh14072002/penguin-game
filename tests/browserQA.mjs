// Real Chromium smoke/gameplay tests run against the Vite app, not mocked
// Three.js functions. Screenshots from CI are downloadable as artifacts.
// Browser runtime logs and exceptions are included in failing test details.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN=process.env.PAWVERSE_QA_ORIGIN || 'http://127.0.0.1:5173';
const OUT=path.resolve('qa-artifacts');
await fs.mkdir(OUT,{recursive:true});
const errors=[],results=[],contexts=new Set();
let browser;
const test=async (name,fn)=>{
 const start=Date.now();
 try {
  await fn();
  results.push({name,status:'PASS',elapsedMs:Date.now()-start});
  console.log('PASS',name,'('+Math.round((Date.now()-start)/100)/10+'s)');
 }catch(error){
  results.push({name,status:'FAIL',error:String(error.stack||error),elapsedMs:Date.now()-start});
  console.error('FAIL',name,error.stack||error);
 }finally{
  // A failed assertion should not keep a WebGL context alive for later tests.
  for(const context of [...contexts]){await context.close().catch(()=>{});contexts.delete(context);}
 }
};
async function openGame(url,opts={}){
 const context=await browser.newContext({
  viewport:opts.viewport||{width:1280,height:720},
  deviceScaleFactor:1,
  hasTouch:Boolean(opts.touch),isMobile:Boolean(opts.mobile)
 });
 contexts.add(context);
 const page=await context.newPage();
 page.setDefaultTimeout(18000);
 const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));
 page.on('console',m=>{
  if(m.type()==='error'&&/webgl|shader|uncaught/i.test(m.text()))
   pageErrors.push(m.text());
 });
 await page.goto(ORIGIN+url,{waitUntil:'domcontentloaded',timeout:60000});
 if(opts.profile){
   // Explicitly seed on the correct origin and reload: this avoids
   // race/permission differences in browser init scripts and guarantees
   // the profile is present before the game reads localStorage.
   await page.evaluate(profile=>{
    localStorage.setItem('penguin-ice-runner-v3',JSON.stringify(profile));
   },opts.profile);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('penguin-ice-runner-v3')));
   assert.equal(saved.coins,opts.profile.coins,'Browser profile fixture seeded');
   await page.reload({waitUntil:'domcontentloaded',timeout:60000});
 }
 await page.waitForFunction(()=>Boolean(
  window.__pawverseQA || window.__pawverseRaceQA
 ),{timeout:45000});
 const check=()=>assert.deepEqual(pageErrors,[],'No uncaught browser errors');
 const close=async()=>{check();await context.close();contexts.delete(context)};
 return {context,page,check,close};
}
const state=page=>page.evaluate(()=>window.__pawverseQA?.()||window.__pawverseRaceQA?.());
const snap=async(page,name)=>{
 try{await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:true,timeout:40000});}
 catch(error){console.warn('Screenshot not available for '+name, String(error).slice(0,200));}
};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 browser=await chromium.launch({
  headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
        '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
 });
 await test('Solo starts in WebGL with Pawverse branding',async()=>{
  const {page,close}=await openGame('/?qa=1');
  assert.match(await page.title(),/Pawverse Dash/);
  assert.match(await page.locator('#screenTitle').textContent(),/PAWVERSE DASH/);
  assert.equal(await page.locator('canvas').count(),1);
  const size=await page.locator('canvas').boundingBox();
  assert.ok(size.width>=1100&&size.height>=600);
  assert.equal((await state(page)).biome,'meadow');
  await snap(page,'01-solo-start');
  await close();
 });
 await test('Shop offers seven heroes; locked character does not change world',async()=>{
  const {page,close}=await openGame('/?qa=1');
  await page.getByRole('button',{name:/CHARACTERS.*SHOP/}).click();
  assert.equal(await page.locator('.char-card').count(),7);
  await page.locator('.char-card').filter({hasText:'Ula Unicorn'}).click();
  assert.match(await page.locator('#shopMessage').textContent(),/Collect more gold coins/);
  assert.equal((await state(page)).selected,'bunny');
  await snap(page,'02-character-shop');
  await close();
 });
 await test('Switching free heroes changes their biome and entire world label',async()=>{
  const {page,close}=await openGame('/?qa=1');
  await page.getByRole('button',{name:/CHARACTERS.*SHOP/}).click();
  await page.locator('.char-card').filter({hasText:'Pip Penguin'}).click();
  assert.equal((await state(page)).biome,'arctic');
  assert.equal((await state(page)).meadowFlowerStrips,0,'Bunny flowers must be removed on world change');
  assert.match(await page.locator('#worldName').textContent(),/Penguin Glacier/);
  await snap(page,'03-penguin-glacier');
  await page.locator('.char-card').filter({hasText:'Bella Bunny'}).click();
  assert.equal((await state(page)).biome,'meadow');
  assert.equal((await state(page)).meadowFlowerStrips,5,'Bunny Meadow should include the full daisy field');
  assert.match(await page.locator('#worldName').textContent(),/Bunny Meadow/);
  await close();
 });
 await test('All seven characters switch their real-time 3D worlds without browser errors',async()=>{
  const heroes=[
    ['bunny','meadow','Bunny Meadow'],
    ['unicorn','rainbow','Unicorn Skyland'],
    ['horse','grassland','Horse Prairie'],
    ['cat','city','Cat Town'],
    ['dog','park','Puppy Park'],
    ['penguin','arctic','Penguin Glacier'],
    ['cow','farm','Mimi Farm']
  ];
  const {page,close}=await openGame('/?qa=1',{
    profile:{coins:0,best:0,unlocked:heroes.map(h=>h[0]),selected:'bunny'}
  });
  await page.getByRole('button',{name:/CHARACTERS.*SHOP/}).click();
  for(const [id,biome,label] of heroes){
    await page.locator('.char-card').filter({hasText:label=== 'Penguin Glacier'?'Pip Penguin':
      ({bunny:'Bella Bunny',unicorn:'Ula Unicorn',horse:'Hugo Horse',
        cat:'Coco Cat',dog:'Dodo Dog',cow:'Mimi Cow'})[id]
    }).click();
    const selected=await state(page);
    assert.equal(selected.selected,id);
    assert.equal(selected.biome,biome);
    assert.equal(selected.meadowFlowerStrips,biome==='meadow'?5:0);
    assert.equal(selected.rainbowCrystalStrips,biome==='rainbow'?4:0,
      'Unicorn crystals should only exist in Rainbow Skyland');
    assert.equal(selected.prairieWheatStrips,biome==='grassland'?5:0,
      'Only Hugo Horse should create the golden wheat fields');
    assert.equal(await page.locator('#worldName').textContent(),label);
    // Remove only the modal's visibility for a frame so the artifact is a
    // truthful screenshot of the currently rendered 3D world, unobstructed.
    await page.locator('#shop').evaluate(node=>node.style.display='none');
    await wait(180);
    await snap(page,'world-'+id);
    await page.locator('#shop').evaluate(node=>node.style.display='');
  }
  await close();
 });
 await test('Buying a new animal persists coins, selection and world',async()=>{
  const {page,close}=await openGame('/?qa=1',{
   profile:{coins:500,best:0,unlocked:['bunny','penguin'],selected:'bunny'}
  });
  await page.getByRole('button',{name:/CHARACTERS.*SHOP/}).click();
  await page.locator('.char-card').filter({hasText:'Coco Cat'}).click();
  const s=await state(page);
  const debug=await page.evaluate(()=>({
    storage:JSON.parse(localStorage.getItem('penguin-ice-runner-v3')),
    message:document.getElementById('shopMessage').textContent,
    catCard:[...document.querySelectorAll('.char-card')].find(b=>b.textContent.includes('Coco Cat'))?.textContent
  }));
  console.log('Shop purchase diagnostic:',JSON.stringify(debug));
  assert.equal(s.selected,'cat');assert.equal(s.biome,'city');
  assert.match(await page.locator('#worldName').textContent(),/Cat Town/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('penguin-ice-runner-v3')));
  assert.equal(saved.coins,150);
  assert.ok(saved.unlocked.includes('cat'));
  await snap(page,'04-cat-town');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.__pawverseQA);
  assert.equal((await state(page)).selected,'cat');
  await close();
 });
 await test('Solo run advances; pause freezes time, resume continues',async()=>{
  const {page,close}=await openGame('/?qa=1');
  await page.getByRole('button',{name:/SOLO RUN/}).click();
  await page.waitForFunction(()=>window.__pawverseQA().distance>2,{timeout:30000});
  await page.locator('#pauseBtn').click();
  const a=await state(page);
  assert.equal(a.paused,true);
  await wait(350);
  const b=await state(page);
  assert.ok(Math.abs(a.distance-b.distance)<.001);
  await page.locator('#pauseBtn').click();
  await page.waitForFunction(d=>window.__pawverseQA().distance>d,b.distance+.5,{timeout:10000});
  await snap(page,'05-solo-running');
  await close();
 });
 await test('Keyboard lane switching and jumping update real player state',async()=>{
  const {page,close}=await openGame('/?qa=1');
  await page.getByRole('button',{name:/SOLO RUN/}).click();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(()=>window.__pawverseQA().targetLane===0);
  await page.keyboard.press('ArrowUp');
  await page.waitForFunction(()=>window.__pawverseQA().playerY>.02,{timeout:10000});
  await close();
 });
 await test('Race starts two independent WebGL runners and can pause',async()=>{
  const {page,close}=await openGame('/race.html?qa=1');
  assert.match(await page.title(),/Pawverse Dash/);
  assert.equal(await page.locator('#p1Pick option').count(),7);
  assert.equal(await page.locator('#p2Pick option').count(),7);
  await page.locator('#raceStart').click();
  await page.waitForFunction(()=>window.__pawverseRaceQA().players.length===2);
  await page.waitForFunction(()=>window.__pawverseRaceQA().players.every(p=>p.distance>1),{timeout:30000});
  const before=await state(page);
  assert.equal(before.players[0].id,'bunny');
  assert.equal(before.players[1].id,'penguin');
  assert.equal(before.players[0].meadowFlowerStrips,5);
  assert.equal(before.players[1].meadowFlowerStrips,0);
  await page.locator('#pauseRace').click();
  // The renderer may advance while Playwright delivers a click under software
  // WebGL. Measure *after* paused is true, not before initiating the click.
  await page.waitForFunction(()=>window.__pawverseRaceQA().paused===true);
  const pausedDistance=(await state(page)).players[0].distance;
  await wait(350);
  const after=await state(page);
  assert.equal(after.paused,true);
  assert.ok(Math.abs(after.players[0].distance-pausedDistance)<.001);
  await snap(page,'06-duo-landscape');
  await close();
 });
 await test('Race has separate left/right and jump controls per player',async()=>{
  const {page,close}=await openGame('/race.html?qa=1');
  await page.locator('#raceStart').click();
  await page.keyboard.press('KeyA');
  await page.keyboard.press('KeyL');
  await page.waitForFunction(()=>window.__pawverseRaceQA().players[0].target===0 &&
                                   window.__pawverseRaceQA().players[1].target===2);
  await page.keyboard.press('KeyW');
  await page.keyboard.press('KeyI');
  await page.waitForFunction(()=>window.__pawverseRaceQA().players.every(p=>p.y>0),{timeout:10000});
  await close();
 });
 await test('Unicorn racer gets Skyland while other player keeps separate world',async()=>{
  const {page,close}=await openGame('/race.html?qa=1');
  await page.locator('#p1Pick').selectOption('unicorn');
  await page.locator('#p2Pick').selectOption('cat');
  await page.locator('#raceStart').click();
  await page.waitForFunction(()=>window.__pawverseRaceQA().players.length===2);
  const a=await state(page);
  assert.equal(a.players[0].id,'unicorn');
  assert.equal(a.players[1].id,'cat');
  assert.equal(a.players[0].rainbowCrystalStrips,4);
  assert.equal(a.players[1].rainbowCrystalStrips,0);
  assert.equal(a.players[0].meadowFlowerStrips,0);
  await snap(page,'09-unicorn-vs-cat');
  await close();
 });
 await test('Horse racer has golden prairie while opponent stays in a different world',async()=>{
  const {page,close}=await openGame('/race.html?qa=1');
  await page.locator('#p1Pick').selectOption('horse');
  await page.locator('#p2Pick').selectOption('dog');
  await page.locator('#raceStart').click();
  await page.waitForFunction(()=>window.__pawverseRaceQA().players.length===2);
  const race=await state(page);
  assert.equal(race.players[0].id,'horse');
  assert.equal(race.players[1].id,'dog');
  assert.equal(race.players[0].prairieWheatStrips,5);
  assert.equal(race.players[1].prairieWheatStrips,0);
  assert.equal(race.players[1].meadowFlowerStrips,0);
  await snap(page,'10-horse-vs-dog');
  await close();
 });
 await test('Mobile portrait race renders a vertical pair with touch controls',async()=>{
  const {page,close}=await openGame('/race.html?qa=1',{viewport:{width:390,height:844},mobile:true,touch:true});
  await page.locator('#raceStart').click();
  const bounds=await page.locator('canvas').boundingBox();
  assert.ok(bounds.height>bounds.width,'Portrait canvas');
  await snap(page,'07-duo-mobile-portrait');
  // Pointer swipe in first (upper) viewport; second (lower) viewport.
  await page.evaluate(()=>{
   const c=document.querySelector('canvas');
   const a={bubbles:true,pointerId:11,pointerType:'touch'};
   c.dispatchEvent(new PointerEvent('pointerdown',{...a,clientX:160,clientY:210}));
   c.dispatchEvent(new PointerEvent('pointerup',{...a,clientX:75,clientY:210}));
  });
  await page.waitForFunction(()=>window.__pawverseRaceQA().players[0].target===0,{timeout:10000});
  await page.evaluate(()=>{
   const c=document.querySelector('canvas');
   const a={bubbles:true,pointerId:12,pointerType:'touch'};
   c.dispatchEvent(new PointerEvent('pointerdown',{...a,clientX:100,clientY:650}));
   c.dispatchEvent(new PointerEvent('pointerup',{...a,clientX:260,clientY:650}));
  });
  await page.waitForFunction(()=>window.__pawverseRaceQA().players[1].target===2,{timeout:10000});
  await close();
 });
 await test('Mobile solo layout and touch swipe remain playable',async()=>{
  const {page,close}=await openGame('/?qa=1',{viewport:{width:390,height:844},mobile:true,touch:true});
  await page.getByRole('button',{name:/SOLO RUN/}).click();
  const bounds=await page.locator('canvas').boundingBox();
  assert.ok(bounds.height>bounds.width);
  await page.evaluate(()=>{
   const c=document.querySelector('canvas');
   const a={bubbles:true,pointerId:14,pointerType:'touch'};
   c.dispatchEvent(new PointerEvent('pointerdown',{...a,clientX:250,clientY:450}));
   c.dispatchEvent(new PointerEvent('pointerup',{...a,clientX:90,clientY:450}));
  });
  await page.waitForFunction(()=>window.__pawverseQA().targetLane===0);
  await snap(page,'08-solo-mobile');
  await close();
 });
}catch(error){
 console.error('TEST HARNESS FAILED:',error.stack||error);
 results.push({name:'Browser harness startup',status:'FAIL',error:String(error)});
}finally{
 await browser?.close();
 const total=results.length,failed=results.filter(r=>r.status==='FAIL').length;
 const summary={total,passed:total-failed,failed,results};
 await fs.writeFile(path.join(OUT,'results.json'),JSON.stringify(summary,null,2));
 console.log('BROWSER QA RESULTS:',JSON.stringify({total,passed:total-failed,failed}));
 if(failed)process.exitCode=1;
}
