// Deterministic swept collision detection shared by the solo runner and
// two-player race. Both lane-changing and forward travel occur between frames;
// checking only the runner's endpoint lets them tunnel through obstacles.
export const HAZARD_HITBOXES=Object.freeze({
  rock:{x:1.23,z:1.01,height:1.30},
  spike:{x:1.03,z:0.76,height:1.28},
  log:{x:1.21,z:0.70,height:1.95},
  lion:{x:1.16,z:0.95,height:2.05}
});

export function sweptAxisInterval(from,to,center,halfWidth){
 if(!Number.isFinite(from)||!Number.isFinite(to)||!Number.isFinite(center)||
    !Number.isFinite(halfWidth)||halfWidth<0)return null;
 const delta=to-from;
 if(Math.abs(delta)<1e-9)return Math.abs(from-center)<=halfWidth?[0,1]:null;
 const t1=(center-halfWidth-from)/delta,t2=(center+halfWidth-from)/delta;
 const start=Math.max(0,Math.min(t1,t2));
 const end=Math.min(1,Math.max(t1,t2));
 return start<=end?[start,end]:null;
}

// Time window during which the feet are LOW enough to touch an obstacle.
// The jump range is linearly interpolated over this short animation frame.
export function groundContactInterval(from,to,ceiling){
 if(!Number.isFinite(from)||!Number.isFinite(to)||!Number.isFinite(ceiling))return null;
 if(from<=ceiling&&to<=ceiling)return [0,1];
 if(from>ceiling&&to>ceiling)return null;
 const cross=Math.max(0,Math.min(1,(ceiling-from)/(to-from)));
 return from<=ceiling?[0,cross]:[cross,1];
}

/**
 * @param {object} step
 * {previousDistance,distance,previousX,x,previousY,y,obstacleDistance,
 * obstacleX,kind,slideStart,slideEnd}.
 * @returns {null|{time:number}} earliest intersection during this frame.
 */
export function sweptHazardContact(step){
 const box=HAZARD_HITBOXES[step.kind];
 if(!box)return null;
 // Sliding avoids an overhead log while the slide is actually held. Ordinary
 // rocks, lions and spikes must not be bypassed by crouching.
 if(step.kind==='log'&&step.slideStart>0&&step.slideEnd>0)return null;
 const z=sweptAxisInterval(step.previousDistance,step.distance,step.obstacleDistance,box.z);
 const x=sweptAxisInterval(step.previousX,step.x,step.obstacleX,box.x);
 const y=groundContactInterval(step.previousY,step.y,box.height+.04);
 if(!z||!x||!y)return null;
 const time=Math.max(z[0],x[0],y[0]);
 return time<=Math.min(z[1],x[1],y[1])+1e-9?{time}:null;
}
