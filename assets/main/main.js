(() => {
  const PAGES = Object.freeze({
    home: 'index.html',
    scores: 'scores.html',
    teams: 'teams.html',
    stats: 'stats.html',
    news: 'news.html'
  });

  const NAVIGATION = Object.freeze([
    { key: 'home', label: 'Home', index: '00' },
    { key: 'scores', label: 'Live Scores', index: '01' },
    { key: 'teams', label: 'Teams', index: '02' },
    { key: 'stats', label: 'Stat Lab', index: '03' },
    { key: 'news', label: 'News Feed', index: '04' }
  ]);

  const currentPage = window.location.pathname.split('/').pop() || PAGES.home;

  function pageKeyFromHref(href) {
    const page = href.split('/').pop().split('#')[0];
    return Object.keys(PAGES).find((key) => PAGES[key] === page);
  }

  function resolvePageHref(href) {
    const key = pageKeyFromHref(href);
    return key ? PAGES[key] : href;
  }

  function setupNavigation() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.includes('://')) return;
      link.setAttribute('href', resolvePageHref(href));
    });

    const navToggle = document.querySelector('[data-nav-toggle]');
    const navPanel = document.querySelector('[data-nav-panel]');
    if (!navToggle || !navPanel) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navPanel.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  function setupStatLab() {
    document.querySelectorAll('.bar__fill[data-fill]').forEach((bar) => {
      requestAnimationFrame(() => { bar.style.width = `${bar.dataset.fill}%`; });
    });

    const weekFilter = document.querySelector('[data-week-filter]');
    if (weekFilter) {
      weekFilter.addEventListener('change', () => {
        const label = weekFilter.value === 'season' ? 'Season to date' : `Week ${weekFilter.value}`;
        document.querySelectorAll('[data-week-label]').forEach((item) => { item.textContent = label; });
      });
    }

    const search = document.querySelector('[data-stat-search]');
    const rows = [...document.querySelectorAll('[data-player-rows] tr')];
    const emptyState = document.querySelector('[data-empty-state]');
    if (search && rows.length) {
      search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        const visibleRows = rows.filter((row) => {
          const matches = !query || row.dataset.player.includes(query);
          row.hidden = !matches;
          return matches;
        });
        if (emptyState) emptyState.hidden = visibleRows.length !== 0;
      });
    }

    const sortSelect = document.querySelector('[data-sort-players]');
    const tableBody = document.querySelector('[data-player-rows]');
    if (sortSelect && tableBody) {
      sortSelect.addEventListener('change', () => {
        const key = sortSelect.value;
        rows.sort((first, second) => Number(second.dataset[key]) - Number(first.dataset[key]));
        rows.forEach((row, index) => {
          row.querySelector('td').textContent = String(index + 1).padStart(2, '0');
          tableBody.appendChild(row);
        });
      });
    }
  }

  function setupScoreFilters() {
    document.querySelectorAll('[data-filter]').forEach((filter) => {
      filter.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('is-active'));
        filter.classList.add('is-active');
        const selected = filter.dataset.filter;
        document.querySelectorAll('[data-status]').forEach((card) => {
          card.hidden = selected !== 'all' && card.dataset.status !== selected;
        });
      });
    });
  }

  function setupPrivacyPopup() {
    if (!document.body || document.querySelector('.privacy-modal')) return;

    const style = document.createElement('style');
    style.textContent = `
      :root {
        --privacy-background: #0e0e0e;
        --privacy-panel: rgba(20, 20, 20, .94);
        --privacy-line: #4a4140;
        --privacy-text: #fbf8ee;
        --privacy-muted: #c0b9b0;
        --privacy-button: #c5281f;
        --privacy-button-hover: #e05232;
        --privacy-accent: #f1682c;
      }
      body.privacy-page {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 1.25rem;
        color: var(--privacy-text);
        background: var(--privacy-background);
        font-family: Arial, sans-serif;
      }
      .privacy-background {
        position: fixed;
        inset: -2rem;
        z-index: 0;
        background: url("assets/img/bg.svg") center / cover no-repeat;
        filter: blur(2px);
        transform: scale(1.04);
        pointer-events: none;
      }
      @media (max-width: 600px) {
        .privacy-background {
          background-image: url("assets/img/mob.png");
          background-position: center;
        }
      }
      .privacy-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1;
        background: rgba(0, 0, 0, 0);
        -webkit-backdrop-filter: blur(0px);
        backdrop-filter: blur(0px);
        pointer-events: none;
      }
      .privacy-modal {
        position: relative;
        z-index: 2;
        width: min(100%, 25rem);
        max-width: 25rem;
        padding: clamp(1.5rem, 5vw, 2.25rem);
        background: var(--privacy-panel);
        border: 1px solid var(--privacy-line);
        border-radius: 3px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, .65), 0 0 0 1px rgba(241, 104, 44, .12);
        border-top: 3px solid var(--privacy-accent);
      }
      .privacy-modal .eyebrow,
      .privacy-modal__meta,
      .privacy-modal__link { font-family: Arial, sans-serif; }
      .privacy-modal .eyebrow {
        color: var(--privacy-accent);
        font-size: .75rem;
        letter-spacing: .04em;
      }
      .privacy-modal h1 {
        margin: .8rem 0 .9rem;
        font-size: clamp(1.7rem, 5vw, 2.25rem);
        line-height: 1.15;
      }
      .privacy-modal h1 span { color: var(--privacy-text); }
      .privacy-modal p {
        margin: 0;
        color: var(--privacy-muted);
        font-size: .98rem;
        line-height: 1.65;
      }
      .privacy-modal__meta {
        margin-top: 1.2rem;
        color: var(--privacy-muted);
        font-size: .78rem;
      }
      .privacy-modal__actions {
        display: grid;
        gap: .65rem;
        margin-top: 1.5rem;
      }
      .privacy-modal__button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 3rem;
        padding: .8rem 1rem;
        border: 1px solid var(--privacy-button);
        color: #ffffff;
        background: var(--privacy-button);
        font-weight: 700;
        text-decoration: none;
        transition: background .2s ease, color .2s ease;
      }
      .privacy-modal__button:hover,
      .privacy-modal__button:focus-visible {
        background: var(--privacy-button-hover);
        outline: 2px solid var(--privacy-button-hover);
        outline-offset: 2px;
      }
      .privacy-modal__button--secondary {
        color: var(--privacy-muted);
        background: transparent;
        border-color: var(--privacy-line);
      }
      .privacy-modal__button--secondary:hover,
      .privacy-modal__button--secondary:focus-visible {
        color: var(--privacy-text);
        background: rgba(241, 104, 44, .12);
        outline-color: var(--privacy-accent);
      }
      .privacy-modal__link {
        display: inline-block;
        margin-top: 1.25rem;
        color: var(--privacy-muted);
        font-size: .78rem;
        text-decoration: underline;
        text-underline-offset: .2rem;
      }
      .privacy-modal__link:hover,
      .privacy-modal__link:focus-visible { color: var(--privacy-accent); }
      @media (max-width: 600px) {
        .privacy-page { padding: .75rem; }
        .privacy-modal {
          width: min(100%, 20rem);
          max-width: 20rem;
          padding: 1.25rem;
        }
        .privacy-modal h1 {
          margin: .6rem 0 .7rem;
          font-size: 1.65rem;
        }
        .privacy-modal p { font-size: .88rem; line-height: 1.5; }
        .privacy-modal__meta { margin-top: .9rem; font-size: .72rem; }
        .privacy-modal__actions { gap: .5rem; margin-top: 1.15rem; }
        .privacy-modal__button {
          min-height: 2.1rem;
          padding: .7rem .8rem;
          font-size: .88rem;
        }
        .privacy-modal__link { margin-top: 1rem; font-size: .72rem; }
      }
    `;

    document.head.appendChild(style);
    document.body.classList.add('privacy-page');
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="privacy-background" aria-hidden="true"></div>
      <div class="privacy-backdrop" aria-hidden="true"></div>
      <main class="privacy-modal" role="dialog" aria-labelledby="privacy-title" aria-describedby="privacy-description">
        <span class="eyebrow">EVERYGAME.EU &middot; ENTRY GATE</span>
        <h1 id="privacy-title">Your privacy.<br><span>Your call.</span></h1>
        <p id="privacy-description">We use essential cookies to keep this experience working. Choose how you would like to continue. Either choice will take you to a separate website.</p>
        <p class="privacy-modal__meta">No account required &middot; Choice is yours</p>
        <div class="privacy-modal__actions">
          <a class="privacy-modal__button" href="https://aussiefusion.site/">Accept &amp; continue</a>
          <a class="privacy-modal__button privacy-modal__button--secondary" href="https://aussiefusion.site/">Decline &amp; view privacy policy</a>
        </div>
        <a class="privacy-modal__link" href="https://aussiefusion.site/">Read the full privacy policy</a>
      </main>
    `);
  }

  function start() {
    document.documentElement.dataset.currentPage = pageKeyFromHref(currentPage) || 'home';
    setupNavigation();
    setupStatLab();
    setupScoreFilters();
    if (currentPage === 'lander.html') setupPrivacyPopup();
  }

  start();
})();
