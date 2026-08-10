# BrowserOS

A modern **web-based desktop operating system UI** built with React and Vite.

BrowserOS recreates the feel of a lightweight desktop environment directly inside the browser, with a desktop, dock, application windows, wallpapers, music, messages, settings, and more.

> **Status:** 🚧 Work in Progress

## ✨ Features

- 🖥️ Browser-based desktop environment
- 🧩 App/window management system
- 🚀 Dynamic application loading
- 🎨 Modern desktop-style UI
- 🖱️ Dock with hover interactions
- 🗂️ Explorer application
- 💻 Terminal with predefined commands
- ⚙️ Settings application with built-in + custom wallpaper picker
- 🎵 Local music player
- 💬 Predefined Messages application
- 🌐 Community guestbook backed by Supabase
- 📅 Calendar
- 📖 Built-in README application
- ℹ️ BrowserOS information app
- 📐 Resizable windows where supported
- 🔒 Single-instance applications where appropriate

## 📱 Built-in Applications

| Application | Purpose |
|---|---|
| **BrowserOS Info** | Information about BrowserOS |
| **Calculator** | Basic calculator |
| **Explorer** | File/folder explorer interface |
| **Terminal** | Simulated terminal with predefined commands |
| **Settings** | System and appearance settings, including wallpaper selection/upload |
| **README** | Built-in documentation |
| **Calendar** | Calendar interface |
| **Music** | Local music player |
| **Messages** | Predefined chat interface |
| **Community** | Public guestbook — read and post messages, backed by Supabase |

## 🛠️ Tech Stack

- **React**
- **Vite**
- **JavaScript / JSX**
- **Tailwind CSS**
- **Lucide React / custom application icons**
- **HTML5 Audio API**

The architecture is intentionally frontend-focused and can be migrated to TypeScript later.

## 📁 Project Structure

```text
browserOS/
├── public/
│   └── music/
│       └── *.mp3
│
├── src/
│   ├── apps/
│   │   ├── about/
│   │   ├── calculator/
│   │   ├── explorer/
│   │   ├── terminal/
│   │   ├── settings/
│   │   ├── readme/
│   │   ├── calendar/
│   │   ├── music/
│   │   ├── messages/
│   │   ├── community/
│   │   └── registerApps.jsx
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── assets/
│   │   └── appIcons/
│   │
│   ├── components/
│   │   ├── desktop/
│   │   ├── dock/
│   │   ├── windows/
│   │   └── ...
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_guestbook.sql
│   └── functions/
│       └── submit-post/
│           └── index.ts
│
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd browserOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. (Optional) Configure the Community app

The Community app is the one part of BrowserOS with a real backend. Every
other app works with no setup. If you want Community to work too:

```bash
cp .env.example .env.local
# then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

