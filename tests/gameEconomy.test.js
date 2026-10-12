import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FOOD_BY_ANIMAL,FOODS,createEconomy,synchronizeEconomy,collectFood,
 sellFood,openSurpriseBox,recordEvent,goalProgress,claimGoal,dailyKey,weeklyKey} from '../src/gameEconomy.js';
const date=new Date('2026-10-12T10:00:00Z');
const profile=(coins=0)=>({coins,economy:createEconomy({},date)});
test('all seven animal treats have distinct IDs and coin sell prices',()=>{
 assert.equal(FOODS.length,7);
 assert.equal(new Set(FOODS.map(x=>x.id)).size,7);
 for(const [animal,item] of Object.entries(FOOD_BY_ANIMAL)){
  assert.ok(animal&&item.label&&item.emoji);
  assert.ok(item.price>=1&&item.price<=10);
 }
});
test('pickup persists inventory and daily/weekly collection targets without double-cloning losses',()=>{
 const p=profile();
 assert.equal(collectFood(p,'bunny',8,date)?.id,'carrot');
 assert.equal(p.economy.inventory.carrot,8);
 assert.equal(p.economy.daily.food,8);
 assert.equal(p.economy.weekly.food,8);
 assert.equal(goalProgress(p,'daily','food',date).complete,true);
 const reward=claimGoal(p,'daily','food',date);
 assert.equal(reward.coins,45);
 assert.equal(p.coins,45);
 assert.equal(claimGoal(p,'daily','food',date),null);
 assert.equal(p.coins,45);
});
test('selling converts only owned food and adds weekly seller progress',()=>{
 const p=profile(20);
 collectFood(p,'cat',12,date);
 assert.equal(sellFood(p,'catFish',6,date).coins,24);
 assert.equal(p.coins,44);
 assert.equal(p.economy.inventory.catFish,6);
 assert.equal(p.economy.weekly.sold,6);
 assert.equal(sellFood(p,'catFish',7,date),null);
 assert.equal(sellFood(p,'catFish',-1,date),null);
 assert.equal(sellFood(p,'nonexistent',1,date),null);
 assert.equal(p.coins,44);
});
test('daily and weekly rollover reset only missions, not inventory or wallet',()=>{
 const p=profile(80);
 collectFood(p,'dog',14,date);
 recordEvent(p,'jump',6,date);
 recordEvent(p,'run',1,date);
 const tomorrow=new Date('2026-10-13T10:00:00Z');
 synchronizeEconomy(p,tomorrow);
 assert.equal(p.economy.daily.food,0);
 assert.equal(p.economy.daily.jumps,0);
 assert.equal(p.economy.weekly.food,14);
 assert.equal(p.economy.inventory.bone,14);
 assert.equal(p.coins,80);
 const nextMonday=new Date('2026-10-19T10:00:00Z');
 synchronizeEconomy(p,nextMonday);
 assert.equal(p.economy.weekly.food,0);
 assert.equal(p.economy.inventory.bone,14);
 assert.notEqual(weeklyKey(date),weeklyKey(nextMonday));
 assert.notEqual(dailyKey(date),dailyKey(tomorrow));
});
test('daily free gift is one-time and remains used after reloading saved progress',()=>{
 const p=profile();
 const gift=openSurpriseBox(p,{free:true,animal:'bunny',rng:()=>0,now:date});
 assert.equal(gift.coins,25);
 assert.equal(p.coins,25);
 assert.equal(openSurpriseBox(p,{free:true,now:date}),null);
 const reloaded={coins:p.coins,economy:createEconomy(JSON.parse(JSON.stringify(p.economy)),date)};
 assert.equal(openSurpriseBox(reloaded,{free:true,now:date}),null);
 const nextDay=new Date('2026-10-13T00:02:00Z');
 assert.ok(openSurpriseBox(reloaded,{free:true,animal:'cow',rng:()=>.6,now:nextDay}));
 assert.equal(reloaded.economy.inventory.corn,6);
});
test('coin boxes have a fixed coin cost and never charge when balance is too low',()=>{
 const p=profile(54);
 assert.equal(openSurpriseBox(p,{animal:'unicorn',rng:()=>.99,now:date}),null);
 assert.equal(p.coins,54);
 p.coins=55;
 const prize=openSurpriseBox(p,{animal:'unicorn',rng:()=>.6,now:date});
 assert.equal(prize.food.id,'rainbowFruit');
 assert.equal(p.coins,0);
 assert.equal(p.economy.inventory.rainbowFruit,10);
 const found=openSurpriseBox(p,{animal:'cat',found:true,rng:()=>0,now:date});
 assert.equal(found.coins,25);
 assert.equal(p.coins,25);
});
test('claiming goals is idempotent and progress must reach the target',()=>{
 const p=profile(0);
 assert.equal(claimGoal(p,'weekly','sold',date),null);
 recordEvent(p,'jump',6,date);
 assert.equal(goalProgress(p,'daily','jumps',date).complete,true);
 assert.equal(claimGoal(p,'daily','jumps',date).coins,30);
 assert.equal(claimGoal(p,'daily','jumps',date),null);
 recordEvent(p,'run',1,date);
 assert.equal(claimGoal(p,'daily','runs',date).coins,50);
 assert.equal(p.coins,80);
});
