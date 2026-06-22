(() => {
  const menuItems = [
    { href: 'main.html', label: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f' },
    { href: 'kniga/oglavlenie.html', label: '\u0427\u0438\u0442\u0430\u0442\u044c \u043a\u043d\u0438\u0433\u0443' },
    { href: 'odoevsky/index.html', label: '\u041e\u0434\u043e\u0435\u0432\u0441\u043a\u0438\u0439' },
    // { href: 'odoevsky-blog/index.html', label: '\u0411\u043b\u043e\u0433 \u041e\u0434\u043e\u0435\u0432\u0441\u043a\u043e\u0433\u043e' },
    { href: 'museum.html', label: '\u041c\u0443\u0437\u0435\u0439' },
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

  const loadGoatCounter = () => {
    if (document.querySelector('script[data-goatcounter="https://pisarchuk.goatcounter.com/count"]')) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = '//gc.zgo.at/count.js';
    script.dataset.goatcounter = 'https://pisarchuk.goatcounter.com/count';
    document.head.appendChild(script);
  };

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

  const blockCopyAndDownload = () => {
    document.body.classList.add('copy-locked');

    const protectedEvents = ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'];
    protectedEvents.forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        const target = event.target;
        const isEditable = target instanceof HTMLElement
          && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

        if (!isEditable) {
          event.preventDefault();
        }
      });
    });

    document.querySelectorAll('img').forEach((image) => {
      image.setAttribute('draggable', 'false');
      image.setAttribute('loading', image.getAttribute('loading') || 'lazy');
    });

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const isEditable = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (isEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      const blockedCtrlKeys = ['c', 's', 'u', 'p'];
      const blockedDevtoolsKeys = ['i', 'j', 'c'];
      const shouldBlock =
        event.key === 'F12'
        || ((event.ctrlKey || event.metaKey) && blockedCtrlKeys.includes(key))
        || ((event.ctrlKey || event.metaKey) && event.shiftKey && blockedDevtoolsKeys.includes(key));

      if (shouldBlock) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  };

  const initVisitCounter = () => {
    const footer = document.querySelector('.site-footer');

    if (!footer) {
      return;
    }

    const storageKey = 'zaMillionLetDoVisitCount';
    let nextVisitCount = 1;

    try {
      nextVisitCount = Number.parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
      localStorage.setItem(storageKey, String(nextVisitCount));
    } catch (error) {
      nextVisitCount = 1;
    }

    const counter = document.createElement('span');
    counter.className = 'visit-counter';
    counter.textContent = `\u041f\u043e\u0441\u0435\u0449\u0435\u043d\u0438\u0439: ${nextVisitCount}`;
    footer.appendChild(counter);
  };

  loadGoatCounter();
  blockCopyAndDownload();
  initVisitCounter();
})();
