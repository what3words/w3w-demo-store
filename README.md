# what3words — Sales demo portal

A static site used by the BD/sales team to demo what3words integrations to prospective customers. Served live at [demo-store.what3words.com](https://demo-store.what3words.com).

## Demos

| Page | File | Integration |
|------|------|-------------|
| Checkout | `checkout.html` | jQuery + w3w autosuggest plugin |
| Address validator | `address-validator-form.html` | Swiftcomplete (`js/sc-app.js`) |
| Delivery instructions — LTR | `delivery-notes.html` | what3words web component |
| Delivery instructions — RTL | `delivery-notes-rtl.html` | what3words web component |

## Getting started

```bash
npm install
npm start        # serves the site at http://localhost:4000
```

Sass is included as a dev dependency — no global install needed.

## Editing styles

There are two separate stylesheets:

**Demo pages** (`checkout.html`, `delivery-notes*.html`, `address-validator-form.html`)

Source lives in `css/scss/`. Compile with:

```bash
npm run build:css
# or watch during development:
npm run watch:css
```

The compiled `css/styles.css` is committed — no CI build step.

**Homepage** (`index.html`)

Source lives in `styles.scss` at the repo root. Compile with:

```bash
sass styles.scss styles.css
```

Design tokens (colours, type, spacing) are in `assets/colors_and_type.css` as CSS custom properties and are shared across the homepage and its card components.

## Development mode

To run the server and watch demo-page SCSS simultaneously:

```bash
npm run dev
```

## Project structure

```
index.html                  — demo portal homepage (card grid)
checkout.html               — Checkout demo
address-validator-form.html — Address validator demo (Swiftcomplete)
delivery-notes.html         — Delivery instructions demo (LTR)
delivery-notes-rtl.html     — Delivery instructions demo (RTL)

assets/
  colors_and_type.css       — design tokens (CSS custom properties)
  fonts/                    — Source Sans 3 variable font
  thumbs/                   — homepage card screenshots

css/
  scss/                     — SCSS source for demo pages
  styles.css                — compiled output (committed)

images/                     — favicon and UI icons

js/
  app.js                    — jQuery w3w autosuggest (checkout / delivery-notes)
  sc-app.js                 — Swiftcomplete integration (address-validator-form)
  vendor/                   — bundled third-party scripts

styles.scss / styles.css    — homepage-only styles (compiled, committed)
```
