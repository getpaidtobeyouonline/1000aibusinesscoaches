'use strict';

// Real coach data for the toolkit. Every slug here is verified against the
// live coach list at build time (see resolve() below), so a typo or a renamed
// coach fails the build instead of shipping a broken link.

const fs = require('fs');
const path = require('path');

const VAULT = 'https://getpaidtobeyouonline.github.io/1000aibusinesscoaches/';

// Load the real coach list, slug -> title.
function loadCoaches() {
  const csv = fs.readFileSync(path.join(__dirname, '..', 'mrr-asset-list.csv'), 'utf8');
  const map = {};
  csv.trim().split('\n').slice(1).forEach(function (line) {
    const m = line.match(/^"([^"]*)","([^"]*)","(.*)"$/);
    if (!m) return;
    map[m[1].split('#')[1]] = m[2];
  });
  return map;
}
const COACHES = loadCoaches();

// Turn a slug into { slug, title, url }, throwing if the coach does not exist.
function resolve(slug) {
  const title = COACHES[slug];
  if (!title) throw new Error('Coach slug not found in real coach data: ' + slug);
  return { slug: slug, title: title, url: VAULT + '#' + slug };
}

// ---- Module 1: business types (one real niche coach each) ----------------
const BUSINESS_TYPES = [
  { label: 'Etsy seller', icon: 'E', slug: 'the-ai-coach-for-etsy-sellers' },
  { label: 'Virtual assistant', icon: 'VA', slug: 'the-ai-coach-for-virtual-assistants' },
  { label: 'Photographer', icon: 'P', slug: 'the-ai-coach-for-wedding-photographers' },
  { label: 'Baker or cake maker', icon: 'B', slug: 'the-ai-coach-for-cake-decorators' },
  { label: 'Handmade products', icon: 'H', slug: 'the-ai-coach-for-candle-makers' },
  { label: 'Bookkeeper', icon: 'BK', slug: 'the-ai-coach-for-bookkeepers' },
  { label: 'Social media manager', icon: 'SM', slug: 'the-ai-coach-for-social-media-managers' },
  { label: 'Blogger', icon: 'BL', slug: 'the-ai-coach-for-bloggers' },
  { label: 'Coach or course creator', icon: 'C', slug: 'the-ai-coach-for-course-creators' },
  { label: 'Writer or copywriter', icon: 'W', slug: 'the-ai-coach-for-copywriters' },
  { label: 'Designer', icon: 'D', slug: 'the-ai-coach-for-graphic-designers' },
  { label: 'Local service business', icon: 'LS', slug: 'the-ai-coach-for-house-cleaners' },
  { label: 'Something else online', icon: 'O', slug: 'the-ai-coach-for-digital-product-creators' },
];

// ---- Module 1: challenges (one primary plus two related topic coaches) ----
const CHALLENGES = [
  { key: 'pricing', label: 'My pricing',
    primary: 'the-pricing-coach',
    related: ['the-charging-your-worth-coach', 'the-value-communication-coach'],
    why: ['Start here. This sets the number everything else rests on.',
      'Next, deal with the wobble that makes you drop your price.',
      'Then learn to say what your work is worth, so the price feels fair.'] },
  { key: 'clients', label: 'Getting clients',
    primary: 'the-lead-generation-coach',
    related: ['the-warm-leads-coach', 'the-referrals-coach'],
    why: ['Start here. This is how you get enquiries coming in steadily.',
      'Next, warm up the people who already know you.',
      'Then turn happy customers into your quietest sales team.'] },
  { key: 'content', label: 'Content ideas',
    primary: 'the-content-ideas-coach',
    related: ['the-content-pillars-coach', 'the-content-planning-coach'],
    why: ['Start here. No more staring at a blank page.',
      'Next, pick the few themes you will be known for.',
      'Then get a simple plan so posting stops eating your week.'] },
  { key: 'audience', label: 'Growing an audience',
    primary: 'the-audience-growth-coach',
    related: ['the-list-building-coach', 'the-lead-magnet-coach'],
    why: ['Start here. Grow with the right people, not just more people.',
      'Next, move followers somewhere you actually own.',
      'Then create the free thing that brings them in.'] },
  { key: 'launch', label: 'Launching something',
    primary: 'the-launch-coach',
    related: ['the-launch-runway-coach', 'the-flash-sale-coach'],
    why: ['Start here. A calm plan beats a frantic one.',
      'Next, warm people up before you open the doors.',
      'Then try a short, simple sale you can run again.'] },
  { key: 'email', label: 'Email',
    primary: 'the-email-marketing-coach',
    related: ['the-welcome-sequence-coach', 'the-email-subject-line-coach'],
    why: ['Start here. Build the habit of writing to your people.',
      'Next, set up the emails that greet every new subscriber.',
      'Then get your emails actually opened.'] },
  { key: 'selling', label: 'Selling without feeling pushy',
    primary: 'the-soft-selling-coach',
    related: ['the-sales-confidence-coach', 'the-objection-handling-coach'],
    why: ['Start here. Selling can feel kind and still work.',
      'Next, build the quiet confidence to ask for the sale.',
      'Then handle the hesitations without panicking.'] },
  { key: 'organised', label: 'Getting organised',
    primary: 'the-productivity-coach',
    related: ['the-time-blocking-coach', 'the-workflows-coach'],
    why: ['Start here. Get your week back under control.',
      'Next, give your important work a proper slot.',
      'Then turn the repeating jobs into simple systems.'] },
];

