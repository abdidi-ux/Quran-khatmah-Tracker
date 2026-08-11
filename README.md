# Qur’an Khatmah Circle

A responsive shared tracker for all 30 Juz. Readers add a display name, mark completed Juz, and see group progress. When all 30 are complete, the Khatmah counter increments once. The checked Juz reset after the configured timezone moves to a new calendar day.

## Preview locally

Open `index.html` in a browser. Without Firebase configuration it runs in **demo mode** using that browser’s local storage.

## Turn on real-time sharing

1. Create a Firebase project at https://console.firebase.google.com/.
2. Add a **Web app** to the project.
3. Create a **Cloud Firestore** database.
4. In `index.html`, find `firebaseConfig` near the bottom and replace all `PASTE_...` values with the config Firebase gives you.
5. In Firestore Rules, paste the contents of `firestore.rules`, then publish the rules.
6. Host the folder using Firebase Hosting, Netlify, Vercel, GitHub Pages, or another static host.

When configured, the page automatically switches from “Demo mode” to “Live” and syncs changes for everyone.

## Timezone

The reset timezone is set in `index.html`:

```js
timeZone: 'America/Toronto'
```

Change it to any valid IANA timezone, such as `Europe/London`, `America/New_York`, or `Asia/Riyadh`.

## Completion logic

- Readers can mark or unmark a Juz until all 30 are complete.
- The final mark increments the Khatmah counter exactly once and locks the finished day.
- A shared transaction prevents two simultaneous clicks from incrementing the counter twice.
- The first connected client after midnight clears the 30 daily marks while preserving the lifetime Khatmah count.

## Production security note

The included rules are suitable for a trusted private reading group and validate the document shape, but they do not identify individual users. For a public community, enable Firebase Authentication and restrict writes to signed-in users before publishing widely.
