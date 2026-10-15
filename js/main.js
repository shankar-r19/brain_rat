(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll progress ---- */
  var bar = document.getElementById('bar');
  function prog(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  addEventListener('scroll', prog, {passive:true}); prog();

  /* ---- reveal on scroll ---- */
  var items = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e, i){
        if (!e.isIntersecting) return;
        var sibs = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
        setTimeout(function(){ e.target.classList.add('in'); }, Math.min(sibs, 6) * 70);
        io.unobserve(e.target);
      });
    }, {rootMargin:'0px 0px -70px 0px', threshold:.08});
    items.forEach(function(el){ io.observe(el); });
  }

  /* ---- Series 01 grid ---- */
  var DIR = 'assets/series/';
  var FIGS = [
    {f:'rat_coffee.png',   n:'Coffee Rat',   t:'Made a proper cup',   c:'var(--butter)', r:'Common'},
    {f:'rat_reading.png',  n:'Reading Rat',  t:'Finished a chapter',  c:'var(--sky)',    r:'Common'},
    {f:'rat_walk.png',     n:'Walking Rat',  t:'Went round the block',c:'var(--mint)',   r:'Common'},
    {f:'rat_plants.png',   n:'Plant Rat',    t:'Watered the ferns',   c:'var(--sage)',   r:'Common'},
    {f:'rat_paint.png',    n:'Painting Rat', t:'Made something bad',  c:'var(--blush)',  r:'Rare'},
    {f:'rat_play.png',     n:'Playing Rat',  t:'Touched the grass',   c:'var(--coral)',  r:'Rare'},
    {f:'rat_nature.png',   n:'Outdoor Rat',  t:'Looked at a tree',    c:'var(--pool)',   r:'Rare'},
    {f:'rat_selfcare.png', n:'Spa Rat',      t:'Did the whole ritual',c:'var(--lilac)',  r:'Rare'},
    {f:'rat_nap.png',      n:'Napping Rat',  t:'Simply lay down',     c:'var(--rose)',   r:'Chase'}
  ];
  var grid = document.getElementById('series-grid');
  if (grid) {
    FIGS.forEach(function(x){
      var d = document.createElement('div');
      d.className = 'fig rv';
      d.innerHTML =
        '<div class="art" style="background:' + x.c + '">' +
          '<span class="rar">' + x.r + '</span>' +
          '<img src="' + DIR + x.f + '" alt="' + x.n + '" loading="lazy">' +
        '</div>' +
        '<div class="meta"><b>' + x.n + '</b><span>' + x.t + '</span></div>';
      grid.appendChild(d);
    });
    var secret = document.createElement('div');
    secret.className = 'fig secret rv';
    secret.innerHTML =
      '<div class="art"><span class="rar" style="background:var(--amber)">Secret</span>' +
      '<span class="q">?</span></div>' +
      '<div class="meta"><b>???</b><span>1 in 72 boxes</span></div>';
    grid.appendChild(secret);
    // re-observe the freshly built tiles
    document.querySelectorAll('#series-grid .rv').forEach(function(el){
      if (reduce || !('IntersectionObserver' in window)) el.classList.add('in');
      else io.observe(el);
    });
  }

  /* ---- Roulette ---- */
  var SEGS = [
    {label:'15 min',    title:'The Quick Peek',        colour:'var(--mint)',
     copy:'Long enough to answer the message. Not long enough to end up in a stranger’s holiday photos from 2019.'},
    {label:'30 min',    title:'The Civil Half-Hour',   colour:'var(--blush)',
     copy:'The sensible default. Reply to everything, post the thing, get out with your dignity intact.'},
    {label:'1 hour',    title:'The Full Hour',         colour:'var(--sky)',
     copy:'For genuine work, or a genuine wallow. Either way the countdown is right there, watching you.'},
    {label:'Open‑ended', title:'The Trust Exercise', colour:'var(--butter)',
     copy:'No timer. It stays open until you close it yourself. A test of character, and occasionally a failure of one.'},
    {label:'Lock now',  title:'The Change of Heart',   colour:'var(--coral)',
     copy:'Ends your window early, on the spot. The most underrated button in the entire app.'},
    {label:'Surprise',  title:'The Blind Box',         colour:'var(--lilac)',
     copy:'Let the rat choose your window for you. Reckless, thrilling, and the reason this wheel exists.'}
  ];
  var wheel = document.getElementById('wheel');
  var btn   = document.getElementById('spin-btn');
  var prize = document.getElementById('prize');

  if (wheel && btn) {
    var n = SEGS.length, step = 360 / n, stops = [];
    SEGS.forEach(function(s, i){
      stops.push(s.colour + ' ' + (i * step) + 'deg ' + ((i + 1) * step) + 'deg');
    });
    wheel.style.background = 'conic-gradient(' + stops.join(',') + ')';

    SEGS.forEach(function(s, i){
      var a = i * step + step / 2;               // centre angle of this slice
      var el = document.createElement('span');
      el.className = 'seg-label';
      el.textContent = s.label;
      el.style.transform = 'rotate(' + a + 'deg) translateY(-104px) rotate(' + (-a) + 'deg)';
      wheel.appendChild(el);
    });

    var turn = 0, busy = false;
    btn.addEventListener('click', function(){
      if (busy) return;
      busy = true; btn.disabled = true; btn.textContent = '...';

      var pick = Math.floor(Math.random() * n);
      var centre = pick * step + step / 2;
      // land the chosen slice under the pointer at 12 o'clock, plus 4-6 full turns
      var spins = 4 + Math.floor(Math.random() * 3);
      var target = turn + spins * 360 + ((360 - centre) - (turn % 360) + 360) % 360;
      turn = target;
      wheel.style.transform = 'rotate(' + turn + 'deg)';

      setTimeout(function(){
        var s = SEGS[pick];
        prize.innerHTML =
          '<span class="tag" style="background:' + s.colour + '">You got &middot; ' + s.label + '</span>' +
          '<h3>' + s.title + '</h3>' +
          '<p>' + s.copy + '</p>' +
          '<p class="fine">Every option here is real and lives in the app. Spin again if the wheel misjudged you.</p>';
        prize.classList.remove('pop-in');
        void prize.offsetWidth;
        prize.classList.add('pop-in');
        btn.disabled = false; btn.textContent = 'SPIN'; busy = false;
      }, reduce ? 60 : 4500);
    });
  }

  /* ---- Demo video: self-hosted, so it plays inline everywhere ---- */
  var vid = document.getElementById('demo');
  var play = document.getElementById('play-btn');
  if (vid && play) {
    play.addEventListener('click', function(){
      play.classList.add('gone');
      vid.controls = true;
      vid.play();
    });
    // Put the big button back whenever the clip finishes or is paused at the start.
    vid.addEventListener('ended', function(){
      vid.controls = false;
      vid.currentTime = 0;
      play.classList.remove('gone');
    });
  }

})();
