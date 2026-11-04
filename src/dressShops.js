// Wardrobe lookbook inspired by the seven character showcase concepts.
// All prices are virtual pink cash earned only by selling collected food.
export const DRESS_SHOPS=Object.freeze({
 bunny:{title:'Bella’s Berry Boutique',icon:'🐰',theme:'berry',color:'#f6a1bb',label:'Berry Meadow',pose:'Twirl',outfit:'berry',styles:['red-bow','heart','red-scarf','berry','heart-charm'],decor:['🍒','🌷','🎀','👗']},
 unicorn:{title:'Ula’s Rainbow Atelier',icon:'🦄',theme:'rainbow',color:'#c8a9fb',label:'Rainbow Dream',pose:'Sparkle',outfit:'lilac',styles:['flower','star','rainbow-scarf','lilac','gold'],decor:['🌈','⭐','🪄','🦄']},
 horse:{title:'Hugo’s Orchard Closet',icon:'🐴',theme:'orchard',color:'#b7d5a6',label:'Orchard Breeze',pose:'Prance',outfit:'mint',styles:['cap','sky','blue-scarf','mint','gold'],decor:['🍎','🌼','🌿','🧺']},
 cat:{title:'Coco’s Cherry Couture',icon:'🐱',theme:'cherry',color:'#f7b1c6',label:'Sweet Berry',pose:'Model',outfit:'berry',styles:['red-bow','heart','red-scarf','berry','heart-charm'],decor:['🍒','🎀','👠','👜']},
 dog:{title:'Dodo’s Sunny Style',icon:'🐶',theme:'sunny',color:'#a7cef9',label:'Sunny Park',pose:'Paw Wave',outfit:'mint',styles:['cap','sky','blue-scarf','mint','bell'],decor:['🐾','🧢','🦴','🎒']},
 penguin:{title:'Pip’s Frosty Fashion',icon:'🐧',theme:'frosty',color:'#b6c8fa',label:'Frosty Star',pose:'Flipper Wave',outfit:'lilac',styles:['flower','sky','rainbow-scarf','lilac','snowflake'],decor:['❄️','🧣','💎','🎿']},
 cow:{title:'Mimi’s Sunflower Closet',icon:'🐮',theme:'sunflower',color:'#f8d88b',label:'Sunflower Meadow',pose:'Curtsy',outfit:'lemon',styles:['red-bow','heart','pink-scarf','lemon','heart-charm'],decor:['🌻','🎀','🌽','🧺']}
});
export const levelFromBest=best=>Math.max(1,Math.min(99,1+Math.floor(Math.max(0,Number(best)||0)/250)));
export const canPurchase=(profile,item)=>levelFromBest(profile.best)>=item.level&&(profile.pinkCash||0)>=item.price;
