import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRoom, evaluatePlacement } from './geometry.js';
import { createCaptureScene } from './capture-scene.js';
import { validateViewState } from './viewer-state.js';
import { validatePlacementPreview } from './state.js';

export async function createEngine(container,{onCondition=()=>{},onPlacement=()=>{},onInteraction=()=>{},onLoadProgress=()=>{}}={}) {
  const progress=value=>{try{onLoadProgress(value);}catch{}};
  progress(0);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(error){progress(null);throw error;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  const canvas=renderer.domElement; canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none'; container.append(canvas);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.005,60);
  const controls=new OrbitControls(camera,canvas); controls.enableDamping=true;controls.minDistance=.065;controls.maxDistance=12;controls.maxTargetRadius=18;controls.maxPolarAngle=Math.PI;canvas.style.touchAction='pan-y';
  scene.add(new THREE.HemisphereLight(0xfffcf4,0x8b8877,2.1));
  const key=new THREE.DirectionalLight(0xfff5e6,3.2);key.position.set(-2,7,3);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5});key.shadow.normalBias=.001;key.shadow.bias=-.00002;scene.add(key);
  const fill=new THREE.DirectionalLight(0xeef2ff,1);fill.position.set(4,2,-2);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.18}));ground.rotation.x=-Math.PI/2;ground.position.y=-.001;ground.receiveShadow=true;scene.add(ground);
  let model,manifest,report;
  let loadingFinished=false;
  const loaded=[0,0,0],updateLoad=(index,value)=>{if(loadingFinished)return;loaded[index]=value;progress(loaded.some(v=>v===null)?null:Math.min(.99,loaded.reduce((sum,v)=>sum+v,0)/3));};
  try { [model,manifest,report]=await Promise.all([new GLTFLoader().loadAsync('/assets/cabinet.glb',event=>updateLoad(0,event.lengthComputable&&event.total>0?THREE.MathUtils.clamp(event.loaded/event.total,0,1):null)).then(g=>{updateLoad(0,1);return g.scene;}),...['cabinet-manifest.json','cabinet-report.json'].map(async (name,index)=>{const r=await fetch('/assets/'+name);if(!r.ok)throw Error('Asset '+name+' gagal dimuat');const value=await r.json();updateLoad(index+1,1);return value;})]); }
  catch(error){loadingFinished=true;progress(null);controls.dispose();ground.geometry.dispose();ground.material.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();throw error;}
  model.traverse(n=>{if(n.isMesh){n.castShadow=!n.name.startsWith('wear_');n.receiveShadow=true;if(n.material.transparent)n.material.depthWrite=false;}});scene.add(model);
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let markerVisibility=false,selected=null,view='overview',active=false,dimensionVisible=false,disposed=false,cameraMove=null,raf,drag=null;
  const captureState={active:false,phase:'prepare',area:'front',progress:0};
  const motions={left:0,right:0,drawer:0}, motionAnimations=new Map();
  const nodes={left:model.getObjectByName('left_door_pivot'),right:model.getObjectByName('right_door_pivot'),drawer:model.getObjectByName('drawer_slide')};
  const bases=Object.fromEntries(Object.entries(nodes).map(([k,n])=>[k,{position:n.position.clone(),rotation:n.rotation.clone()}]));
  const roomState={width:3.2,depth:3,x:0,z:-.4,rotation:0,fixture:'clear'};
  const room=createRoom({...roomState,height:2.6});room.group.visible=false;scene.add(room.group);
  const captureScene=createCaptureScene({scene,renderer,reduced});
  const obstacle=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xd19e65,transparent:true,opacity:.6,roughness:.7}));obstacle.visible=false;scene.add(obstacle);let boxes=[];
  const markers=report.conditions.map((condition,index)=>{const point=new THREE.Object3D();point.position.fromArray(condition.localPositionM);model.getObjectByName(condition.anchorNodeId).add(point);const button=document.createElement('button');button.className='model-marker';button.textContent=index+1;button.title=['Goresan permukaan','Sudut terkelupas','Bekas pada permukaan'][index];button.setAttribute('aria-label',button.title);button.addEventListener('click',()=>selectCondition(condition.id));container.append(button);return {condition,point,button}});
  const dimensions=new THREE.Group();model.add(dimensions);dimensions.visible=false;
  const lineMaterial=new THREE.LineBasicMaterial({color:0x557d69});
  const labels=[];
  for(const [path,text] of [[[[-.45,.03,.33],[.45,.03,.33]],'90 cm'],[[[.55,0,.22],[.55,1.2,.22]],'120 cm'],[[[-.55,.03,-.2375],[-.55,.03,.2375]],'47,5 cm']]) { dimensions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.map(p=>new THREE.Vector3(...p))),lineMaterial));for(const p of path){const v=new THREE.Vector3(...p);dimensions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([v.clone().addScalar(.009),v.clone().addScalar(-.009)]),lineMaterial))}const point=new THREE.Object3D();point.position.fromArray(path[0]).add(new THREE.Vector3(...path[1])).multiplyScalar(.5);dimensions.add(point);const el=document.createElement('span');el.className='dimension-label';el.textContent=text;el.hidden=true;container.append(el);labels.push({point,el});}
  function moveCamera(position,target,instant=false){cameraMove={start:performance.now(),from:camera.position.clone(),to:position,targetFrom:controls.target.clone(),targetTo:target,duration:instant||reduced()?0:650};if(!cameraMove.duration){camera.position.copy(position);controls.target.copy(target);cameraMove=null;controls.update();}}
  function fit(position,target){const offset=position.clone().sub(target);if(camera.aspect<1)offset.multiplyScalar(Math.max(1,1/camera.aspect*.85));return offset.add(target)}
  function selectCondition(id){if(id&&captureState.active)deactivateCapture();const m=markers.find(m=>m.condition.id===id);selected=m? id:null;onCondition(selected);if(!m)return;model.updateMatrixWorld(true);const target=m.point.getWorldPosition(new THREE.Vector3());const offset=id==='scratch'?new THREE.Vector3(.12,.08,.38):id==='chip'?new THREE.Vector3(.12,.09,.12):new THREE.Vector3(.07,.28,.08);offset.applyQuaternion(m.point.parent.getWorldQuaternion(new THREE.Quaternion()));moveCamera(fit(target.clone().add(offset),target),target);}
  function setView(preset='overview',instant=false){if(captureState.active)deactivateCapture();view=preset;selectCondition(null);const p=preset==='underside'?{position:[1.3,-.75,1.9],target:[0,.18,0]}:report.cameraPresets[preset==='rear-lower'?'rear':preset]||report.cameraPresets.overview;ground.visible=!active&&preset!=='underside';if(preset==='interior')setStorage(true);if(preset==='drawer')setMotion('drawer',.3);const target=new THREE.Vector3().fromArray(p.target),position=new THREE.Vector3().fromArray(p.position);moveCamera(fit(position,target),target,instant);}
  function applyMotion(kind,value){const n=nodes[kind],b=bases[kind];if(kind==='drawer')n.position.z=b.position.z+value;else n.rotation.y=b.rotation.y+THREE.MathUtils.degToRad(value*(kind==='left'?-1:1));}
  function setMotion(kind,value){if(!nodes[kind])return;value=THREE.MathUtils.clamp(Number(value)||0,0,kind==='drawer'?.3:100);motions[kind]=value;if(reduced()){motionAnimations.delete(kind);applyMotion(kind,value);model.updateMatrixWorld(true);}else motionAnimations.set(kind,{start:performance.now(),from:kind==='drawer'?nodes[kind].position.z-bases[kind].position.z:THREE.MathUtils.radToDeg(nodes[kind].rotation.y-bases[kind].rotation.y)*(kind==='left'?-1:1),to:value,duration:500});if(selected)selectCondition(null);}
  function setStorage(open){for(const kind of Object.keys(nodes))setMotion(kind,open?(kind==='drawer'?.3:100):0);}
  function placement(){model.position.set(roomState.x,0,roomState.z);model.rotation.y=THREE.MathUtils.degToRad(roomState.rotation);model.updateMatrixWorld(true);const result=evaluatePlacement({bounds:room.bounds,model,manifest,obstacles:boxes});onPlacement({state:{...roomState},result});return result;}
  function configureFixture(id){
    roomState.fixture=id;boxes=[];obstacle.visible=false;setStorage(false);
    if(id==='door'||id==='drawer'){
      const size=id==='door'?new THREE.Vector3(.14,.24,.1):new THREE.Vector3(.24,.1,.15);
      const center=id==='door'?new THREE.Vector3(-.30,.62,-.02):new THREE.Vector3(0,1.09,.075);
      obstacle.position.copy(center);obstacle.scale.copy(size);obstacle.visible=active;
      boxes=[new THREE.Box3(center.clone().sub(size.clone().multiplyScalar(.5)),center.clone().add(size.clone().multiplyScalar(.5)))];
      setMotion(id==='door'?'left':'drawer',id==='door'?60:.3);
    }
  }
  function setRoom(patch={}){
    const oldWidth=roomState.width,oldDepth=roomState.depth;
    for(const k of ['width','depth','x','z','rotation'])if(Number.isFinite(Number(patch[k])))roomState[k]=Number(patch[k]);
    roomState.width=THREE.MathUtils.clamp(roomState.width,1.2,10);roomState.depth=THREE.MathUtils.clamp(roomState.depth,1,10);
    roomState.x=THREE.MathUtils.clamp(roomState.x,-10,10);roomState.z=THREE.MathUtils.clamp(roomState.z,-10,10);roomState.rotation=THREE.MathUtils.clamp(roomState.rotation,-180,180);
    if(oldWidth!==roomState.width||oldDepth!==roomState.depth)room.setDimensions(roomState);
    if(['clear','door','drawer','wall'].includes(patch.fixture)&&patch.fixture!==roomState.fixture)configureFixture(patch.fixture);
    placement();
  }
  function setFixture(id){
    if(!['clear','door','drawer','wall'].includes(id))return;
    Object.assign(roomState,{x:id==='wall'?roomState.width/2-.1:0,z:-.4,rotation:0});
    configureFixture(id);placement();
  }
  function roomCamera(){moveCamera(fit(new THREE.Vector3(4.5,4.7,5.5),new THREE.Vector3(0,.65,0)),new THREE.Vector3(0,.65,0));}
  function enterRoom(state){if(captureState.active)deactivateCapture();active=true;selectCondition(null);room.group.visible=true;ground.visible=false;if(state)setRoom(state);else placement();obstacle.visible=boxes.length>0;roomCamera();}
  function leaveRoom(){active=false;room.group.visible=false;obstacle.visible=false;model.position.set(0,0,0);model.rotation.y=0;setView('overview');}
  function deactivateCapture(){captureState.active=false;captureScene.setVisible(false);controls.enabled=true;ground.visible=!active;cameraMove=null;motionAnimations.clear();for(const kind of Object.keys(nodes)){motions[kind]=0;applyMotion(kind,0);}}
  // Fit the authored cabinet's real, articulated mesh bounds in every capture viewport.
  // Keep the chosen angle and target, moving back only when the composition is clipped.
  function capturePose(){
    const pose=captureScene.getCameraPose(camera.aspect);if(!pose)return null;
    model.updateMatrixWorld(true);
    const bounds=new THREE.Box3();
    model.traverse(node=>{if(node.isMesh){if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();bounds.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));}});
    const corners=[];for(let i=0;i<8;i++)corners.push(new THREE.Vector3(i&1?bounds.max.x:bounds.min.x,i&2?bounds.max.y:bounds.min.y,i&4?bounds.max.z:bounds.min.z));
    const framingCamera=new THREE.PerspectiveCamera(camera.fov,camera.aspect,camera.near,camera.far),offset=pose.position.clone().sub(pose.target);
    for(let step=0;step<36;step++){
      framingCamera.position.copy(pose.target).add(offset);framingCamera.lookAt(pose.target);framingCamera.updateMatrixWorld(true);
      if(corners.every(point=>{const projected=point.clone().project(framingCamera);return Math.abs(projected.x)<=.92&&Math.abs(projected.y)<=.92&&projected.z>=-1&&projected.z<=1;}))break;
      offset.multiplyScalar(1.08);
    }
    return {position:pose.target.clone().add(offset),target:pose.target};
  }
  function setCaptureScene({phase='prepare',area='front',progress=0}={}){
    const first=!captureState.active;
    active=false;room.group.visible=false;obstacle.visible=false;end();
    captureState.active=true;captureState.phase=['prepare','exterior','interior','review'].includes(phase)?phase:'prepare';
    captureState.area=Object.hasOwn(report.cameraPresets,area)||['rear-lower','underside','scratch','chip','mark'].includes(area)?area:'front';
    captureState.progress=THREE.MathUtils.clamp(Number(progress)||0,0,1);
    selected=null;onCondition(null);dimensionVisible=false;dimensions.visible=false;labels.forEach(l=>{l.el.hidden=true;l.el.style.display='none'});markers.forEach(m=>{m.button.hidden=true;m.button.style.display='none'});
    model.position.set(0,0,0);model.rotation.y=0;ground.visible=false;controls.enabled=false;
    // Outside recording stays stationary. Opening happens only in the separate interior phase.
    motionAnimations.clear();for(const kind of Object.keys(nodes)){const value=captureState.phase==='interior'?(kind==='drawer'?.3:100):0;motions[kind]=value;applyMotion(kind,value);}
    model.updateMatrixWorld(true);captureScene.setState(captureState,report,first);
    const pose=capturePose();if(pose)moveCamera(pose.position,pose.target,first&&reduced());
  }
  function leaveCaptureScene(){if(!captureState.active)return;deactivateCapture();setStorage(false);setView('overview');}
  function captureViewState(){
    if(disposed)return null;
    return validateViewState({schema:1,camera:{position:camera.position.toArray(),target:controls.target.toArray()},view,condition:selected,motions:{...motions},dimensionsVisible:dimensionVisible,inRoom:active,roomState:{...roomState},captureScene:{...captureState}});
  }
  // Consume remaining orbit damping before applying an exact saved pose.
  function stopOrbit(){const damping=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=damping;}
  function restoreViewState(input){
    let snapshot;try{snapshot=validateViewState(input);}catch{return false;}
    if(disposed)return false;
    end();cameraMove=null;motionAnimations.clear();stopOrbit();
    if(captureState.active)deactivateCapture();
    active=snapshot.inRoom;room.group.visible=active;setRoom(snapshot.roomState);
    if(snapshot.captureScene.active)setCaptureScene(snapshot.captureScene);
    else{
      captureScene.setVisible(false);Object.assign(captureState,snapshot.captureScene);
      controls.enabled=true;ground.visible=!active&&snapshot.view!=='underside';obstacle.visible=active&&boxes.length>0;
      model.position.set(active?roomState.x:0,0,active?roomState.z:0);model.rotation.y=active?THREE.MathUtils.degToRad(roomState.rotation):0;
    }
    cameraMove=null;motionAnimations.clear();view=snapshot.view;selected=snapshot.condition;onCondition(selected);
    for(const kind of Object.keys(nodes)){motions[kind]=snapshot.motions[kind];applyMotion(kind,motions[kind]);}
    dimensionVisible=snapshot.dimensionsVisible;dimensions.visible=dimensionVisible;
    camera.position.fromArray(snapshot.camera.position);controls.target.fromArray(snapshot.camera.target);camera.lookAt(controls.target);camera.updateMatrixWorld();model.updateMatrixWorld(true);
    if(active)room.setNearWallHidden(true,camera.position);
    return true;
  }
  function zoomBy(factor){
    if(disposed||captureState.active||typeof factor!=='number'||!Number.isFinite(factor)||factor<=0)return false;
    const position=camera.position.clone(),target=controls.target.clone();stopOrbit();camera.position.copy(position);controls.target.copy(target);
    const offset=position.sub(target),distance=offset.length();if(!distance)return false;
    cameraMove=null;camera.position.copy(target).add(offset.multiplyScalar(THREE.MathUtils.clamp(distance*factor,controls.minDistance,controls.maxDistance)/distance));camera.lookAt(target);camera.updateMatrixWorld();onInteraction();return true;
  }
  function capturePlacementPreview(){
    if(disposed||!active||captureState.active)return null;
    const width=400,height=300,target=new THREE.WebGLRenderTarget(width,height);target.texture.colorSpace=THREE.SRGBColorSpace;
    const previous={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),scissorTest:renderer.getScissorTest(),autoClear:renderer.autoClear};
    const wallVisibility=room.group.children.map(node=>[node,node.visible]);
    try{
      const thumbnailCamera=camera.clone();thumbnailCamera.aspect=width/height;thumbnailCamera.updateProjectionMatrix();thumbnailCamera.updateMatrixWorld();
      room.setNearWallHidden(true,thumbnailCamera.position);
      renderer.setRenderTarget(target);renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.autoClear=true;renderer.render(scene,thumbnailCamera);
      const pixels=new Uint8Array(width*height*4);renderer.readRenderTargetPixels(target,0,0,width,height,pixels);
      const thumbnail=document.createElement('canvas');thumbnail.width=width;thumbnail.height=height;
      const context=thumbnail.getContext('2d');if(!context)return null;
      const image=context.createImageData(width,height),row=width*4;
      for(let y=0;y<height;y++)image.data.set(pixels.subarray((height-1-y)*row,(height-y)*row),y*row);
      context.putImageData(image,0,0);
      for(const quality of [.78,.6,.45,.3]){const value=thumbnail.toDataURL('image/webp',quality);try{return validatePlacementPreview(value);}catch{}}
      return null;
    }catch{return null;}
    finally{
      wallVisibility.forEach(([node,visible])=>{node.visible=visible;});renderer.setRenderTarget(previous.target);renderer.setViewport(previous.viewport);renderer.setScissor(previous.scissor);renderer.setScissorTest(previous.scissorTest);renderer.autoClear=previous.autoClear;target.dispose();
    }
  }
  const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  function floorPoint(e){const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return raycaster.ray.intersectPlane(plane,new THREE.Vector3());}
  function down(e){if(!active||e.button!==0)return;const point=floorPoint(e);if(point&&raycaster.intersectObject(model,true).length){drag={point,position:model.position.clone(),pointer:e.pointerId};controls.enabled=false;cameraMove=null;canvas.setPointerCapture(e.pointerId);onInteraction();}}
  function move(e){if(!drag)return;const p=floorPoint(e);if(p)setRoom({x:drag.position.x+p.x-drag.point.x,z:drag.position.z+p.z-drag.point.z});}
  function end(){if(drag&&canvas.hasPointerCapture(drag.pointer))canvas.releasePointerCapture(drag.pointer);drag=null;controls.enabled=!captureState.active;}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  const interaction=()=>{cameraMove=null;onInteraction();};controls.addEventListener('start',interaction);
  let hadSize=false;
  function resize(){const r=container.getBoundingClientRect(),previousAspect=camera.aspect;camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);if(!hadSize){hadSize=true;setView(view,true);}else if(captureState.active&&Math.abs(previousAspect-camera.aspect)>.08){const pose=capturePose();if(pose)moveCamera(pose.position,pose.target,true);}}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function project(point,el,show){const p=point.getWorldPosition(new THREE.Vector3()).project(camera);el.style.left=(p.x*.5+.5)*canvas.clientWidth+'px';el.style.top=(-p.y*.5+.5)*canvas.clientHeight+'px';el.hidden=!show||p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;el.style.display=el.hidden?'none':'';return p;}
  function render(now){if(disposed)return;raf=requestAnimationFrame(render);if(cameraMove){const t=cameraMove.duration?Math.min(1,(now-cameraMove.start)/cameraMove.duration):1,s=1-(1-t)**3;camera.position.lerpVectors(cameraMove.from,cameraMove.to,s);controls.target.lerpVectors(cameraMove.targetFrom,cameraMove.targetTo,s);if(t===1)cameraMove=null;}for(const [kind,a] of motionAnimations){const t=a.duration?Math.min(1,(now-a.start)/a.duration):1;applyMotion(kind,THREE.MathUtils.lerp(a.from,a.to,1-(1-t)**3));if(t===1)motionAnimations.delete(kind);}controls.update();model.updateMatrixWorld(true);camera.updateMatrixWorld();for(const m of markers){const p=project(m.point,m.button,markerVisibility&&!active&&!captureState.active&&!selected);if(!m.button.hidden){raycaster.setFromCamera(new THREE.Vector2(p.x,p.y),camera);const world=m.point.getWorldPosition(new THREE.Vector3()),hit=raycaster.intersectObject(model,true).find(h=>h.object.isMesh);if(hit&&hit.distance<camera.position.distanceTo(world)-.006){m.button.hidden=true;m.button.style.display='none';}}}for(const l of labels)project(l.point,l.el,dimensionVisible&&!captureState.active);if(active)room.setNearWallHidden(true,camera.position);if(captureState.active){captureScene.tick(now);captureScene.prepareFrame(camera);}renderer.render(scene,camera);}
  raf=requestAnimationFrame(render);
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();end();for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',end],['pointercancel',end]])canvas.removeEventListener(event,fn);controls.removeEventListener('start',interaction);controls.dispose();markers.forEach(m=>m.button.remove());labels.forEach(l=>l.el.remove());captureScene.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(n=>{if(n.geometry)geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());key.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}
  loadingFinished=true;progress(1);
  return {ready:true,model,manifest,report,camera,controls,scene,renderer,setView,selectCondition,setStorage,setMotion,setCaptureScene,leaveCaptureScene,captureViewState,restoreViewState,zoomBy,capturePlacementPreview,setMarkersVisible(v){markerVisibility=Boolean(v);if(!markerVisibility)for(const m of markers){m.button.hidden=true;m.button.style.display='none';}},setDimensionsVisible(v){dimensionVisible=!captureState.active&&Boolean(v);dimensions.visible=dimensionVisible;},enterRoom,leaveRoom,setRoom,setFixture,resetCamera(){if(captureState.active){const pose=capturePose();if(pose)moveCamera(pose.position,pose.target);}else active?roomCamera():setView('overview')},dispose,getState(){return {roomState:{...roomState},condition:selected,motions:{...motions},view,dimensionsVisible:dimensionVisible,inRoom:active,captureScene:{...captureState},camera:camera.position.toArray()};}};
}
