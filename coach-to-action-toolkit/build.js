'use strict';

// Builds all five static HTML files for The Coach-To-Action Toolkit.
// Run: node coach-to-action-toolkit/build.js

const fs = require('fs');
const path = require('path');
const { page, VAULT, CLAUDE } = require('./_shell');
const D = require('./_data');

const OUT = __dirname;
const w = (file, html) => { fs.writeFileSync(path.join(OUT, file), html); return Buffer.byteLength(html); };
const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

/* ===================== FILE 1: index.html, the hub ===================== */

const MODULES = [
  { n: 1, file: 'coach-picker-guide.html', name: 'Coach Picker Guide',
    desc: 'Answer two quick questions and get your personal starting line-up of five coaches.' },
  { n: 2, file: '30-day-coaching-plan.html', name: 'The 30-Day Coaching Plan',
    desc: 'A gentle day by day plan for your first month, with a real coach for every day.' },
  { n: 3, file: 'report-to-action-workbook.html', name: 'The Report-To-Action Workbook',
    desc: 'Turn any coaching report into a simple weekly plan you will actually follow.' },
  { n: 4, file: 'prompt-pack-expansion.html', name: 'The Prompt Pack Expansion',
    desc: '100 extra ready-to-paste Claude prompts, going deeper than the reports.' },
];

function buildIndex() {
  const cards = MODULES.map((m) => (
    '<article class="mod">' +
    '<div class="mn">Module ' + m.n + '</div>' +
    '<h3>' + esc(m.name) + '</h3>' +
    '<p>' + esc(m.desc) + '</p>' +
    '<a class="btn" href="' + m.file + '">Open Module ' + m.n + '</a>' +
    '</article>'
  )).join('');

  const body =
    '<header class="hero">' +
    '<div class="kicker">A companion to your 1000 coaches</div>' +
    '<h1>The Coach-To-Action Toolkit</h1>' +
    '<p>Your vault gives you the coaching. This toolkit helps you act on it. Pick the right coach for where you are, build a gentle habit, turn your report into a plan you will actually follow, and go deeper with Claude whenever you want more.</p>' +
    '</header>' +
    '<section class="grid">' + cards + '</section>' +
    '<section class="panel"><h2>Not sure where to begin?</h2>' +
    '<p class="lead">Start with Module 1. It takes about a minute and tells you exactly which five coaches to open first.</p>' +
    '<div class="btn-row"><a class="btn" href="coach-picker-guide.html">Find my starting coaches</a>' +
    '<a class="btn sec" href="' + VAULT + '" target="_blank" rel="noopener">Browse all 1000 coaches</a></div></section>';

  const css =
    '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:20px}' +
    '.mod{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 20px;display:flex;flex-direction:column;gap:9px}' +
    '.mn{display:inline-block;align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;' +
    'color:var(--accent);background:rgba(139,92,246,.18);border:1px solid var(--border);border-radius:999px;padding:4px 11px}' +
    '.mod h3{font-size:20px;line-height:1.25}.mod p{color:var(--muted);font-size:14.5px;flex:1}' +
    '.mod .btn{margin-top:6px;width:100%}';

  return page({ file: 'index.html', title: 'The Coach-To-Action Toolkit',
    description: 'A companion toolkit to your 1000 AI Business Coaches. Pick your coach, build the habit, act on your report, and go deeper with Claude.',
    css, body });
}

/* ============ FILE 2: coach-picker-guide.html, Module 1 =============== */

