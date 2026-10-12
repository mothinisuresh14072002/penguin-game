import * as THREE from 'three';

// Rounded, asymmetric silhouette meshes inspired by hand-shaped clay toys.
// This keeps animals readable from a distance without stacking spheres.
export function createSoftEarGeometry({height=1.1,width=.28,depth=.12,flop=0}={}){
 const half=width*.5;
 const outline=new THREE.Shape();
 outline.moveTo(-half*.60,0);
 outline.bezierCurveTo(-half*1.12,height*.23,-half*1.05,height*.64,-half*.61,height*.89);
 outline.bezierCurveTo(-half*.29,height*1.06,half*.29,height*1.06,half*.61,height*.89);
 outline.bezierCurveTo(half*1.05,height*.64,half*1.12,height*.23,half*.60,0);
 outline.quadraticCurveTo(0,-height*.07,-half*.60,0);
 const geometry=new THREE.ExtrudeGeometry(outline,{
  depth,steps:1,curveSegments:14,bevelEnabled:true,
  bevelSegments:3,bevelThickness:depth*.15,
  bevelSize:width*.055
 });
 geometry.translate(flop,0,-depth*.5);
 geometry.computeVertexNormals();
 return geometry;
}
export function createRoundedTriangleGeometry({width=.38,height=.51,depth=.13}={}){
 const half=width*.5,shape=new THREE.Shape();
 shape.moveTo(-half,0);
 shape.quadraticCurveTo(-half*.86,height*.55,-half*.10,height);
 shape.quadraticCurveTo(0,height*1.09,half*.14,height*.93);
 shape.quadraticCurveTo(half*.97,height*.36,half,0);
 shape.quadraticCurveTo(0,-height*.08,-half,0);
 const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:12,
  bevelEnabled:true,bevelSize:width*.08,bevelThickness:depth*.15,bevelSegments:3});
 geo.translate(0,0,-depth*.5);
 geo.computeVertexNormals();
 return geo;
}
// Smooth tapered 3D fur/mane lock with thick rounded base, narrow curved tip.
export function createHairLockGeometry({length=.65,width=.19,thickness=.15,curve=.20}={}){
 const shape=new THREE.Shape();
 shape.moveTo(-width*.5,0);
 shape.bezierCurveTo(-width*.73,length*.28,-width*.53,length*.65,curve,length);
 shape.bezierCurveTo(curve+width*.15,length*.70,width*.53,length*.36,width*.5,0);
 shape.quadraticCurveTo(0,-length*.09,-width*.5,0);
 const geo=new THREE.ExtrudeGeometry(shape,{
  depth:thickness,steps:1,bevelEnabled:true,bevelSegments:2,
  bevelSize:width*.06,bevelThickness:thickness*.15,curveSegments:10
 });
 geo.translate(0,0,-thickness*.5);
 geo.computeVertexNormals();
 return geo;
}
