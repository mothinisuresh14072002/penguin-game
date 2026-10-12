// Offline-only progression for Pawverse Dash. All rewards are virtual
// in-game coins/food, with no purchase, ads, or real-money random rewards.
export const FOOD_BY_ANIMAL=Object.freeze({
 bunny:{id:'carrot',label:'Carrot',emoji:'🥕',price:3,color:0xf18b36},
 unicorn:{id:'rainbowFruit',label:'Rainbow Fruit',emoji:'🌈',price:5,color:0xec9bfc},
 horse:{id:'apple',label:'Apple',emoji:'🍎',price:4,color:0xe95f60},
 cat:{id:'catFish',label:'Fish',emoji:'🐟',price:4,color:0x88c8e5},
 dog:{id:'bone',label:'Bone',emoji:'🦴',price:3,color:0xffe9ce},
 penguin:{id:'penguinFish',label:'Silver Fish',emoji:'🐟',price:4,color:0xb7e9f5},
 cow:{id:'corn',label:'Corn',emoji:'🌽',price:3,color:0xf0cd60}
});
export const FOODS=Object.freeze(Object.values(FOOD_BY_ANIMAL));
export const DAILY_GOALS=Object.freeze([
 {id:'food',label:'Collect 8 animal treats',target:8,reward:45},
 {id:'jumps',label:'Jump 6 times',target:6,reward:30},
 {id:'runs',label:'Complete 1 solo run',target:1,reward:50}
]);
export const WEEKLY_GOALS=Object.freeze([
 {id:'food',label:'Collect 60 animal treats',target:60,reward:220},
 {id:'sold',label:'Sell 30 food items',target:30,reward:170},
 {id:'runs',label:'Complete 10 solo runs',target:10,reward:250}
]);
const whole=n=>Math.max(0,Math.min(10000000,Math.floor(Number(n)||0)));
const dateOf=d=>new Date(d);
export function dailyKey(now=new Date()){
 const d=dateOf(now);
 return [d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-');
}
export function weeklyKey(now=new Date()){
 const d=dateOf(now);
 d.setUTCHours(0,0,0,0);
 d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
 return dailyKey(d);
}
const blankGoals=key=>({key,food:0,sold:0,jumps:0,runs:0,claimed:[]});
function normalizeGoals(source,key){
 if(!source||source.key!==key)return blankGoals(key);
 return {
  key,food:whole(source.food),sold:whole(source.sold),
  jumps:whole(source.jumps),runs:whole(source.runs),
  claimed:Array.isArray(source.claimed)?source.claimed.filter(x=>typeof x==='string'):[]
 };
}
export function createEconomy(saved={},now=new Date()){
 const inventory={};
 const source=saved?.inventory&&typeof saved.inventory==='object'?saved.inventory:{};
 for(const food of FOODS)inventory[food.id]=whole(source[food.id]);
 return {
  inventory,
  daily:normalizeGoals(saved?.daily,dailyKey(now)),
  weekly:normalizeGoals(saved?.weekly,weeklyKey(now)),
  freeBoxDay:typeof saved?.freeBoxDay==='string'?saved.freeBoxDay:''
 };
}
export function synchronizeEconomy(profile,now=new Date()){
 profile.economy=createEconomy(profile.economy,now);
 return profile.economy;
}
export function recordEvent(profile,event,quantity=1,now=new Date()){
 const e=synchronizeEconomy(profile,now);
 const count=whole(quantity);
 if(!count)return false;
 if(event==='food'){e.daily.food+=count;e.weekly.food+=count;return true}
 if(event==='jump'){e.daily.jumps+=count;e.weekly.jumps+=count;return true}
 if(event==='run'){e.daily.runs+=count;e.weekly.runs+=count;return true}
 return false;
}
export function collectFood(profile,animal,count=1,now=new Date()){
 const food=FOOD_BY_ANIMAL[animal],n=whole(count);
 if(!food||!n)return null;
 recordEvent(profile,'food',n,now);
 profile.economy.inventory[food.id]+=n;
 return food;
}
export function sellFood(profile,id,amount=1,now=new Date()){
 const food=FOODS.find(f=>f.id===id),n=whole(amount);
 if(!food||!n)return null;
 const e=synchronizeEconomy(profile,now);
 if(e.inventory[id]<n)return null;
 e.inventory[id]-=n;
 const coins=n*food.price;
 profile.coins=whole(profile.coins)+coins;
 e.daily.sold+=n;e.weekly.sold+=n;
 return {food,quantity:n,coins};
}
export function goalProgress(profile,period,id,now=new Date()){
 const e=synchronizeEconomy(profile,now);
 const goalSet=period==='daily'?DAILY_GOALS:period==='weekly'?WEEKLY_GOALS:null;
 const goal=goalSet?.find(g=>g.id===id);
 if(!goal)return null;
 const bucket=e[period],value=whole(bucket[id]);
 return {...goal,progress:Math.min(goal.target,value),complete:value>=goal.target,
  claimed:bucket.claimed.includes(id)};
}
export function claimGoal(profile,period,id,now=new Date()){
 const state=goalProgress(profile,period,id,now);
 if(!state||!state.complete||state.claimed)return null;
 profile.economy[period].claimed.push(id);
 profile.coins=whole(profile.coins)+state.reward;
 return {coins:state.reward,id,period};
}
export function openSurpriseBox(profile,{free=false,animal='bunny',rng=Math.random,now=new Date()}={}){
 const e=synchronizeEconomy(profile,now),today=dailyKey(now);
 if(free){
  if(e.freeBoxDay===today)return null;
 }else{
  if(whole(profile.coins)<55)return null;
  profile.coins-=55;
 }
 if(free)e.freeBoxDay=today;
 // Weighted, bounded virtual-reward prize table; no cash or payment.
 const roll=Math.min(.99999,Math.max(0,Number(rng())||0));
 if(roll<.50){
  const coins=free?25:20;
  profile.coins=whole(profile.coins)+coins;
  return {type:'coins',coins,free,label:'🪙 '+coins+' coins'};
 }
 if(roll<.84){
  const food=FOOD_BY_ANIMAL[animal]||FOOD_BY_ANIMAL.bunny;
  e.inventory[food.id]+=free?6:10;
  return {type:'food',food,quantity:free?6:10,free,label:food.emoji+' '+(free?6:10)+' '+food.label};
 }
 const coins=free?75:80;
 profile.coins=whole(profile.coins)+coins;
 return {type:'coins',coins,free,label:'✨ '+coins+' bonus coins'};
}
