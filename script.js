const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });


    const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('drawerOverlay');

function setDrawer(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', !open);
  document.body.classList.toggle('no-scroll', open);
}

burger.addEventListener('click', () => setDrawer(true));
document.getElementById('drawerClose').addEventListener('click', () => setDrawer(false));
overlay.addEventListener('click', () => setDrawer(false));
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });

    const sections = ['home', 'chi-siamo', 'menu', 'dove-siamo'].map(id => document.getElementById(id));
    const navLinks = document.querySelectorAll('.navlinks a, .drawer-links a');
    const setActive = (id) => {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => observer.observe(s));

    /* ---- MENU: livello 1 (Da Bere / Da Mangiare) ---- */
    const menuMain = document.getElementById('menuMain');
    const level1Btns = document.querySelectorAll('.tab-btn[data-main]');
    const mainPanels = document.querySelectorAll('.menu-panel[data-main]');

    function selectMain(key) {
      level1Btns.forEach(b => {
        const active = b.dataset.main === key;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active);
      });
      mainPanels.forEach(p => p.classList.toggle('active', p.dataset.main === key));
      menuMain.classList.remove('collapsed');

      if (window.matchMedia('(max-width:840px)').matches) {
        document.getElementById('backToCategories').scrollIntoView({ block: 'start' });
      }
    }
    level1Btns.forEach(btn => btn.addEventListener('click', () => selectMain(btn.dataset.main)));

    /* su mobile, all'arrivo, nessuna categoria è aperta: solo i due pulsanti */
    if (window.matchMedia('(max-width:840px)').matches) {
      menuMain.classList.add('collapsed');
      level1Btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    }

    document.getElementById('backToCategories').addEventListener('click', () => {
      menuMain.classList.add('collapsed');
      level1Btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      document.getElementById('menu').scrollIntoView({ block: 'start' });
    });

    /* ---- MENU: livello 2 (sottocategorie), una per ogni categoria principale ---- */
    mainPanels.forEach(panel => {
      const subBtns = panel.querySelectorAll('.level2-btn');
      const subPanels = panel.querySelectorAll('.sub-panel');
      subBtns.forEach(btn => btn.addEventListener('click', () => {
        subBtns.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
        subPanels.forEach(p => p.classList.toggle('active', p.id === 'sub-' + btn.dataset.sub));
      }));
    });


    /* ---- GALLERIA A NASTRO ---- */
/* tipo: 'h' = orizzontale, 'v' = verticale, 's' = quadrata */
const ribbonRows = [
  /* riga 1 (scorre verso sinistra) */
  [
    { src: 'images/gallery/s01.jpg',  type: 's' },
    { src: 'images/gallery/v01.jpg',  type: 'v' },
    { src: 'images/gallery/h01.jpg',  type: 'h' },
    { src: 'images/gallery/v02.jpg',  type: 'v' },
    { src: 'images/gallery/h02.jpg',  type: 'h' },
    { src: 'images/gallery/v03.jpg',  type: 'v' },
    { src: 'images/gallery/h03.jpeg', type: 'h' },
    { src: 'images/gallery/v06.jpeg', type: 'v' },
    { src: 'images/gallery/h04.jpg',  type: 'h' },
  ],
  /* riga 2 (scorre verso destra) */
  [
    { src: 'images/gallery/h05.jpg',  type: 'h' },
    { src: 'images/gallery/v05.jpg',  type: 'v' },
    { src: 'images/gallery/s02.JPG',  type: 's' },
    { src: 'images/gallery/v04.jpeg', type: 'v' },
    { src: 'images/gallery/h06.jpeg', type: 'h' },
    { src: 'images/gallery/v07.jpeg', type: 'v' },
    { src: 'images/gallery/h07.jpeg', type: 'h' },
    { src: 'images/gallery/v08.JPG',  type: 'v' },
  ],
];

const RIBBON_RATIO = { h: 3 / 2, v: 2 / 3, s: 1 };   /* proporzioni delle tessere */
const RIBBON_SPEED_DESKTOP = 50;                      /* pixel al secondo */
const RIBBON_SPEED_MOBILE = 45;

function buildRibbon() {
  const tracks = document.querySelectorAll('.ribbon-track');
  if (!tracks.length) return;

  const viewport = document.querySelector('.ribbon-row').clientWidth;
  const speed = window.innerWidth <= 840 ? RIBBON_SPEED_MOBILE : RIBBON_SPEED_DESKTOP;

  tracks.forEach((track, rowIndex) => {
    const order = ribbonRows[rowIndex % ribbonRows.length];
    if (!order || !order.length) return;

    track.textContent = '';

    /* ripete l'elenco finché un giro è largo almeno quanto lo schermo */
    let passes = 0;
    do {
      order.forEach(photo => {
        const tile = document.createElement('div');
        tile.className = 'ribbon-tile';
        tile.style.aspectRatio = String(RIBBON_RATIO[photo.type] || 3 / 2);

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = passes === 0 ? (photo.alt || '') : '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.draggable = false;

        tile.appendChild(img);
        track.appendChild(tile);
      });
      passes++;
    } while (track.offsetWidth < viewport && passes < 20);

    /* durata in base alla lunghezza del giro: velocità costante qualunque sia il numero di foto */
    const lap = track.offsetWidth;
    track.style.setProperty('--ribbon-duration', (lap / speed) + 's');

    /* copia identica subito dopo: il giro riparte senza che si veda la giunzione */
    Array.from(track.children).forEach(tile => {
      const copy = tile.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
}

buildRibbon();

/* si ricostruisce solo se cambia la larghezza (non quando la barra del browser mobile sale e scende) */
let ribbonWidth = window.innerWidth;
let ribbonTimer;
window.addEventListener('resize', () => {
  if (window.innerWidth === ribbonWidth) return;
  ribbonWidth = window.innerWidth;
  clearTimeout(ribbonTimer);
  ribbonTimer = setTimeout(buildRibbon, 250);
});

/* mobile: tenendo il dito sulle righe si fermano, quando lo alzi ripartono */
(function ribbonTouchPause() {
  const ribbon = document.getElementById('ribbon');
  const rows = ribbon.querySelector('.ribbon-rows');

  rows.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') ribbon.classList.add('is-paused');
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type =>
    rows.addEventListener(type, () => ribbon.classList.remove('is-paused'))
  );
  rows.addEventListener('contextmenu', e => e.preventDefault());
})();

