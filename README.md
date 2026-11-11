# STWRD

**Reliable help, right next door.**

STWRD connects students ages 14 to 24 with neighbors who need affordable, reliable help around the house. Every job builds a verified work portfolio, and a slice of each payment goes to the student's 529 college fund.

This repo is the marketing site plus a fully interactive app demo. No build step, no dependencies.

## What's here

| File | What it is |
| --- | --- |
| `index.html` / `site.css` / `site.js` | Landing page: hero with a live phone demo, how it works, features, 529 calculator, safety, pricing, testimonials, roadmap, team, waitlist |
| `demo.html` / `demo.css` / `demo.js` | The app demo. Works standalone and embedded in the landing page |
| `icons.js` | Solid icon set (Phosphor Icons, fill weight, MIT) used across the demo |
| `assets/` | New logo (full lockup, S mark, wordmark) on transparent background, plus favicon |

## The demo

Open `demo.html` directly or use the phone on the homepage. Both sides of the marketplace are playable.

**Student**
- Home with live 529 balance, earnings, verified hours, upcoming jobs
- Job search with category chips, filters (verified homes, distance, pay), boosted listings first
- Job detail showing exactly how much goes to the 529 vs. take-home, then apply
- Schedule with calendar. "Mark done" on a confirmed job updates earnings, hours, and 529 live, then prompts a rating
- 529 tab: adjustable auto-save percent, projection, deposit history
- Profile: verified portfolio by service, badges (some unlock as you go), services, reviews, Premium upgrade
- Earnings breakdown (monthly / by service) with working CSV export, service-hours export

**Homeowner**
- Dashboard with active jobs, applicants, spending, activity feed
- Find help with filters, worker profiles (Stats / About / Services / Reviews)
- 3-step booking: service, date/time/duration/address, worker + notes, with 529 contribution shown
- Post a job with AI-written descriptions, suggested pay ranges, and $2.99 boost. A student applies a few seconds later
- Review applicants and hire, pay with tip, route the tip to the student's 529, rate the student

**Both:** STWRD AI assistant (scripted for the demo), notifications, availability settings, role switching.

Deep link: `demo.html?role=student&name=Joel` or `demo.html?role=homeowner&name=Sandra`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages: Settings → Pages → Deploy from branch → `main` / root. Works on Vercel or Netlify as a static site with zero config.

## To wire up before launch

- **Waitlist form** currently saves to the visitor's browser only (`site.js`). Point it at Formspree, a Google Form, or your backend.
- **AI assistant** replies are scripted in `demo.js` (`reply()`). Swap in a real model call behind an API route.
- **529 routing, background checks, payments** are simulated. These need a compliant 529/fintech partner, a background-check provider, and a payments provider.
