const state = {
  apps: [],
  filteredApps: [],
};

const appGrid = document.getElementById('appGrid');
const statsEl = document.getElementById('stats');
const searchInput = document.getElementById('searchInput');
const osFilter = document.getElementById('osFilter');
const resultsCount = document.getElementById('resultsCount');

function formatSize(size) {
  return `${Number(size).toFixed(1)} MB`;
}

function buildStats(apps) {
  const totalApps = apps.length;
  const totalSize = apps.reduce((sum, app) => sum + Number(app.binarySizeMB || 0), 0);
  const minOsVersions = [...new Set(apps.map((app) => app.minimumOS))].sort();

  const cards = [
    { label: 'Apps', value: totalApps },
    { label: 'Total size', value: `${totalSize.toFixed(1)} MB` },
    { label: 'Min OS range', value: `${minOsVersions[0]} - ${minOsVersions[minOsVersions.length - 1]}` },
    { label: 'Platforms', value: [...new Set(apps.map((app) => app.platform))].join(', ') },
  ];

  statsEl.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <span class="label">${card.label}</span>
          <span class="value">${card.value}</span>
        </article>
      `,
    )
    .join('');
}

function populateFilters(apps) {
  const osValues = [...new Set(apps.map((app) => app.minimumOS))].sort((a, b) => parseFloat(a) - parseFloat(b));

  osFilter.innerHTML = `<option value="all">All versions</option>${osValues
    .map((v) => `<option value="${v}">${v}</option>`)
    .join('')}`;
}

function renderApps(apps) {
  if (apps.length === 0) {
    appGrid.innerHTML = '<div class="empty-state">No apps match the current search.</div>';
    resultsCount.textContent = '0 apps';
    return;
  }

  appGrid.innerHTML = apps
    .map(
      (app) => `
        <article class="app-card">
          <div class="app-card-header">
            <h4>${app.name}</h4>
            <span class="version-chip">v${app.version}</span>
          </div>
          <div class="app-meta">
            <div class="meta-row"><span>Bundle ID</span><strong>${app.bundleId}</strong></div>
            <div class="meta-row"><span>Platform</span><strong>${app.platform}</strong></div>
            <div class="meta-row"><span>Minimum OS</span><strong>${app.minimumOS}</strong></div>
            <div class="meta-row"><span>Binary Size</span><strong>${formatSize(app.binarySizeMB)}</strong></div>
          </div>
        </article>
      `,
    )
    .join('');

  resultsCount.textContent = `${apps.length} app${apps.length === 1 ? '' : 's'}`;
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedOs = osFilter.value;

  state.filteredApps = state.apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm) ||
      app.bundleId.toLowerCase().includes(searchTerm);

    const matchesOs = selectedOs === 'all' || app.minimumOS === selectedOs;

    return matchesSearch && matchesOs;
  });

  renderApps(state.filteredApps);
}

async function init() {
  try {
    const response = await fetch('catalog.json');
    const catalog = await response.json();
    state.apps = catalog.apps;
    state.filteredApps = [...state.apps];

    buildStats(state.apps);
    populateFilters(state.apps);
    renderApps(state.filteredApps);

    searchInput.addEventListener('input', applyFilters);
    osFilter.addEventListener('change', applyFilters);
  } catch (error) {
    appGrid.innerHTML = '<div class="empty-state">The catalog could not be loaded. Please check catalog.json.</div>';
    resultsCount.textContent = 'Catalog unavailable';
    console.error('Failed to load app catalog:', error);
  }
}

init();
