'use strict';

// FILE 5: prompt-pack-expansion.html, Module 4.
// 100 ready-to-paste Claude prompts, 10 categories of 10, with tabs, search,
// per prompt copy, copy all in category, and an Open Claude button.

const fs = require('fs');
const path = require('path');
const { page, CLAUDE } = require('./_shell');

// Fixed display order so the tabs always read the same way.
const ORDER = ['pricing', 'offers', 'launches', 'sales-pages', 'email',
  'content-ideas', 'social-media', 'getting-clients', 'systems-and-time', 'mindset-and-confidence'];

function loadPrompts() {
  const dir = path.join(__dirname, '_prompts');
  return ORDER.map(function (key) {
    const p = JSON.parse(fs.readFileSync(path.join(dir, key + '.json'), 'utf8'));
    if (!Array.isArray(p.prompts) || p.prompts.length !== 10) {
      throw new Error(key + ' must have exactly 10 prompts, found ' + (p.prompts || []).length);
    }
    return { key: key, category: p.category, prompts: p.prompts };
  });
}

function buildPromptPack() {
  const cats = loadPrompts();
  const total = cats.reduce(function (n, c) { return n + c.prompts.length; }, 0);

  const body =
    '<header class="hero"><div class="kicker">Module 4</div><h1>The Prompt Pack Expansion</h1>' +
    '<p>' + total + ' extra prompts that go deeper than your coaching reports. Fill in the words in [square brackets], copy, and paste into your own Claude chat.</p></header>' +

    '<section class="panel no-print"><p class="note">These prompts are crafted with Claude and ready to paste into your own Claude conversation.</p>' +
    '<div class="tools"><input type="search" id="search" class="search" placeholder="Search all ' + total + ' prompts, for example price, launch, reels...">' +
    '<a class="btn" href="' + CLAUDE + '" target="_blank" rel="noopener">Open Claude</a></div>' +
    '<div class="tabs" id="tabs"></div>' +
    '<div class="count" id="count"></div></section>' +
    '<div id="list"></div>';

  const css =
    '.note{color:var(--accent);font-size:14px;margin-bottom:14px}' +
    '.tools{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}' +
    '.tools .search{flex:1;min-width:220px;font-family:inherit;font-size:15.5px;padding:13px 15px;border-radius:12px;' +
    'background:var(--bg);border:1px solid var(--border);color:var(--text)}' +
    '.tools .search:focus{outline:none;border-color:var(--accent2);box-shadow:0 0 0 3px rgba(139,92,246,.25)}' +
    '.tools .btn{flex:0 0 auto}' +
    '.tabs{display:flex;gap:7px;flex-wrap:wrap}' +
    '.tab{cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;border:1px solid var(--border);' +
    'background:transparent;color:var(--muted);border-radius:999px;padding:7px 13px;transition:all .14s}' +
    '.tab:hover{color:var(--text);border-color:var(--accent2)}' +
    '.tab.on{background:var(--accent2);color:#fff;border-color:var(--accent2)}' +
    '.count{color:var(--muted);font-size:13.5px;margin-top:12px}' +
    '.cat{margin-bottom:26px}' +
    '.cathead{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}' +
    '.cathead h2{font-size:23px}' +
    '.pcard{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:15px 16px;margin-bottom:11px}' +
    '.phead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px}' +
    '.phead h4{font-family:"Nunito",sans-serif;font-size:15.5px;font-weight:800;line-height:1.3}' +
    '.pcard p{color:var(--muted);font-size:14.3px;line-height:1.6;white-space:pre-wrap}' +
    '.pcard mark{background:rgba(201,184,232,.22);color:var(--accent);border-radius:4px;padding:0 3px;font-weight:700}' +
    '.copy{flex:0 0 auto;cursor:pointer;font-family:inherit;font-weight:700;font-size:12.5px;border:1px solid var(--border);' +
    'background:rgba(139,92,246,.14);color:var(--accent);border-radius:9px;padding:7px 13px;transition:all .14s}' +
    '.copy:hover{border-color:var(--accent2)}' +
    '.copy.done{background:rgba(34,197,94,.16);color:var(--green);border-color:var(--green)}' +
    '.empty{text-align:center;color:var(--muted);padding:44px 18px}' +
    '@media(max-width:560px){.tools .btn{width:100%}.phead{flex-direction:column}.copy{width:100%}}';

  const script =
    'var CATS=' + JSON.stringify(cats) + ';' +
    'var listEl=document.getElementById("list"),tabsEl=document.getElementById("tabs"),' +
    'countEl=document.getElementById("count"),searchEl=document.getElementById("search");' +
    'var active="all",query="";' +
    'function esc(s){return String(s).replace(/[&<>"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[m];});}' +
    'function hl(s){return esc(s).replace(/\\[([^\\]]+)\\]/g,function(m,p){return "<mark>["+p+"]</mark>";});}' +
    'var tabDefs=[{key:"all",label:"All prompts"}].concat(CATS.map(function(c){return {key:c.key,label:c.category};}));' +
    'tabDefs.forEach(function(t){var b=document.createElement("button");b.className="tab"+(t.key===active?" on":"");' +
    'b.type="button";b.textContent=t.label;b.onclick=function(){active=t.key;paint();};tabsEl.appendChild(b);});' +
    'function copyText(txt,btn,label){' +
    'function done(){btn.textContent="Copied";btn.classList.add("done");' +
    'setTimeout(function(){btn.textContent=label;btn.classList.remove("done");},1700);}' +
    'if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done,function(){fb(txt);done();});}' +
    'else{fb(txt);done();}}' +
    'function fb(txt){var ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";' +
    'document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(ta);}' +
    'function matches(p){if(!query)return true;var h=(p.title+" "+p.text).toLowerCase();return h.indexOf(query)!==-1;}' +
    'function paint(){' +
    'Array.prototype.forEach.call(tabsEl.children,function(b,i){b.classList.toggle("on",tabDefs[i].key===active);});' +
    'listEl.innerHTML="";var shown=0;' +
    'CATS.forEach(function(c){' +
    'if(active!=="all"&&active!==c.key)return;' +
    'var ps=c.prompts.filter(matches);if(!ps.length)return;shown+=ps.length;' +
    'var sec=document.createElement("section");sec.className="cat";' +
    'var head=document.createElement("div");head.className="cathead";' +
    'head.innerHTML="<h2>"+esc(c.category)+"</h2>";' +
    'var all=document.createElement("button");all.className="copy";all.type="button";' +
    'all.textContent="Copy all in "+c.category;' +
    'all.onclick=(function(list,btn){return function(){' +
    'var t=list.map(function(p,i){return (i+1)+". "+p.title+"\\n\\n"+p.text;}).join("\\n\\n-----\\n\\n");' +
    'copyText(t,btn,"Copy all in "+c.category);};})(ps,all);' +
    'head.appendChild(all);sec.appendChild(head);' +
    'ps.forEach(function(p){var card=document.createElement("div");card.className="pcard";' +
    'var ph=document.createElement("div");ph.className="phead";' +
    'ph.innerHTML="<h4>"+esc(p.title)+"</h4>";' +
    'var cb=document.createElement("button");cb.className="copy";cb.type="button";cb.textContent="Copy";' +
    'cb.onclick=(function(txt,btn){return function(){copyText(txt,btn,"Copy");};})(p.text,cb);' +
    'ph.appendChild(cb);card.appendChild(ph);' +
    'var body=document.createElement("p");body.innerHTML=hl(p.text);card.appendChild(body);' +
    'sec.appendChild(card);});' +
    'listEl.appendChild(sec);});' +
    'if(!shown){listEl.innerHTML=\'<div class="empty">No prompts match that word yet. Try another one.</div>\';}' +
    'countEl.textContent=shown+(shown===1?" prompt":" prompts")+" showing";}' +
    'searchEl.addEventListener("input",function(){query=this.value.toLowerCase().trim();paint();});' +
    'paint();';

  return page({ file: 'prompt-pack-expansion.html',
    title: 'The Prompt Pack Expansion | The Coach-To-Action Toolkit',
    description: '100 extra ready-to-paste Claude prompts for your small business.',
    css, body, script });
}

module.exports = { buildPromptPack };

if (require.main === module) {
  const html = buildPromptPack();
  fs.writeFileSync(path.join(__dirname, 'prompt-pack-expansion.html'), html);
  console.log('prompt-pack-expansion.html  ' + Buffer.byteLength(html) + ' bytes');
}
