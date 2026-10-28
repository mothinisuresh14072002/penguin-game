import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Friends Walk is a browser WebGL mode; source-level checks avoid a DOM dependency in Node.
test('Friends Walk has independent entry and separate selectors',()=>{
 const html=readFileSync(new URL('../walk.html',import.meta.url),'utf8');
 assert.match(html,/friend-one/);assert.match(html,/friend-two/);assert.match(html,/walk-start/);
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 assert.match(main,/FRIENDS WALK/);
});
test('Friends Walk keeps saved outfits, both players and a bounded recycled scene',()=>{
 const code=readFileSync(new URL('../src/friendsWalk.js',import.meta.url),'utf8');
 assert.match(code,/wardrobe\.equipped\[id\]/);
 assert.match(code,/actors=ids\.map/);
 assert.match(code,/Array\.from\(\{length:12\}/);
 assert.match(code,/WALK_SPEED/);
 assert.match(code,/paused/);
});

test('Friends Walk scenery materials are shared across recycled sections',()=>{const code=readFileSync(new URL('../src/friendsWalk.js',import.meta.url),'utf8');assert.match(code,/const cottageWall=mat/);assert.match(code,/theme===5\?pond:magicStone/);assert.doesNotMatch(code,/geo\(g,sphere,mat\(theme/);});
