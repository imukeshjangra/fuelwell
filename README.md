# Fuelwell

Health blog built with Next.js + SQLite: magazine-style home page, articles, categories, tags, search,
protein calculator, newsletter, RSS, sitemap, and a full admin panel at `/admin`.

## Run it
1. `cp .env.example .env.local` and set **ADMIN_PASSWORD** (12+ chars, unique), **AUTH_SECRET** (`openssl rand -hex 32`) and **NEXT_PUBLIC_SITE_URL** (your real domain).
2. `npm install && npm run build && npm start` (or `npm run dev` while testing)
3. Site: http://localhost:3000   Admin: http://localhost:3000/admin
4. Back up `fuelwell.db` and the `uploads/` folder. Delete `fuelwell.db` to reseed the 8 demo articles
   (delete the demo articles from Admin before launch, or replace them with your own).

## Styling (Tailwind, separate files)
All site CSS is compiled by Tailwind from small files in `styles/`, imported once in `app/layout.tsx`:
- `styles/tailwind.css` entry point (sets the order of everything below)
- `styles/base.css` page background, focus ring, scrollbars, form focus
- `styles/components.css` buttons (`btn`, `btn-primary`), cards (`card`, `card-hover`), chips, 3D tilt, gradient text
- `styles/article.css` long-form article typography
- `styles/motion.css` scroll-reveal states, drifting aurora background, reduced-motion safety net
- `styles/print.css` print rules

Colours, shadows, keyframes and animations are defined in `tailwind.config.ts` (`animate-float`, `animate-marquee`, `bg-grad-sunrise` and so on). The admin panel keeps its own stylesheet, `app/admin/admin.css`.
Motion respects the visitor's "reduce motion" setting. Small client components add the effects: `Reveal` (scroll in), `Tilt` (3D hover), `CountUp`, `BackToTop`.

## Admin panel (/admin)
- **Categories**: add, edit, reorder and delete topics. Each has a name, icon, two gradient colours, short description, page introduction, optional banner image, and switches for "show on website", "show in menu and footer" and "show on home page". Changing a web address moves its articles; deleting a category asks where its articles should go.
- Dashboard: stats, 14-day views chart, most viewed articles
- Editor: toolbar, live preview, drag/paste images, cover image upload, tags, featured flag,
  draft / publish / **schedule for later**, Google search preview, autosaved backup
- Articles table with search and filters, messages inbox, subscribers CSV export

## Get traffic (the site already has the technical SEO)
- Social share images are generated automatically for every article
- Article, breadcrumb and website structured data, sitemap.xml with dates, robots.txt, RSS feed
- Related articles, popular articles, tags, table of contents, share buttons, newsletter forms
- Submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console and Bing Webmaster Tools

## Monetisation and compliance
- Set `NEXT_PUBLIC_ADSENSE_ID=ca-pub-...`: ad slots, the AdSense script (only after cookie consent) and `/ads.txt` all switch on from that one value.
- Cookie banner with Accept/Decline and a footer "Cookie settings" link to change the choice later.
- `/disclaimer`, `/terms`, `/privacy` pages plus a disclaimer line on every article. Have the final wording reviewed by a professional.
- If you serve visitors in the EU/UK, add a certified Google CMP (consent platform) before showing personalised ads.

## Security notes
- Signed 7-day session cookie, login lockout (8 failures / 15 min), same-origin check on all writes, honeypot + rate limits on contact and newsletter, upload checks by file signature (10 MB cap), prepared SQL statements, CSV formula guard.
- Rate limits are in-memory: fine for one server process; use a shared store if you ever run several.
- Share images are served from `/og/<slug>`.

## Traffic tools (new)
- `/foods` and `/foods/<slug>`: Indian food protein and calorie database, one page per food, in English and Hindi (`/hi/foods/...`).
- `/protein-per-rupee`: foods ranked by grams of protein per ₹10 (with WhatsApp share). Hindi: `/hi/protein-per-rupee`.
- `/meal-plan`: 7-day Indian plan by goal, food preference and daily budget, with shopping list. Use "Print or save as PDF".
- `/tools/*`: calorie, BMI (Asia-Pacific cut-offs), water intake and weight-goal calculators. `/tracker`: private weight log (browser only).

### Adding foods and updating prices
All food data lives in `lib/foods.ts`. Add one line per food and it gets its own English and Hindi page, sitemap entries and a place in the tables automatically.
Nutrition values are rounded approximations; prices are indicative estimates in ₹ per kg as bought. Check both against IFCT 2017 / USDA and your local market before launch, and refresh prices every few months.

## Folder structure
```
app/
  (site)/        public pages (home, blog, category, foods, tools, hi/ Hindi pages ...)
  admin/         admin panel (Admin, Categories, Login, ui, admin.css)
  api/           route handlers (login, posts, upload, categories, contact ...)
  layout.tsx     root layout, fonts, metadata
  icon.svg       browser tab icon
components/
  member/        AuthForm, HealthLogger, MiniChart (SVG charts), ChallengeCard, PostEditor, AccountNav
  layout/        SiteHeader, SiteFooter, Sidebar, Aurora, ConsentGate, BackToTop ...
  ui/            Reveal, Tilt, CountUp, Marquee, Cover, Newsletter, AdSlot, Pagination ...
  blog/          PostCard, HeroTile
  tools/         ProteinCalc, Calcs, MealPlanner, Tracker, FoodTable, FoodDetail, PprTable
lib/             db, auth, foods, categories, i18n, mealplan, rate, http
styles/          Tailwind entry + base, components, article, motion, print
public/          fuelwell-logo.svg, fuelwell-icon.svg
```
Import components with `@/components/<folder>/<Name>`.

## Deploying updates on the VPS
Keep your existing `.env.local`, `fuelwell.db` and `uploads/` when copying new files over. Then run `npm install`, `npm run build`, `pm2 restart fuelwell`.
If you upload images larger than 5 MB, set `client_max_body_size 10m;` in the nginx server block (443) and reload nginx.

## Members, health chart and challenges
- `/register`, `/login`: free member accounts (passwords hashed with scrypt, signed cookie `fw_user`, rate limited).
- `/account`: personal dashboard with daily log (weight, water, steps, exercise, sleep), targets and 5 charts.
- `/account/challenges`: 6 built-in challenges (edit them in `lib/challenges.ts`). Water, steps, exercise and sleep are counted automatically from the daily log.
- `/account/posts`: members write articles. They are saved as submissions and only go live after you approve them at `/admin/submissions` (link "Member articles" in the admin sidebar). Member text is Markdown only; raw HTML is neutralised.
- `/challenges` and `/diet-plan` are public SEO landing pages with FAQ structured data and are in the sitemap.
- Set `AUTH_SECRET` in `.env.local` (any long random text) so member sessions use their own secret.
- Back up `fuelwell.db` regularly: it now also holds member accounts and health logs.

## Forgot password
- `/forgot-password` emails a one-time link to `/reset-password?token=...` (valid 1 hour, works once; only a hash of the token is stored).
- The same reply is shown whether or not the email has an account. Limits: 5 requests per hour per network, 3 per email.
- After a reset, every older login session for that account stops working.
- Needs the SMTP settings in `.env.local` (same ones used for the welcome email) and `NEXT_PUBLIC_SITE_URL=https://kharedly.in` so the link points to your site.

## Auto deploy (GitHub to VPS)
Push to the `main` branch and GitHub Actions runs `deploy.sh` on the server (pull, `npm ci`, build, `pm2 restart`).
Repository secrets needed: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`. Never commit `.env.local`, `fuelwell.db` or `uploads/` (see `.gitignore`).
