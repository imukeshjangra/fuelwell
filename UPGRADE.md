# Fuelwell admin upgrade

Copy these files over your project (same folders). No new npm packages are needed.

New / replaced files
- app/admin/Admin.tsx, Login.tsx (new), ui.tsx (new), admin.css (new), page.tsx
- lib/auth.ts, lib/rate.ts (new), lib/db.ts
- app/api/login, logout, posts, contact, subscribers, upload (replaced)
- app/api/revisions, app/api/export (new)

After copying: stop the server, run `npm run dev` again, and sign in again
(old login cookies stop working because sessions are now signed and expire).
Your fuelwell.db is upgraded automatically on first start (new tables and a "read" column on messages).
Nothing is deleted.

New in the admin
- Animated sign-in, count-up stats, drawing area chart, dark mode, Ctrl/Cmd+K command palette
- Articles: status tabs, category filter, sorting, bulk publish / draft / feature / move / delete, duplicate, one-click feature star
- Editor: live split preview, tag chips, SEO score with checklist, Google + social preview, version history with restore, Ctrl/Cmd+S, unsaved-changes warning
- Messages: unread tracking, expand / reply / mark read. Subscribers: search, copy emails, remove
- Activity log and one-click JSON backup

Backend hardening
- Signed session tokens that expire after 7 days
- Same-origin check on every write, login lockout after 8 failures, slower guessing
- Real image-signature check on uploads, CSV formula-injection guard
- Duplicate web-address check, transactional bulk actions, last 20 versions kept per article


# Fuelwell v4: Tailwind styles, animations, editable categories
- Run `npm install` (adds `postcss-import`), then `npm run build`.
- `app/globals.css` is gone; styles now live in `styles/` (see README).
- Categories moved from `lib/categories.ts` into the database. The four original categories are added automatically on first start and existing articles keep working. Manage them at Admin > Categories.
