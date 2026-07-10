(() => {
  const menuItems = [
    { href: 'main.html', label: 'Главная' },
    { href: 'kniga/oglavlenie.html', label: 'Читать книгу' },
    { href: 'odoevsky/index.html', label: 'Одоевский' },
    { href: 'odoevsky-blog/index.html', label: 'Блог Одоевского' },
    { href: 'museum.html', label: 'Музей' },
    { href: 'kommentarii.html', label: 'Комментарии' },
    { href: 'sitemap.html', label: 'Карта сайта' },
    { href: 'kontakt.html', label: 'Контакты' },
  ];

  const currentScript = document.currentScript;
  const scriptSrc = currentScript ? currentScript.getAttribute('src') || '' : '';
  const siteRoot = scriptSrc.endsWith('shared-menu.js')
    ? scriptSrc.slice(0, -'shared-menu.js'.length)
    : '';

  const makeHref = (href) => `${siteRoot}${href}`;

  const loadGoatCounter = () => {
    if (document.querySelector('script[data-goatcounter="https://pisarchuk.goatcounter.com/count"]')) {
      return;
    }

    const projectPrefix = '/za-million-let-do';
    const currentPath = window.location.pathname || '/';
    const trackedPath =
      currentPath === projectPrefix || currentPath === `${projectPrefix}/`
        ? '/'
        : currentPath.startsWith(`${projectPrefix}/`)
          ? currentPath.slice(projectPrefix.length)
          : currentPath;

    const script = document.createElement('script');
    script.async = true;
    script.src = '//gc.zgo.at/count.js';
    script.dataset.goatcounter = 'https://pisarchuk.goatcounter.com/count';
    script.dataset.goatcounterSettings = JSON.stringify({ path: trackedPath });
    document.head.appendChild(script);
  };

  const renderMenu = () => `
    <button class="nav-toggle" aria-expanded="false" aria-label="Меню">
      <span></span>
    </button>
    <nav>
      <ul class="nav-menu">
        ${menuItems
          .map((item) => `<li><a href="${makeHref(item.href)}">${item.label}</a></li>`)
          .join('')}
      </ul>
    </nav>
  `;

  const initMenu = (topNav) => {
    topNav.innerHTML = renderMenu();

    const navToggle = topNav.querySelector('.nav-toggle');
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      topNav.classList.toggle('menu-open');
    });
  };

  document.querySelectorAll('[data-shared-menu]').forEach(initMenu);

  loadGoatCounter();
})();
