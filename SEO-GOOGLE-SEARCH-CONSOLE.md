# Google Search Console setup

Site property:

`https://srg4snn-gif.github.io/za-million-let-do/`

Recommended verification method:

1. Open Google Search Console with the Google account that should own the site.
2. Add a new URL-prefix property for `https://srg4snn-gif.github.io/za-million-let-do/`.
3. Choose the HTML file verification method.
4. Download the verification file from Google.
5. Put that file in the repository root.
6. Commit and push it to both `main` and `gh-pages`.
7. Wait for GitHub Pages to deploy, then click Verify in Search Console.

After verification:

1. Submit sitemap: `https://srg4snn-gif.github.io/za-million-let-do/sitemap.xml`.
2. Use URL Inspection for these important pages after GitHub Pages deploys:
   - `https://srg4snn-gif.github.io/za-million-let-do/`
   - `https://srg4snn-gif.github.io/za-million-let-do/kniga/`
   - `https://srg4snn-gif.github.io/za-million-let-do/kniga/oglavlenie.html`
   - `https://srg4snn-gif.github.io/za-million-let-do/kniga/predislovie.html`
   - `https://srg4snn-gif.github.io/za-million-let-do/kniga/obstoyatelstva-obreteniya-teksta.html`
   - all published `kniga/*.html` chapter pages except `chapter-template.html`
   - `https://srg4snn-gif.github.io/za-million-let-do/odoevsky/`
   - all published `odoevsky/glava-*.html` pages
   - `https://srg4snn-gif.github.io/za-million-let-do/kommentarii.html`
3. Request indexing for the inspected pages if Google has not crawled the fresh version yet.

Contact email for reports and ownership notes:

`davidpisarchuk@gmail.com`
