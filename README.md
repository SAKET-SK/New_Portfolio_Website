# Saket Khopkar — Portfolio Website

A personal portfolio built with plain HTML, CSS, and JavaScript, now extended with an **AI Mode**: a full-screen RAG-powered chatbot that visitors can toggle into from the navbar to ask questions about my experience, projects, and skills — answered live by an LLM grounded in my actual background, not a canned FAQ.

The classic site still ships zero-framework, zero-build-step, following Apple's *Designing Fluid Interfaces* principles (instant press feedback, critically-damped motion, translucent materials, reduced-motion support) on top of a clean editorial design system. AI Mode is layered on top using the same design tokens, plus one small serverless function.

**Live sections (Classic Mode):** Home · About (Work Experience, Education, Projects, Achievements) · Recommendations · Knowledge Base · Blogs · Contact
**AI Mode:** A conversational assistant answering questions about my experience, AI/ML projects, tech stack, and how to get in touch — toggle via the navbar button, no page reload.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Markup | HTML5 | Semantic single-page structure, plus a Classic/AI Mode view toggle |
| Styling | CSS3 (custom properties, Grid, Flexbox) | Design system, theming, responsive layout — no preprocessor, no framework |
| Behavior | Vanilla JavaScript (ES6+) | DOM interactions, view toggling, chat UI — no bundler required |
| Email delivery | [EmailJS](https://www.emailjs.com/) (`@emailjs/browser@4`, loaded via jsDelivr CDN) | Sends contact-form submissions client-side without a backend |
| Icons | [Font Awesome 6.4.0](https://fontawesome.com/) (CDN) | UI and social icons |
| Typography | [Google Fonts](https://fonts.google.com/) — `DM Serif Display` (headings) & `DM Sans` (body) | Loaded via `@import` in CSS and preconnected in `<head>` |
| SEO / structured data | JSON-LD (`schema.org/Person`) | Rich-result eligibility for search engines |
| **AI backend** | **Netlify Functions (Node.js)** | Serverless function handling chat requests — no server to manage |
| **LLM** | **OpenAI `gpt-5-mini`** | Generates grounded replies from retrieved context |
| **Embeddings / retrieval** | **OpenAI `text-embedding-3-small` + cosine similarity + keyword overlap** | Lightweight hybrid retrieval over a flat JSON knowledge base — no vector DB service needed at this content scale |
| **Memory** | In-browser JS array (session-only) | Keeps recent chat turns for context, resets on reload — consistent with the site's existing no-`localStorage` approach |

The classic site remains 100% static; AI Mode adds exactly one serverless function and two small JSON files. No package manager or bundler is required for the frontend.

---

## Project Structure

```
.
├── index.html                    # Classic Mode + AI Mode markup, one page
├── styles/
│   └── style.css                  # Full design system + AI Mode chat UI styles
├── scripts/
│   └── script.js                   # All interactivity, including AI Mode toggle + chat logic
├── images/                          # Referenced but not included in this deliverable
├── portfolio_new.mp4               # Intro video, embedded via <iframe> in the hero section
├── netlify/
│   └── functions/
│       └── chat.js                  # Serverless function: retrieval + OpenAI call (Netlify)
├── api/
│   └── chat.js                       # Same logic, Vercel function format (unused unless you deploy there)
├── data/
│   ├── knowledge-source.json        # Plain-text knowledge base chunks (human-edited)
│   └── knowledge.json                # Same chunks + embeddings (generated, not hand-edited)
├── tools/
│   └── build-knowledge.js            # Generates knowledge.json from knowledge-source.json
├── netlify.toml                      # Netlify build/functions config
├── .nvmrc                             # Pins Node 20 for the functions runtime
├── package.json                      # Project metadata + build-knowledge script
├── .env.example                       # Template for the OPENAI_API_KEY env var
└── .gitignore                          # Excludes .env, node_modules, etc.
```

> **Deployment note:** `index.html` references its stylesheet and script at `styles/style.css` and `scripts/script.js`. Keep that folder layout, or update the two `<link>`/`<script>` paths to match a flat structure if you prefer.

---

## Features

### AI Mode (new)
- **Navbar toggle**: an "AI Mode" button sits next to the theme toggle. Clicking it swaps the entire page — no reload — into a full-screen chat interface; the same button (now labeled "Classic Mode") switches back. Position never moves.
- **Agentic RAG pipeline**: each message is embedded, matched against a knowledge base of my experience/projects/skills via combined semantic (cosine similarity) + keyword retrieval, and the top matches are fed to `gpt-5-mini` as grounding context — so answers stay factual instead of generic or hallucinated.
- **Conversational memory**: the last 10 turns are kept in memory for follow-up questions, session-only (no `localStorage`), consistent with how theme choice already works on this site.
- **Quick-inquiry chips**: one-tap prompts for Experience, AI & ML Projects, Tech Stack, and Contact Info.
- **Design continuity**: the chat shell, bubbles, and input bar are built entirely from the site's existing CSS custom properties (`--primary`, `--secondary`, `--radius`, `--shadow`, `--ease-spring`) and glass `backdrop-filter` treatment, so it matches light/dark mode automatically with zero new colors introduced. Respects `prefers-reduced-motion` like the rest of the site.
- **Zero new frontend dependencies**: the chat UI is vanilla JS/CSS, same as the rest of the site — the only new infrastructure is one small serverless function.

### Design system
- CSS custom properties (`:root`) drive every color, shadow, radius, spacing, and easing curve — theme-wide changes happen in one place.
- Full **light/dark mode**, toggled client-side, re-mapping the same variable set rather than duplicating styles.
- Fluid typography and spacing via `clamp()` — text and section padding scale continuously between phone and 4K desktop instead of jumping at breakpoints.
- Apple-inspired motion: a critically-damped `cubic-bezier(0.32, 0.72, 0, 1)` easing curve used site-wide, plus dedicated `:active` press states so touch input feels instant instead of waiting for `:hover`.

### Layout & responsiveness
- CSS Grid / Flexbox layouts throughout; no fixed pixel widths on major containers.
- Breakpoints tuned for **phone (≤480px), phone landscape, tablet (≤768px / ≤992px), desktop, and large desktop (≥1400px)**.
- 44px minimum touch targets on interactive controls at phone widths (WCAG 2.5.5 / Apple HIG guidance).
- `env(safe-area-inset-*)` support so the header, mobile nav, back-to-top button, and AI Mode chat input respect notches/home-indicators on modern phones.

### Navigation
- Fixed, frosted-glass header (`backdrop-filter: blur() saturate()`) that gains a border/shadow only once the page is actually scrolled.
- Scroll-spy: the active nav link updates automatically based on which section is in view (Classic Mode only).
- Slide-in mobile menu that closes automatically on link tap, outside click, or <kbd>Esc</kbd>, and returns focus to the toggle button for keyboard users.
- Sticky scroll-progress bar under the header, updated 1:1 with scroll position.
- Floating **back-to-top** button that fades in after ~60% of a viewport's worth of scrolling.

### Testimonial carousel
- Auto-advancing carousel with manual prev/next controls and dot indicators.
- Pauses on hover/keyboard focus so autoplay never interrupts reading.
- Recomputes its bound/unbound state on window resize.
- Collapses to a stacked, swipeable list (no JS transform) on mobile.

### Contact form
- Client-side email delivery via EmailJS — no backend, no server-side form handler required.
- Inline validation: fields only show a red/green border after being visited, updating live as the user corrects them.
- Loading state on submit, success/error feedback, and automatic reset after a successful send.

### Theme toggle
- Persists only for the current session (no `localStorage`, by design).
- Icon swap animates with a quick rotate-and-settle spring.

### Accessibility
- Respects `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast` OS-level preferences, including within AI Mode's chat animations.
- Visible `:focus-visible` outlines on every interactive element.
- `aria-label`s on icon-only buttons; `aria-live` region on the chat message list so replies are announced to screen readers.
- Semantic landmarks and a logical heading hierarchy.

### Performance
- `loading="lazy"` on all below-the-fold images.
- Only `transform` and `opacity` are animated (compositor-friendly, GPU-accelerated).
- Fonts are preconnected before being requested.
- AI Mode's retrieval is a flat in-memory JSON lookup (no external vector DB round-trip) — the only network calls per chat turn are two OpenAI API requests.

---

## Getting Started (Classic site only)

1. **Clone or download** this repository.
2. Make sure `images/` and `portfolio_new.mp4` are present alongside `index.html`.
3. Place `style.css` and `script.js` at `styles/style.css` and `scripts/script.js`, or edit those two references to match your layout.
4. Open `index.html` directly, or serve the folder:

   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```

No install step needed for the classic site alone — AI Mode's button will render, but the chat calls will fail without the backend set up (see below).

---

## Setting up AI Mode

### 1. Requirements
- **Node.js 18+** (needed for the built-in `fetch` used to call OpenAI). This repo pins Node 20 via `.nvmrc`.
- An **OpenAI API key** with available credit — [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 2. Generate the knowledge base
```bash
npm run build-knowledge
```
or directly:
```bash
OPENAI_API_KEY=sk-your-key-here node tools/build-knowledge.js
```
This reads `data/knowledge-source.json` (plain-text facts about my experience, projects, skills, education, blogs, and contact info) and writes `data/knowledge.json` — the same chunks with OpenAI embeddings attached. Re-run this any time `knowledge-source.json` changes (new project, new job, updated skills).

`knowledge.json` **must be committed** to the repo — it's the file the live function actually searches at request time.

### 3. Test locally with Netlify Dev
A plain static server (Live Server, `python -m http.server`, etc.) cannot run the serverless function — you'll get a 405 error on `/​.netlify/functions/chat`. Use the Netlify CLI instead:
```bash
npm install -g netlify-cli
netlify dev
```
This serves the static site **and** runs `netlify/functions/chat.js` locally, reading `OPENAI_API_KEY` from your `.env` file automatically. Open the URL it prints (typically `http://localhost:8888`).

### 4. Deploy (Netlify via GitHub)
1. Commit and push everything, including `data/knowledge.json`.
2. In Netlify: **Site settings → Environment variables** → add `OPENAI_API_KEY`.
3. Push/redeploy — `netlify.toml` registers `netlify/functions` automatically.

### 5. Ongoing maintenance
- **Content changes**: edit `knowledge-source.json`, re-run `npm run build-knowledge`, redeploy.
- **Model changes**: `CHAT_MODEL` and `EMBEDDING_MODEL` are each defined once, at the top of `netlify/functions/chat.js` and `tools/build-knowledge.js` — update those constants if OpenAI ever retires the current models.
- **Cost**: each chat turn costs a fraction of a cent (one embedding call + one short `gpt-5-mini` completion). Monitor at [platform.openai.com/usage](https://platform.openai.com/usage).

### Known quirks worth knowing (found during setup)
- `gpt-5-mini` requires `max_completion_tokens`, not the older `max_tokens` parameter.
- `gpt-5-mini` only supports the default `temperature` (1) — passing any other value errors out.
- As a reasoning-style model, part of the token budget can be spent on internal reasoning before any visible output is written — keep `max_completion_tokens` generous (1200 in this setup) or replies can come back empty.
- The frontend calls `/.netlify/functions/chat` directly rather than relying on a `/api/chat` redirect, since Netlify Dev didn't reliably apply the rewrite for POST requests in testing.

---

## Configuration

### EmailJS (contact form)
```js
emailjs.init("SVGG2rcl0GAtjc2D5");                          // Public Key
emailjs.sendForm("service_0z9ijp9", "template_ng24h1n", this); // Service ID, Template ID
```
To point the form at your own EmailJS account, replace these three values and confirm your template's variable names match the form's `name` attributes: `senderName`, `senderEmail`, `senderTopic`, `senderSubject`.

### Theming
All colors, shadows, radii, and spacing live in `:root` and `.dark-mode` at the top of `style.css`, including the AI Mode chat interface — re-skinning the classic site re-skins the chatbot automatically.

### AI Mode content
Edit `data/knowledge-source.json` to change what the assistant knows, then re-run `npm run build-knowledge`.

---

## Browser Support

Built on widely-supported modern CSS/JS (Grid, custom properties, `backdrop-filter`, `clamp()`, `matchMedia`). Tested against current versions of Chrome/Edge (Chromium), Firefox, and Safari (macOS & iOS).

`backdrop-filter` gracefully degrades to a solid background in browsers without support or when `prefers-reduced-transparency` is set.

---

## Known Limitations / Roadmap

- Theme choice (light/dark) is not persisted across page reloads (no `localStorage` used, per current design constraints) — AI Mode chat history is session-only for the same reason.
- No CMS or content pipeline — classic site copy lives in `index.html`; AI Mode's knowledge lives in `knowledge-source.json`.
- No automated tests or CI.
- Video embed uses an `<iframe>` pointed at a local `.mp4`; consider a `<video>` element for broader compatibility if needed.
- **Next up**: smarter agentic routing (skip retrieval entirely for greetings/small talk), and exploring a proper hybrid retrieval setup (dense + BM25) as the knowledge base grows.

---

## Author

**Saket Khopkar**
Software Engineer · Full-Stack Developer · Generative AI

- Email: saketkhopkar910@gmail.com
- GitHub: [@SAKET-SK](https://github.com/SAKET-SK)
- LinkedIn: [saket-khopkar-336684198](https://www.linkedin.com/in/saket-khopkar-336684198/)

## License

No license file is included. All rights reserved to Saket Khopkar unless a license is added.