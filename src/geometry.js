import * as THREE from 'three';

export function createRoom({width,depth,height}){
  const group=new THREE.Group();group.name='illustrative_room';const bounds={};
  const wall=new THREE.MeshStandardMaterial({color:0xeae9e1,roughness:.94});const floor=new THREE.MeshStandardMaterial({color:0xc6c5b7,roughness:.83});
  const pane=new THREE.MeshStandardMaterial({color:0xc7d4d1,roughness:.42});let hidden=true;
  function setDimensions({width:w,depth:d}){
    while(group.children.length){const child=group.children.pop();child.geometry?.dispose();if(child.isLineSegments)child.material.dispose();child.parent=null;}
    width=w;depth=d;Object.assign(bounds,{minX:-w/2,maxX:w/2,minZ:-d/2,maxZ:d/2});
    function box(id,x0,y0,z0,x1,y1,z1,mat=wall){
      if(x1<=x0)return;
      const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),mat);m.name=id;m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.castShadow=true;m.receiveShadow=true;group.add(m);
    }
    const x=w/2,z=d/2,t=.1;
    box('floor',-x,-.05,-z,x,0,z,floor);
    box('left_wall',-x-t,0,-z-t,-x,height,z+t);box('right_wall',x,0,-z-t,x+t,height,z+t);
    const a=-x+.3,b=Math.min(a+.8,x);
    box('front_left_jamb',-x,0,z,a,height,z+t);box('front_right_jamb',b,0,z,x,height,z+t);box('front_header',a,2.1,z,b,height,z+t);
    const half=Math.min(.6,w/2-.1);
    box('rear_left_wall',-x,0,-z-t,-half,height,-z);box('rear_right_wall',half,0,-z-t,x,height,-z);
    box('rear_sill_wall',-half,0,-z-t,half,.9,-z);box('rear_header_wall',-half,1.9,-z-t,half,height,-z);
    box('window_view',-half,.9,-z-.09,half,1.9,-z-.085,pane);
    const grid=new THREE.GridHelper(Math.max(w,d),Math.round(Math.max(w,d)*10),0x9da998,0xb8c0b2);grid.position.y=.001;grid.material.transparent=true;grid.material.opacity=.18;group.add(grid);
    setNearWallHidden(hidden);
  }
  function setNearWallHidden(v,position={x:1,z:1}){
    hidden=v;
    group.children.forEach(m=>{
      if(m.name==='left_wall')m.visible=!(v&&position.x<0);
      if(m.name==='right_wall')m.visible=!(v&&position.x>=0);
      if(m.name.startsWith('front_'))m.visible=!(v&&position.z>=0);
      if(m.name.startsWith('rear_')||m.name==='window_view')m.visible=!(v&&position.z<0);
    });
  }
  setDimensions({width,depth});
  return {group,bounds,setDimensions,setNearWallHidden,dispose(){group.traverse(n=>n.geometry?.dispose());wall.dispose();floor.dispose();pane.dispose()}};
}

function obstacleHit(points,box,matrix){
  const minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
  if(maxY<=box.min.y+1e-6||minY>=box.max.y-1e-6)return false;
  const e=matrix.elements;
  const axes=[new THREE.Vector2(1,0),new THREE.Vector2(0,1),new THREE.Vector2(e[0],e[2]).normalize(),new THREE.Vector2(e[8],e[10]).normalize()];
  const corners=[[box.min.x,box.min.z],[box.min.x,box.max.z],[box.max.x,box.min.z],[box.max.x,box.max.z]];
  return axes.every(a=>{
    const p=points.map(p=>p.x*a.x+p.z*a.y),q=corners.map(p=>p[0]*a.x+p[1]*a.y);
    return Math.min(Math.max(...p),Math.max(...q))-Math.max(Math.min(...p),Math.min(...q))>1e-6;
  });
}

export function evaluatePlacement({bounds,model,manifest,obstacles=[]}){
  const physical=manifest.partIds.map(id=>model.getObjectByName(id)).filter(n=>n?.isMesh);
  const motion=manifest.motion.map(m=>({m,node:model.getObjectByName(m.nodeId)}));
  const saved=motion.map(({node})=>({position:node.position.clone(),rotation:node.rotation.clone()}));
  function setPose(m,node,value){
    if(m.type==='rotation')node.rotation[m.axis]=value;
    else node.position[m.axis]=m.pivotM[{x:0,y:1,z:2}[m.axis]]+value;
  }
  motion.forEach(({m,node})=>setPose(m,node,0));
  const conflicts=[];
  function check(parts,type){
    model.updateMatrixWorld(true);
    for(const node of parts){
      node.geometry.computeBoundingBox();const b=node.geometry.boundingBox,points=[];
      for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])points.push(new THREE.Vector3(x,y,z).applyMatrix4(node.matrixWorld));
      if(points.some(p=>p.x<bounds.minX-1e-5||p.x>bounds.maxX+1e-5||p.z<bounds.minZ-1e-5||p.z>bounds.maxZ+1e-5)){
        conflicts.push({type,partId:node.name,obstacle:'wall'});return false;
      }
      if(obstacles.some(box=>obstacleHit(points,box,node.matrixWorld))){conflicts.push({type,partId:node.name,obstacle:'example-block'});return false;}
    }
    return true;
  }
  let closedFits,doorsClear=true,drawerClear=true;
  try{
    closedFits=check(physical,'closed');
    for(const {m,node} of motion){
      const parts=physical.filter(p=>p.parent===node),steps=m.type==='rotation'?100:60;
      let clear=true;
      for(let i=0;i<=steps;i++){setPose(m,node,m.openValue*i/steps);if(!check(parts,m.type==='rotation'?'doors':'drawer')){clear=false;break;}}
      if(m.type==='rotation')doorsClear&&=clear;else drawerClear=clear;
      setPose(m,node,0);
    }
  }finally{motion.forEach(({node},i)=>{node.position.copy(saved[i].position);node.rotation.copy(saved[i].rotation)});model.updateMatrixWorld(true);}
  return {closedFits,doorsClear,drawerClear,conflicts};
}

