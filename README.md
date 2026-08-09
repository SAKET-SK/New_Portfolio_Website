# Saket Khopkar — Portfolio Website

A single-page personal portfolio built with plain HTML, CSS, and JavaScript — no build step, no framework, no dependencies beyond two CDN-hosted libraries. The UI follows Apple's *Designing Fluid Interfaces* principles (instant press feedback, critically-damped motion, translucent materials, reduced-motion support) layered on top of a clean editorial design system.

**Live sections:** Home · About (Work Experience, Education, Projects, Achievements) · Recommendations · Knowledge Base · Blogs · Contact

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Markup | HTML5 | Semantic single-page structure |
| Styling | CSS3 (custom properties, Grid, Flexbox) | Design system, theming, responsive layout — no preprocessor, no framework |
| Behavior | Vanilla JavaScript (ES6+) | DOM interactions, no bundler required |
| Email delivery | [EmailJS](https://www.emailjs.com/) (`@emailjs/browser@4`, loaded via jsDelivr CDN) | Sends contact-form submissions client-side without a backend |
| Icons | [Font Awesome 6.4.0](https://fontawesome.com/) (CDN) | UI and social icons |
| Typography | [Google Fonts](https://fonts.google.com/) — `DM Serif Display` (headings) & `DM Sans` (body) | Loaded via `@import` in CSS and preconnected in `<head>` |
| SEO / structured data | JSON-LD (`schema.org/Person`) | Rich-result eligibility for search engines |

No package manager, bundler, or server-side code is used. The site is 100% static and can be hosted on any static host (GitHub Pages, Netlify, Vercel, S3, etc.).

---

## Project Structure

```
.
├── index.html          # All markup and content — single page, six sections
├── style.css            # Full design system + responsive rules
├── script.js             # All interactivity (no external JS dependencies besides EmailJS)
├── images/                # Referenced but not included in this deliverable — see "Assets" below
│   ├── title_logo.png
│   ├── New-Logo.PNG
│   ├── my-photo.jpg
│   ├── project-1.png … project-5.jfif
│   └── blog-1.png … blog-8.png
└── portfolio_new.mp4     # Intro video, embedded via <iframe> in the hero section
```

> **Deployment note:** `index.html` references its stylesheet and script at `styles/style.css` and `scripts/script.js`. Either place `style.css` and `script.js` inside `styles/` and `scripts/` subfolders on your web server, or update the two `<link>`/`<script>` paths in `index.html` to match a flat structure — whichever matches your hosting layout.

---

## Features

### Design system
- CSS custom properties (`:root`) drive every color, shadow, radius, spacing, and easing curve — theme-wide changes happen in one place.
- Full **light/dark mode**, toggled client-side, re-mapping the same variable set rather than duplicating styles.
- Fluid typography and spacing via `clamp()` — text and section padding scale continuously between phone and 4K desktop instead of jumping at breakpoints.
- Apple-inspired motion: a critically-damped `cubic-bezier(0.32, 0.72, 0, 1)` easing curve used site-wide, plus dedicated `:active` press states (buttons, cards, nav links, icon buttons) so touch input feels instant instead of waiting for `:hover`.

### Layout & responsiveness
- CSS Grid / Flexbox layouts throughout; no fixed pixel widths on major containers.
- Breakpoints tuned for **phone (≤480px), phone landscape, tablet (≤768px / ≤992px), desktop, and large desktop (≥1400px)** — not just a single mobile cutoff.
- 44px minimum touch targets on interactive controls at phone widths (WCAG 2.5.5 / Apple HIG guidance).
- `env(safe-area-inset-*)` support so the header, mobile nav, and back-to-top button respect notches/home-indicators on modern phones.

### Navigation
- Fixed, frosted-glass header (`backdrop-filter: blur() saturate()`) that gains a border/shadow only once the page is actually scrolled (a "scroll-edge" material effect, not a hard-coded divider).
- Scroll-spy: the active nav link updates automatically based on which section is in view.
- Slide-in mobile menu (translucent glass) that closes automatically on link tap, outside click, or <kbd>Esc</kbd>, and returns focus to the toggle button for keyboard users.
- Sticky scroll-progress bar under the header, updated 1:1 with scroll position (no lag).
- Floating **back-to-top** button that fades in after ~60% of a viewport's worth of scrolling.

### Testimonial carousel
- Auto-advancing carousel with manual prev/next controls and dot indicators generated dynamically from the testimonial count.
- Pauses on hover/keyboard focus so autoplay never interrupts reading.
- Recomputes its bound/unbound state on window resize — a device rotated or a window resized across the 768px breakpoint mid-session won't leave it half-broken.
- Collapses to a stacked, swipeable list (no JS transform) on mobile.

### Contact form
- Client-side email delivery via EmailJS — no backend, no server-side form handler required.
- **Inline validation:** fields only show a red/green border after being visited (`blur`), so required fields don't flash invalid before the user has typed anything; the state updates live as they correct it.
- Loading state on submit (`Sending…` + disabled button), success/error feedback, and automatic reset of both the form and its validation state after a successful send.

### Theme toggle
- Persists only for the current session (no `localStorage`, by design — see *Customization* below if you want to persist across reloads).
- Icon swap animates with a quick rotate-and-settle spring instead of an instant glyph replacement.

### Accessibility
- Respects three OS-level preferences out of the box:
  - `prefers-reduced-motion: reduce` — disables/shortens all animations and transitions site-wide, and disables carousel autoplay.
  - `prefers-reduced-transparency: reduce` — swaps translucent header/glass surfaces for solid backgrounds.
  - `prefers-contrast: more` — thickens borders on cards and form fields.
- Visible `:focus-visible` outlines on every interactive element for keyboard navigation.
- `aria-label`s on icon-only buttons (theme toggle, carousel dots, back-to-top).
- Semantic landmarks (`<header>`, `<nav>`, `<section>`, `<footer>`) and a logical heading hierarchy.

### Performance
- `loading="lazy"` on all below-the-fold images (project cards, blog cards); the hero photo and logo stay eager since they're above the fold.
- Only `transform` and `opacity` are animated (compositor-friendly, GPU-accelerated) — no layout-triggering properties are transitioned.
- Fonts are preconnected (`<link rel="preconnect">`) before being requested.
- Zero JS dependencies beyond EmailJS; no bundler, no runtime framework overhead.

---

## Getting Started

1. **Clone or download** this repository.
2. Make sure the `images/` folder and `portfolio_new.mp4` are present alongside `index.html` (see *Project Structure*).
3. Place `style.css` and `script.js` at the paths referenced in `index.html` (`styles/style.css`, `scripts/script.js`), or edit those two references to match your layout.
4. Open `index.html` directly in a browser, or serve the folder with any static file server:

   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```

No install step, no `npm install`, no build command.

---

## Configuration

### EmailJS (contact form)
The form is wired to a specific EmailJS account via three values in `script.js`:

```js
emailjs.init("SVGG2rcl0GAtjc2D5");                          // Public Key
emailjs.sendForm("service_0z9ijp9", "template_ng24h1n", this); // Service ID, Template ID
```

To point the form at your own EmailJS account:
1. Create a service + template at [emailjs.com](https://www.emailjs.com/).
2. Replace the Public Key, Service ID, and Template ID above with your own.
3. Confirm your EmailJS template's variable names match the form's `name` attributes: `senderName`, `senderEmail`, `senderTopic`, `senderSubject` (the last one is bound to the message textarea — a pre-existing naming choice in the template, not a bug).

### Theming
All colors, shadows, radii, and spacing live in `:root` and `.dark-mode` at the top of `style.css`. Change `--primary`, `--secondary`, `--font-display`, `--font-body`, etc. to re-skin the entire site without touching component rules.

---

## Browser Support

Built on widely-supported modern CSS/JS (Grid, custom properties, `backdrop-filter`, `clamp()`, `matchMedia`, `IntersectionObserver`-free scroll logic). Tested against current versions of:

- Chrome / Edge (Chromium)
- Firefox
- Safari (macOS & iOS)

`backdrop-filter` gracefully degrades to a solid background in browsers without support or when `prefers-reduced-transparency` is set.

---

## Known Limitations / Roadmap

- Theme choice (light/dark) is not persisted across page reloads (no `localStorage` used, per current design constraints).
- No CMS or content pipeline — all copy lives directly in `index.html`.
- No automated tests or CI — this is a static marketing/portfolio site, not an application.
- Video embed uses an `<iframe>` pointed at a local `.mp4`; consider replacing with a `<video>` element for broader compatibility if the current embed doesn't render on a given host.

---

## Author

**Saket Khopkar**
Software Engineer · Full-Stack Developer · Generative AI

- Email: saketkhopkar910@gmail.com
- GitHub: [@SAKET-SK](https://github.com/SAKET-SK)
- LinkedIn: [saket-khopkar-336684198](https://www.linkedin.com/in/saket-khopkar-336684198/)

## License

No license file is included. All rights reserved to Saket Khopkar unless a license is added.
