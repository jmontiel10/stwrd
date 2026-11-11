/* STWRD interactive app demo. Vanilla JS, no build step. All data is local sample data. */
(() => {
'use strict';

/* ---------- icons (Phosphor fill, see icons.js) ---------- */
const ICO = {home:'house',search:'magnifying-glass',cal:'calendar-blank',cap:'graduation-cap',user:'user-circle',bell:'bell',plus:'plus',brief:'briefcase',spark:'sparkle',gear:'gear-six',filter:'funnel-simple',send:'paper-plane-tilt',check:'check'};
const si = window.si;
const ico = n => si(ICO[n] || n);
const stars = (n, total = 5) => `<span class="stars-row">${Array.from({length: total}, (_, i) => si('star', i < n ? '' : 'dim')).join('')}</span>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (n, d = 2) => '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
const $0 = n => $(n, 0);

/* ---------- sample data ---------- */
const TYPES = {
  lawn:{e:'plant',n:'Lawn Mowing',s:'Lawn'}, snow:{e:'snowflake',n:'Snow Removal',s:'Snow'},
  car:{e:'car',n:'Car Washing',s:'Car Wash'}, yard:{e:'leaf',n:'Yard Work',s:'Yard'},
  clean:{e:'broom',n:'Cleaning',s:'Cleaning'}, pet:{e:'dog',n:'Pet Care',s:'Pets'},
  other:{e:'wrench',n:'Other',s:'Other'}
};
const COLORS = ['#F3EC6C','#7cb7ff','#5be3a0','#ffb38a','#d4a8ff','#ff9fb6'];
const initials = n => n.split(/\s+/).map(p => p[0]).join('').slice(0,2).toUpperCase();
const avatar = (name, i = 0, cls = '') => `<div class="av ${cls}" style="background:${COLORS[i % COLORS.length]}">${esc(initials(name))}</div>`;

const WORKERS = [
  {id:'joel',name:'Joel M.',school:'Concord High School',rating:4.9,reviews:38,jobs:42,hours:127,rate:18,dist:0.4,vetted:true,top:true,skills:['lawn','snow','car'],about:'Senior at Concord. I show up early, bring my own gear for most jobs, and everything I earn goes toward college.',c:0},
  {id:'owen',name:'Owen B.',school:'Concord High School',rating:4.8,reviews:21,jobs:25,hours:74,rate:20,dist:0.9,vetted:true,top:true,skills:['car','yard','other'],about:'Detail-oriented and great with cars. Happy to take repeat weekly jobs.',c:1},
  {id:'mari',name:'Marihanna M.',school:'Concord High School',rating:5.0,reviews:9,jobs:11,hours:30,rate:16,dist:1.3,vetted:true,top:false,skills:['clean','pet','yard'],about:'Junior who loves animals and organizing. References available.',c:2},
  {id:'aiden',name:'Aiden B.',school:'Goshen High School',rating:4.7,reviews:14,jobs:17,hours:51,rate:17,dist:1.8,vetted:true,top:false,skills:['lawn','yard'],about:'Lawn care is my thing. I can do weekly mowing all season.',c:3},
  {id:'simon',name:'Simon A.',school:'Elkhart High School',rating:4.6,reviews:6,jobs:8,hours:19,rate:15,dist:2.6,vetted:false,top:false,skills:['snow','car','other'],about:'Early riser, perfect for snow days before school.',c:4}
];
const W = id => WORKERS.find(w => w.id === id);

const REVIEWS = [
  {who:'Sandra K.',s:5,t:'Joel was on time, polite, and the yard looked amazing. Booking him weekly now.'},
  {who:'Marcus T.',s:5,t:'Car looked brand new inside and out. Great kid, great work.'},
  {who:'Lisa M.',s:4,t:'Did a solid leaf cleanup. Would hire again.'}
];

const initState = () => ({
  role:null, name:'', tab:'home', filter:'all', wfilter:'all', schedTab:'up',
  jfilters:{verified:false, dist:0, pay:'any'},
  available:true, premium:false, plan:true,
  earned:1840, jobsDone:42, hours:127, fund:412.40, pct:10, fundGoal:5000,
  months:[['Jun',210],['Jul',380],['Aug',420],['Sep',300],['Oct',290],['Nov',240]],
  byService:{lawn:780,yard:480,car:360,snow:220},
  portfolio:{lawn:[20,58],yard:[8,32],car:[9,22],snow:[5,15]},
  services:[{type:'lawn',rate:18,desc:'Mowing, edging, bagging'},{type:'snow',rate:20,desc:'Driveways and walks'},{type:'car',rate:18,desc:'Hand wash and vacuum'}],
  avail:{days:['Mon','Wed','Fri','Sat'],hours:'Afternoon',max:'3–5'},
  fundLog:[{d:'Nov 7',j:'Yard cleanup · Lisa M.',a:7.00},{d:'Nov 4',j:'Car wash · Marcus T.',a:4.00},{d:'Nov 1',j:'Lawn mowing · Sandra K.',a:3.50},{d:'Oct 28',j:'Snow removal · Dave R.',a:5.50}],
  jobs:[
    {id:1,type:'lawn',title:'Weekly lawn mowing',owner:'Sandra K.',ov:true,pay:35,dist:0.4,when:'Sat, Nov 14 · 10 AM',dur:'1.5 hrs',boost:true,desc:'Front and back yard. Mower provided. Bag clippings by the side gate.'},
    {id:2,type:'yard',title:'Fall leaf cleanup',owner:'Lisa M.',ov:true,pay:70,dist:1.2,when:'Sat, Nov 14 · 1 PM',dur:'3 hrs',boost:true,desc:'Rake and bag leaves from front lawn and flower beds. Bags and rakes provided.'},
    {id:3,type:'car',title:'Car wash + interior vacuum',owner:'Marcus T.',ov:true,pay:40,dist:0.8,when:'Sun, Nov 15 · 2 PM',dur:'2 hrs',boost:false,desc:'One SUV. Hose and supplies in the garage.'},
    {id:4,type:'snow',title:'On-call driveway shoveling',owner:'Dave R.',ov:false,pay:30,dist:0.6,when:'Next snowfall',dur:'1 hr',boost:false,desc:'Two-car driveway and front walk. Need it cleared before 7 AM.'},
    {id:5,type:'pet',title:'Dog walks, 3x this week',owner:'Tom H.',ov:true,pay:45,dist:0.9,when:'Mon–Wed · 4 PM',dur:'30 min each',boost:false,desc:'Friendly golden retriever, 30 minute walks around the block.'},
    {id:6,type:'clean',title:'Garage clean-out',owner:'Priya S.',ov:true,pay:80,dist:2.3,when:'Fri, Nov 20 · 4 PM',dur:'4 hrs',boost:false,desc:'Sort, sweep, and haul boxes to the curb. Heavy lifting involved.'},
    {id:7,type:'other',title:'Move furniture to basement',owner:'Greg L.',ov:true,pay:50,dist:3.1,when:'Sun, Nov 22 · 11 AM',dur:'2 hrs',boost:false,desc:'Couch and two dressers down one flight of stairs.'}
  ],
  applied:[],
  sched:[
    {id:'s1',title:'Lawn mowing',who:'Sandra K.',type:'lawn',day:14,time:'10:00 AM',pay:35,status:'confirmed'},
    {id:'s2',title:'Car wash',who:'Marcus T.',type:'car',day:15,time:'2:00 PM',pay:40,status:'pending'},
    {id:'p1',title:'Yard cleanup',who:'Lisa M.',type:'yard',day:7,time:'1:00 PM',pay:70,status:'done',rated:false},
    {id:'p2',title:'Car wash',who:'Marcus T.',type:'car',day:4,time:'3:00 PM',pay:40,status:'done',rated:true},
    {id:'p3',title:'Lawn mowing',who:'Sandra K.',type:'lawn',day:1,time:'10:00 AM',pay:35,status:'done',rated:true}
  ],
  /* homeowner */
  spent:680, month:135, my:[
    {id:101,type:'lawn',title:'Weekly lawn mowing',pay:35,status:'booked',worker:'joel',when:'Sat, Nov 14 · 10 AM'},
    {id:102,type:'yard',title:'Leaf cleanup, front + back',pay:70,status:'open',applicants:['aiden','owen','simon'],boost:true,when:'Sat, Nov 21 · 9 AM'},
    {id:103,type:'car',title:'Car wash',pay:50,status:'done',worker:'owen',when:'Sun, Nov 8 · 2 PM'},
    {id:104,type:'snow',title:'Snow removal',pay:55,status:'paid',worker:'joel',when:'Oct 30',rated:true}
  ],
  activity:[
    {e:'user-plus',t:'<b>Aiden B.</b> applied to Leaf cleanup',w:'12m ago'},
    {e:'check-circle',t:'Car wash completed by <b>Owen B.</b>',w:'2d ago'},
    {e:'user-plus',t:'<b>Owen B.</b> applied to Leaf cleanup',w:'3d ago'},
    {e:'clock-countdown',t:'Your gutter cleaning listing expired',w:'5d ago',repost:true}
  ],
  notes:{student:[
    {t:'Sandra K. confirmed Saturday’s lawn mowing.',w:'1h'},
    {t:'$7.00 from your last job went to your 529.',w:'3d'},
    {t:'New boosted job 1.2 mi away: Fall leaf cleanup, $70.',w:'4d'},
    {t:'You earned the Snow Hero badge.',w:'1w'}
  ],homeowner:[
    {t:'Aiden B. applied to Leaf cleanup.',w:'12m'},
    {t:'Owen B. finished your car wash. Time to pay and rate.',w:'2d'},
    {t:'Joel M. confirmed Saturday’s lawn mowing.',w:'2d'}
  ]},
  unread:true,
  chat:[]
});
let S = initState();

/* ---------- shell ---------- */
const app = document.getElementById('app');
app.innerHTML = `<div id="main" style="display:flex;flex-direction:column;height:100%;min-height:0"></div>
<div class="sheet-bg" id="sbg" data-act="close"></div><div class="sheet" id="sheet"></div><div class="toast" id="toast"></div>`;
const main = document.getElementById('main'), sheet = document.getElementById('sheet'), sbg = document.getElementById('sbg');
let toastT;
function toast(msg){ const t = document.getElementById('toast'); t.innerHTML = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400); }

/* ---------- derived ---------- */
const student = () => S.role === 'student';
const firstName = () => esc(S.name || (student() ? 'Joel' : 'Sandra'));
const fundPctDone = () => Math.min(100, S.fund / S.fundGoal * 100);
const avgMonthly = () => S.months.reduce((a, m) => a + m[1], 0) / S.months.length;
const projected = years => { const c = avgMonthly() * S.pct / 100 * 12, r = 0.05; return S.fund * Math.pow(1 + r, years) + c * ((Math.pow(1 + r, years) - 1) / r); };
const earnedBadges = () => [
  {e:'confetti',n:'First Job',d:'Complete 1 job',ok:S.jobsDone >= 1},
  {e:'trophy',n:'10 Jobs',d:'Complete 10 jobs',ok:S.jobsDone >= 10},
  {e:'medal',n:'25 Jobs',d:'Complete 25 jobs',ok:S.jobsDone >= 25},
  {e:'timer',n:'100 Hours',d:'Log 100 service hrs',ok:S.hours >= 100},
  {e:'star',n:'Top Rated',d:'4.8+ over 20 reviews',ok:true},
  {e:'snowflake',n:'Snow Hero',d:'5 snow jobs',ok:true},
  {e:'repeat',n:'Regular',d:'3 repeat clients',ok:true},
  {e:'piggy-bank',n:'529 Saver',d:'Save $500 for college',ok:S.fund >= 500},
  {e:'rocket-launch',n:'50 Jobs',d:'Complete 50 jobs',ok:S.jobsDone >= 50}
];

/* ---------- render ---------- */
function render(){
  const prev = main.querySelector('.screen'), scroll = prev ? prev.scrollTop : 0, prevTab = main.dataset.tab;
  if(!S.role){ main.innerHTML = onboarding(); main.dataset.tab = ''; return; }
  const screens = student()
    ? {home:sHome, jobs:sJobs, sched:sSched, fund:sFund, profile:sProfile}
    : {home:hHome, find:hFind, myjobs:hJobs, profile:hProfile};
  main.innerHTML = `
    <div class="top">
      <img src="assets/logo-full.png" alt="STWRD">
      <div class="row" style="gap:8px">
        <button class="icon-btn" data-act="notes" aria-label="Notifications">${ico('bell')}${S.unread ? '<i class="dot"></i>' : ''}</button>
        <button class="icon-btn" data-act="settings" aria-label="Settings">${ico('gear')}</button>
      </div>
    </div>
    <div class="screen">${(screens[S.tab] || screens.home)()}</div>
    <button class="fab" data-act="chat" aria-label="Ask STWRD AI">${ico('spark')}</button>
    ${tabbar()}`;
  if(prevTab === S.tab) main.querySelector('.screen').scrollTop = scroll;
  main.dataset.tab = S.tab;
}

function tabbar(){
  const t = (id, label, icon) => `<button class="tab ${S.tab === id ? 'on' : ''}" data-act="tab" data-id="${id}">${ico(icon)}${label}</button>`;
  if(student()) return `<nav class="tabs">${t('home','Home','home')}${t('jobs','Jobs','search')}${t('sched','Schedule','cal')}${t('fund','529','cap')}${t('profile','Profile','user')}</nav>`;
  return `<nav class="tabs">${t('home','Home','home')}${t('find','Find','search')}
    <button class="tab plus" data-act="post"><span class="pl">${ico('plus')}</span>Post</button>
    ${t('myjobs','Jobs','brief')}${t('profile','Profile','user')}</nav>`;
}

function onboarding(){
  return `<div class="onb">
    <img class="logo" src="assets/logo-full.png" alt="STWRD">
    <div style="margin-top:48px">
      <h1>Reliable help,<br>right next door.</h1>
      <p class="sub" style="margin-top:10px;font-size:15px">Students earn, save for college, and build a verified work history. Neighbors get affordable help they can trust.</p>
    </div>
    <div style="margin-top:28px">
      <button class="role ${S._pick === 'homeowner' ? 'on' : ''}" data-act="pick" data-id="homeowner"><span class="e">${si('house-line')}</span><div><b>I need help</b><span>Post jobs and hire vetted local students</span></div></button>
      <button class="role ${S._pick === 'student' ? 'on' : ''}" data-act="pick" data-id="student"><span class="e">${si('graduation-cap')}</span><div><b>I want to work</b><span>Find jobs nearby and grow your 529</span></div></button>
      <div class="field"><label for="nm">First name</label><input id="nm" data-bind="name" placeholder="${S._pick === 'homeowner' ? 'Sandra' : 'Joel'}" value="${esc(S.name)}" maxlength="20" autocomplete="off"></div>
      <button class="btn" style="margin-top:18px" data-act="start" ${S._pick ? '' : 'disabled'}>Continue</button>
      <p class="note" style="text-align:center">Interactive demo. No account needed, nothing is saved.</p>
    </div></div>`;
}

/* ----- student screens ----- */
function jobCard(j){
  const t = TYPES[j.type], ap = S.applied.includes(j.id);
  return `<div class="card job ${j.boost ? 'boost' : ''}" data-act="job" data-id="${j.id}">
    <div class="row">
      <div class="ico">${si(t.e)}</div>
      <div style="flex:1;min-width:0">
        <div class="between"><h4>${esc(j.title)}</h4><span class="pay">${$0(j.pay)}</span></div>
        <div class="meta">${esc(j.owner)} ${j.ov ? si('seal-check', 'ok') : ''} · ${j.dist} mi · ${esc(j.when)}</div>
        <div class="row" style="gap:6px;margin-top:8px">
          ${j.boost ? `<span class="badge y">${si('lightning')} Boosted</span>` : ''}
          ${j.ov ? '<span class="badge b">Verified home</span>' : ''}
          ${ap ? '<span class="badge g">Applied</span>' : ''}
        </div>
      </div>
    </div></div>`;
}
function filteredJobs(){
  let js = S.jobs.slice();
  const f = S.filter, jf = S.jfilters;
  if(f === 'boost') js = js.filter(j => j.boost); else if(f !== 'all') js = js.filter(j => j.type === f);
  if(jf.verified) js = js.filter(j => j.ov);
  if(jf.dist) js = js.filter(j => j.dist <= jf.dist);
  if(jf.pay === 'low') js = js.filter(j => j.pay < 40); else if(jf.pay === 'mid') js = js.filter(j => j.pay >= 40 && j.pay < 80); else if(jf.pay === 'high') js = js.filter(j => j.pay >= 80);
  return js.sort((a, b) => (b.boost - a.boost) || (a.dist - b.dist));
}
function sHome(){
  const up = S.sched.filter(s => s.status !== 'done').sort((a, b) => a.day - b.day);
  const near = S.jobs.filter(j => !S.applied.includes(j.id)).sort((a, b) => (b.boost - a.boost) || (a.dist - b.dist)).slice(0, 3);
  return `<div class="hero-greet"><div><h1>Hey ${firstName()}</h1><p class="sub">Goshen, IN · ${S.premium ? '<span style="color:var(--yellow)">Premium</span>' : 'Free plan'}</p></div>
      <button data-act="avail" class="pill-live ${S.available ? '' : 'off'}" style="margin-top:8px">${S.available ? 'Available' : 'Away'}</button></div>
    <div class="card fund" data-act="tab" data-id="fund" style="cursor:pointer">
      <div class="between"><span style="font-weight:700;font-size:13px">${si('graduation-cap')} COLLEGE FUND · 529</span><span style="font-size:12px;font-weight:700">${S.pct}% of every job</span></div>
      <div style="font-size:34px;font-weight:800;margin-top:6px;letter-spacing:-.02em">${$(S.fund)}</div>
      <div class="sub">${fundPctDone().toFixed(0)}% of your ${$0(S.fundGoal)} goal</div>
      <div class="bar"><i style="width:${fundPctDone()}%"></i></div>
    </div>
    <div class="grid2" style="margin-top:10px">
      <div class="stat" data-act="earnings" style="cursor:pointer"><b>${$0(S.earned)}</b><span>Earned · tap for breakdown</span></div>
      <div class="stat"><b>${S.jobsDone}</b><span>Jobs completed</span></div>
      <div class="stat"><b>${S.hours}</b><span>Verified service hours</span></div>
      <div class="stat"><b>4.9 ${si('star','y')}</b><span>38 reviews · 100% on-time</span></div>
    </div>
    <h2>Up next <a data-act="tab" data-id="sched">Schedule</a></h2>
    ${up.length ? up.slice(0,2).map(schedRow).join('') : '<div class="card empty">Nothing booked yet. Apply to a job below.</div>'}
    <h2>Jobs near you <a data-act="tab" data-id="jobs">See all</a></h2>
    ${near.map(jobCard).join('')}`;
}
function sJobs(){
  const chips = [['all','All'],['lawn','Lawn'],['snow','Snow'],['car','Car Wash'],['yard','Yard'],['pet','Pets'],['clean','Cleaning'],['boost','Boosted']];
  const js = filteredJobs(), active = S.jfilters.verified || S.jfilters.dist || S.jfilters.pay !== 'any';
  return `<div class="between"><h1>Find work</h1><button class="icon-btn" data-act="jfilters" aria-label="Filters">${ico('filter')}${active ? '<i class="dot"></i>' : ''}</button></div>
    <p class="sub">${js.length} jobs within 5 miles of Goshen</p>
    <div class="chips" style="margin:14px 0">${chips.map(([id, l]) => `<button class="chip ${S.filter === id ? 'on' : ''}" data-act="filter" data-id="${id}">${l}</button>`).join('')}</div>
    ${js.length ? js.map(jobCard).join('') : '<div class="card empty">No jobs match. Try clearing filters.</div>'}`;
}
function schedRow(s){
  const t = TYPES[s.type];
  const right = s.status === 'done'
    ? (s.rated ? `<span class="badge">Rated</span>` : `<button class="btn sm" data-act="rate" data-id="${s.id}">Rate</button>`)
    : s.status === 'confirmed' ? `<button class="btn sm ghost" data-act="complete" data-id="${s.id}">Mark done</button>`
    : `<span class="badge y">Pending</span>`;
  return `<div class="card"><div class="row"><div class="job"><div class="ico">${si(t.e)}</div></div>
    <div style="flex:1"><h4 style="font-size:15px">${esc(s.title)}</h4><div class="sub" style="font-size:12px">${esc(s.who)} · Nov ${s.day} · ${s.time}</div></div>
    <div style="text-align:right"><div class="pay" style="font-size:15px;margin-bottom:6px">${$0(s.pay)}</div>${right}</div></div></div>`;
}
function calendar(days, sel, act, minDay = 1){
  const head = ['S','M','T','W','T','F','S'].map(d => `<span>${d}</span>`).join('');
  let cells = '';
  for(let d = 1; d <= 30; d++){
    cells += `<button class="${d === sel ? 'on' : ''} ${days.includes(d) ? 'has' : ''} ${d < minDay ? 'off' : ''}" ${act ? `data-act="${act}" data-id="${d}"` : ''}>${d}</button>`;
  }
  return `<div class="cal">${head}${cells}</div>`; /* Nov 1 2026 is a Sunday, so no offset */
}
function sSched(){
  const up = S.sched.filter(s => s.status !== 'done').sort((a, b) => a.day - b.day);
  const past = S.sched.filter(s => s.status === 'done').sort((a, b) => b.day - a.day);
  return `<h1>Schedule</h1><p class="sub">November 2026</p>
    <div class="card" style="margin-top:14px">${calendar(S.sched.map(s => s.day), 10)}</div>
    <div class="seg" style="margin:16px 0 10px"><button class="${S.schedTab === 'up' ? 'on' : ''}" data-act="schedTab" data-id="up">Upcoming (${up.length})</button><button class="${S.schedTab === 'past' ? 'on' : ''}" data-act="schedTab" data-id="past">Past (${past.length})</button></div>
    ${(S.schedTab === 'up' ? up : past).map(schedRow).join('') || '<div class="card empty">Nothing here yet.</div>'}
    <p class="note">Tip: tap “Mark done” on a confirmed job to see earnings and your 529 update live.</p>`;
}
function sFund(){
  const yrs = 4, proj = projected(yrs), perJob = 44 * S.pct / 100;
  return `<h1>College fund</h1><p class="sub">A slice of every job goes straight to your 529.</p>
    <div class="card fund" style="margin-top:14px">
      <div style="font-weight:700;font-size:13px">BALANCE</div>
      <div style="font-size:40px;font-weight:800;letter-spacing:-.02em">${$(S.fund)}</div>
      <div class="between sub"><span>Goal ${$0(S.fundGoal)}</span><span>${fundPctDone().toFixed(1)}%</span></div>
      <div class="bar"><i style="width:${fundPctDone()}%"></i></div>
    </div>
    <div class="card" style="margin-top:10px">
      <div class="between"><b>Auto-save per job</b><b style="color:var(--yellow);font-size:22px" id="pctv">${S.pct}%</b></div>
      <input type="range" class="range" min="0" max="25" step="1" value="${S.pct}" data-act-input="pct" style="margin:14px 0 6px" aria-label="Percent of each job to save">
      <div class="sub" style="font-size:13px" id="pctx">About <b style="color:var(--white)">${$(perJob)}</b> from an average ${$0(44)} job.</div>
    </div>
    <div class="card" style="margin-top:10px">
      <div class="sub" style="font-size:12px;font-weight:700;letter-spacing:.04em">IF YOU KEEP THIS PACE</div>
      <div style="font-size:28px;font-weight:800;margin-top:4px" id="projv">${$0(proj)}</div>
      <div class="sub" style="font-size:13px">by graduation in ${yrs} years, at ${$0(avgMonthly())}/mo earnings and 5% growth.</div>
      <p class="note" style="margin-top:8px">Illustrative only. Not investment advice. Returns aren’t guaranteed.</p>
    </div>
    <h2>Recent deposits</h2>
    <div class="card">${S.fundLog.map(l => `<div class="list-item"><div class="t">${esc(l.j)}<small>${l.d}</small></div><b style="color:var(--green)">+${$(l.a)}</b></div>`).join('')}</div>
    <h2>Linked account</h2>
    <div class="card"><div class="list-item"><div class="li-ico">${si('bank')}</div><div class="t">Indiana 529 plan<small>Linked with parent/guardian · demo</small></div><span class="badge g">Active</span></div>
    <div class="list-item" data-act="toast" data-msg="Gift link copied. Family can chip in anytime." style="cursor:pointer"><div class="li-ico">${si('gift')}</div><div class="t">Invite family to contribute<small>Share a gift link for birthdays and holidays</small></div><span class="link">Share</span></div></div>`;
}
function sProfile(){
  const totalH = Object.values(S.portfolio).reduce((a, p) => a + p[1], 0);
  return `<div style="text-align:center;margin-top:6px"><div class="av lg" style="margin:0 auto;background:#F3EC6C">${esc(initials((S.name || 'Joel') + ' M'))}</div>
      <h1 style="margin-top:12px">${firstName()} M.</h1><p class="sub">Concord High School · Goshen, IN</p>
      <div class="row" style="justify-content:center;gap:6px;margin-top:10px"><span class="badge g">${si('seal-check')} Vetted</span><span class="badge y">${si('star')} Top Rated</span>${S.premium ? '<span class="badge b">Premium</span>' : ''}</div></div>
    <div class="grid3" style="margin-top:18px">
      <div class="stat" style="text-align:center"><b>4.9</b><span>Rating</span></div>
      <div class="stat" style="text-align:center"><b>${S.jobsDone}</b><span>Jobs</span></div>
      <div class="stat" style="text-align:center"><b>${S.hours}</b><span>Hours</span></div>
    </div>
    ${S.premium ? '' : `<div class="card boost" style="margin-top:12px"><div class="between"><div><b>Go Premium · $6/mo</b><div class="sub" style="font-size:13px">Top of search, early access to boosted jobs.</div></div><button class="btn sm" data-act="premium">Try it</button></div></div>`}
    <h2>Verified portfolio <span class="badge">${totalH} hrs</span></h2>
    <div class="card">${Object.entries(S.portfolio).map(([k, [j, h]]) => `<div class="list-item"><div class="li-ico y">${si(TYPES[k].e)}</div><div class="t">${TYPES[k].n}<small>${j} jobs · ${h} service hours</small></div><div style="width:80px"><div class="bar dark" style="margin:0"><i style="width:${h / totalH * 100 * 1.6}%"></i></div></div></div>`).join('')}
      <p class="note">Every hour is logged and verified by STWRD. Export it for college apps, scholarships, or your first résumé.</p>
      <button class="btn ghost" style="margin-top:12px" data-act="exportHours">Download service-hours record</button></div>
    <h2>Badges</h2>
    <div class="grid3">${earnedBadges().map(b => `<div class="card badge-tile ${b.ok ? '' : 'lock'}" style="margin:0"><div class="e">${si(b.e)}</div><b>${b.n}</b><small>${b.d}</small></div>`).join('')}</div>
    <h2>My services <a data-act="addService">+ Add</a></h2>
    <div class="card">${S.services.map(s => `<div class="list-item"><div class="li-ico y">${si(TYPES[s.type].e)}</div><div class="t">${TYPES[s.type].n}<small>${esc(s.desc)}</small></div><b>${$0(s.rate)}/hr</b></div>`).join('')}</div>
    <h2>Reviews</h2>
    ${REVIEWS.map(r => `<div class="card"><div class="between"><b>${r.who}</b>${stars(r.s)}</div><p class="sub" style="margin-top:6px">${r.t}</p></div>`).join('')}`;
}

/* ----- homeowner screens ----- */
function hHome(){
  const active = S.my.filter(j => j.status === 'booked' || j.status === 'open').length;
  const apps = S.my.reduce((a, j) => a + (j.status === 'open' ? (j.applicants || []).length : 0), 0);
  const due = S.my.filter(j => j.status === 'done');
  return `<div class="hero-greet"><div><h1>Hi ${firstName()}</h1><p class="sub">South Bend, IN · <span style="color:var(--green)">ID verified</span></p></div></div>
    <button class="btn" data-act="post">${ico('plus')} Post a job</button>
    ${due.map(j => `<div class="card boost" style="margin-top:12px"><div class="between"><div><b>${esc(j.title)} is done</b><div class="sub" style="font-size:13px">${esc(W(j.worker).name)} is waiting on payment</div></div><button class="btn sm" data-act="pay" data-id="${j.id}">Pay & tip</button></div></div>`).join('')}
    <div class="grid2" style="margin-top:12px">
      <div class="stat" data-act="tab" data-id="myjobs" style="cursor:pointer"><b>${active}</b><span>Active jobs</span></div>
      <div class="stat" data-act="tab" data-id="myjobs" style="cursor:pointer"><b style="color:var(--yellow)">${apps}</b><span>New applicants</span></div>
      <div class="stat"><b>${$0(S.month)}</b><span>Spent this month</span></div>
      <div class="stat"><b>3</b><span>Regular helpers</span></div>
    </div>
    <h2>Upcoming</h2>
    ${S.my.filter(j => j.status === 'booked').map(j => myJobRow(j)).join('') || '<div class="card empty">No upcoming jobs.</div>'}
    <h2>Recent activity</h2>
    <div class="card">${S.activity.map(a => `<div class="list-item"><div class="li-ico">${si(a.e)}</div><div class="t">${a.t}<small>${a.w}</small></div>${a.repost ? '<button class="btn sm ghost" data-act="post">Repost</button>' : ''}</div>`).join('')}</div>
    <h2>Top helpers near you <a data-act="tab" data-id="find">See all</a></h2>
    ${WORKERS.slice(0, 2).map(workerCard).join('')}`;
}
function workerCard(w){
  return `<div class="card job" data-act="worker" data-id="${w.id}"><div class="row">${avatar(w.name, w.c)}
    <div style="flex:1;min-width:0"><div class="between"><h4>${w.name}</h4><span style="font-weight:700">${$0(w.rate)}<small style="color:var(--mute);font-weight:500">/hr</small></span></div>
    <div class="meta">${si('star','y')} ${w.rating.toFixed(1)} (${w.reviews}) · ${w.jobs} jobs · ${w.dist} mi</div>
    <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">${w.vetted ? `<span class="badge g">${si('seal-check')} Vetted</span>` : ''}${w.top ? `<span class="badge y">${si('star')} Top Rated</span>` : ''}${w.skills.map(s => `<span class="badge">${TYPES[s].s}</span>`).join('')}</div></div></div></div>`;
}
function hFind(){
  const chips = [['all','All'],['lawn','Lawn'],['snow','Snow'],['car','Car Wash'],['yard','Yard'],['clean','Cleaning'],['vetted','Vetted only'],['top','Top Rated']];
  const f = S.wfilter;
  const ws = WORKERS.filter(w => f === 'all' || (f === 'vetted' ? w.vetted : f === 'top' ? w.top : w.skills.includes(f))).sort((a, b) => a.dist - b.dist);
  return `<h1>Find help</h1><p class="sub">${ws.length} students available near South Bend</p>
    <div class="chips" style="margin:14px 0">${chips.map(([id, l]) => `<button class="chip ${f === id ? 'on' : ''}" data-act="wfilter" data-id="${id}">${l}</button>`).join('')}</div>
    <div class="card" style="margin-bottom:10px;cursor:pointer" data-act="book" data-id=""><div class="row"><div class="li-ico y">${si('sparkle')}</div><div style="flex:1"><b>Let STWRD match you</b><div class="sub" style="font-size:13px">Tell us the job, we’ll pick the best available student.</div></div><span class="link">Book</span></div></div>
    ${ws.map(workerCard).join('')}`;
}
function myJobRow(j){
  const t = TYPES[j.type], w = j.worker ? W(j.worker) : null;
  const status = {open:`<span class="badge y">${(j.applicants || []).length} applicants</span>`, booked:'<span class="badge g">Confirmed</span>', done:'<span class="badge b">Needs payment</span>', paid:'<span class="badge">Paid</span>'}[j.status];
  const act = j.status === 'open' ? 'applicants' : j.status === 'done' ? 'pay' : j.status === 'paid' && !j.rated ? 'hrate' : '';
  return `<div class="card job" ${act ? `data-act="${act}" data-id="${j.id}"` : ''}><div class="row"><div class="ico">${si(t.e)}</div>
    <div style="flex:1;min-width:0"><div class="between"><h4>${esc(j.title)}</h4><span class="pay" style="font-size:15px">${$0(j.pay)}</span></div>
    <div class="meta">${w ? esc(w.name) + ' · ' : ''}${esc(j.when)}</div><div class="row" style="gap:6px;margin-top:8px">${status}${j.boost ? `<span class="badge y">${si('lightning')} Boosted</span>` : ''}${j.status === 'paid' && !j.rated ? '<span class="link">Rate</span>' : ''}</div></div></div></div>`;
}
function hJobs(){
  const g = (label, fn) => { const l = S.my.filter(fn); return l.length ? `<h2>${label}</h2>${l.map(myJobRow).join('')}` : ''; };
  return `<h1>My jobs</h1><p class="sub">${S.my.length} posted · ${$0(S.spent)} spent all-time</p>
    ${g('Open · review applicants', j => j.status === 'open')}${g('Confirmed', j => j.status === 'booked')}${g('Needs payment', j => j.status === 'done')}${g('History', j => j.status === 'paid')}`;
}
function hProfile(){
  return `<div style="text-align:center;margin-top:6px"><div class="av lg" style="margin:0 auto;background:#7cb7ff">${esc(initials((S.name || 'Sandra') + ' K'))}</div>
      <h1 style="margin-top:12px">${firstName()} K.</h1><p class="sub">South Bend, IN · Member since 2026</p>
      <div class="row" style="justify-content:center;gap:6px;margin-top:10px"><span class="badge g">${si('identification-card')} ID Verified</span><span class="badge y">${si('house-line')} Trusted Host</span></div></div>
    <div class="grid3" style="margin-top:18px">
      <div class="stat" style="text-align:center"><b>${S.my.length + 10}</b><span>Jobs posted</span></div>
      <div class="stat" style="text-align:center"><b>4.9</b><span>Host rating</span></div>
      <div class="stat" style="text-align:center"><b>100%</b><span>Completion</span></div>
    </div>
    <h2>Membership</h2>
    <div class="card boost"><div class="between"><div><b>STWRD Access</b><div class="sub" style="font-size:13px">$10 every 3 months · renews Jan 10</div></div><span class="badge g">Active</span></div>
      <div class="sub" style="font-size:13px;margin-top:10px">Unlimited posts, worker contact info, and 1 free boost per month.</div></div>
    <h2>Your impact</h2>
    <div class="card"><div class="row"><div class="li-ico y lg">${si('graduation-cap')}</div><div><b style="font-size:20px">$58.50</b><div class="sub" style="font-size:13px">sent to local students’ college funds through your jobs</div></div></div></div>
    <h2>What students say</h2>
    <div class="card"><div class="between"><b>Joel M.</b>${stars(5)}</div><p class="sub" style="margin-top:6px">Super clear instructions and always has the mower ready. Paid same day.</p></div>
    <p class="note">Homeowners are reviewed too. Ratings go both ways so students know where they’re headed.</p>`;
}

/* ---------- sheets ---------- */
function openSheet(kind, data = {}){ S.sheet = {kind, ...data}; drawSheet(); requestAnimationFrame(() => { sheet.classList.add('on'); sbg.classList.add('on'); }); }
function closeSheet(){ sheet.classList.remove('on'); sbg.classList.remove('on'); S.sheet = null; }
function drawSheet(){
  if(!S.sheet) return;
  const fn = SHEETS[S.sheet.kind];
  sheet.innerHTML = `<div class="grab"></div>${fn(S.sheet)}`;
  const c = sheet.querySelector('.chat'); if(c) c.scrollTop = c.scrollHeight;
}
const success = (title, msg, btn = 'Done', act = 'close') => `<div class="success"><div class="ring">${si('check')}</div><h3>${title}</h3><p class="sub">${msg}</p></div><button class="btn" data-act="${act}">${btn}</button>`;

const SHEETS = {
  job(d){
    const j = S.jobs.find(x => x.id === d.id), t = TYPES[j.type], ap = S.applied.includes(j.id), cut = j.pay * S.pct / 100;
    return `<div class="row"><div class="job"><div class="ico">${si(t.e)}</div></div><div><h3>${esc(j.title)}</h3><p class="sub">${t.n} · ${j.dist} mi away</p></div></div>
      <div class="grid3" style="margin-top:16px"><div class="stat"><b style="color:var(--yellow)">${$0(j.pay)}</b><span>Pay</span></div><div class="stat"><b style="font-size:15px">${esc(j.dur)}</b><span>Est. time</span></div><div class="stat"><b style="font-size:15px">${j.dist} mi</b><span>Distance</span></div></div>
      <div class="card" style="margin-top:10px"><div class="sub" style="font-size:12px;font-weight:700">WHEN</div><div style="margin-top:4px">${esc(j.when)}</div>
        <div class="sub" style="font-size:12px;font-weight:700;margin-top:12px">DETAILS</div><p style="margin-top:4px;font-size:14px;line-height:1.5">${esc(j.desc)}</p></div>
      <div class="card" style="margin-top:10px"><div class="row">${avatar(j.owner, 1)}<div style="flex:1"><b>${esc(j.owner)}</b><div class="sub" style="font-size:12px">${j.ov ? si('seal-check','ok') + ' Verified homeowner · ' : ''}${si('star','y')} 4.9 host rating</div></div></div></div>
      <div class="card fund" style="margin-top:10px;padding:12px 16px"><div class="between"><span style="font-weight:700;font-size:14px">${si('graduation-cap')} ${$(cut)} goes to your 529</span><span style="font-size:13px">${$(j.pay - cut)} to you</span></div></div>
      <button class="btn" style="margin-top:14px" data-act="apply" data-id="${j.id}" ${ap ? 'disabled' : ''}>${ap ? `${si('check-circle')} Applied · waiting on ${esc(j.owner)}` : 'Apply for this job'}</button>`;
  },
  jfilters(){
    const f = S.jfilters, c = (k, v, l) => `<button class="chip ${f[k] === v ? 'on' : ''}" data-act="jf" data-k="${k}" data-v="${v}">${l}</button>`;
    return `<h3>Filters</h3>
      <div class="field"><label>Homeowner</label><div class="chips">${c('verified', false, 'Anyone')}${c('verified', true, 'Verified only')}</div></div>
      <div class="field"><label>Distance</label><div class="chips">${c('dist', 0, 'Any')}${c('dist', 1, 'Within 1 mi')}${c('dist', 2, 'Within 2 mi')}</div></div>
      <div class="field"><label>Pay</label><div class="chips">${c('pay', 'any', 'Any')}${c('pay', 'low', 'Under $40')}${c('pay', 'mid', '$40–$80')}${c('pay', 'high', '$80+')}</div></div>
      <div class="grid2" style="margin-top:20px"><button class="btn ghost" data-act="jfreset">Reset all</button><button class="btn" data-act="close">Show ${filteredJobs().length} jobs</button></div>`;
  },
  rate(d){
    const name = d.who;
    if(d.done) return success('Thanks for the feedback', `Your review helps keep STWRD trustworthy for everyone.`);
    return `<h3 style="text-align:center">Rate ${esc(name)}</h3><p class="sub" style="text-align:center">${esc(d.title || '')}</p>
      <div class="stars">${[1,2,3,4,5].map(i => `<button class="${i <= (d.stars || 0) ? 'on' : ''}" data-act="star" data-id="${i}" aria-label="${i} stars">${si('star')}</button>`).join('')}</div>
      <div class="chips" style="justify-content:center;flex-wrap:wrap">${['On time','Friendly','Clear instructions','Great work','Would rehire'].map(t => `<button class="chip ${(d.tags || []).includes(t) ? 'on' : ''}" data-act="tag" data-id="${t}">${t}</button>`).join('')}</div>
      <button class="btn" style="margin-top:18px" data-act="submitRate" ${d.stars ? '' : 'disabled'}>Submit rating</button>`;
  },
  earnings(d){
    const mode = d.mode || 'month';
    const rows = mode === 'month' ? S.months : Object.entries(S.byService).map(([k, v]) => [TYPES[k].s, v]);
    const max = Math.max(...rows.map(r => r[1]));
    return `<h3>Earnings</h3><p class="sub">Last 6 months</p>
      <div class="grid3" style="margin-top:14px"><div class="stat"><b>${$0(S.earned)}</b><span>Total</span></div><div class="stat"><b>${$0(avgMonthly())}</b><span>Avg / month</span></div><div class="stat"><b>${$0(S.earned / S.jobsDone)}</b><span>Avg / job</span></div></div>
      <div class="seg" style="margin-top:14px"><button class="${mode === 'month' ? 'on' : ''}" data-act="emode" data-id="month">Monthly</button><button class="${mode === 'svc' ? 'on' : ''}" data-act="emode" data-id="svc">By service</button></div>
      <div class="card" style="margin-top:10px"><div class="chart">${rows.map((r, i) => `<div class="c ${i === rows.length - 1 && mode === 'month' ? 'on' : mode === 'svc' && r[1] === max ? 'on' : ''}"><em>${$0(r[1])}</em><i style="height:${r[1] / max * 100}%"></i><span>${r[0]}</span></div>`).join('')}</div></div>
      <button class="btn ghost" style="margin-top:12px" data-act="csv">Export CSV</button>`;
  },
  avail(){
    const a = S.avail, days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return `<h3>Availability</h3><p class="sub">Homeowners only see you when you’re open.</p>
      <div class="list-item" style="margin-top:8px"><div class="t"><b>Accepting jobs</b><small>Turn off for exams or busy weeks</small></div><button class="toggle ${S.available ? 'on' : ''}" data-act="toggleAvail" aria-label="Toggle availability"></button></div>
      <div class="field"><label>Days</label><div class="chips" style="flex-wrap:wrap">${days.map(d => `<button class="chip ${a.days.includes(d) ? 'on' : ''}" data-act="day" data-id="${d}">${d}</button>`).join('')}</div></div>
      <div class="field"><label>Preferred hours</label><div class="chips" style="flex-wrap:wrap">${['Morning','Afternoon','Evenings','Flexible'].map(h => `<button class="chip ${a.hours === h ? 'on' : ''}" data-act="hours" data-id="${h}">${h}</button>`).join('')}</div></div>
      <div class="field"><label>Max jobs per week</label><div class="chips">${['1–2','3–5','6+'].map(m => `<button class="chip ${a.max === m ? 'on' : ''}" data-act="max" data-id="${m}">${m}</button>`).join('')}</div></div>
      <button class="btn" style="margin-top:20px" data-act="saveAvail">Save</button>`;
  },
  addService(d){
    if(d.done) return success('Service added', 'It’s now on your profile and in homeowner search.');
    return `<h3>Add a service</h3>
      <div class="field"><label>Type</label><div class="opt-grid">${Object.entries(TYPES).map(([k, t]) => `<button class="opt ${d.type === k ? 'on' : ''}" data-act="svcType" data-id="${k}"><b>${si(t.e)}</b>${t.s}</button>`).join('')}</div></div>
      <div class="field"><label>Your rate ($/hr)</label><input type="number" min="10" max="60" data-bind="sheet.rate" value="${esc(d.rate || 18)}"></div>
      <div class="field"><label>Short description</label><input data-bind="sheet.desc" maxlength="60" placeholder="What’s included?" value="${esc(d.desc || '')}"></div>
      <button class="btn" style="margin-top:18px" data-act="saveService" ${d.type ? '' : 'disabled'}>Save service</button>`;
  },
  premium(d){
    if(d.done) return success('You’re Premium', 'You’ll show first in homeowner search starting now.');
    return `<h3>STWRD Premium</h3><p class="sub">For students who want more jobs, faster.</p>
      <div class="card fund" style="margin-top:14px;text-align:center"><div style="font-size:40px;font-weight:800">$6<span style="font-size:16px">/month</span></div><div class="sub">Cancel anytime</div></div>
      <div class="card" style="margin-top:10px">${['Show first in homeowner search','Early access to boosted jobs','Premium badge on your profile','Unlimited service listings'].map(f => `<div class="list-item"><span class="li-ico y">${si('check-circle')}</span><div class="t">${f}</div></div>`).join('')}</div>
      <button class="btn" style="margin-top:14px" data-act="goPremium">Start Premium (demo)</button>`;
  },
  notes(){
    const list = S.notes[S.role];
    return `<div class="between"><h3>Notifications</h3><span class="link" data-act="readAll">Mark all read</span></div>
      <div style="margin-top:8px">${list.map(n => `<div class="list-item"><div style="width:8px;height:8px;border-radius:50%;background:${S.unread ? 'var(--yellow)' : 'transparent'}"></div><div class="t">${n.t}<small>${n.w} ago</small></div></div>`).join('')}</div>`;
  },
  settings(){
    const other = student() ? 'homeowner' : 'student';
    const items = student()
      ? [['pencil-simple','Edit profile','toast','Profile editing is coming soon'],['calendar-check','Set availability','avail'],['credit-card','Payment & payouts','toast','Payouts land in 1 business day'],['graduation-cap','529 settings','gofund'],['star','Premium','premium']]
      : [['pencil-simple','Edit profile','toast','Profile editing is coming soon'],['credit-card','Payment methods','toast','Visa ending 4417 is your default (demo)'],['house-line','Membership','toast','STWRD Access: active']];
    return `<h3>Settings</h3><div style="margin-top:8px">
      ${items.map(([e, l, a, m]) => `<div class="list-item" data-act="${a}" ${m ? `data-msg="${m}"` : ''} style="cursor:pointer"><div class="li-ico">${si(e)}</div><div class="t">${l}</div><span class="sub">${si('caret-right')}</span></div>`).join('')}
      <div class="list-item" data-act="toast" data-msg="Help is a message away: help@stwrd.net" style="cursor:pointer"><div class="li-ico">${si('chat-circle-dots')}</div><div class="t">Help & support</div><span class="sub">${si('caret-right')}</span></div>
      <div class="list-item" data-act="switch" data-id="${other}" style="cursor:pointer"><div class="li-ico">${si('arrows-clockwise')}</div><div class="t">Switch to ${other} view<small>See the other side of the marketplace</small></div><span class="sub">${si('caret-right')}</span></div>
      <div class="list-item" data-act="signout" style="cursor:pointer"><div class="li-ico" style="color:var(--red)">${si('sign-out')}</div><div class="t" style="color:var(--red)">Sign out &amp; restart demo</div></div></div>`;
  },
  worker(d){
    const w = W(d.id), tab = d.tab || 'stats';
    const tabs = ['stats','about','services','reviews'].map(t => `<button class="${tab === t ? 'on' : ''}" data-act="wtab" data-id="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('');
    const body = {
      stats:`<div class="grid2"><div class="stat"><b>${w.rating.toFixed(1)} ${si('star','y')}</b><span>${w.reviews} reviews</span></div><div class="stat"><b>${w.jobs}</b><span>Jobs done</span></div><div class="stat"><b>${w.hours}</b><span>Verified hours</span></div><div class="stat"><b>100%</b><span>On-time</span></div></div>`,
      about:`<div class="card"><p style="font-size:14px;line-height:1.55">${w.about}</p><div class="list-item" style="margin-top:8px"><div class="t">School<small>${w.school}</small></div></div><div class="list-item"><div class="t">Background check<small>${w.vetted ? 'Passed · parent/guardian consent on file' : 'In progress'}</small></div>${w.vetted ? `<span class="badge g">${si('shield-check')}</span>` : `<span class="badge">${si('clock-countdown')}</span>`}</div></div>`,
      services:`<div class="card">${w.skills.map(s => `<div class="list-item"><div class="li-ico y">${si(TYPES[s].e)}</div><div class="t">${TYPES[s].n}</div><b>${$0(w.rate)}/hr</b></div>`).join('')}</div>`,
      reviews:REVIEWS.map(r => `<div class="card"><div class="between"><b>${r.who}</b>${stars(r.s)}</div><p class="sub" style="margin-top:6px">${r.t}</p></div>`).join('')
    }[tab];
    return `<div class="row">${avatar(w.name, w.c, 'lg')}<div><h3>${w.name}</h3><p class="sub">${w.school} · ${w.dist} mi</p><div class="row" style="gap:6px;margin-top:6px">${w.vetted ? `<span class="badge g">${si('seal-check')} Vetted</span>` : ''}${w.top ? `<span class="badge y">${si('star')} Top Rated</span>` : ''}</div></div></div>
      <div class="seg" style="margin:16px 0 12px">${tabs}</div>${body}
      <div class="grid2" style="margin-top:14px"><button class="btn ghost" data-act="contact" data-id="${w.id}">Message</button><button class="btn" data-act="book" data-id="${w.id}">Book ${w.name.split(' ')[0]}</button></div>`;
  },
  book(d){
    const step = d.step || 1, w = d.worker ? W(d.worker) : null;
    const types = w ? w.skills : Object.keys(TYPES).filter(k => k !== 'other');
    const dots = `<div class="steps">${[1,2,3].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
    if(d.done){
      const who = w ? w.name : 'Joel M.';
      return success('Booking confirmed', `${who} will see you Nov ${d.day} at ${d.time}. ${w ? '' : 'STWRD matched you with the top-rated student nearby.'}`, 'View my jobs', 'toMyJobs');
    }
    if(step === 1) return `${dots}<h3>What do you need?</h3><p class="sub">${w ? 'Services ' + w.name + ' offers' : 'Pick a job type'}</p>
      <div class="opt-grid" style="margin-top:14px">${types.map(k => `<button class="opt ${d.service === k ? 'on' : ''}" data-act="bk" data-k="service" data-v="${k}"><b>${si(TYPES[k].e)}</b>${TYPES[k].s}</button>`).join('')}</div>
      <button class="btn" style="margin-top:18px" data-act="bkNext" ${d.service ? '' : 'disabled'}>Next</button>`;
    if(step === 2) return `${dots}<h3>When?</h3><p class="sub">November 2026</p>
      <div class="card" style="margin-top:12px">${calendar([], d.day, 'bkDay', 11)}</div>
      <div class="field"><label>Start time</label><div class="chips">${['9:00 AM','11:00 AM','1:00 PM','3:00 PM','5:00 PM'].map(t => `<button class="chip ${d.time === t ? 'on' : ''}" data-act="bk" data-k="time" data-v="${t}">${t}</button>`).join('')}</div></div>
      <div class="field"><label>Duration</label><div class="chips">${[['1','1 hr'],['2','2 hrs'],['3','3 hrs'],['4','Half day']].map(([v, l]) => `<button class="chip ${d.dur === v ? 'on' : ''}" data-act="bk" data-k="dur" data-v="${v}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>Address</label><input data-bind="sheet.addr" placeholder="123 Main St, South Bend" value="${esc(d.addr || '')}"></div>
      <div class="grid2" style="margin-top:18px"><button class="btn ghost" data-act="bkBack">Back</button><button class="btn" data-act="bkNext" ${d.day && d.time && d.dur ? '' : 'disabled'}>Next</button></div>`;
    const rate = w ? w.rate : 18, est = rate * Number(d.dur);
    return `${dots}<h3>Who & notes</h3>
      <div class="card" style="margin-top:12px">${w ? `<div class="row">${avatar(w.name, w.c)}<div><b>${w.name}</b><div class="sub" style="font-size:12px">${si('star','y')} ${w.rating} · ${$0(w.rate)}/hr</div></div></div>` : `<div class="row"><div class="li-ico y">${si('sparkle')}</div><div><b>STWRD will match you</b><div class="sub" style="font-size:12px">We’ll pick a vetted, top-rated student who’s free</div></div></div>`}</div>
      <div class="field"><label>Notes for your helper</label><textarea data-bind="sheet.notes" placeholder="Gate code, where supplies are, pets at home…">${esc(d.notes || '')}</textarea></div>
      <div class="card" style="margin-top:12px">
        <div class="list-item"><div class="t">${TYPES[d.service].n}<small>Nov ${d.day} · ${d.time} · ${d.dur === '4' ? 'Half day' : d.dur + ' hr'}</small></div><b>${$0(est)}</b></div>
        <div class="list-item"><div class="t">To student’s 529<small>Included, at no extra cost to you</small></div><span style="color:var(--green);font-weight:700">${si('graduation-cap')} ${$(est * 0.1)}</span></div></div>
      <div class="grid2" style="margin-top:18px"><button class="btn ghost" data-act="bkBack">Back</button><button class="btn" data-act="bkConfirm">Confirm · ${$0(est)}</button></div>`;
  },
  post(d){
    if(d.done) return success('Job posted', `${d.boost ? 'Boosted: students nearby see it first. ' : ''}You’ll get a notification when someone applies.`, 'View my jobs', 'toMyJobs');
    return `<h3>Post a job</h3><p class="sub">Vetted students near you will see it right away.</p>
      <div class="field"><label>Job type</label><div class="opt-grid">${Object.entries(TYPES).map(([k, t]) => `<button class="opt ${d.type === k ? 'on' : ''}" data-act="pk" data-k="type" data-v="${k}"><b>${si(t.e)}</b>${t.s}</button>`).join('')}</div></div>
      <div class="field"><label>Title</label><input data-bind="sheet.title" maxlength="50" placeholder="e.g. Rake front yard leaves" value="${esc(d.title || '')}"></div>
      <div class="field"><div class="between"><label style="margin:0">Description</label><span class="link" data-act="aiDesc">${si('sparkle')} Write with AI</span></div><textarea data-bind="sheet.desc" style="margin-top:6px" placeholder="What needs doing, tools provided, timing…">${esc(d.desc || '')}</textarea></div>
      <div class="field"><label>Pay</label><input type="number" min="10" data-bind="sheet.pay" placeholder="40" value="${esc(d.pay || '')}">${d.type ? `<p class="note" style="margin-top:6px">Typical for ${TYPES[d.type].s.toLowerCase()} nearby: ${{lawn:'$30–$45',snow:'$25–$55',car:'$35–$50',yard:'$50–$90',clean:'$40–$90',pet:'$15–$25 per walk',other:'$20/hr'}[d.type]}</p>` : ''}</div>
      <div class="card boost" style="margin-top:14px"><div class="between"><div><b>${si('lightning')} Boost listing · $2.99</b><div class="sub" style="font-size:13px">Shown first to students nearby</div></div><button class="toggle ${d.boost ? 'on' : ''}" data-act="pboost" aria-label="Boost"></button></div></div>
      <button class="btn" style="margin-top:16px" data-act="submitPost" ${d.type ? '' : 'disabled'}>Post job${d.boost ? ' · $2.99' : ''}</button>`;
  },
  applicants(d){
    const j = S.my.find(x => x.id === d.id);
    return `<h3>${esc(j.title)}</h3><p class="sub">${(j.applicants || []).length} students applied · ${$0(j.pay)}</p>
      <div style="margin-top:12px">${(j.applicants || []).map(id => { const w = W(id); return `<div class="card"><div class="row">${avatar(w.name, w.c)}<div style="flex:1"><b>${w.name}</b><div class="sub" style="font-size:12px">${si('star','y')} ${w.rating} · ${w.jobs} jobs · ${w.dist} mi ${w.vetted ? '· ' + si('seal-check','ok') + ' Vetted' : ''}</div></div></div>
        <div class="grid2" style="margin-top:12px"><button class="btn sm ghost" data-act="worker" data-id="${w.id}">Profile</button><button class="btn sm" data-act="accept" data-id="${j.id}" data-w="${w.id}">Hire</button></div></div>`; }).join('')}</div>`;
  },
  pay(d){
    const j = S.my.find(x => x.id === d.id), w = W(j.worker), tip = d.tip ?? 5, total = j.pay + tip;
    if(d.done) return success('Paid', `${w.name} got ${$(total)}. ${d.to529 && tip ? `Your ${$0(tip)} tip went to their college fund.` : ''}`, 'Rate ' + w.name.split(' ')[0], 'hrate');
    return `<h3>Pay ${w.name}</h3><p class="sub">${esc(j.title)} · ${esc(j.when)}</p>
      <div class="field"><label>Add a tip</label><div class="chips">${[0,5,10,15].map(t => `<button class="chip ${tip === t ? 'on' : ''}" data-act="tip" data-id="${t}">${t ? '$' + t : 'No tip'}</button>`).join('')}</div></div>
      <div class="list-item" style="margin-top:10px"><div class="t"><b>Send tip to their 529</b><small>Help ${w.name.split(' ')[0]} save for college</small></div><button class="toggle ${d.to529 ? 'on' : ''}" data-act="to529" aria-label="Send tip to 529"></button></div>
      <div class="card" style="margin-top:12px"><div class="list-item"><div class="t">Job</div><b>${$(j.pay)}</b></div><div class="list-item"><div class="t">Tip</div><b>${$(tip)}</b></div><div class="list-item"><div class="t"><b>Total</b></div><b style="color:var(--yellow);font-size:18px">${$(total)}</b></div></div>
      <button class="btn" style="margin-top:14px" data-act="payNow">Pay ${$(total)}</button>`;
  },
  chat(){
    const quick = student()
      ? ['What should I charge to mow?','How does the 529 work?','Find me jobs this weekend','How do I get Top Rated?']
      : ['What should I pay for leaf cleanup?','Write a job post for me','Who’s best for snow removal?','Are workers background checked?'];
    return `<div class="between"><h3 class="row" style="gap:8px"><span style="color:var(--yellow);display:flex">${si('sparkle')}</span>STWRD Assistant</h3><span class="badge g">AI</span></div>
      <div class="chat" id="chat">${S.chat.map(m => `<div class="msg ${m.from}">${m.typing ? '<div class="typing"><i></i><i></i><i></i></div>' : m.text}</div>`).join('')}</div>
      <div class="chips" style="flex-wrap:wrap;margin-bottom:10px">${quick.map(q => `<button class="chip" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <form class="row" data-form="chat" style="gap:8px"><input id="chatin" placeholder="Ask anything…" autocomplete="off"><button class="icon-btn" style="background:var(--yellow);color:var(--navy);flex-shrink:0" aria-label="Send">${ico('send')}</button></form>`;
  }
};

/* ---------- AI assistant (scripted for the demo) ---------- */
function reply(q){
  const s = q.toLowerCase();
  if(/529|college|fund|save/.test(s)) return student()
    ? `You choose a percent of every job (you’re at <b>${S.pct}%</b>). When a homeowner pays, that slice goes straight to your linked 529. Right now you have <b>${$(S.fund)}</b> saved. Want to bump it up? Head to the 529 tab.`
    : `Every job you book sends a small slice of the student’s pay to their 529 college fund, at no extra cost to you. You can also route tips to their 529 when you pay.`;
  if(/charge|rate|price|pay|cost|how much/.test(s)){
    if(/leaf|yard|rake/.test(s)) return `Leaf cleanups around South Bend usually run <b>$50–$90</b> depending on yard size. For a typical front + back yard, <b>$70</b> gets quick applicants. Boost it ($2.99) if you need it this weekend.`;
    if(/snow/.test(s)) return `Snow shoveling is usually <b>$25–$55</b> per visit. On-call jobs before 7 AM tend to go for the higher end.`;
    return student() ? `Students nearby charge <b>$16–$20/hr</b> for mowing. With your 4.9 rating and 42 jobs, <b>$18–$20/hr</b> is fair. Most mows take 1–1.5 hrs, so about <b>$30–$35</b> per yard.` : `Most small jobs land between <b>$15–$20/hr</b>. Mowing averages $30–$45, car washes $35–$50, and yard cleanups $50–$90.`;
  }
  if(/write|post|description/.test(s)) return `Here’s a draft:<br><br><i>“Looking for a reliable student to rake and bag leaves in my front and back yard this Saturday morning. Rakes and bags provided. About 3 hours. $70, paid same day.”</i><br><br>Tap <b>Post</b> and hit “Write with AI” to drop this in.`;
  if(/find|weekend|near|jobs/.test(s)) return student() ? `This weekend near you: <b>Fall leaf cleanup</b> ($70, 1.2 mi, boosted), <b>Weekly lawn mowing</b> ($35, 0.4 mi), and a <b>car wash</b> ($40, 0.8 mi). Want me to filter to just these?` : `Top picks near you: <b>Joel M.</b> (4.9 stars, lawn + snow) and <b>Owen B.</b> (4.8 stars, car + yard). Both vetted.`;
  if(/best|who|snow|recommend/.test(s)) return `For snow, I’d go with <b>Joel M.</b>: 4.9 stars, 0.4 mi away, and he holds the Snow Hero badge. <b>Simon A.</b> is a solid backup for early mornings.`;
  if(/safe|background|check|vetted|trust/.test(s)) return `Students marked <b>Vetted</b> passed a background check, and anyone under 18 has parent or guardian consent on file. Homeowners verify their ID, and both sides leave reviews after every job.`;
  if(/top rated|badge|rating/.test(s)) return `Top Rated means 4.8+ stars across 20+ reviews. Show up on time, message before you arrive, and send a quick photo when you finish. Those three things drive most 5-star reviews.`;
  return `I can help with pricing, writing job posts, finding ${student() ? 'jobs' : 'helpers'}, or how the 529 works. What do you need?`;
}
function ask(q){
  if(!q.trim()) return;
  S.chat.push({from:'me', text:esc(q)}, {from:'ai', typing:true});
  drawSheet();
  setTimeout(() => { S.chat.pop(); S.chat.push({from:'ai', text:reply(q)}); if(S.sheet && S.sheet.kind === 'chat') drawSheet(); }, 700 + Math.random() * 500);
}

/* ---------- helpers ---------- */
function download(name, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type:'text/csv'}));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
function completeJob(id){
  const s = S.sched.find(x => x.id === id);
  const cut = +(s.pay * S.pct / 100).toFixed(2);
  s.status = 'done'; s.rated = false;
  S.earned += s.pay; S.jobsDone += 1; S.hours += 2; S.fund += cut;
  S.months[S.months.length - 1][1] += s.pay;
  S.byService[s.type] = (S.byService[s.type] || 0) + s.pay;
  if(S.portfolio[s.type]){ S.portfolio[s.type][0]++; S.portfolio[s.type][1] += 2; }
  S.fundLog.unshift({d:'Nov 10', j:`${s.title} · ${s.who}`, a:cut});
  toast(`+${$0(s.pay)} earned · ${si('graduation-cap')} ${$(cut)} to your 529`);
  render();
  setTimeout(() => openSheet('rate', {who:s.who, title:s.title, sid:id}), 900);
}

/* ---------- events ---------- */
const A = {
  pick:e => { S._pick = e.dataset.id; render(); setTimeout(() => document.getElementById('nm')?.focus(), 30); },
  start:() => { S.role = S._pick; S.tab = 'home'; S.chat = [{from:'ai', text:`Hi ${firstName()}! I’m the STWRD assistant. Ask me about ${student() ? 'pricing, finding jobs, or your 529' : 'pricing, writing a job post, or finding a helper'}.`}]; render(); toast(student() ? 'Welcome! You have 2 jobs coming up.' : 'Welcome back! 3 students applied to your job.'); },
  tab:e => { S.tab = e.dataset.id; render(); main.querySelector('.screen').scrollTop = 0; },
  gofund:() => { closeSheet(); S.tab = 'fund'; render(); },
  filter:e => { S.filter = e.dataset.id; render(); },
  wfilter:e => { S.wfilter = e.dataset.id; render(); },
  schedTab:e => { S.schedTab = e.dataset.id; render(); },
  close:closeSheet,
  toast:e => { toast(e.dataset.msg); },
  notes:() => openSheet('notes'),
  readAll:() => { S.unread = false; drawSheet(); render(); },
  settings:() => openSheet('settings'),
  chat:() => openSheet('chat'),
  ask:e => ask(e.dataset.q),
  job:e => openSheet('job', {id:+e.dataset.id}),
  apply:e => { const id = +e.dataset.id, j = S.jobs.find(x => x.id === id); S.applied.push(id); drawSheet(); render(); toast(`Applied! ${esc(j.owner)} usually replies within an hour.`); },
  jfilters:() => openSheet('jfilters'),
  jf:e => { const k = e.dataset.k, v = e.dataset.v; S.jfilters[k] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v; drawSheet(); render(); },
  jfreset:() => { S.jfilters = {verified:false, dist:0, pay:'any'}; S.filter = 'all'; drawSheet(); render(); },
  complete:e => completeJob(e.dataset.id),
  rate:e => { const s = S.sched.find(x => x.id === e.dataset.id); openSheet('rate', {who:s.who, title:s.title, sid:s.id}); },
  hrate:e => {
    const j = S.my.find(x => x.id === (+e.dataset.id || S.sheet?.id));
    closeSheet(); setTimeout(() => openSheet('rate', {who:W(j.worker).name, title:j.title, hid:j.id}), S.sheet ? 0 : 280);
  },
  star:e => { S.sheet.stars = +e.dataset.id; drawSheet(); },
  tag:e => { const t = S.sheet.tags = S.sheet.tags || [], v = e.dataset.id; t.includes(v) ? t.splice(t.indexOf(v), 1) : t.push(v); drawSheet(); },
  submitRate:() => { const d = S.sheet; if(d.sid) S.sched.find(x => x.id === d.sid).rated = true; if(d.hid) S.my.find(x => x.id === d.hid).rated = true; d.done = true; drawSheet(); render(); },
  earnings:() => openSheet('earnings'),
  emode:e => { S.sheet.mode = e.dataset.id; drawSheet(); },
  csv:() => { download('stwrd-earnings.csv', 'month,earned\n' + S.months.map(m => `${m[0]} 2026,${m[1]}`).join('\n') + `\nTotal,${S.earned}\n`); toast('Earnings CSV downloaded'); },
  exportHours:() => { download('stwrd-service-hours.csv', 'service,jobs,verified_hours\n' + Object.entries(S.portfolio).map(([k, [j, h]]) => `${TYPES[k].n},${j},${h}`).join('\n') + '\n'); toast('Service-hours record downloaded'); },
  avail:() => openSheet('avail'),
  toggleAvail:() => { S.available = !S.available; drawSheet(); render(); },
  day:e => { const d = S.avail.days, v = e.dataset.id; d.includes(v) ? d.splice(d.indexOf(v), 1) : d.push(v); drawSheet(); },
  hours:e => { S.avail.hours = e.dataset.id; drawSheet(); },
  max:e => { S.avail.max = e.dataset.id; drawSheet(); },
  saveAvail:() => { closeSheet(); toast('Availability saved'); },
  addService:() => openSheet('addService', {}),
  svcType:e => { S.sheet.type = e.dataset.id; drawSheet(); },
  saveService:() => { const d = S.sheet; S.services.push({type:d.type, rate:+d.rate || 18, desc:d.desc || TYPES[d.type].n}); d.done = true; drawSheet(); render(); },
  premium:() => { closeSheet(); setTimeout(() => openSheet('premium', {}), S.sheet ? 280 : 0); },
  goPremium:() => { S.premium = true; S.sheet.done = true; drawSheet(); render(); },
  switch:e => { const keepName = S.name; S = initState(); S.name = keepName; S._pick = e.dataset.id; closeSheet(); A.start(); },
  signout:() => { S = initState(); closeSheet(); render(); },
  worker:e => openSheet('worker', {id:e.dataset.id}),
  wtab:e => { S.sheet.tab = e.dataset.id; drawSheet(); },
  contact:e => toast(`Message sent to ${W(e.dataset.id).name}. Contact info unlocked with STWRD Access.`),
  book:e => openSheet('book', {worker:e.dataset.id || null, step:1, dur:'2'}),
  bk:e => { S.sheet[e.dataset.k] = e.dataset.v; drawSheet(); },
  bkDay:e => { S.sheet.day = +e.dataset.id; drawSheet(); },
  bkNext:() => { S.sheet.step++; drawSheet(); },
  bkBack:() => { S.sheet.step--; drawSheet(); },
  bkConfirm:() => {
    const d = S.sheet, w = d.worker || 'joel', est = (d.worker ? W(d.worker).rate : 18) * Number(d.dur);
    S.my.unshift({id:Date.now(), type:d.service, title:TYPES[d.service].n, pay:est, status:'booked', worker:w, when:`Nov ${d.day} · ${d.time}`});
    S.activity.unshift({e:'calendar-check', t:`You booked <b>${W(w).name}</b> for ${TYPES[d.service].n.toLowerCase()}`, w:'just now'});
    d.done = true; drawSheet(); render();
  },
  toMyJobs:() => { closeSheet(); S.tab = 'myjobs'; render(); },
  post:() => { if(student()) return; openSheet('post', {}); },
  pk:e => { S.sheet[e.dataset.k] = e.dataset.v; drawSheet(); },
  pboost:() => { S.sheet.boost = !S.sheet.boost; drawSheet(); },
  aiDesc:() => {
    const d = S.sheet, t = d.type || 'yard';
    const drafts = {lawn:'Need a reliable student to mow, edge, and bag clippings for my front and back yard. Mower and trimmer provided. About 1.5 hours. Paid same day.', snow:'Looking for someone to shovel my two-car driveway and front walk after the next snowfall, ideally before 7 AM. Shovel and salt provided.', car:'Hand wash and interior vacuum for one SUV. Hose, buckets, and supplies are in the garage. About 2 hours.', yard:'Rake and bag leaves in my front and back yard plus flower beds. Rakes and bags provided. About 3 hours this Saturday morning.', clean:'Help sorting and sweeping out my garage and carrying boxes to the curb. Some lifting. About 3–4 hours.', pet:'Walk my friendly golden retriever for 30 minutes after school, three days this week. Leash and treats by the door.', other:'Quick help around the house. Details on arrival. About 2 hours, paid same day.'};
    d.desc = drafts[t]; if(!d.title) d.title = {lawn:'Mow front + back yard', snow:'Shovel driveway after snow', car:'Wash + vacuum my SUV', yard:'Rake and bag leaves', clean:'Garage clean-out', pet:'Dog walks after school', other:'Help around the house'}[t]; if(!d.type) d.type = t;
    drawSheet(); toast(`${si('sparkle')} Drafted by STWRD AI`);
  },
  submitPost:() => {
    const d = S.sheet, pay = +d.pay || 40, title = d.title || TYPES[d.type].n;
    S.my.unshift({id:Date.now(), type:d.type, title, pay, status:'open', applicants:[], boost:!!d.boost, when:'Flexible'});
    S.activity.unshift({e:'megaphone', t:`You posted <b>${esc(title)}</b>${d.boost ? ' (boosted)' : ''}`, w:'just now'});
    d.done = true; drawSheet(); render();
    const job = S.my[0];
    setTimeout(() => { job.applicants.push('joel'); S.unread = true; S.notes.homeowner.unshift({t:`Joel M. applied to ${esc(title)}.`, w:'1m'}); render(); toast(`${si('user-plus')} Joel M. applied to ${esc(title)}`); }, 3500);
  },
  applicants:e => openSheet('applicants', {id:+e.dataset.id}),
  accept:e => { const j = S.my.find(x => x.id === +e.dataset.id), w = W(e.dataset.w); j.status = 'booked'; j.worker = w.id; if(j.when === 'Flexible') j.when = 'Sat, Nov 21 · 9 AM'; closeSheet(); render(); toast(`${w.name} is hired. We’ll remind you both the day before.`); },
  pay:e => openSheet('pay', {id:+e.dataset.id, tip:5, to529:true}),
  tip:e => { S.sheet.tip = +e.dataset.id; drawSheet(); },
  to529:() => { S.sheet.to529 = !S.sheet.to529; drawSheet(); },
  payNow:() => { const d = S.sheet, j = S.my.find(x => x.id === d.id); j.status = 'paid'; S.spent += j.pay + d.tip; S.month += j.pay + d.tip; d.done = true; drawSheet(); render(); }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if(!el || el.hasAttribute('disabled')) return;
  const fn = A[el.dataset.act];
  if(fn){ e.preventDefault(); fn(el); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if(el.dataset.bind){
    const [root, key] = el.dataset.bind.split('.');
    if(root === 'name'){ S.name = el.value.trim(); }
    else if(root === 'sheet' && S.sheet){ S.sheet[key] = el.value; }
  }
  if(el.dataset.actInput === 'pct'){
    S.pct = +el.value;
    document.getElementById('pctv').textContent = S.pct + '%';
    document.getElementById('pctx').innerHTML = `About <b style="color:var(--white)">${$(44 * S.pct / 100)}</b> from an average $44 job.`;
    document.getElementById('projv').textContent = $0(projected(4));
  }
});
document.addEventListener('change', e => { if(e.target.dataset.actInput === 'pct') render(); });
document.addEventListener('submit', e => {
  if(e.target.dataset.form === 'chat'){ e.preventDefault(); const i = document.getElementById('chatin'); const q = i.value; i.value = ''; ask(q); setTimeout(() => document.getElementById('chatin')?.focus(), 10); }
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.sheet) closeSheet(); if(e.key === 'Enter' && e.target.id === 'nm' && S._pick) A.start(); });

/* deep link: demo.html?role=student&name=Joel */
const qp = new URLSearchParams(location.search);
if(qp.has('embed')) document.body.classList.add('embed');
if(qp.get('role') === 'student' || qp.get('role') === 'homeowner'){ S._pick = qp.get('role'); S.name = (qp.get('name') || '').slice(0, 20); A.start(); }
else render();
window.addEventListener('message', ev => { if(ev.data && ev.data.stwrdRole){ S = initState(); S.name = ev.data.stwrdRole === 'student' ? 'Joel' : 'Sandra'; S._pick = ev.data.stwrdRole; closeSheet(); A.start(); } });
})();
