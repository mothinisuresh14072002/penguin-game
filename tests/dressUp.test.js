import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAnimal} from '../src/animalArt.js';
import {ACCESSORIES,SLOTS,sanitizeWardrobe,buyAccessory,equipAccessory,unequipAccessory,applyWardrobe} from '../src/dressUp.js';

test('dressing shop has exactly twenty unique cute cosmetics across five slots',()=>{
 assert.equal(ACCESSORIES.length,20);
 assert.equal(new Set(ACCESSORIES.map(x=>x.id)).size,20);
 for(const slot of SLOTS)assert.equal(ACCESSORIES.filter(x=>x.slot===slot).length,4);
});
test('coins, purchases and per-character equipment persist safely',()=>{
 const profile={coins:200,pinkCash:200,wardrobe:sanitizeWardrobe({})};
 assert.ok(buyAccessory(profile,'sunny'));
 assert.equal(profile.pinkCash,120);
 assert.equal(profile.coins,200);
 assert.equal(buyAccessory(profile,'sunny'),false);
 assert.equal(equipAccessory(profile,'cat','sunny'),true);
 assert.equal(profile.wardrobe.equipped.cat.eyes,'sunny');
 assert.equal(profile.wardrobe.equipped.dog,undefined);
 const saved=sanitizeWardrobe(JSON.parse(JSON.stringify(profile.wardrobe)));
 assert.equal(saved.equipped.cat.eyes,'sunny');
 assert.equal(unequipAccessory(profile,'cat','eyes'),true);
 assert.equal(profile.wardrobe.equipped.cat.eyes,undefined);
 assert.equal(equipAccessory(profile,'cat','not-real'),false);
});
test('outfits render on the character and can be changed without affecting anatomy',()=>{
 const actor=createAnimal('cat');
 applyWardrobe(actor,{head:'red-bow',eyes:'sunny',neck:'red-scarf',outfit:'berry',charm:'bell'});
 const group=actor.group.getObjectByName('wardrobe-cosmetics');
 assert.ok(group&&group.children.length>=5);
 applyWardrobe(actor,{neck:'blue-scarf'});
 assert.equal(actor.group.getObjectByName('wardrobe-cosmetics').children.length,2);
 assert.ok(actor.group.getObjectByName('cat-distinct-head'));
});
