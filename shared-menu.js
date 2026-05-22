(() => {
  const menuItems = [
    { href: 'index.html', label: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f' },
    { href: 'kniga/oglavlenie.html?v=20260522-2-9-img', label: '\u0427\u0438\u0442\u0430\u0442\u044c \u043a\u043d\u0438\u0433\u0443' },
    { href: 'odoevsky/index.html', label: '\u041e\u0434\u043e\u0435\u0432\u0441\u043a\u0438\u0439' },
    { href: 'kommentarii.html', label: '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438' },
    { href: 'sitemap.html', label: '\u041a\u0430\u0440\u0442\u0430 \u0441\u0430\u0439\u0442\u0430' },
    { href: 'kontakt.html', label: '\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b' },
  ];

  const currentScript = document.currentScript;
  const scriptSrc = currentScript ? currentScript.getAttribute('src') || '' : '';
  const siteRoot = scriptSrc.endsWith('shared-menu.js')
    ? scriptSrc.slice(0, -'shared-menu.js'.length)
    : '';

  const makeHref = (href) => `${siteRoot}${href}`;

  const renderMenu = () => `
    <button class="nav-toggle" aria-expanded="false" aria-label="\u041c\u0435\u043d\u044e">
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
})();
