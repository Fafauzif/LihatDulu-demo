/**
 * Authored room-context imagery for the LihatDulu business-plan prototype.
 * Loads the unchanged demonstration cabinet GLB, adds illustrative room props,
 * and exports WebP frames through Three.js in headless Chromium.
 * Run from project root: node scripts/render-scene-assets.js
 */
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const threeRoot = fileURLToPath(new URL('../', import.meta.resolve('three')));
const html = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#eee7dc}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/three/three.module.js","three/addons/":"/three/addons/"}}</script></head><body>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const query=new URLSearchParams(location.search),kind=query.get('kind')||'hero';
const width=kind==='detail'?1000:1600,height=kind==='detail'?1100:1150;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xeee7dc);
const camera=new THREE.PerspectiveCamera(42,width/height,.02,50);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(width,height);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;document.body.append(renderer.domElement);
const material=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
const cream=material(0xe9e1d4),trim=material(0xe5dbca),black=material(0x2c322e),green=material(0x66715c),clay=material(0xb98065);
function box(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
function woodTexture(){const c=document.createElement('canvas');c.width=1024;c.height=1024;const p=c.getContext('2d');p.fillStyle='#b5a08b';p.fillRect(0,0,1024,1024);for(let i=0;i<6;i++){const x=i*171;p.fillStyle=i%2?'#ae9a85':'#b9a58f';p.fillRect(x+1,0,169,1024);p.fillStyle='rgba(62,42,25,.14)';p.fillRect(x,0,1,1024);for(let j=0;j<58;j++){const dx=x+7+j*2.8;p.strokeStyle='rgba(72,51,32,'+(j%5===0?.1:.035)+')';p.lineWidth=j%5===0?1.2:.4;p.beginPath();p.moveTo(dx,0);p.bezierCurveTo(dx+4,300,dx-5,700,dx+2,1024);p.stroke();}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.5,2.5);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
box(9,.08,8,0,-.04,1,new THREE.MeshStandardMaterial({map:woodTexture(),roughness:.88}));
box(5,3,.12,0,1.5,-.39,cream);const sideWall=box(.12,3,4.6,-1.65,1.5,1.85,cream);sideWall.castShadow=false;
box(5,.065,.035,0,.033,-.306,trim);box(.035,.065,4.5,-1.581,.033,1.85,trim);
// Minimal authored artwork, deliberately separate from cabinet evidence.
const art=box(.67,.88,.034,.98,1.56,-.302,material(0x86765d));
box(.615,.825,.012,.98,1.56,-.28,material(0xf4ede3));
const circle=new THREE.Mesh(new THREE.CircleGeometry(.145,80),material(0xbc7d61));circle.position.set(.99,1.67,-.271);scene.add(circle);
box(.37,.026,.006,.98,1.38,-.27,material(0x8a967f));
// Window-like architectural recess creates a calm daylight source in context.
box(.018,1.15,1.12,-1.573,1.65,.53,material(0xf4f3e9));
box(.038,1.24,.05,-1.55,1.65,-.06,trim);box(.038,1.24,.05,-1.55,1.65,1.12,trim);
box(.038,.044,1.26,-1.55,1.05,.53,trim);box(.038,.044,1.26,-1.55,2.25,.53,trim);
box(.055,.014,1.3,-1.53,1.04,.53,trim);box(.038,1.15,.035,-1.54,1.65,.53,trim);
// Woven rug texture uses deterministic authored lines, not an external photo.
const rc=document.createElement('canvas');rc.width=512;rc.height=512;const rp=rc.getContext('2d');rp.fillStyle='#d2c4ae';rp.fillRect(0,0,512,512);for(let i=0;i<512;i+=3){rp.strokeStyle=i%9?'rgba(106,89,62,.07)':'rgba(255,255,255,.24)';rp.beginPath();rp.moveTo(i,0);rp.lineTo(i,512);rp.stroke();rp.beginPath();rp.moveTo(0,i);rp.lineTo(512,i);rp.stroke();}const rt=new THREE.CanvasTexture(rc);rt.colorSpace=THREE.SRGBColorSpace;const rug=box(2.1,.006,1.44,.25,.003,1.25,new THREE.MeshStandardMaterial({map:rt,roughness:1}));
// Authored potted plant provides scale and room context.
const potGeometry=new THREE.LatheGeometry([new THREE.Vector2(.13,0),new THREE.Vector2(.14,.025),new THREE.Vector2(.2,.32),new THREE.Vector2(.19,.345),new THREE.Vector2(.172,.345),new THREE.Vector2(.165,.3)],48);
const pot=new THREE.Mesh(potGeometry,material(0xc5a78a));pot.position.set(-.94,0,.0);pot.castShadow=true;pot.receiveShadow=true;scene.add(pot);
const soil=new THREE.Mesh(new THREE.CylinderGeometry(.164,.164,.012,48),material(0x4c4133));soil.position.set(-.94,.307,0);scene.add(soil);
const stem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.014,.78,12),material(0x6e7953));stem.position.set(-.94,.68,0);stem.castShadow=true;scene.add(stem);
for(let i=0;i<9;i++){const angle=i*2.35;const y=.49+i*.066;const branch=new THREE.Mesh(new THREE.CylinderGeometry(.002,.003,.22,8),material(0x62704c));branch.position.set(-.94+Math.sin(angle)*.082,y+.02,Math.cos(angle)*.082);branch.rotation.z=-Math.sin(angle)*.9;branch.rotation.x=Math.cos(angle)*.9;scene.add(branch);const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),i%2?green:material(0x7a8666));leaf.scale.set(.072,.016,.18);leaf.position.set(-.94+Math.sin(angle)*.19,y+.025,Math.cos(angle)*.19);leaf.rotation.set(.12*Math.cos(angle),angle,.12*Math.sin(angle));leaf.castShadow=true;leaf.receiveShadow=true;scene.add(leaf);}
// Small sculptural floor vase beside the cabinet, no props obscure cabinet wear.
const vase=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.1,0),new THREE.Vector2(.13,.03),new THREE.Vector2(.145,.17),new THREE.Vector2(.09,.33),new THREE.Vector2(.055,.38),new THREE.Vector2(.055,.43),new THREE.Vector2(.046,.43)],64),clay);vase.position.set(.84,0,.04);vase.castShadow=true;vase.receiveShadow=true;scene.add(vase);
scene.add(new THREE.HemisphereLight(0xfff9ec,0x817669,2.65));
const sun=new THREE.DirectionalLight(0xfff1d8,2.25);sun.position.set(-3.6,4.8,3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:15});sun.shadow.normalBias=.003;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun);
const fill=new THREE.DirectionalLight(0xe4eced,.65);fill.position.set(3,2.8,2);scene.add(fill);
const gltf=await new GLTFLoader().loadAsync('/assets/cabinet.glb');const model=gltf.scene;model.traverse(n=>{if(n.isMesh){n.castShadow=!n.name.startsWith('wear_');n.receiveShadow=true;if(n.material.transparent)n.material.depthWrite=false;}});scene.add(model);
if(kind==='detail'){model.getObjectByName('left_door_pivot').rotation.y=-THREE.MathUtils.degToRad(22);model.getObjectByName('drawer_slide').position.z+=.09;camera.position.set(1.78,1.6,2.47);camera.lookAt(0,.71,0);}
else{camera.position.set(2.06,1.9,3.45);camera.lookAt(-.07,.84,.04);}
model.updateMatrixWorld(true);renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));renderer.render(scene,camera);
window.renderedAsset={kind,width,height,data:renderer.domElement.toDataURL('image/webp',.94),partCount:model.children.length,bounds:new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).toArray()};
</script></body></html>`;

const mime={'.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/render'){res.setHeader('Content-Type','text/html');res.end(html);return;}
    let target;
    if(url.pathname==='/three/three.module.js')target=path.join(threeRoot,'build/three.module.js');
    else if(url.pathname==='/three/three.core.js')target=path.join(threeRoot,'build/three.core.js');
    else if(url.pathname.startsWith('/three/addons/'))target=path.join(threeRoot,'examples/jsm',url.pathname.slice('/three/addons/'.length));
    else if(url.pathname.startsWith('/assets/'))target=path.join(root,'public',url.pathname);
    else {res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(await fs.readFile(target));
  } catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:await testBrowserPath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1600,height:1150},deviceScaleFactor:1});page.on('pageerror',error=>errors.push(error.message));
  for(const [kind,name] of [['hero','room-cabinet-hero.webp'],['detail','room-cabinet-detail.webp']]){
    await page.goto('http://127.0.0.1:'+server.address().port+'/render?kind='+kind);await page.waitForFunction(()=>window.renderedAsset,{timeout:60000});
    const asset=await page.evaluate(()=>window.renderedAsset);await fs.writeFile(path.join(root,'public/images',name),Buffer.from(asset.data.split(',')[1],'base64'));
    console.log(JSON.stringify({name,width:asset.width,height:asset.height,bounds:asset.bounds}));
  }
  if(errors.length)throw Error(errors.join('\n'));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
