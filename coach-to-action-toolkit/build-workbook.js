'use strict';

// FILE 4: report-to-action-workbook.html, Module 3.
// A fillable workbook that turns any coaching report into a weekly plan.
// Everything auto-saves to localStorage, so nothing ever leaves her device.

const { page } = require('./_shell');

const REPORT_FIELDS = [
  { id: 'diagnosis', label: 'Your Diagnosis', hint: 'Paste what your coach said about where you are right now.' },
  { id: 'strategy', label: 'Your Strategy', hint: 'Paste the recommended approach for your situation.' },
  { id: 'actions', label: 'Your Action Steps', hint: 'Paste the numbered list of next moves.' },
  { id: 'next', label: 'Your Next Moves', hint: 'Paste what your coach suggested for this week, month and quarter.' },
];

function buildWorkbook() {
  const body =
    '<header class="hero"><div class="kicker">Module 3</div><h1>The Report-To-Action Workbook</h1>' +
    '<p>A coaching report is lovely to read. This turns it into a plan you will actually follow. Fill it in as you go, it saves itself.</p></header>' +

    '<section class="panel no-print"><div class="saved"><span class="dot"></span><span id="savedNote">Your words save automatically on this device</span></div>' +
    '<p class="lead" style="margin-top:10px;margin-bottom:0">Everything you type stays in this browser on this device. It is private, it never leaves your computer, and nobody else can see it.</p></section>' +

    '<section class="panel"><h2>Section A, My Coaching Report</h2>' +
    '<p class="lead">Open a coach, get your report, then paste each part in below.</p>' +
    REPORT_FIELDS.map((f) =>
      '<label class="field"><span class="q">' + f.label + '</span>' +
      '<span class="hint">' + f.hint + '</span>' +
      '<textarea id="' + f.id + '" rows="4" placeholder="Paste here..."></textarea></label>').join('') +
    '</section>' +

    '<section class="panel"><h2>Section B, My Weekly Plan</h2>' +
    '<p class="lead">Now make it small and doable. One focus, three actions, that is plenty.</p>' +
    '<label class="field"><span class="q">The one thing I am fixing this week</span>' +
    '<span class="hint">Just one. The rest can wait.</span>' +
    '<textarea id="onething" rows="2" placeholder="This week I am focusing on..."></textarea></label>' +
    '<div class="q" style="margin-bottom:8px">My three actions</div>' +
    '<div class="acts">' +
    [1, 2, 3].map((i) =>
      '<div class="act"><div class="anum">' + i + '</div>' +
      '<input type="text" id="act' + i + '" placeholder="What I will do">' +
      '<input type="text" id="when' + i + '" placeholder="When I will do it">' +
      '<label class="tick"><input type="checkbox" id="done' + i + '"> Done</label></div>').join('') +
    '</div>' +
    '<label class="field" style="margin-top:16px"><span class="q">What I will say no to this week</span>' +
    '<span class="hint">Protecting your time is part of the plan.</span>' +
    '<textarea id="sayno" rows="2" placeholder="I am saying no to..."></textarea></label>' +
    '<label class="field"><span class="q">How I will know it worked</span>' +
    '<span class="hint">One simple sign. It does not have to be a number.</span>' +
    '<textarea id="knew" rows="2" placeholder="I will know it worked when..."></textarea></label>' +
    '</section>' +

    '<section class="panel"><h2>Section C, My Month at a Glance</h2>' +
    '<p class="lead">One line per week. A gentle sense of direction, not a rigid plan.</p>' +
    [1, 2, 3, 4].map((i) =>
      '<label class="field"><span class="q">Week ' + i + '</span>' +
      '<input type="text" id="wk' + i + '" placeholder="My intention for week ' + i + '"></label>').join('') +
    '</section>' +

    '<section class="panel no-print"><div class="btn-row">' +
    '<button class="btn" id="printBtn">Print my plan</button>' +
    '<button class="btn sec" id="copyBtn">Copy my plan as text</button>' +
    '<button class="btn sec" id="clearBtn">Clear and start a new week</button>' +
    '</div></section>';

  const css =
    '.saved{display:flex;align-items:center;gap:9px;font-size:14px;color:var(--muted)}' +
    '.saved .dot{width:9px;height:9px;border-radius:50%;background:var(--green);flex:0 0 auto;box-shadow:0 0 0 4px rgba(34,197,94,.16)}' +
    'label.field{display:block;margin-bottom:16px}' +
    '.q{display:block;font-weight:800;font-size:15.5px;margin-bottom:3px}' +
    '.hint{display:block;color:var(--muted);font-size:13.5px;margin-bottom:7px}' +
    'textarea,input[type=text]{width:100%;font-family:inherit;font-size:15.5px;color:var(--text);background:var(--bg);' +
    'border:1px solid var(--border);border-radius:11px;padding:12px 13px;transition:border-color .15s,box-shadow .15s}' +
    'textarea{resize:vertical;min-height:62px}' +
    'textarea:focus,input[type=text]:focus{outline:none;border-color:var(--accent2);box-shadow:0 0 0 3px rgba(139,92,246,.26)}' +
    '::placeholder{color:rgba(168,155,194,.55)}' +
    '.acts{display:grid;gap:10px}' +
    '.act{display:grid;grid-template-columns:34px 1fr 1fr auto;gap:9px;align-items:center;' +
    'background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 12px}' +
    '.act input[type=text]{background:transparent;border:none;padding:6px 4px;border-bottom:1px solid var(--border);border-radius:0}' +
    '.act input[type=text]:focus{box-shadow:none;border-bottom-color:var(--accent2)}' +
    '.anum{width:28px;height:28px;border-radius:8px;background:rgba(201,184,232,.16);color:var(--accent);' +
    'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13.5px}' +
    '.tick{display:flex;align-items:center;gap:7px;font-size:13.5px;color:var(--muted);cursor:pointer;white-space:nowrap}' +
    '.tick input{width:18px;height:18px;accent-color:var(--accent2);cursor:pointer}' +
    '@media(max-width:620px){.act{grid-template-columns:28px 1fr;grid-auto-rows:auto}' +
    '.act .tick{grid-column:1 / -1;justify-content:flex-end}}' +
    '@media print{textarea,input[type=text]{border:1px solid #bbb;color:#000;background:#fff;min-height:auto}' +
    '.hint{color:#555}.saved{display:none}.act{border:1px solid #bbb;background:#fff}' +
    '.anum{background:#eee;color:#000}}';

  const ids = REPORT_FIELDS.map((f) => f.id)
    .concat(['onething', 'sayno', 'knew'])
    .concat([1, 2, 3].map((i) => 'act' + i))
    .concat([1, 2, 3].map((i) => 'when' + i))
    .concat([1, 2, 3, 4].map((i) => 'wk' + i));
  const checks = [1, 2, 3].map((i) => 'done' + i);

  const script =
    'var IDS=' + JSON.stringify(ids) + ',CHECKS=' + JSON.stringify(checks) + ',KEY="ctat_workbook_v1";' +
    'function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}' +
    'function save(){var s={};IDS.forEach(function(id){var e=document.getElementById(id);if(e)s[id]=e.value;});' +
    'CHECKS.forEach(function(id){var e=document.getElementById(id);if(e)s[id]=e.checked;});' +
    'try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}flash();}' +
    'var note=document.getElementById("savedNote"),t;' +
    'function flash(){note.textContent="Saved just now on this device";clearTimeout(t);' +
    't=setTimeout(function(){note.textContent="Your words save automatically on this device";},1800);}' +
    'var data=load();' +
    'IDS.forEach(function(id){var e=document.getElementById(id);if(!e)return;if(data[id])e.value=data[id];' +
    'e.addEventListener("input",save);});' +
    'CHECKS.forEach(function(id){var e=document.getElementById(id);if(!e)return;if(data[id])e.checked=true;' +
    'e.addEventListener("change",save);});' +
    'function val(id){var e=document.getElementById(id);return e&&e.value.trim()?e.value.trim():"";}' +
    'function asText(){var L=[];L.push("MY COACHING PLAN");L.push("");' +
    'L.push("== MY COACHING REPORT ==");' +
    ' [["Your Diagnosis","diagnosis"],["Your Strategy","strategy"],["Your Action Steps","actions"],["Your Next Moves","next"]]' +
    '.forEach(function(p){if(val(p[1])){L.push(p[0]+":");L.push(val(p[1]));L.push("");}});' +
    'L.push("== MY WEEKLY PLAN ==");' +
    'if(val("onething"))L.push("The one thing I am fixing this week: "+val("onething"));' +
    'L.push("");L.push("My three actions:");' +
    '[1,2,3].forEach(function(i){var a=val("act"+i);if(!a)return;var wn=val("when"+i);' +
    'var dn=document.getElementById("done"+i).checked?"[x]":"[ ]";' +
    'L.push("  "+dn+" "+i+". "+a+(wn?"  (when: "+wn+")":""));});' +
    'L.push("");if(val("sayno"))L.push("Saying no to: "+val("sayno"));' +
    'if(val("knew"))L.push("I will know it worked when: "+val("knew"));' +
    'L.push("");L.push("== MY MONTH AT A GLANCE ==");' +
    '[1,2,3,4].forEach(function(i){if(val("wk"+i))L.push("Week "+i+": "+val("wk"+i));});' +
    'return L.join("\\n");}' +
    'document.getElementById("printBtn").onclick=function(){window.print();};' +
    'document.getElementById("copyBtn").onclick=function(){var b=this,txt=asText();' +
    'function done(){b.textContent="Copied";b.classList.add("ok");' +
    'setTimeout(function(){b.textContent="Copy my plan as text";b.classList.remove("ok");},1800);}' +
    'if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done,function(){fb(txt);done();});}' +
    'else{fb(txt);done();}};' +
    'function fb(txt){var ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";' +
    'document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(ta);}' +
    'document.getElementById("clearBtn").onclick=function(){' +
    'if(!confirm("This clears everything you have written here and starts a fresh week. Are you sure?"))return;' +
    'IDS.forEach(function(id){var e=document.getElementById(id);if(e)e.value="";});' +
    'CHECKS.forEach(function(id){var e=document.getElementById(id);if(e)e.checked=false;});' +
    'try{localStorage.removeItem(KEY);}catch(e){}window.scrollTo({top:0,behavior:"smooth"});};';

  return page({ file: 'report-to-action-workbook.html',
    title: 'The Report-To-Action Workbook | The Coach-To-Action Toolkit',
    description: 'Turn any coaching report into a simple weekly plan you will actually follow.',
    css, body, script });
}

module.exports = { buildWorkbook };

if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const html = buildWorkbook();
  fs.writeFileSync(path.join(__dirname, 'report-to-action-workbook.html'), html);
  console.log('report-to-action-workbook.html  ' + Buffer.byteLength(html) + ' bytes');
}
