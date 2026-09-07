(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navPanel.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  document.querySelectorAll('.bar__fill[data-fill]').forEach((bar) => {
    requestAnimationFrame(() => {
      bar.style.width = `${bar.dataset.fill}%`;
    });
  });

  const weekFilter = document.querySelector('[data-week-filter]');
  const weekLabels = document.querySelectorAll('[data-week-label]');
  if (weekFilter) {
    weekFilter.addEventListener('change', () => {
      const label = weekFilter.value === 'season' ? 'Season to date' : `Week ${weekFilter.value}`;
      weekLabels.forEach((item) => { item.textContent = label; });
    });
  }

  const search = document.querySelector('[data-stat-search]');
  const rows = [...document.querySelectorAll('[data-player-rows] tr')];
  const emptyState = document.querySelector('[data-empty-state]');
  if (search && rows.length) {
    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();
      let visibleRows = 0;
      rows.forEach((row) => {
        const matches = !query || row.dataset.player.includes(query);
        row.hidden = !matches;
        if (matches) visibleRows += 1;
      });
      if (emptyState) emptyState.hidden = visibleRows !== 0;
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
})();
