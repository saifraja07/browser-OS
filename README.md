# BrowserOS

BrowserOS is a web-based desktop operating system UI built with React and Vite.

It runs entirely in the browser and provides a desktop-like environment with windows, a dock, applications, settings, a file explorer, a terminal, a retro music player, and a public Community guestbook.

## Features

- Desktop and window management
- Resizable and maximizable windows
- Mobile-friendly layout
- File Explorer
- Simulated Terminal
- Settings and wallpaper customization
- Retro Music Player with local MP3 files and volume control
- Calendar
- Messages
- Retro plain-text README viewer
- Community guestbook powered by Supabase

## How It Works

BrowserOS is mainly a frontend application.

The desktop manages windows and applications. Each application has its own UI and logic, while the application registry controls which apps are available.

The Community app is different because it uses Supabase for persistent shared data.

### Community

Users can read and create guestbook posts.

- Posts are stored in a Supabase `guestbook` table.
- Row Level Security allows public reads.
- New posts are sent through the `submit-post` Supabase Edge Function.
- The Edge Function validates, normalizes, moderates, rate-limits, and inserts posts.
- The Supabase service-role key stays on the server and is never exposed to the browser.

### Internet (browser + search)

The Internet app is an iframe-based browser with address-bar navigation.
The address bar also doubles as a search box: input is classified as
either a URL (navigates as before) or a search query (calls
`searchInternet()`, which hits BrowserOS's own backend —
`GET /internet/search?q=<query>` — never a search provider directly). See
`aws/internet-search/` for the backend (AWS API Gateway → AWS Lambda →
Jina Search) and `src/apps/internet/internetSearchService.js` for the
frontend client. Results are currently shown in a minimal, temporary list
pending a real results design.

## Tech Stack

- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- Lucide React
- HTML5 Audio API
- Supabase

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd browserOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase and Internet search

Community and Internet search are both optional. The rest of BrowserOS
works without either.

Copy the example environment file:

```bash
cp .env.example .env.local
```

Add your Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Never put the Supabase `service_role` key in frontend environment variables.

To enable Internet search, add the deployed API URL from
`aws/internet-search/` (see that directory's README to deploy it first):

```env
VITE_BROWSEROS_API_URL=https://your-api-id.execute-api.your-region.amazonaws.com
```

This is a public URL, not a secret. The search-provider API key stays
server-side in the Lambda and must never be added to a frontend `.env`
file.

### 4. Set up the Community database

Run the migration:

```text
supabase/migrations/0001_guestbook.sql
```

You can run it from the Supabase SQL Editor or with the Supabase CLI.

The migration creates the `guestbook` table and its Row Level Security policies.

### 5. Deploy the Edge Function

Install and log in to the Supabase CLI, then:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy submit-post
```

The Edge Function receives the Supabase service-role credentials through its server-side environment.

### 6. Start BrowserOS

```bash
npm run dev
```

Open the local address shown by Vite, normally:

```text
http://localhost:5173/
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview it locally:

```bash
npm run preview
```

The production files are generated in:

```text
dist/
```

## Music

Place local MP3 files in:

```text
public/music/
├── song-1.mp3
├── song-2.mp3
└── song-3.mp3
```

They can then be referenced as:

```text
/music/song-1.mp3
```

The Music app provides play/pause and volume control. The vinyl record spins while music is playing and resumes from its previous position after pausing.

## Project Structure

```text
browserOS/
├── public/
│   └── music/
├── src/
│   ├── apps/
│   │   ├── calculator/
│   │   ├── explorer/
│   │   ├── terminal/
│   │   ├── settings/
│   │   ├── readme/
│   │   ├── calendar/
│   │   ├── music/
│   │   ├── messages/
│   │   └── community/
│   ├── components/
│   ├── assets/
│   ├── lib/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── migrations/
│   └── functions/
├── aws/
│   └── internet-search/
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## Adding an App

Apps are registered through the application registry.

A basic app looks like:

```jsx
{
  id: "example",
  title: "Example App",
  icon: (props) => <AppIcon appId="example" {...props} />,
  component: () => import("./example/ExampleApp")
}
```

Application code should normally live in its own directory:

```text
src/apps/example/
└── ExampleApp.jsx
```

## Security

BrowserOS runs inside the browser sandbox and does not execute arbitrary operating-system commands.

For the Community backend:

- RLS protects database access.
- No public `UPDATE` or `DELETE` policies are provided.
- The service-role key is used only by the Edge Function.
- User content is rendered as plain text.
- Input length and basic abuse protection are enforced on the server and database.

## License

Choose a license appropriate for your project before publishing it publicly.

## Author

**Saif Ali**

BrowserOS is a project exploring how far a desktop-like operating system experience can be built inside a web browser.
