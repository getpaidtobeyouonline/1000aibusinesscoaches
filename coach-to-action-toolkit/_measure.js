'use strict';

// Measures real horizontal overflow for each toolkit page.
// Headless Chrome clamps its viewport to a 500px minimum, so a 375px window
// screenshot is only a crop. Instead we load each page in a real Chrome, force
// the viewport narrow with a meta/style override, and report scrollWidth vs
// clientWidth. Any page where scrollWidth > clientWidth would overflow.

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILES = ['index.html', 'coach-picker-guide.html', '30-day-coaching-plan.html',
  'report-to-action-workbook.html', 'prompt-pack-expansion.html'];

// Build a temp copy of the page with a probe appended.
function probeCopy(file, width) {
  const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const probe =
    '<script>window.addEventListener("load",function(){' +
    'var d=document.documentElement,b=document.body;' +
    'var over=Math.max(d.scrollWidth,b.scrollWidth)-d.clientWidth;' +
    'var wide=[];Array.prototype.forEach.call(document.querySelectorAll("*"),function(n){' +
    'var r=n.getBoundingClientRect();if(r.right>d.clientWidth+1){wide.push(n.tagName+"."+(n.className||"")); }});' +
    'var p=document.createElement("div");p.id="__probe";' +
    'p.textContent="PROBE|w="+d.clientWidth+"|scroll="+d.scrollWidth+"|overflow="+over+"|offenders="+wide.slice(0,4).join(",");' +
    'document.body.appendChild(p);});<\/script>';
  const out = src.replace('</body>', probe + '</body>');
  const tmp = path.join('/tmp', 'probe_' + width + '_' + file);
  fs.writeFileSync(tmp, out);
  return tmp;
}

function run(file, width) {
  return new Promise(function (resolve) {
    const tmp = probeCopy(file, width);
    const args = ['--headless=old', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--user-data-dir=/tmp/chr_m_' + Math.random().toString(36).slice(2),
      '--disable-remote-fonts', '--hide-scrollbars',
      '--window-size=' + width + ',900', '--virtual-time-budget=2500',
      '--dump-dom', 'file://' + tmp];
    execFile(CHROME, args, { timeout: 25000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024 * 40 },
      function (err, stdout) {
        // Match the RENDERED probe div, not the script source that defines it.
        const m = (stdout || '').match(/id="__probe">([^<]*)</);
        resolve({ file, width, line: m ? m[1] : 'NO PROBE OUTPUT' });
      });
  });
}

(async function () {
  for (const width of [375]) {
    console.log('=== viewport request: ' + width + 'px ===');
    for (const f of FILES) {
      const r = await run(f, width);
      console.log('  ' + f.padEnd(32) + r.line);
    }
  }
})();
