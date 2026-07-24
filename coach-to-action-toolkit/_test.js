'use strict';

// Drives the real toolkit HTML files in jsdom to confirm the interactive bits
// actually work: the picker flow, localStorage save and restore in the 30 day
// plan and the workbook, prompt search and copy.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };

function boot(file, storage) {
  // Seed localStorage in beforeParse, which runs BEFORE the page scripts do.
  // Setting it afterwards would be too late: the page has already read it.
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/' + file,
    beforeParse(window) {
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = function () {};
      if (storage) Object.keys(storage).forEach((k) => window.localStorage.setItem(k, storage[k]));
    },
  });
  return dom;
}

// Re-run the page scripts against an existing localStorage to simulate a reload.
function reload(file, dom) {
  const store = {};
  for (let i = 0; i < dom.window.localStorage.length; i++) {
    const k = dom.window.localStorage.key(i);
    store[k] = dom.window.localStorage.getItem(k);
  }
  return boot(file, store);
}

console.log('Test: coach-picker-guide.html');
{
  const dom = boot('coach-picker-guide.html');
  const doc = dom.window.document;
  const types = doc.querySelectorAll('#typeTiles .tile');
  const chs = doc.querySelectorAll('#chTiles .tile');
  ok(types.length >= 12, 'at least 12 business types, got ' + types.length);
  ok(chs.length === 8, '8 challenges, got ' + chs.length);
  ok(doc.getElementById('step2').hidden, 'step 2 hidden before choosing');
  types[0].click();
  ok(!doc.getElementById('step2').hidden, 'step 2 shows after picking a type');
  chs[0].click();
  const res = doc.getElementById('result');
  ok(!res.hidden, 'result shows after picking a challenge');
  ok(res.querySelectorAll('.pick').length === 5, 'exactly 5 coaches recommended, got ' + res.querySelectorAll('.pick').length);
  const links = res.querySelectorAll('.pick a.btn');
  ok(links.length === 5, '5 open buttons');
  ok(Array.prototype.every.call(links, (a) => a.target === '_blank' && /#[a-z0-9-]+$/.test(a.href)), 'all open in new tab with a hash link');
  doc.getElementById('again').click();
  ok(doc.getElementById('result').hidden, 'Start again resets the result');
}

console.log('Test: 30-day-coaching-plan.html localStorage');
{
  let dom = boot('30-day-coaching-plan.html');
  let doc = dom.window.document;
  ok(doc.querySelectorAll('.day').length === 30, '30 day cards, got ' + doc.querySelectorAll('.day').length);
  ok(doc.querySelectorAll('.day .btn').length === 28, '28 coach buttons (days 29 and 30 are review)');
  ok(/0 of 30 days done/.test(doc.getElementById('pcount').textContent), 'starts at 0 of 30');
  const boxes = doc.querySelectorAll('.tick input');
  boxes[0].checked = true; boxes[0].dispatchEvent(new dom.window.Event('change'));
  boxes[1].checked = true; boxes[1].dispatchEvent(new dom.window.Event('change'));
  ok(/2 of 30 days done/.test(doc.getElementById('pcount').textContent), 'counter updates to 2');
  ok(doc.querySelectorAll('.day.done').length === 2, 'two cards marked done');
  const saved = dom.window.localStorage.getItem('ctat_plan30_v1');
  ok(!!saved && JSON.parse(saved).d1 === true, 'ticks written to localStorage');
  // simulate a reload
  dom = reload('30-day-coaching-plan.html', dom);
  doc = dom.window.document;
  ok(/2 of 30 days done/.test(doc.getElementById('pcount').textContent), 'ticks restored after reload');
  ok(doc.querySelectorAll('.day.done').length === 2, 'done styling restored after reload');
  ok(doc.querySelectorAll('.tick input')[0].checked === true, 'checkbox restored as checked');
}

console.log('Test: report-to-action-workbook.html localStorage');
{
  let dom = boot('report-to-action-workbook.html');
  let doc = dom.window.document;
  ok(doc.querySelectorAll('#diagnosis,#strategy,#actions,#next').length === 4, 'four report paste areas');
  ok(doc.querySelectorAll('.act').length === 3, 'three action rows');
  ok(doc.querySelectorAll('#wk1,#wk2,#wk3,#wk4').length === 4, 'four weekly intention fields');
  const d = doc.getElementById('diagnosis');
  d.value = 'My prices are too low'; d.dispatchEvent(new dom.window.Event('input'));
  const a1 = doc.getElementById('act1');
  a1.value = 'Raise my prices'; a1.dispatchEvent(new dom.window.Event('input'));
  const w1 = doc.getElementById('when1');
  w1.value = 'Tuesday'; w1.dispatchEvent(new dom.window.Event('input'));
  const c1 = doc.getElementById('done1');
  c1.checked = true; c1.dispatchEvent(new dom.window.Event('change'));
  const saved = JSON.parse(dom.window.localStorage.getItem('ctat_workbook_v1') || '{}');
  ok(saved.diagnosis === 'My prices are too low', 'text saved to localStorage');
  ok(saved.done1 === true, 'tick saved to localStorage');
  ok(/Saved just now/.test(doc.getElementById('savedNote').textContent), 'shows a saved confirmation');
  // reload
  dom = reload('report-to-action-workbook.html', dom);
  doc = dom.window.document;
  ok(doc.getElementById('diagnosis').value === 'My prices are too low', 'text restored after reload');
  ok(doc.getElementById('when1').value === 'Tuesday', 'when field restored');
  ok(doc.getElementById('done1').checked === true, 'tick restored');
  // copy as text
  let copied = '';
  dom.window.navigator.clipboard = { writeText: (t) => { copied = t; return Promise.resolve(); } };
  doc.getElementById('copyBtn').click();
  ok(/MY COACHING PLAN/.test(copied) && /Raise my prices/.test(copied), 'copy as text produces a tidy plan');
  ok(/\[x\]/.test(copied), 'copied text shows the done tick');
}

console.log('Test: prompt-pack-expansion.html');
{
  const dom = boot('prompt-pack-expansion.html');
  const doc = dom.window.document;
  ok(doc.querySelectorAll('.pcard').length === 100, 'exactly 100 prompts rendered, got ' + doc.querySelectorAll('.pcard').length);
  ok(doc.querySelectorAll('.cat').length === 10, '10 categories, got ' + doc.querySelectorAll('.cat').length);
  ok(doc.querySelectorAll('.tab').length === 11, 'All tab plus 10 category tabs');
  ok(/100 prompts showing/.test(doc.getElementById('count').textContent), 'count shows 100');
  // category filter
  doc.querySelectorAll('.tab')[1].click();
  ok(doc.querySelectorAll('.pcard').length === 10, 'category tab filters to 10');
  doc.querySelectorAll('.tab')[0].click();
  // search
  const s = doc.getElementById('search');
  s.value = 'price'; s.dispatchEvent(new dom.window.Event('input'));
  const n = doc.querySelectorAll('.pcard').length;
  ok(n > 0 && n < 100, 'search narrows results, got ' + n);
  s.value = 'zzzznotathing'; s.dispatchEvent(new dom.window.Event('input'));
  ok(doc.querySelector('.empty') !== null, 'shows a friendly empty state');
  s.value = ''; s.dispatchEvent(new dom.window.Event('input'));
  // copy
  let copied = '';
  dom.window.navigator.clipboard = { writeText: (t) => { copied = t; return Promise.resolve(); } };
  doc.querySelector('.pcard .copy').click();
  ok(copied.length > 60, 'single copy puts the prompt on the clipboard');
  ok(doc.querySelector('a.btn[href="https://claude.ai"]') !== null, 'Open Claude button present');
}

console.log('Test: shared shell on every page');
{
  ['index.html', 'coach-picker-guide.html', '30-day-coaching-plan.html',
    'report-to-action-workbook.html', 'prompt-pack-expansion.html'].forEach((f) => {
    const html = fs.readFileSync(path.join(__dirname, f), 'utf8');
    ok(/nav class="nav"/.test(html), f + ' has the nav bar');
    ok((html.match(/class="nav"[\s\S]*?<\/nav>/)[0].match(/<a /g) || []).length === 5, f + ' nav links all 5 pages');
    ok(/not legal, financial, or medical advice/.test(html), f + ' has the disclaimer');
    ok(/Open your vault of 1000 coaches/.test(html), f + ' links back to the vault');
    ok(/Playfair\+Display/.test(html) && /Nunito/.test(html), f + ' loads both fonts');
    ok(/#1A0A2E/.test(html) && /#C9B8E8/.test(html), f + ' uses the brand colours');
  });
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