function buildPicker() {
  const types = D.BUSINESS_TYPES.map((b) => {
    const c = D.resolve(b.slug);
    return { label: b.label, icon: b.icon, title: c.title, url: c.url };
  });
  const challenges = D.CHALLENGES.map((c) => {
    const p = D.resolve(c.primary);
    const rel = c.related.map(D.resolve);
    return { key: c.key, label: c.label,
      coaches: [{ title: p.title, url: p.url, why: c.why[0] },
        { title: rel[0].title, url: rel[0].url, why: c.why[1] },
        { title: rel[1].title, url: rel[1].url, why: c.why[2] }] };
  });
  const found = D.resolve(D.FOUNDATION.slug);

  const body =
    '<header class="hero"><div class="kicker">Module 1</div><h1>Coach Picker Guide</h1>' +
    '<p>Two quick questions, and you will know exactly which five coaches to open first. Nothing you pick leaves this page.</p></header>' +
    '<section class="panel" id="step1"><h2>First, what kind of business do you run?</h2>' +
    '<p class="lead">Pick the closest match. It does not have to be perfect.</p>' +
    '<div class="tiles" id="typeTiles"></div></section>' +
    '<section class="panel" id="step2" hidden><h2>And what is your biggest challenge right now?</h2>' +
    '<p class="lead">Just pick the one that is bothering you most today.</p>' +
    '<div class="tiles" id="chTiles"></div>' +
    '<div class="btn-row"><button class="btn sec" id="backBtn">Back to business type</button></div></section>' +
    '<section id="result" hidden></section>';

  const css =
    '.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}' +
    '.tile{cursor:pointer;font-family:inherit;text-align:left;background:var(--bg);border:1px solid var(--border);' +
    'border-radius:13px;padding:14px 15px;color:var(--text);font-size:15px;font-weight:700;transition:all .14s;display:flex;align-items:center;gap:11px}' +
    '.tile:hover{border-color:var(--accent2);transform:translateY(-2px)}' +
    '.tile.on{background:rgba(139,92,246,.2);border-color:var(--accent2)}' +
    '.tile .ic{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:rgba(201,184,232,.16);color:var(--accent);' +
    'display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:800}' +
    '.pick{background:var(--card);border:1px solid var(--border);border-radius:15px;padding:17px 18px;margin-bottom:12px}' +
    '.pick .tag{font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);margin-bottom:5px;display:block}' +
    '.pick h4{font-size:18.5px;margin-bottom:5px;font-family:"Playfair Display",serif}' +
    '.pick p{color:var(--muted);font-size:14.5px;margin-bottom:12px}' +
    '.pick .btn{font-size:14.5px;padding:11px 18px}';

  const script =
    'var TYPES=' + JSON.stringify(types) + ',CH=' + JSON.stringify(challenges) + ',FOUND=' +
    JSON.stringify({ title: found.title, url: found.url, why: D.FOUNDATION.why }) + ';' +
    'var chosenType=null;' +
    'var s1=document.getElementById("step1"),s2=document.getElementById("step2"),res=document.getElementById("result");' +
    'var tt=document.getElementById("typeTiles"),ct=document.getElementById("chTiles");' +
    'function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}' +
    'function esc(s){return String(s).replace(/[&<>"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[m];});}' +
    'TYPES.forEach(function(t){var b=el("button","tile");b.type="button";' +
    'b.appendChild(el("span","ic",esc(t.icon)));b.appendChild(el("span",null,esc(t.label)));' +
    'b.onclick=function(){chosenType=t;Array.prototype.forEach.call(tt.children,function(n){n.classList.remove("on");});b.classList.add("on");' +
    's2.hidden=false;res.hidden=true;s2.scrollIntoView({behavior:"smooth",block:"start"});};tt.appendChild(b);});' +
    'CH.forEach(function(c){var b=el("button","tile");b.type="button";' +
    'b.appendChild(el("span","ic","?"));b.appendChild(el("span",null,esc(c.label)));' +
    'b.onclick=function(){Array.prototype.forEach.call(ct.children,function(n){n.classList.remove("on");});b.classList.add("on");show(c);};ct.appendChild(b);});' +
    'document.getElementById("backBtn").onclick=function(){s2.hidden=true;res.hidden=true;s1.scrollIntoView({behavior:"smooth"});};' +
    'function card(tag,title,why,url){return \'<div class="pick"><span class="tag">\'+esc(tag)+\'</span><h4>\'+esc(title)+\'</h4><p>\'+esc(why)+\'</p>\'+' +
    '\'<a class="btn" href="\'+url+\'" target="_blank" rel="noopener">Open this coach</a></div>\';}' +
    'function show(c){var h=\'<div class="panel"><h2>Your starting line-up</h2>\'+' +
    '\'<p class="lead">Five coaches, in the order I would open them. Work through one at a time, there is no rush.</p>\'+' +
    'card("Made for your business",chosenType.title,"This one knows your world, so start by getting the basics right for a business like yours.",chosenType.url)+' +
    'c.coaches.map(function(x,i){return card(i===0?"Your main challenge":"Go a little deeper",x.title,x.why,x.url);}).join("")+' +
    'card("Good for everyone",FOUND.title,FOUND.why,FOUND.url)+' +
    '\'<div class="btn-row"><button class="btn sec" id="again">Start again</button></div></div>\';' +
    'res.innerHTML=h;res.hidden=false;res.scrollIntoView({behavior:"smooth",block:"start"});' +
    'document.getElementById("again").onclick=function(){chosenType=null;res.hidden=true;s2.hidden=true;' +
    'Array.prototype.forEach.call(tt.children,function(n){n.classList.remove("on");});' +
    'Array.prototype.forEach.call(ct.children,function(n){n.classList.remove("on");});' +
    'window.scrollTo({top:0,behavior:"smooth"});};}';

  return page({ file: 'coach-picker-guide.html', title: 'Coach Picker Guide | The Coach-To-Action Toolkit',
    description: 'Answer two quick questions and get your personal starting line-up of five coaches.',
    css, body, script });
}

