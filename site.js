(() => {
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const money = n => '$' + Math.round(n).toLocaleString('en-US');

  /* sticky nav border */
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), {passive:true});

  /* demo role switching: tabs + any [data-role] link */
  const frame = $('#demoFrame');
  const setRole = role => {
    $$('.role-switch button').forEach(b => b.classList.toggle('on', b.dataset.role === role));
    frame.contentWindow.postMessage({stwrdRole: role}, '*');
  };
  $$('[data-role]').forEach(el => el.addEventListener('click', () => setRole(el.dataset.role)));

  /* how-it-works tabs */
  $$('[data-how]').forEach(b => b.addEventListener('click', () => {
    $$('[data-how]').forEach(x => x.classList.toggle('on', x === b));
    $$('[data-how-panel]').forEach(p => p.hidden = p.dataset.howPanel !== b.dataset.how);
  }));

  /* 529 calculator: 40 working weeks/yr, monthly compounding at 5%/yr */
  const ids = ['Jobs', 'Pay', 'Pct', 'Yrs'];
  const calc = () => {
    const [jobs, pay, pct, yrs] = ids.map(i => +$('#c' + i).value);
    $('#vJobs').textContent = jobs; $('#vPay').textContent = '$' + pay; $('#vPct').textContent = pct + '%'; $('#vYrs').textContent = yrs;
    const yearly = jobs * pay * 40, monthlyIn = yearly * pct / 100 / 12, r = 0.05 / 12, n = yrs * 12;
    const fund = monthlyIn * ((Math.pow(1 + r, n) - 1) / r);
    const contributed = monthlyIn * n, earned = yearly * yrs;
    $('#rFund').textContent = money(fund); $('#rEarn').textContent = money(earned);
    $('#rIn').textContent = money(contributed); $('#rGrow').textContent = money(fund - contributed);
    $('#rKeep').textContent = money(earned - contributed);
  };
  ids.forEach(i => $('#c' + i).addEventListener('input', calc)); calc();

  /* waitlist: stored locally until a form backend is wired up (see README) */
  $('#waitlist').addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try { const l = JSON.parse(localStorage.getItem('stwrd_waitlist') || '[]'); l.push({...data, at: new Date().toISOString()}); localStorage.setItem('stwrd_waitlist', JSON.stringify(l)); } catch (_) {}
    e.target.style.display = 'none'; $('#ok').style.display = 'block';
  });

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), {threshold: .12});
  $$('.reveal').forEach(el => io.observe(el));
})();
