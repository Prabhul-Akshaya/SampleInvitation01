# 💍 Wedding Invitation Website

A premium, mobile-first digital wedding invitation — built as a static site so it can be hosted **for free on GitHub Pages** and shared as a link on WhatsApp.

Every piece of wedding content (names, dates, venues, events, photos, RSVP details, colors) lives in one file, **`wedding.json`**. You never need to touch the HTML, CSS or JavaScript to create a new invitation.

---

## 📁 Project structure

```
wedding-invitation/
├── index.html          ← page structure only, no wedding content
├── wedding.json         ← ALL your wedding details go here
├── css/
│   └── style.css        ← visual design
├── js/
│   └── app.js            ← reads wedding.json and builds the page
├── images/
│   ├── couple.jpg         ← hero background photo
│   ├── couple-2.jpg       ← cinematic "couple photo" section
│   ├── gallery-1.jpg … gallery-6.jpg
│   └── venue.jpg
└── assets/
    └── music.mp3          ← optional background music (not included)
```

The `images/` folder currently contains elegant placeholder art (soft gold/maroon plates with a monogram) so the site looks complete the moment you open it. Swap in your own photos using the **same filenames** and everything updates automatically.

---

## 1. Run it locally

Because the page loads `wedding.json` with `fetch()`, opening `index.html` directly by double-clicking it won't work in every browser (some browsers block local file requests). Serve the folder instead:

**Option A — Python (already on most computers)**
```bash
cd wedding-invitation
python3 -m http.server 8000
```
Then open **http://localhost:8000** in your browser.

**Option B — VS Code**
Install the "Live Server" extension, right-click `index.html`, and choose **Open with Live Server**.

**Option C — Node.js**
```bash
npx serve .
```

---

## 2. Change your wedding details

Open **`wedding.json`** in any text editor. It's a plain JSON file organised by section:

| Section in `wedding.json` | Controls |
|---|---|
| `meta` | Browser tab title & search-engine description |
| `couple` | Bride/groom names, hero photo, couple photo |
| `date` | The date/time shown everywhere, **and** the exact countdown target (`iso`) |
| `location` | Main venue name, address, Google Maps link |
| `invitation` | The "Together with their families…" and "With joyful hearts…" text |
| `families` | Parents' names for the bride and groom |
| `countdown` | Countdown heading and the message shown after the wedding date passes |
| `story` / `storyTimeline` | "Our Story" paragraphs and the optional milestone timeline |
| `events` | Every function — Mehendi, Sangeet, Ceremony, Reception, etc. |
| `gallery` | List of photo paths for the gallery |
| `venueImage` | The photo shown in the Venue section |
| `rsvp` | RSVP heading, message, deadline, WhatsApp number |
| `music` | Background music toggle |
| `theme` | Every color and font used on the site |
| `closing` | The final "Two hearts. One journey…" message |
| `footer` | The line at the very bottom of the page |

