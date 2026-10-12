import * as THREE from 'three';

// Desktop HD favours sharp foliage/roads and soft 2K shadows. Mobile and
// split-screen use lower default resolution to avoid GPU stalls. A query
// parameter (?quality=hd or ?quality=balanced) allows visual comparison.
export const QUALITY_PRESETS=Object.freeze({
 hd:Object.freeze({maxPixelRatio:2,shadowSize:2048,anisotropy:12}),
 balanced:Object.freeze({maxPixelRatio:1.25,shadowSize:1024,anisotropy:4}),
 mobile:Object.freeze({maxPixelRatio:1.25,shadowSize:512,anisotropy:4})
});
export function chooseGraphicsQuality({
 width=1280,
 isMobile=false,
 deviceMemory=8,
 hardwareConcurrency=8,
 multiplayer=false,
 requested='auto'
}={}){
 if(requested==='hd')return 'hd';
 if(requested==='balanced')return 'balanced';
 const lowPower=isMobile||width<750||deviceMemory<=3||hardwareConcurrency<=2;
 if(lowPower)return 'mobile';
 if(multiplayer)return 'balanced';
 return 'hd';
}
export function configureGameRenderer(renderer,{
 multiplayer=false,
 width=1280,
 pixelRatio=1,
 isMobile=false,
 deviceMemory=8,
 hardwareConcurrency=8,
 requested='auto'
}={}){
 const name=chooseGraphicsQuality({multiplayer,width,isMobile,deviceMemory,hardwareConcurrency,requested});
 const quality=QUALITY_PRESETS[name];
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.18;
 renderer.setPixelRatio(Math.min(Math.max(.8,pixelRatio),quality.maxPixelRatio));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 return {name,...quality};
}
export function browserQualityOptions(multiplayer=false){
 const params=new URLSearchParams(typeof location!=='undefined'?location.search:'');
 const requested=params.get('quality');
 return {
  multiplayer,
  width:typeof innerWidth==='number'?innerWidth:1280,
  pixelRatio:typeof devicePixelRatio==='number'?devicePixelRatio:1,
  isMobile:typeof navigator!=='undefined'&&
   (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||('ontouchstart' in globalThis&&innerWidth<1000)),
  deviceMemory:typeof navigator!=='undefined'?navigator.deviceMemory??8:8,
  hardwareConcurrency:typeof navigator!=='undefined'?navigator.hardwareConcurrency??8:8,
  requested:requested==='hd'||requested==='balanced'?requested:'auto'
 };
}
