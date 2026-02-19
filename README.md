# Online Tint Exemption — onlinetintexemption.com

Medical window tint exemption telemedicine platform. Next.js 16, TailwindCSS, dark/light mode (dark default).

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (135 static pages)
```

## Architecture

- **JSON-driven templates** — All state, condition, and booking pages are built from TypeScript data files in `src/data/`. Nothing is hardcoded except the design.
- **Data files:**
  - `src/data/states.ts` — 51 states (50 + DC) with tint laws, FAQs, conditions, nearby states
  - `src/data/conditions.ts` — 16 medical conditions with full content
  - `src/data/blog.ts` — Blog posts and categories
- **Dynamic routes:**
  - `/[stateSlug]` → State info pages (e.g., `/ohio-window-tint-medical-exemption`)
  - `/book/[stateSlug]` → State booking pages (e.g., `/book/ohio`)
  - `/conditions/[conditionSlug]` → Condition pages (e.g., `/conditions/migraines`)
  - `/blog/[slug]` → Blog post pages

## Deployment

- **GitHub:** https://github.com/FacelessMedia/onlinetintexemption
- **Vercel:** Auto-deploys from `master` branch
- **Production:** https://onlinetintexemption.vercel.app

### Custom Domain Setup

1. Go to https://vercel.com/dashboard → Select project → Settings → Domains
2. Add `www.onlinetintexemption.com` and `onlinetintexemption.com`
3. Update DNS records at your domain registrar:
   - `A` record: `76.76.21.21` (for apex domain)
   - `CNAME` record: `cname.vercel-dns.com` (for www subdomain)
4. Vercel will auto-issue SSL certificate

## Tech Stack

- Next.js 16 (App Router, SSR/SSG)
- TailwindCSS v4 with CSS custom properties
- next-themes (dark mode default)
- Lucide React icons
- TypeScript

## Integrations (Pending)

- **Go High Level** — Forms, payments, CRM pipeline (booking pages have GHL placeholders)
- **QuickBooks** — Accounting sync via GHL
- **ChatGPT** — Chatbot with custom knowledge base (future phase)

## Key Info

- **Brand:** Online Tint Exemption
- **Email:** support@onlinetintexemption.com
- **Phone:** (734) 338-8453
- **Pricing:** $249 flat rate, all states
- **No HIPAA claims** — removed per compliance requirement

## Page Count: 135 Static Pages

| Type | Count |
|------|-------|
| Core pages | 7 (home, about, faq, contact, conditions, book, blog) |
| State info pages | 51 |
| State booking pages | 51 |
| Condition pages | 15 |
| Blog posts | 4 |
| Team profiles | 2 |
| Legal pages | 2 |
| Blog hub categories | 8 (planned) |