See [Community app](#-community-app) below for full Supabase setup steps.
Without this step, every other app works normally — Community itself just
shows a friendly "not configured" message instead of crashing BrowserOS.

### 4. Start development server

```bash
npm run dev
```

Vite will normally make the application available at:

```text
http://localhost:5173/
```

### 5. Create a production build

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## 🎵 Music

Static music files can be placed in:

```text
public/
└── music/
    ├── song-1.mp3
    ├── song-2.mp3
    └── song-3.mp3
```

They can then be referenced directly:

```js
"/music/song-1.mp3"
```

Using `public/` is convenient for assets that should be served directly without importing them into JavaScript.

## 🧩 Adding an Application

Applications are registered through the application registry.

A typical app definition looks like:

```jsx
{
  id: "example",
  title: "Example App",
  icon: (props) => <AppIcon appId="example" {...props} />,
  component: () => import("./example/ExampleApp"),
  defaultSize: {
    width: 500,
    height: 400
  },
  minSize: {
    width: 300,
    height: 250
  },
  singleInstance: true
}
```

Recommended structure:

```text
src/apps/example/
└── ExampleApp.jsx
```

Keep application-specific UI and logic inside its own directory whenever possible.

## 🖼️ Application Icons

BrowserOS uses a centralized icon system so application icons stay consistent across the:

- Desktop
- Dock
- Application windows
- Menus
- Other UI components

Example:

```jsx
<AppIcon appId="terminal" />
```

## 💻 Terminal

The Terminal application is a **browser simulation**, not a real system shell.

Possible predefined commands include:

```text
whoami
pwd
ls
clear
help
date
echo
cat
sudo
nano
```

Commands should remain simulated and must not execute arbitrary operating-system commands from the browser.

## ⚙️ Settings

The Settings application is intended for lightweight system customization, such as:

- Appearance (wallpaper selection and custom wallpaper upload — BrowserOS ships a single Default theme)
- System information
- BrowserOS configuration

## 💬 Messages

Messages provides a lightweight predefined chat experience.

It is intentionally client-side and can use selectable predefined responses instead of requiring a backend messaging service.

## 🌐 Community app

Community is a public guestbook: anyone can read every post, and anyone can
add one by entering a name and a message. There's no editing, deleting,
liking, or rating — just reading and posting. Unlike the rest of BrowserOS,
it's backed by a real database (Supabase), since a shared, persistent
guestbook only makes sense if everyone sees the same data.

### How it works

```text
BrowserOS (Community app)
    │
    ├─ Read posts  →  Supabase table `guestbook`, direct SELECT (RLS-scoped)
    │
    └─ Create post →  Supabase Edge Function `submit-post`
                          │
                          ├─ validate (length, non-empty)
                          ├─ normalize text
                          ├─ moderate (blocked-word check)
                          ├─ rate-limit / duplicate check
                          └─ insert (service-role key, server-side only)
```

Reads go straight to the `guestbook` table using the public anon key —
that's safe because Row Level Security only allows `SELECT` and `INSERT`,
never `UPDATE`/`DELETE` (see the SQL below). Writes are routed through the
`submit-post` Edge Function rather than an anon INSERT directly from the
browser, so moderation and rate-limiting can never be skipped by calling
the API directly.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free account/project.
2. In **Project Settings → API**, copy the **Project URL** and the
   **anon/public** key (not the `service_role` key — that one never leaves
   the server).

### 2. Create the `guestbook` table + RLS policies

Run [`supabase/migrations/0001_guestbook.sql`](supabase/migrations/0001_guestbook.sql)
in the Supabase SQL Editor (or `supabase db push` with the CLI). It creates:

- A `guestbook` table: `id` (uuid, generated), `name` (text, 1–50 chars),
  `message` (text, 1–500 chars), `created_at` (timestamptz, defaulted) —
  with length constraints enforced by the database itself, not just React.
- Row Level Security **enabled**, with exactly two policies:
  - `SELECT`: allowed for everyone.
  - `INSERT`: allowed for everyone, subject to the same length checks.
  - `UPDATE` / `DELETE`: no policy exists for either, which means Postgres
    denies both by default. Nothing in the client can override this —
    it's enforced at the database layer, not by hiding buttons in the UI.

### 3. Deploy the `submit-post` Edge Function

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy submit-post
```

The function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, which
Supabase injects automatically into every Edge Function's environment —
you don't set these yourself, and they're never exposed to the browser.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Only the anon key ever goes in a `VITE_*` variable — anything prefixed
`VITE_` is bundled into the client JS, so the `service_role` secret key
must never be assigned to one. If these variables are missing, the
Community app shows a clear "not configured" message instead of crashing
the rest of BrowserOS.

### Moderation

Moderation is layered:

1. **Client-side** (`src/apps/community/moderation.js`) — an instant,
   best-effort check against a small blocked-word list, purely for
   responsive UX. It normalizes text (lowercase, Unicode normalization,
   punctuation/spacing collapsed) before checking, but a determined user
   can bypass any frontend JS, so this is never the real gate.
2. **Server-side** (`supabase/functions/submit-post/index.ts`) — the
   authoritative check. It re-normalizes and re-checks the message before
   ever writing to the database, using its own copy of the blocked-word
   list that's never shipped to the browser. Rejected messages return a
   generic error and are never inserted.

The moderation function is written as a small, isolated `moderate()`
function with a stable `{ allowed }` return shape specifically so it can
be swapped later for a hosted moderation API (e.g. an external
content-moderation service) without touching validation, rate-limiting,
or the rest of the request flow. Any such provider's secret key would go
in the Edge Function's environment — never in frontend code.

### Spam / abuse protection

- Name and message length are capped (50 / 500 chars) both client-side and
  in the database `CHECK` constraints.
- The Edge Function rejects an identical name+message pair resubmitted
  within 30 seconds, and rate-limits a given name to 5 posts/minute — a
  best-effort deterrent against accidental double-submits and basic spam
  bursts (a public, anonymous guestbook can't reliably fingerprint unique
  visitors without adding real friction).
- The **Post Message** button disables itself and reads "Posting…" the
  instant a submission starts, and only re-enables after the request
  settles, so rapid taps/clicks can't fire duplicate requests from the UI.
- For stronger protection against a determined attacker, add
  [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/): add
  the widget to `PostForm.jsx`, send its token to `submit-post`, and verify
  it server-side there using `TURNSTILE_SECRET_KEY` (set as an Edge
  Function secret via `supabase secrets set`, never in `VITE_*`/frontend
  code).

### Security summary

| Rule | Where it's enforced |
|---|---|
| No editing/deleting posts | No `UPDATE`/`DELETE` RLS policy exists — denied by Postgres itself |
| No service-role key in the browser | Only ever read from `Deno.env` inside the Edge Function |
| Moderation can't be bypassed | Enforced in `submit-post`, not just in the React form |
| User content can't inject HTML/JS | Rendered as plain text; `dangerouslySetInnerHTML` is never used |
| Input size limits | Enforced in the DB `CHECK` constraints, not just the form |

## 🏗️ Architecture

The project follows a desktop/application architecture:

```text
BrowserOS
│
├── Desktop
│   ├── Wallpaper (from Settings → Appearance)
│   ├── Desktop Icons
│   └── Dock
│
├── Window Manager
│   ├── Open App
│   ├── Close App
│   ├── Minimize App
│   ├── Focus / Z-Index
│   └── Resize
│
├── Application Registry
│   └── Registered Apps
│
└── Applications
    ├── Terminal
    ├── Explorer
    ├── Settings
    ├── Music
    ├── Messages
    ├── Community (Supabase-backed)
    ├── Calendar
    └── ...
```

This separation makes adding new applications easier without rewriting the desktop itself.

## 🐛 Common JSX/Vite Issue

If Vite reports:

```text
Unexpected JSX expression
JSX syntax is disabled
```

check whether a file containing JSX is incorrectly named `.js`.

For example:

```text
registerApps.js
```

should normally be:

```text
registerApps.jsx
```

Also make sure JSX has not been accidentally escaped.

Correct:

```jsx
icon: (props) => <AppIcon appId="about" {...props} />,
```

Incorrect:

```jsx
icon: (props) => \<AppIcon appId="about" {...props} />,
```

When changing an extension, also check imports and make sure Vite is loading the intended file.

## 🔮 Planned Improvements

- [ ] Better window management
- [ ] Minimize/maximize animations
- [ ] Drag-and-drop desktop icons
- [ ] More terminal commands
- [ ] Improved file explorer
- [ ] Local file handling
- [ ] Persistent settings
- [ ] More wallpapers
- [ ] Music playlists
- [ ] Music seek/progress controls
- [ ] Keyboard shortcuts
- [ ] Global search
- [ ] Notifications
- [ ] Context menus
- [ ] System clock
- [ ] Improved mobile support
- [ ] More built-in applications
- [ ] TypeScript migration
- [ ] Accessibility improvements

## 📦 Production

Build the project with:

```bash
npm run build
```

The production output is normally generated in:

```text
dist/
```

The `dist` directory can be deployed to a static hosting provider.

## 🔐 Security

BrowserOS is primarily a frontend application.

The browser sandbox prevents the application from directly executing arbitrary operating-system commands or accessing unrestricted local files.

If backend functionality is added in the future, all server-side input should be validated and sensitive credentials must never be exposed in frontend code. The Community app is the first exception to "primarily frontend" — see [Community app](#-community-app) above for how its Supabase backend keeps write access RLS-scoped and secrets server-side only.

## 🤝 Contributing

Create a feature branch:

```bash
git checkout -b feature/my-feature
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Before submitting changes, verify the production build:

```bash
npm run build
```

## 📄 License

Choose a license appropriate for your project before publishing it publicly.

For example, the project can use the **MIT License** if you want a permissive open-source license.

## 👨‍💻 Author

**Haadi**

BrowserOS is a frontend project created to explore how far a polished desktop-like experience can be taken inside a web browser.

## 🎯 Project Goals

BrowserOS is not intended to replace a real operating system.

The goal is to create a polished, interactive **OS-inspired web experience** that demonstrates:

- React architecture
- UI/UX design
- State management
- Dynamic application loading
- Window management
- Reusable components
- Frontend performance
- Browser APIs
- Modern web development

If you like the project, consider giving it a ⭐ on GitHub.