// A foundation coach that suits almost every business.
const FOUNDATION = { slug: 'the-ideal-client-coach',
  why: 'Everyone needs this one. When you know exactly who you are talking to, pricing, content and selling all get easier.' };

// ---- Module 2: the 30 day plan -------------------------------------------
const WEEKS = [
  { n: 1, title: 'Week 1, Foundations', note: 'Get clear on your business and the person you serve.' },
  { n: 2, title: 'Week 2, Offers and Pricing', note: 'Shape what you sell and what you charge.' },
  { n: 3, title: 'Week 3, Getting Seen', note: 'Content, social and growing your audience.' },
  { n: 4, title: 'Week 4, Selling and Systems', note: 'Turn interest into sales, and tidy the back end.' },
];

const PLAN = [
  // Week 1, Foundations
  { d: 1, w: 1, slug: 'the-ideal-client-coach', take: 'A clear picture of the one person you are here to help.' },
  { d: 2, w: 1, slug: 'the-audience-research-coach', take: 'Real words from real people to use in your marketing.' },
  { d: 3, w: 1, slug: 'the-niching-down-coach', take: 'A tighter focus so the right people find you.' },
  { d: 4, w: 1, slug: 'the-dream-clients-coach', take: 'A picture of the customers you would love more of.' },
  { d: 5, w: 1, slug: 'the-branding-coach', take: 'A brand that feels like you, not like everyone else.' },
  { d: 6, w: 1, slug: 'the-brand-voice-coach', take: 'A way of writing that sounds like you every time.' },
  { d: 7, w: 1, slug: 'the-goal-setting-coach', take: 'One clear goal for the next 30 days.' },
  // Week 2, Offers and Pricing
  { d: 8, w: 2, slug: 'the-offer-coach', take: 'An offer that makes sense to the person buying it.' },
  { d: 9, w: 2, slug: 'the-signature-offer-coach', take: 'The one thing you want to be known for.' },
  { d: 10, w: 2, slug: 'the-pricing-coach', take: 'A price you can say out loud without flinching.' },
  { d: 11, w: 2, slug: 'the-charging-your-worth-coach', take: 'A little more nerve about what you are worth.' },
  { d: 12, w: 2, slug: 'the-value-communication-coach', take: 'Words that make the price feel fair.' },
  { d: 13, w: 2, slug: 'the-profit-pricing-coach', take: 'Prices that leave you something to keep.' },
  { d: 14, w: 2, slug: 'the-revenue-goals-coach', take: 'A realistic number to aim at this month.' },
  // Week 3, Getting Seen
  { d: 15, w: 3, slug: 'the-content-marketing-coach', take: 'A simple content approach you can keep up.' },
  { d: 16, w: 3, slug: 'the-content-ideas-coach', take: 'A list of ideas so you never start from blank.' },
  { d: 17, w: 3, slug: 'the-content-pillars-coach', take: 'The few themes you will talk about from now on.' },
  { d: 18, w: 3, slug: 'the-storytelling-coach', take: 'A story of yours worth telling.' },
  { d: 19, w: 3, slug: 'the-social-media-strategy-coach', take: 'A calmer plan for showing up online.' },
  { d: 20, w: 3, slug: 'the-audience-growth-coach', take: 'A way to grow that does not burn you out.' },
  { d: 21, w: 3, slug: 'the-lead-magnet-coach', take: 'A free thing that brings the right people in.' },
  // Week 4, Selling and Systems
  { d: 22, w: 4, slug: 'the-email-marketing-coach', take: 'A reason and a rhythm for emailing your people.' },
  { d: 23, w: 4, slug: 'the-welcome-sequence-coach', take: 'A warm welcome that runs without you.' },
  { d: 24, w: 4, slug: 'the-soft-selling-coach', take: 'A way to sell that feels kind and still works.' },
  { d: 25, w: 4, slug: 'the-sales-confidence-coach', take: 'The nerve to actually ask for the sale.' },
  { d: 26, w: 4, slug: 'the-testimonials-coach', take: 'Proof from happy customers, asked for properly.' },
  { d: 27, w: 4, slug: 'the-productivity-coach', take: 'A few hours back in your week.' },
  { d: 28, w: 4, slug: 'the-workflows-coach', take: 'The repeating jobs turned into simple systems.' },
];

// Days 29 and 30 are review and planning, with no coach to visit.
const REVIEW_DAYS = [
  { d: 29, w: 4, title: 'Look back', take: 'Read your notes from the month. Write down the three things that made the biggest difference, and the one thing you would skip next time.' },
  { d: 30, w: 4, title: 'Plan next month', take: 'Pick your one goal for next month, then choose five coaches from the vault to work through. Put them in your diary now.' },
];

module.exports = { VAULT, COACHES, resolve, BUSINESS_TYPES, CHALLENGES, FOUNDATION, WEEKS, PLAN, REVIEW_DAYS };
