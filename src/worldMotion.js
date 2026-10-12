// The camera follows a runner fixed near z=2. Each rendered object's
// camera-relative position is mathematically equivalent to the animal
// travelling into an unmoving world. Distant scenery changes more slowly.
export const WORLD_LAYERS=Object.freeze({
 track:1,
 near:1,
 mid:.42,
 far:.08,
 sky:0
});
export function loopZ(index,spacing,distance,count,front=14){
 if(!Number.isFinite(distance)||!Number.isFinite(spacing)||spacing<=0||
    !Number.isInteger(count)||count<=0)return front;
 const period=count*spacing;
 const raw=index*spacing-distance+spacing;
 const wrapped=((raw%period)+period)%period;
 return front+spacing-wrapped;
}
export function layerTravel(distance,layer='near'){
 return Math.max(0,Number(distance)||0)*(WORLD_LAYERS[layer]??1);
}
export const JOURNEY_CHAPTERS=Object.freeze({
 meadow:['Daisy Fields','Carrot Grove','Blossom Hills'],
 rainbow:['Cloud Gardens','Crystal Valley','Starlight Bridge'],
 grassland:['Sunflower Trail','Haystack Valley','Windmill Hills'],
 city:['Pastel Street','Flower Market','Clocktower Lane'],
 park:['Garden Walk','Lily Pond','Gazebo Grove'],
 arctic:['Frozen Lake','Crystal Gate','Snowy Peaks'],
 farm:['Sunflower Farm','Golden Cornfields','Barnyard Lane']
});
export function journeyChapter(biome,distance){
 const names=JOURNEY_CHAPTERS[biome]||JOURNEY_CHAPTERS.meadow;
 const index=Math.floor(Math.max(0,Number(distance)||0)/240);
 return {index,name:names[index%names.length]};
}
