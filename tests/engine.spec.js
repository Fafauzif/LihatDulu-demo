import { test, expect } from '@playwright/test';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { evaluatePlacement } from '../src/geometry.js';
const manifest=JSON.parse(readFileSync(new URL('../public/assets/cabinet-manifest.json',import.meta.url)));
function fixture(){
 const model=new THREE.Group(), root=new THREE.Group();root.name='cabinet_root';model.add(root);
 for(const m of manifest.motion){const n=new THREE.Group();n.name=m.nodeId;n.position.fromArray(m.pivotM);root.add(n);}
 for(const p of manifest.parts){const a=p.boundsMM.slice(0,3).map(v=>v/1000),b=p.boundsMM.slice(3).map(v=>v/1000),mesh=new THREE.Mesh(new THREE.BoxGeometry(...a.map((v,i)=>b[i]-v)));mesh.name=p.id;const parent=model.getObjectByName(p.parent);mesh.position.fromArray(a.map((v,i)=>(v+b[i])/2)).sub(parent.position);parent.add(mesh);}
 model.position.z=-.4;return model;
}
const bounds={minX:-1.6,maxX:1.6,minZ:-1.5,maxZ:1.5};
function box(center,size){return new THREE.Box3(new THREE.Vector3(...center).sub(new THREE.Vector3(...size).multiplyScalar(.5)),new THREE.Vector3(...center).add(new THREE.Vector3(...size).multiplyScalar(.5)));}
test('sampled geometry separates closed fit, door swing, drawer travel and wall conflicts',()=>{
 const model=fixture(),check=obstacles=>evaluatePlacement({bounds,model,manifest,obstacles});
 expect(check([])).toMatchObject({closedFits:true,doorsClear:true,drawerClear:true});
 expect(check([box([-.3,.62,-.02],[.14,.24,.1])])).toMatchObject({closedFits:true,doorsClear:false,drawerClear:true});
 expect(check([box([0,1.09,.075],[.24,.1,.15])])).toMatchObject({closedFits:true,doorsClear:true,drawerClear:false});
 model.position.x=1.5;expect(check([]).closedFits).toBe(false);
});
test('clearance check restores animated part transforms and handles rotation',()=>{
 const model=fixture(),left=model.getObjectByName('left_door_pivot'),drawer=model.getObjectByName('drawer_slide');left.rotation.y=-.8;drawer.position.z=.18;model.rotation.y=Math.PI/4;
 const result=evaluatePlacement({bounds,model,manifest});expect(result.closedFits).toBe(true);expect(left.rotation.y).toBe(-.8);expect(drawer.position.z).toBe(.18);
});

test('real engine restores moved and rotated obstacle scenarios without rebuilding room for nudges',async({page})=>{
 await page.goto('/ruang');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 for(const fixture of ['door','drawer']){
  const restored=await page.evaluate(fixture=>{
   const engine=window.lihatDulu.engine;
   engine.setFixture('clear');engine.leaveRoom();
   const saved={width:3.7,depth:3.4,x:.35,z:-.65,rotation:35,fixture};
   engine.enterRoom(saved);
   const room=engine.scene.getObjectByName('illustrative_room');
   const floor=room.getObjectByName('floor');
   const restored=engine.getState().roomState;
   engine.setRoom({x:.4,z:-.7,rotation:40});
   const retainedFloor=floor===room.getObjectByName('floor');
   const transform={x:engine.model.position.x,z:engine.model.position.z,rotation:engine.model.rotation.y*180/Math.PI};
   engine.setRoom({x:100,z:-100,rotation:1000});
   return {restored,retainedFloor,transform,clamped:engine.getState().roomState};
  },fixture);
  expect(restored.restored).toEqual({width:3.7,depth:3.4,x:.35,z:-.65,rotation:35,fixture});
  expect(restored.retainedFloor).toBe(true);
  expect(restored.transform.x).toBe(.4);expect(restored.transform.z).toBe(-.7);expect(restored.transform.rotation).toBeCloseTo(40);
  expect(restored.clamped).toMatchObject({x:10,z:-10,rotation:180});
 }
});

test('long orbit panning stays within the persistable snapshot bounds',async({page})=>{
 await page.goto('/studio?mode=free');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 const result=await page.evaluate(()=>{
  const e=window.lihatDulu.engine;e.controls.target.set(90,90,90);e.camera.position.set(92,92,92);e.controls.update();const snapshot=e.captureViewState();return {radius:e.controls.target.length(),snapshot,restored:e.restoreViewState(snapshot)};
 });
 expect(result.radius).toBeLessThanOrEqual(18.000001);expect(result.snapshot).not.toBeNull();expect(result.restored).toBe(true);
});
