'use strict';

// Shared shell for The Coach-To-Action Toolkit.
// Each module is a fully self-contained HTML file, so this builder inlines the
// same CSS, nav and footer into every page. No frameworks, no build step at
// runtime: this just writes plain static HTML files.

const VAULT = 'https://getpaidtobeyouonline.github.io/1000aibusinesscoaches/';
const CLAUDE = 'https://claude.ai';

const PAGES = [
  { file: 'index.html', nav: 'Toolkit Home' },
  { file: 'coach-picker-guide.html', nav: 'Coach Picker' },
  { file: '30-day-coaching-plan.html', nav: '30 Day Plan' },
  { file: 'report-to-action-workbook.html', nav: 'Workbook' },
  { file: 'prompt-pack-expansion.html', nav: 'Prompt Pack' },
];

const FONTS = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap';

const CSS = `
:root{
  --bg:#1A0A2E; --bg2:#2D1B4E; --card:#3D2660; --accent:#C9B8E8; --accent2:#8B5CF6;
  --text:#FFFFFF; --muted:#A89BC2; --border:#5B3F8C; --green:#22C55E;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
/* Safety net for small screens: nothing may push the page sideways, and long
   words or pasted links always wrap instead of overflowing. */
html,body{max-width:100%;overflow-x:hidden}
p,h1,h2,h3,h4,li,textarea,input,a{overflow-wrap:break-word;word-break:break-word}
body{font-family:'Nunito',system-ui,sans-serif;background:linear-gradient(135deg,#1A0A2E 0%,#0D0D1A 100%);
  background-attachment:fixed;color:var(--text);line-height:1.65;min-height:100vh;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Playfair Display',Georgia,serif}
a{color:var(--accent)}
.wrap{max-width:1000px;margin:0 auto;padding:18px 18px 90px}

/* nav */
.nav{display:flex;gap:6px;flex-wrap:wrap;padding:14px 0 20px;border-bottom:1px solid var(--border);margin-bottom:26px}
.nav a{display:inline-block;text-decoration:none;font-weight:700;font-size:13.5px;color:var(--muted);
  border:1px solid var(--border);border-radius:999px;padding:7px 14px;transition:all .15s}
.nav a:hover{color:var(--text);border-color:var(--accent2)}
.nav a.on{background:var(--accent2);color:#fff;border-color:var(--accent2)}

/* hero */
.hero{text-align:center;padding:14px 6px 26px}
.hero .kicker{display:inline-block;letter-spacing:.15em;text-transform:uppercase;font-size:11.5px;
  font-weight:800;color:var(--muted);margin-bottom:12px}
.hero h1{font-size:clamp(28px,6vw,46px);line-height:1.12;font-weight:800}
.hero p{color:var(--accent);margin-top:14px;font-size:clamp(15px,2.4vw,18px);max-width:640px;margin-left:auto;margin-right:auto}

/* panels + buttons */
.panel{background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:22px 20px;margin-bottom:18px;
  box-shadow:0 14px 40px rgba(0,0,0,.32)}
.panel h2{font-size:clamp(20px,3.6vw,27px);margin-bottom:6px}
.panel .lead{color:var(--muted);margin-bottom:18px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;font-weight:800;
  font-size:15.5px;cursor:pointer;border:none;border-radius:12px;padding:13px 22px;color:#fff;text-decoration:none;
  background:linear-gradient(135deg,var(--accent2),#6D28D9);box-shadow:0 8px 22px rgba(139,92,246,.36);
  transition:transform .12s,box-shadow .12s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(139,92,246,.46)}
.btn.sec{background:transparent;color:var(--accent);border:1px solid var(--border);box-shadow:none}
.btn.sec:hover{border-color:var(--accent2);transform:none;box-shadow:none}
.btn.ok{background:linear-gradient(135deg,var(--green),#16A34A);box-shadow:0 8px 22px rgba(34,197,94,.36)}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}

/* footer */
.foot{text-align:center;color:var(--muted);font-size:13px;padding:30px 10px 10px;border-top:1px solid var(--border);margin-top:36px}
.foot a{font-weight:700}
.foot .disc{max-width:620px;margin:0 auto 12px;font-style:italic;line-height:1.55}

@media(max-width:560px){
  .wrap{padding:14px 14px 80px}
  .panel{padding:18px 15px;border-radius:14px}
  .nav a{font-size:12.5px;padding:6px 11px}
  .btn{width:100%}
}
@media print{
  body{background:#fff;color:#000}
  .nav,.no-print,.btn{display:none !important}
  .panel{border:1px solid #ccc;box-shadow:none;background:#fff;break-inside:avoid}
  h1,h2,h3,h4,.hero h1{color:#000}
  .hero p,.panel .lead,.foot{color:#333}
}
`;

function nav(current) {
  return '<nav class="nav">' + PAGES.map(function (p) {
    return '<a href="' + p.file + '"' + (p.file === current ? ' class="on"' : '') + '>' + p.nav + '</a>';
  }).join('') + '</nav>';
}

function footer() {
  return '<footer class="foot">' +
    '<p class="disc">For educational and informational purposes only. This is not legal, financial, or medical advice.</p>' +
    '<p><a href="' + VAULT + '" target="_blank" rel="noopener">Open your vault of 1000 coaches</a></p>' +
    '</footer>';
}

// Wraps body content into a complete, self-contained page.
function page(opts) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + opts.title + '</title>\n' +
    '<meta name="description" content="' + (opts.description || '') + '">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="' + FONTS + '" rel="stylesheet">\n' +
    '<style>' + CSS + (opts.css || '') + '</style>\n</head>\n<body>\n<div class="wrap">\n' +
    nav(opts.file) + opts.body + footer() +
    '\n</div>\n' + (opts.script ? '<script>' + opts.script + '</script>\n' : '') +
    '</body>\n</html>\n';
}

module.exports = { page, VAULT, CLAUDE, PAGES };
