import test from 'node:test';
import assert from 'node:assert/strict';
import { createCapture, markArea, CAPTURE_AREAS } from '../src/capture.js';
import * as ui from '../src/capture-ui.js';

const actionCount=(html, action)=>(html.match(new RegExp(`data-action="${action}"`, 'g'))||[]).length;

test('capture offers one recording action and advances only after an explicit decision', () => {
  const session={...createCapture(),phase:'capture'};
  const pending=ui.captureHTML(session);
  assert.equal(actionCount(pending,'capture-photo'),1);
  assert.equal(actionCount(pending,'skip-area'),1);
  assert.equal(actionCount(pending,'next-area'),0);
  for(const status of ['captured','skipped']) {
    const decided=ui.captureHTML(markArea(session,'front',status));
    assert.equal(actionCount(decided,'capture-photo'),0);
    assert.equal(actionCount(decided,'next-area'),1);
    assert.equal(actionCount(decided,'mark-active-retake'),1);
  }
});

test('every capture phase has a persistent dock with one primary phase action', () => {
  for(const [phase,action] of [['prepare','start-capture'],['capture','capture-photo'],['review','publish-capture'],['ready','preview-draft']]) {
    const html=ui.captureHTML({...createCapture(),phase});
    assert.match(html,/<footer class="capture-action-dock"/);
    assert.match(html,/<div class="capture-content"/);
    assert.equal(actionCount(html,action),1);
  }
});

test('review keeps all editable fields while selecting a compact review tab', () => {
  const session={...createCapture(),phase:'review'};
  const html=ui.captureHTML(session,'',{reviewTab:'notes'});
  assert.match(html,/class="capture-content" data-review-tab="notes"/);
  for(const panel of ['photos','notes','size']) assert.match(html,new RegExp(`data-review-panel="${panel}"`));
  assert.match(html,/id="dimensions-confirmed"/);
  assert.match(html,/data-condition-note="scratch"/);
  assert.match(html,/9 area belum memiliki bukti/);
});

test('the area picker exposes every canonical area with an honest status', () => {
  assert.equal(typeof ui.captureAreaPickerHTML,'function');
  const session=markArea(createCapture(),'front','captured');
  const html=ui.captureAreaPickerHTML(session);
  for(const area of CAPTURE_AREAS) assert.equal((html.match(new RegExp(`data-area="${area.id}"`, 'g'))||[]).length,1);
  assert.match(html,/Terekam/);
  assert.match(html,/Belum direkam/);
  assert.match(html,/1\/9/);
});

test('retake removes the next action and the final decision offers finishing without a duplicate review name', () => {
  const session={...createCapture(),phase:'capture'};
  const retake=ui.captureHTML(markArea(session,'front','retake'));
  assert.equal(actionCount(retake,'capture-photo'),1);
  assert.equal(actionCount(retake,'next-area'),0);
  const final=ui.captureHTML(markArea(session,CAPTURE_AREAS.at(-1).id,'skipped'));
  assert.match(final,/data-action="next-area"[^>]*>Selesai merekam/);
  assert.equal(actionCount(final,'review-capture'),1);
});

test('review tab selection remains bounded and report text is escaped', () => {
  const session={...createCapture(),phase:'review'};
  session.report.name='<img src=x onerror=alert(1)>';
  session.report.conditionNotes=[{id:'scratch',note:'</textarea><script>alert(1)</script>'}];
  const html=ui.captureHTML(session,'',{reviewTab:'<script>'});
  assert.match(html,/class="capture-content" data-review-tab="photos"/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html,/&lt;\/textarea&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.equal(html.includes('<script>'),false);
});