/* ============ FILE 3: 30-day-coaching-plan.html, Module 2 ============= */

function buildPlan() {
  const days = D.PLAN.map((p) => {
    const c = D.resolve(p.slug);
    return { d: p.d, w: p.w, title: c.title, url: c.url, take: p.take };
  });
  const review = D.REVIEW_DAYS.map((r) => ({ d: r.d, w: r.w, title: r.title, take: r.take, review: true }));
  const all = days.concat(review);

  const body =
    '<header class="hero"><div class="kicker">Module 2</div><h1>The 30-Day Coaching Plan</h1>' +
    '<p>One coach a day for your first month. Tick them off as you go. Miss a day and nothing breaks, the plan simply waits for you.</p></header>' +
    '<section class="panel no-print"><div class="prog"><div class="bar"><span id="fill"></span></div>' +
    '<div class="ptext"><strong id="pcount">0 of 30 days done</strong><span id="pmsg">Whenever you are ready, start with Day 1.</span></div></div>' +
    '<div class="btn-row"><button class="btn sec" id="printBtn">Print my plan</button>' +
    '<button class="btn sec" id="resetBtn">Clear my ticks</button></div></section>' +
    '<div id="weeks"></div>';

  const css =
    '.prog .bar{height:10px;border-radius:999px;background:var(--bg);border:1px solid var(--border);overflow:hidden}' +
    '.prog .bar span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--accent2),#22C55E);transition:width .3s}' +
    '.ptext{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;margin-top:9px}' +
    '.ptext strong{font-size:15px}.ptext span{color:var(--muted);font-size:14px}' +
    '.wk{margin-bottom:26px}.wk h2{font-size:22px;margin-bottom:3px}.wk .wn{color:var(--muted);font-size:14px;margin-bottom:14px}' +
    '.days{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:13px}' +
    '.day{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:15px 16px;display:flex;flex-direction:column;gap:7px}' +
    '.day.done{border-color:var(--green);background:rgba(34,197,94,.09)}' +
    '.dh{display:flex;justify-content:space-between;align-items:center;gap:8px}' +
    '.dn{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}' +
    '.day h4{font-size:16.5px;line-height:1.28;font-family:"Playfair Display",serif}' +
    '.day p{color:var(--muted);font-size:13.8px;flex:1}' +
    '.day .btn{font-size:13.5px;padding:9px 15px;width:100%}' +
    '.tick{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13.5px;color:var(--muted);user-select:none}' +
    '.tick input{width:19px;height:19px;accent-color:var(--accent2);cursor:pointer;flex:0 0 auto}' +
    '.day.rev{background:var(--bg2);border-style:dashed}' +
    '@media print{.days{grid-template-columns:repeat(2,1fr);gap:7px}.day{padding:8px 10px;border:1px solid #ccc;background:#fff}' +
    '.day h4{font-size:12px}.day p{font-size:10.5px;color:#333}.dn{color:#555}.wk h2{font-size:15px}.hero p{display:none}' +
    '.tick{font-size:10px;color:#555}}';

  const script =
    'var DAYS=' + JSON.stringify(all) + ',WEEKS=' + JSON.stringify(D.WEEKS) + ',KEY="ctat_plan30_v1";' +
    'function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}' +
    'function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}' +
    'var state=load();' +
    'function esc(s){return String(s).replace(/[&<>"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[m];});}' +
    'var wrap=document.getElementById("weeks");' +
    'WEEKS.forEach(function(wk){var sec=document.createElement("section");sec.className="wk";' +
    'sec.innerHTML=\'<h2>\'+esc(wk.title)+\'</h2><p class="wn">\'+esc(wk.note)+\'</p>\';' +
    'var g=document.createElement("div");g.className="days";' +
    'DAYS.filter(function(d){return d.w===wk.n;}).forEach(function(d){' +
    'var c=document.createElement("div");c.className="day"+(d.review?" rev":"")+(state["d"+d.d]?" done":"");c.id="day"+d.d;' +
    'var inner=\'<div class="dh"><span class="dn">Day \'+d.d+\'</span></div><h4>\'+esc(d.title)+\'</h4><p>\'+esc(d.take)+\'</p>\';' +
    'if(!d.review){inner+=\'<a class="btn" href="\'+d.url+\'" target="_blank" rel="noopener">Visit this coach</a>\';}' +
    'inner+=\'<label class="tick"><input type="checkbox" \'+(state["d"+d.d]?"checked":"")+\'> Done</label>\';' +
    'c.innerHTML=inner;' +
    'c.querySelector("input").onchange=function(){state["d"+d.d]=this.checked;if(!this.checked)delete state["d"+d.d];' +
    'save(state);c.classList.toggle("done",this.checked);paint();};' +
    'g.appendChild(c);});sec.appendChild(g);wrap.appendChild(sec);});' +
    'var MSG=[["Whenever you are ready, start with Day 1.",0],["A lovely start. Keep it gentle.",1],' +
    '["You are building a real habit now.",5],["Look at you go. Well over a week in.",10],' +
    '["Halfway. That is properly impressive.",15],["The final stretch, and you are still here.",21],' +
    '["Nearly there. Finish at your own pace.",26],["You did the whole month. Take a moment to be proud.",30]];' +
    'function paint(){var n=DAYS.filter(function(d){return state["d"+d.d];}).length;' +
    'document.getElementById("fill").style.width=(n/DAYS.length*100)+"%";' +
    'document.getElementById("pcount").textContent=n+" of "+DAYS.length+" days done";' +
    'var m=MSG[0][0];MSG.forEach(function(x){if(n>=x[1])m=x[0];});' +
    'document.getElementById("pmsg").textContent=m;}' +
    'document.getElementById("printBtn").onclick=function(){window.print();};' +
    'document.getElementById("resetBtn").onclick=function(){' +
    'if(!confirm("This clears your ticks and starts the month fresh. Your plan stays the same. Carry on?"))return;' +
    'state={};save(state);' +
    'Array.prototype.forEach.call(document.querySelectorAll(".day"),function(c){c.classList.remove("done");});' +
    'Array.prototype.forEach.call(document.querySelectorAll(".tick input"),function(i){i.checked=false;});paint();};' +
    'paint();';

  return page({ file: '30-day-coaching-plan.html', title: 'The 30-Day Coaching Plan | The Coach-To-Action Toolkit',
    description: 'A gentle day by day coaching plan for your first month, with a real coach for every day.',
    css, body, script });
}

module.exports = { buildIndex, buildPicker, buildPlan, w, esc, page, VAULT, CLAUDE, D };

if (require.main === module) {
  console.log('index.html                 ' + w('index.html', buildIndex()) + ' bytes');
  console.log('coach-picker-guide.html    ' + w('coach-picker-guide.html', buildPicker()) + ' bytes');
  console.log('30-day-coaching-plan.html  ' + w('30-day-coaching-plan.html', buildPlan()) + ' bytes');
}
