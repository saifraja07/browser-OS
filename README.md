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
- ⚙️ Settings application
- 🖼️ Wallpaper application
- 🎵 Local music player
- 💬 Predefined Messages application
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
| **Settings** | System and appearance settings |
| **Wallpaper** | Wallpaper selection |
| **README** | Built-in documentation |
| **Calendar** | Calendar interface |
| **Music** | Local music player |
| **Messages** | Predefined chat interface |

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
│   │   ├── wallpaper/
│   │   ├── readme/
│   │   ├── calendar/
│   │   ├── music/
│   │   ├── messages/
│   │   └── registerApps.jsx
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
├── index.html
├── package.json
├── vite.config.js
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

### 3. Start development server

```bash
npm run dev
```

Vite will normally make the application available at:

```text
http://localhost:5173/
```

### 4. Create a production build

```bash
npm run build
```

### 5. Preview the production build

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

- Theme
- Appearance
- System information
- BrowserOS configuration

## 💬 Messages

Messages provides a lightweight predefined chat experience.

It is intentionally client-side and can use selectable predefined responses instead of requiring a backend messaging service.

## 🏗️ Architecture

The project follows a desktop/application architecture:

```text
BrowserOS
│
├── Desktop
│   ├── Wallpaper
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

If backend functionality is added in the future, all server-side input should be validated and sensitive credentials must never be exposed in frontend code.

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