**Important:** `wedding.json` must stay valid JSON — every text value in double quotes, commas between items, no trailing comma after the last item. If the page shows a loading message forever, you likely have a small typo; paste your file into [jsonlint.com](https://jsonlint.com) to find it instantly.

### The date & countdown
```json
"date": {
  "display": "18 December 2026",
  "day": "Friday",
  "time": "10:30 AM",
  "iso": "2026-12-18T10:30:00+05:30"
}
```
`display`/`day`/`time` are just text shown on the page. `iso` is what the countdown actually calculates against — keep it in this exact format (`YYYY-MM-DDTHH:MM:SS±HH:MM`, where `+05:30` is the Indian Standard Time offset).

---

## 3. Replace the images

Replace the files inside `images/` **using the exact same filenames** wedding.json points to:

| File | Recommended size | Used for |
|---|---|---|
| `couple.jpg` | ≥ 1600×2000, portrait | Full-screen hero background |
| `couple-2.jpg` | ≥ 1920×1280, landscape | Cinematic couple-photo section |
| `gallery-1.jpg` … `gallery-6.jpg` | ≥ 1200×1200 | Photo gallery (add/remove as many as you like) |
| `venue.jpg` | ≥ 1600×1000, landscape | Venue section |

You can rename files if you also update the matching path in `wedding.json` — nothing is hardcoded. Large photos straight from a phone (4–8 MB) work, but the site will feel snappier if you compress them first (e.g. with [squoosh.app](https://squoosh.app)) to under ~500 KB each.

If an image file is missing or fails to load, that section hides or falls back gracefully instead of showing a broken image icon — you won't break the site by leaving something out temporarily.

---

## 4. Add or remove events

`events` is a list — add as many objects as you have functions, or delete ones you don't need:

```json
{
  "name": "Mehendi Ceremony",
  "date": "16 December 2026",
  "time": "4:00 PM",
  "venue": "Bayleaf Garden Palace — Lawn",
  "address": "Kovalam Beach Road, Thiruvananthapuram, Kerala 695527",
  "description": "An afternoon of colour, music and intricate henna.",
  "mapUrl": "https://maps.google.com/?q=your+venue",
  "icon": "lotus",
  "image": "images/gallery-3.jpg"
}
```
- `icon` can be `heart`, `ring`, `lotus`, `star`, `pin`, `calendar`, or `clock`.
- `mapUrl` and `image` are both optional — leave them out (or delete the line) and the "View Location" button / thumbnail simply won't appear.

---

## 5. Add or remove gallery photos

`gallery` is just a list of image paths — the layout adjusts automatically:

```json
"gallery": [
  "images/gallery-1.jpg",
  "images/gallery-2.jpg",
  "images/my-new-photo.jpg"
]
```
Add a new file to `images/`, add its path to the list, done. Remove an entry to remove that photo. Clicking any photo opens a full-screen viewer with next/previous arrows, swipe support, and keyboard arrow-key navigation.

---

## 6. Change the Google Maps link

1. Open [Google Maps](https://maps.google.com), search for your venue, click **Share → Copy link**.
2. Paste that link as `location.mapUrl` (for the main Venue section) and/or as `mapUrl` inside any event that needs its own location.

---

## 7. Change RSVP information

```json
"rsvp": {
  "enabled": true,
  "heading": "Please join us",
  "message": "We would be honoured to have you celebrate with us.",
  "contactName": "Ananya & Arjun",
  "phone": "+91 98765 43210",
  "whatsapp": "+919876543210",
  "deadline": "10 December 2026",
  "messageTemplate": "Hello! I would like to RSVP for the wedding of {couple}."
}
```
- `whatsapp` should be the full number **with country code, no spaces or symbols** (e.g. `919876543210`) — this is what builds the "RSVP on WhatsApp" button link.
- `{couple}` inside `messageTemplate` is automatically replaced with your `couple.displayName`.
- Set `"enabled": false` to hide the whole RSVP section.

---

## 8. Turn background music on or off

```json
"music": {
  "enabled": true,
  "file": "assets/music.mp3",
  "loop": true
}
```
Set `enabled: true` and drop an MP3 file at `assets/music.mp3` (this repo ships without one, since every couple's choice of song is different — and a browser license/copyright note: only use a track you have the right to use). A small floating music button then appears in the corner. Music never starts automatically — phones and browsers block that, and it also makes for a better first impression — it only plays after a visitor taps the button. Set `enabled: false` to hide the button completely.

---

## 9. Change theme colors & fonts

```json
"theme": {
  "primary": "#7A1F3F",
  "primaryDark": "#4A0F26",
  "secondary": "#C9A227",
  "secondaryLight": "#E0C378",
  "background": "#FBF7F0",
  "surface": "#F6EEDF",
  "text": "#3B2924",
  "textMuted": "#7A6A5F",
  "fontDisplay": "'Cormorant Garamond', Georgia, serif",
  "fontBody": "'Montserrat', Arial, sans-serif"
}
```
Every color on the site is driven by these values — change `primary` and `secondary` and the whole palette updates. If you swap in a different Google Font, add its `<link>` in the `<head>` of `index.html` and reference its name in `fontDisplay`/`fontBody`.

---

## 10. Deploy to GitHub Pages (free hosting)

1. Create a new **public** repository on GitHub (e.g. `our-wedding`).
2. Upload every file in this folder to that repository, keeping the same folder structure (`index.html` at the root, alongside `wedding.json`, `css/`, `js/`, `images/`, `assets/`).
   - Easiest way: on the repository page, click **Add file → Upload files**, drag the whole folder's contents in, and commit.
3. Go to **Settings → Pages** in the repository.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Under **Branch**, choose `main` and `/ (root)`, then click **Save**.
6. Wait 1–2 minutes, then refresh the Pages settings screen — it will show your live URL:
   ```
   https://USERNAME.github.io/REPOSITORY/
   ```
7. Share that link on WhatsApp — that's your invitation!

The site is built entirely with relative paths (`images/couple.jpg`, not `/images/couple.jpg`), so it works correctly at that nested URL. No build step, server, or database is required.

### WhatsApp link preview
When you paste the link into WhatsApp, it shows a small preview card (title, description, image). WhatsApp reads this straight from `index.html` and can't run JavaScript, so it can't automatically pull from `wedding.json`. For a personalised preview, open `index.html` and edit these three lines near the top:
```html
<meta property="og:title" content="You're Invited — A Wedding Celebration" />
<meta property="og:description" content="Join us as we celebrate our wedding day." />
<meta property="og:image" content="images/couple.jpg" />
```
This is the one place in the project where a small manual edit is genuinely required, due to how link previews work on static sites.

---

## Notes on accessibility & performance

- Every image has descriptive alt text; interactive icons have `aria-label`s; the photo lightbox is fully keyboard-operable (Tab, Enter, Escape, Arrow keys) and traps focus sensibly.
- Animations respect `prefers-reduced-motion` — visitors with that setting enabled see content appear without motion.
- Images use `loading="lazy"` so only what's near the viewport downloads as the visitor scrolls.
- No frameworks, build tools, or backend — just HTML, CSS and vanilla JavaScript, so it will keep working for years with zero maintenance.

---

Made with care for two people about to begin their forever. 💛
