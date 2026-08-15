# Qur’an Khatmah Circle

A production-ready, responsive bilingual community tracker for completing all 30 Juz together. The site supports live shared progress, reader attribution, Juz-specific comments, recent activity, a private invite-code gate, daily personal recitations, Arabic RTL layout, dark mode, and automatic daily reset in the configured timezone.

## Live behavior

- **Shared progress:** all connected visitors see completions in real time through Cloud Firestore.
- **Safe concurrent updates:** Firestore transactions prevent simultaneous readers from overwriting each other and ensure the Khatmah counter increases once.
- **Reader ownership:** only the browser identity that marked a Juz can reopen it.
- **Juz comments:** each Juz keeps the latest 30 short comments so the shared document stays bounded.
- **Invite gate:** visitors enter a code once per browser before joining.
- **Bilingual UI:** English and Arabic, including right-to-left layout.
- **Private recitation checklist:** stored only in that visitor’s browser and reset daily.
- **Graceful fallback:** if Firebase is unavailable, the site enters local demo mode instead of breaking.

## Project structure

- `index.html` — semantic page structure and dialogs
- `styles.css` — responsive, accessible light/dark styling
- `app.js` — UI, live sync, comments, translations, and browser storage
- `core.mjs` — tested state, reset, transaction, comment, and invite utilities
- `config.js` — timezone, Firebase web configuration, and invite-code hash
- `firestore.rules` — bounded validation for the shared tracker document
- `tests/` — unit, static accessibility, and browser flow tests

## Run locally

A local server is recommended because the app uses JavaScript modules:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/?demo=1` to force local demo mode.

## Test

```bash
npm run check
npm run test:browser
```

The browser test verifies the invite flow, profile creation, Juz completion, comments, Arabic RTL mode, console errors, and a 390px mobile viewport.

## Change the invite code

The invite is a lightweight community gate, not a substitute for user authentication. Change it before sharing widely:

```bash
node scripts/set-invite-code.mjs "YOUR-NEW-CODE"
```

Commit the resulting `config.js` change. The plain code is never written to the repository; only its SHA-256 hash is stored.

## Firebase and hosting

The current Firebase web configuration is already present in `config.js`. GitHub Pages can serve the site directly from the `main` branch.

After changing `firestore.rules`, publish those rules in the Firebase console so the deployed database matches this repository. The data model intentionally remains compatible with the existing `quranTrackers/main` document, so shared progress and comments work without a data migration.

## Scalability and security

This version is designed for a family, mosque, or community circle with many readers and bounded comments. All writes use transactions, every Juz keeps at most 30 comments, and the shared document remains below Firestore’s document limit.

The invite screen is a **soft gate** because the application is a static website. For an open public product with untrusted traffic, the next production step is Firebase Authentication, App Check, per-user rate limits, moderation tools, and moving comments into a paginated subcollection or dedicated backend.
