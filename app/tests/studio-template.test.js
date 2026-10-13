import test from 'node:test';
import assert from 'node:assert/strict';
import { studioHTML, studioPanelHTML, studioChapters } from '../src/studio.js';
const report={name:'Lemari Sora',note:'',views:['front'],conditionNotes:[],dimensionsConfirmed:false};
const room={width:3.2,depth:3,x:0,z:-.4,rotation:0,fixture:'clear'};
const ctx={chapter:0,report,room,free:false};
test('free exploration exposes all five direct tools and no chapter navigation',()=>{
 const html=studioPanelHTML({...ctx,free:true,mode:'free'});
 for(const tool of ['model','condition','opening','size','room']) assert.ok(html.includes(`data-tool="${tool}"`),`missing ${tool}`);
 assert.ok(!html.includes('data-action="next-chapter"'));
 assert.ok(!html.includes('data-action="prev-chapter"'));
});
test('guided chapters retain one navigation pair and a persistent canvas',()=>{
 for(let chapter=0;chapter<studioChapters.length;chapter++) {
  const html=studioHTML({...ctx,chapter});
  assert.equal((html.match(/id="stage"/g)||[]).length,1);
  assert.equal((html.match(/data-action="prev-chapter"/g)||[]).length,1);
  assert.equal((html.match(/data-action="(?:next-chapter|restart-studio)"/g)||[]).length,1);
  assert.ok(html.includes('class="studio-panel-body"'));
  assert.ok(html.includes('id="studio-mode-bar"'));
 }
});
test('opening tools expose independent motion values from the current scene',()=>{
 const html=studioPanelHTML({...ctx,free:true,tool:'opening',motions:{left:35,right:80,drawer:.12}});
 assert.match(html,/data-motion="left"[^>]*value="35"/);
 assert.match(html,/data-motion="right"[^>]*value="80"/);
 assert.match(html,/data-motion="drawer"[^>]*value="12"/);
});
test('room tools expose compact sections and save/reset/undo without forced advance',()=>{
 for(const roomTab of ['size','position','fixtures']) {
  const html=studioPanelHTML({...ctx,free:true,tool:'room',roomTab});
  for(const tab of ['size','position','fixtures']) { assert.ok(html.includes(`data-room-tab="${tab}"`)); assert.ok(html.includes(`data-room-panel="${tab}"`)); }
  for(const action of ['save-placement','reset-placement','undo-placement']) assert.ok(html.includes(`data-action="${action}"`));
  for(const id of ['fit-body','fit-doors','fit-drawer']) assert.ok(html.includes(`id="${id}"`));
  assert.ok(!html.includes('data-action="next-chapter"'));
 }
});
