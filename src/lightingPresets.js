import * as THREE from 'three';

// Per-world lighting inspired by the reference art: warm golden sun on the
// meadow, farm and prairie; cool glassy light on the glacier; rosy glow in the
// sky world. Pure data + a small applier so it is testable without a browser.
export const LIGHTING_PRESETS=Object.freeze({
 meadow:   {sun:0xfff1c9,sunI:2.7,sky:0xdff6ff,ground:0x7cae62,hemiI:1.7,fill:0xffe0e8,fillI:.55,exposure:1.20},
 rainbow:  {sun:0xffe3f6,sunI:2.3,sky:0xf0dcff,ground:0x9a7fd0,hemiI:1.85,fill:0xc9b6ff,fillI:.75,exposure:1.22},
 grassland:{sun:0xffe7b0,sunI:2.8,sky:0xdcf1ff,ground:0x93a85b,hemiI:1.6,fill:0xffd9a6,fillI:.5,exposure:1.20},
 city:     {sun:0xffdcae,sunI:2.6,sky:0xdfe8ff,ground:0xa88b7c,hemiI:1.7,fill:0xffc7c0,fillI:.6,exposure:1.18},
 park:     {sun:0xfff0c4,sunI:2.6,sky:0xe0f7ff,ground:0x6fae6a,hemiI:1.7,fill:0xfff0d0,fillI:.5,exposure:1.20},
 arctic:   {sun:0xf2fbff,sunI:2.4,sky:0xd5f4ff,ground:0x3f8bae,hemiI:1.65,fill:0x9fdcff,fillI:.7,exposure:1.16},
 farm:     {sun:0xffe9bd,sunI:2.8,sky:0xe3f4ff,ground:0x8aa35c,hemiI:1.6,fill:0xffdcb0,fillI:.5,exposure:1.20}
});
export function lightingFor(biome){return LIGHTING_PRESETS[biome]||LIGHTING_PRESETS.meadow}
export function applyLighting(biome,{renderer,hemi,sun,fill}){
 const p=lightingFor(biome);
 if(hemi){hemi.color.setHex(p.sky);hemi.groundColor.setHex(p.ground);hemi.intensity=p.hemiI}
 if(sun){sun.color.setHex(p.sun);sun.intensity=p.sunI}
 if(fill){fill.color.setHex(p.fill);fill.intensity=p.fillI}
 if(renderer)renderer.toneMappingExposure=p.exposure;
 return p;
}
// Fluffy cumulus: a flat base with a dome of overlapping puffs.
export const CLOUD_PUFFS=Object.freeze([
 [-1.7,-.12,.05,.82,.46,.62],[-.85,.12,.0,1.0,.66,.72],[0,.30,-.05,1.18,.82,.78],
 [.9,.12,.04,1.0,.64,.7],[1.75,-.10,.0,.8,.44,.6],[0,-.08,.12,2.2,.34,.7]
]);
export function addCloudPuffs(group,addPuff){
 for(const [x,y,z,sx,sy,sz] of CLOUD_PUFFS)addPuff(group,x,y,z,sx,sy,sz);
 return group;
}
