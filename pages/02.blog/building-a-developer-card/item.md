---
title: 'Build Your Own Developer Card with Astro and Tailwind CSS'
description: 'Build a themeable, embeddable developer identity card with Astro, Tailwind CSS v4, and astro-icon.'
date: '2026-03-01 00:00'
author: Sami Bashraheel
taxonomy:
  tag:
    - astro
    - tailwind
    - component
    - tutorial
---
Most developers maintain a portfolio site, a GitHub profile, and a LinkedIn page. A single, focused URL does something none of those do: show who you are in one screen. Your name, your role, where to find you, and your stack. No noise, no navigation, no filler.

This guide walks through building a developer card from scratch with Astro, Tailwind CSS v4, and astro-icon. The end result is fully static, deploys anywhere, and stays easy to update.

> 💡 For a live reference, visit [card.sami.codes](http://card.sami.codes). The example uses the same stack, with 15 switchable themes, social links, and a copy-to-clipboard embed button.
> 

The finished card includes:

- Name, role, and a short bio
- Clickable social icons for your platforms
- Tech stack badges rendered from a plain string array
- A theme switcher powered by CSS custom properties
- Copy Link and Embed buttons for sharing and embedding

---

## Why Astro?

Astro builds to plain HTML by default. No client-side framework ships to the browser unless you opt in. For this type of project, the output is tiny bundles and fast loads. The only JavaScript on the page handles theme switching and clipboard interaction. Everything else is static.

Astro components use a familiar HTML-first syntax. TypeScript works out of the box. Deployment targets any static host without extra configuration.

---

## Setup

Scaffold a new project and install the required packages:

```bash
npm create astro@latest my-developer-card
cd my-developer-card

npm install astro-icon @iconify-json/simple-icons @iconify-json/lucide
npm install tailwindcss @tailwindcss/vite
```

Update `astro.config.mjs` to register both integrations:

```jsx
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon()],
})
```

---

## The Theme System

Before building any components, plan the theming approach. This card uses CSS custom properties (CSS Custom Properties) scoped to a class on the root element. Swapping the class instantly repaints the card. No JavaScript style injection, no theme context, no extra library.

Define four variables and reference them throughout:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

@layer base {
  :root {
    --color-brand: #6366F1;
    --color-surface: #0F172A;
    --color-text-primary: #F1F5F9;
    --color-text-secondary: #94A3B8;
  }

  .theme-default {
    --color-brand: #6366F1;
    --color-surface: #0F172A;
    --color-text-primary: #F1F5F9;
    --color-text-secondary: #94A3B8;
  }

  .theme-light {
    --color-brand: #6366F1;
    --color-surface: #F8FAFC;
    --color-text-primary: #1E293B;
    --color-text-secondary: #64748B;
  }

  /* keep adding themes in this same pattern */
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

Every component references `var(--color-brand)` and the other custom properties. Hard-coded Tailwind colour classes never appear. This separation makes the whole system work.

A few theme directions worth trying:

| Name | Feel | Brand colour |
| --- | --- | --- |
| `midnight` | Dark navy | `#38BDF8` |
| `terminal` | Green on black | `#00FF00` |
| `coffee` | Warm browns | `#D2691E` |
| `retrowave` | Neon synthwave | `#F9C80E` |
| `forest` | Deep greens | `#9BC53D` |
| `grayscale` | Near-monochrome | `#555555` |

Pick whatever fits your personality. Two or three themes is plenty to start.

---

## File Structure

Five small components make up the full card:

```
src/
  components/
    DeveloperCard.astro   ← card shell, composes everything
    SocialLinks.astro     ← icon row
    TechBadges.astro      ← stack badges
    ThemeToggle.astro     ← theme cycling button
    CardActions.astro     ← copy link / embed buttons
  layouts/
    Layout.astro
  pages/
    index.astro
  styles/
    global.css
```

---

## DeveloperCard.astro

The root shell. Personal data passes in as props from the page, keeping the component clean and reusable:

```
---
import ThemeToggle from "./ThemeToggle.astro";
import SocialLinks from "./SocialLinks.astro";
import TechBadges from "./TechBadges.astro";

interface Props {
  name?: string;
  title?: string;
  bio?: string;
  socials?: { platform: string; url: string }[];
  stack?: string[];
}

const {
  name    = "Your Name",
  title   = "Your Role",
  bio     = "A short line about what you build and care about.",
  socials = [],
  stack   = [],
} = Astro.props;
---

<section
  id="dev-card"
  class="theme-default w-full max-w-[360px] mx-auto p-6 rounded-xl
         border border-[var(--color-brand)] bg-[var(--color-surface)]
         shadow-lg transition-all relative"
  data-theme="default"
>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
        {name}
      </h1>
      <h2 class="text-[var(--color-brand)] font-medium mt-1">{title}</h2>
    </div>

    <p class="text-[var(--color-text-secondary)] text-sm leading-relaxed">
      {bio}
    </p>

    <div class="pt-2">
      <SocialLinks links={socials} />
    </div>

    <div class="pt-4 border-t border-[var(--color-brand)]/20 flex justify-between items-end">
      <TechBadges stack={stack} />
      <div class="shrink-0">
        <ThemeToggle />
      </div>
    </div>
  </div>
</section>
```

---

## SocialLinks.astro

A platform-to-icon mapping backed by `astro-icon`. The `simple-icons` pack covers most developer platforms. `lucide` handles generic cases. Add or remove entries from the map to match your own profiles:

```
---
import { Icon } from "astro-icon/components";

interface Props {
  links: { platform: string; url: string }[];
}

const { links = [] } = Astro.props;

const iconMap: Record<string, string> = {
  github:   "simple-icons:github",
  linkedin: "simple-icons:linkedin",
  x:        "simple-icons:x",
  twitter:  "simple-icons:x",
  dev:      "simple-icons:devdotto",
  hashnode: "simple-icons:hashnode",
  youtube:  "simple-icons:youtube",
  twitch:   "simple-icons:twitch",
  bluesky:  "simple-icons:bluesky",
  mastodon: "simple-icons:mastodon",
  website:  "lucide:globe",
  email:    "lucide:mail",
};

const getIcon = (platform: string) =>
  iconMap[platform.toLowerCase()] ?? "lucide:link";
---

<div class="flex flex-wrap gap-4 items-center mt-2">
  {links.map((link) => (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      class="text-[var(--color-text-primary)] hover:text-[var(--color-brand)]
             transition-transform hover:scale-110 focus:outline-none
             focus:ring-2 focus:ring-[var(--color-brand)] rounded"
      aria-label={`Visit my ${link.platform}`}
    >
      <Icon name={getIcon(link.platform)} class="w-6 h-6" />
    </a>
  ))}
</div>
```

Browse the full icon list at [icon-sets.iconify.design/simple-icons](http://icon-sets.iconify.design/simple-icons).

---

## TechBadges.astro

Pass in a string array. Each entry renders as a pill badge:

```
---
interface Props {
  stack: string[];
}
const { stack = [] } = Astro.props;
---

<div class="mt-4">
  <p class="text-[0.65rem] font-bold tracking-widest text-[var(--color-brand)]
            font-mono mb-2 uppercase">
    Stack
  </p>
  <div class="flex flex-wrap gap-2">
    {stack.map((item) => (
      <span class="px-3 py-1 text-xs rounded border
                   border-[var(--color-brand)] text-[var(--color-brand)]
                   bg-transparent font-mono">
        {item}
      </span>
    ))}
  </div>
</div>
```

---

## ThemeToggle.astro

The theme list serialises as a JSON `data-*` attribute at build time. A small inline script reads the value at runtime. No state management, no framework. One button cycles through an array and swaps a class:

```
---
const themes = [
  { name: "default",  label: "Switch Theme" },
  { name: "light",    label: "Too Bright?"  },
  { name: "terminal", label: "Too Hackery?" },
];
---

<button
  id="theme-toggle"
  class="text-xs px-2 py-1 rounded border border-[var(--color-brand)]
         text-[var(--color-text-primary)] hover:bg-[var(--color-brand)]
         hover:text-[var(--color-surface)] transition-colors font-mono"
  data-themes={JSON.stringify(themes)}
>
  Theme
</button>

<script>
  let currentIndex = 0;

  const setup = () => {
    const btn  = document.getElementById("theme-toggle");
    const card = document.getElementById("dev-card");
    if (!btn || !card) return;

    const themes = JSON.parse(btn.dataset.themes!);

    const saved = localStorage.getItem("dev-card-theme");
    if (saved) {
      const idx = themes.findIndex((t: any) => t.name === saved);
      if (idx !== -1) currentIndex = idx;
    }

    const apply = (i: number) => {
      const theme = themes[i];
      card.className = card.className.replace(/theme-\S+/g, "").trim();
      card.classList.add(`theme-${theme.name}`);
      card.setAttribute("data-theme", theme.name);
      btn.textContent = theme.label;
      localStorage.setItem("dev-card-theme", theme.name);
    };

    apply(currentIndex);
    btn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % themes.length;
      apply(currentIndex);
    });
  };

  setup();
  document.addEventListener("astro:page-load", setup);
</script>
```

The button label doubles as a hint about the current theme. Write whatever copy fits each one. [card.sami.codes](http://card.sami.codes) uses slightly sarcastic labels like "Too Hackery!" and "Too Cosy!" to give the card personality.

> 💡 After calling `apply()`, read the freshly computed CSS variables with `getComputedStyle` and regenerate your browser tab favicon as an inline SVG. The tab icon repaints to match the active theme. A small detail with a big payoff.
> 

---

## CardActions.astro

Two utility buttons sit below the card. The embed snippet appends `?embed=true` to the URL. The page checks for this parameter and hides the buttons when loaded inside an iframe:

```
---
import { Icon } from "astro-icon/components";
---

<div class="flex gap-4 relative">
  <button id="copy-link-btn"
    class="text-xs px-3 py-1.5 rounded border border-[var(--color-brand)]
           text-[var(--color-text-primary)] hover:bg-[var(--color-brand)]
           hover:text-[var(--color-surface)] transition-colors font-mono
           font-bold flex items-center gap-1.5">
    <Icon name="lucide:link-2" class="w-4 h-4" /> Copy Link
  </button>

  <button id="copy-embed-btn"
    class="text-xs px-3 py-1.5 rounded border border-[var(--color-brand)]
           text-[var(--color-text-primary)] hover:bg-[var(--color-brand)]
           hover:text-[var(--color-surface)] transition-colors font-mono
           font-bold flex items-center gap-1.5">
    <Icon name="lucide:code" class="w-4 h-4" /> Embed
  </button>

  <div id="toast"
    class="absolute left-1/2 -top-8 -translate-x-1/2 px-2 py-1
           bg-[var(--color-brand)] text-[var(--color-surface)] text-[0.65rem]
           font-bold uppercase tracking-wider rounded opacity-0
           pointer-events-none transition-all duration-300 font-mono">
    Copied!
  </div>
</div>

<script>
  const setup = () => {
    const linkBtn  = document.getElementById("copy-link-btn")!;
    const embedBtn = document.getElementById("copy-embed-btn")!;
    const toast    = document.getElementById("toast")!;
    let timer: ReturnType<typeof setTimeout>;

    const showToast = (msg: string) => {
      clearTimeout(timer);
      toast.textContent = msg;
      toast.classList.replace("opacity-0", "opacity-100");
      timer = setTimeout(() =>
        toast.classList.replace("opacity-100", "opacity-0"), 2000
      );
    };

    linkBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(
        window.location.origin + window.location.pathname
      );
      showToast("Link Copied!");
    });

    embedBtn.addEventListener("click", async () => {
      const src  = `${window.location.origin}${window.location.pathname}?embed=true`;
      const html = `<iframe src="${src}" width="100%" height="400"
        style="border:none;max-width:400px;display:block;"
        title="Developer Card" loading="lazy"></iframe>`;
      await navigator.clipboard.writeText(html);
      showToast("Embed Copied!");
    });
  };

  setup();
  document.addEventListener("astro:page-load", setup);
</script>
```

---

## index.astro: Wire Up Your Details

All personal data lives here, passed as props to the card. The component stays generic. The page is where the card becomes yours:

```
---
import Layout from "../layouts/Layout.astro";
import DeveloperCard from "../components/DeveloperCard.astro";
import CardActions from "../components/CardActions.astro";
---

<Layout>
  <main class="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
    <DeveloperCard
      name="Your Name"
      title="Your Role"
      bio="One or two sentences. What you build, what you care about."
      socials={[
        { platform: "github",   url: "https://github.com/you" },
        { platform: "linkedin", url: "https://linkedin.com/in/you" },
        { platform: "website",  url: "https://yoursite.com" },
      ]}
      stack={["React", "TypeScript", "your actual stack"]}
    />
    <div id="actions-wrapper">
      <CardActions />
    </div>
  </main>
</Layout>

<script>
  const checkEmbed = () => {
    const isEmbed =
      window.self !== window.top ||
      new URLSearchParams(window.location.search).has("embed");
    if (isEmbed) {
      const el = document.getElementById("actions-wrapper");
      if (el) el.style.display = "none";
    }
  };
  checkEmbed();
  document.addEventListener("astro:page-load", checkEmbed);
</script>
```

---

## Going Live

The build output is a plain static folder. No server needed:

```bash
npm run build    # outputs to ./dist
npm run preview  # sanity check before pushing
```

Push to GitHub and connect to Vercel, Netlify, or Cloudflare Pages. All three detect the Astro project and configure the build command automatically. Point a subdomain at the deployment (`card.yourdomain.com`) and use the URL in your email signature, conference bio, or README.

---

## Ideas for Going Further

Once the basics work, consider these extensions:

- Dynamic favicon: regenerate the browser tab icon as an inline SVG after each theme change, using the active CSS variable values (the live example at [card.sami.codes](http://card.sami.codes) does this)
- OG image: use Satori or `@astrojs/og` to auto-generate a social share image matching your card colours
- QR code: generate one from your card URL and print on a conference badge or business card
- System theme detection: read `prefers-color-scheme` on first load and pick a suitable starting theme before any user interaction
- Analytics: a single `navigator.sendBeacon` call is enough to track visits

---

Open-source reference: [github.com/sami/developer-card](http://github.com/sami/developer-card)