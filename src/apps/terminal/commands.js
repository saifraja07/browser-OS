import { resolvePath, basename } from '../../core/filesystem/pathUtils.js';

/**
 * ctx shape (built fresh per command execution by TerminalApp):
 * {
 *   cwd: string,
 *   fs: virtualFS instance,
 *   setCwd(path),
 *   openApp(appId),
 *   closeApp(appId),
 *   listApps(): manifest[],
 *   clear(),
 * }
 */

function fmtBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

export const COMMANDS = {
  help: {
    usage: 'help',
    description: 'List available commands',
    run: async () =>
      Object.entries(COMMANDS)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, cmd]) => `  ${cmd.usage.padEnd(24)} ${cmd.description}`),
  },

  pwd: {
    usage: 'pwd',
    description: 'Print working directory',
    run: async (args, ctx) => [ctx.cwd],
  },

  ls: {
    usage: 'ls [path]',
    description: 'List directory contents',
    run: async (args, ctx) => {
      const target = resolvePath(ctx.cwd, args[0] ?? '.');
      const entries = await ctx.fs.readDir(target);
      if (entries.length === 0) return ['(empty)'];

      return entries.map((entry) =>
        entry.type === 'folder'
          ? `  ${entry.name}/`
          : `  ${entry.name.padEnd(24)} ${fmtBytes(entry.size)}`,
      );
    },
  },

  cd: {
    usage: 'cd [path]',
    description: 'Change directory',
    run: async (args, ctx) => {
      const target = resolvePath(ctx.cwd, args[0] ?? '/');
      const stat = await ctx.fs.stat(target).catch(() => null);

      if (!stat) {
        throw new Error(`cd: no such directory: ${args[0] ?? '/'}`);
      }

      if (stat.type !== 'folder') {
        throw new Error(`cd: not a directory: ${args[0]}`);
      }

      ctx.setCwd(target);
      return [];
    },
  },

  cat: {
    usage: 'cat <file>',
    description: 'Print file contents',
    run: async (args, ctx) => {
      if (!args[0]) throw new Error('cat: missing file operand');

      const target = resolvePath(ctx.cwd, args[0]);
      const content = await ctx.fs.readFile(target).catch((error) => {
        throw new Error(`cat: ${error.message}`);
      });

      return String(content).split('\n');
    },
  },

  mkdir: {
    usage: 'mkdir <directory>',
    description: 'Create a directory',
    run: async (args, ctx) => {
      if (!args[0]) throw new Error('mkdir: missing operand');

      const target = resolvePath(ctx.cwd, args[0]);
      await ctx.fs.mkdir(target, { recursive: true });
      return [];
    },
  },

  touch: {
    usage: 'touch <file>',
    description: 'Create an empty file',
    run: async (args, ctx) => {
      if (!args[0]) throw new Error('touch: missing operand');

      const target = resolvePath(ctx.cwd, args[0]);
      if (await ctx.fs.exists(target)) return [];

      await ctx.fs.writeFile(target, '');
      return [];
    },
  },

  rm: {
    usage: 'rm [-r] <path>',
    description: 'Remove a file or directory',
    run: async (args, ctx) => {
      const recursive = args.includes('-r');
      const pathArg = args.find((arg) => arg !== '-r');

      if (!pathArg) throw new Error('rm: missing operand');

      const target = resolvePath(ctx.cwd, pathArg);

      await ctx.fs.delete(target, { recursive }).catch((error) => {
        throw new Error(
          `rm: ${error.message}${error.code === 'ENOTEMPTY' ? ' (use -r)' : ''}`,
        );
      });

      return [];
    },
  },

  mv: {
    usage: 'mv <source> <destination>',
    description: 'Move or rename a file/directory',
    run: async (args, ctx) => {
      if (!args[0] || !args[1]) throw new Error('mv: missing operand');

      const source = resolvePath(ctx.cwd, args[0]);
      let destination = resolvePath(ctx.cwd, args[1]);

      const destinationStat = await ctx.fs.stat(destination).catch(() => null);
      if (destinationStat?.type === 'folder') {
        destination = `${destination}/${basename(source)}`;
      }

      await ctx.fs.move(source, destination).catch((error) => {
        throw new Error(`mv: ${error.message}`);
      });

      return [];
    },
  },

  echo: {
    usage: 'echo <text>',
    description: 'Print text',
    run: async (args) => [args.join(' ')],
  },

  clear: {
    usage: 'clear',
    description: 'Clear the terminal',
    run: async (args, ctx) => {
      ctx.clear();
      return [];
    },
  },

  apps: {
    usage: 'apps',
    description: 'List installed apps',
    run: async (args, ctx) =>
      ctx.listApps().map((app) => `  ${app.id.padEnd(16)} ${app.title}`),
  },

  open: {
    usage: 'open <appId>',
    description: 'Launch an app by id',
    run: async (args, ctx) => {
      if (!args[0]) {
        throw new Error('open: missing app id (try "apps" to list them)');
      }

      const app = ctx.listApps().find((entry) => entry.id === args[0]);
      if (!app) throw new Error(`open: no app named "${args[0]}"`);

      ctx.openApp(args[0]);
      return [`Opening ${app.title}…`];
    },
  },

  exit: {
    usage: 'exit',
    description: 'Close the terminal',
    run: async (args, ctx) => {
      ctx.closeApp('terminal');
      return [];
    },
  },

  quit: {
    usage: 'quit',
    description: 'Close the terminal',
    run: async (args, ctx) => {
      ctx.closeApp('terminal');
      return [];
    },
  },

  q: {
    usage: 'q',
    description: 'Close the terminal',
    run: async (args, ctx) => {
      ctx.closeApp('terminal');
      return [];
    },
  },

  whoami: {
    usage: 'whoami',
    description: 'Print the current user',
    run: async () => ['guest@browseros'],
  },

  hostname: {
    usage: 'hostname',
    description: 'Print the system hostname',
    run: async () => ['browseros'],
  },

  uname: {
    usage: 'uname',
    description: 'Show BrowserOS system information',
    run: async () => ['BrowserOS WebOS 1.0 x86_64'],
  },

  version: {
    usage: 'version',
    description: 'Show BrowserOS version',
    run: async () => ['BrowserOS Terminal v1.0.0'],
  },

  theme: {
    usage: 'theme',
    description: 'Show the OS theme',
    run: async () => [
      'Current theme: Default',
      'BrowserOS ships with a single Default theme.',
    ],
  },

  date: {
    usage: 'date',
    description: 'Print the current date and time',
    run: async () => [new Date().toString()],
  },

  uptime: {
    usage: 'uptime',
    description: 'Show BrowserOS uptime',
    run: async () => {
      const seconds = Math.floor(performance.now() / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      return [
        hours > 0
          ? `up ${hours}h ${minutes % 60}m`
          : `up ${minutes}m ${seconds % 60}s`,
      ];
    },
  },

  neofetch: {
    usage: 'neofetch',
    description: 'Display BrowserOS system information',
    run: async () => [
      '       ███████████████',
      '     ███  BrowserOS  ███',
      '    ███               ███',
      '    ███    ◉     ◉    ███',
      '    ███       ▽       ███',
      '     ███             ███',
      '       ███████████████',
      '',
      'OS:       BrowserOS',
      'Kernel:   Web Runtime',
      'Shell:    BrowserOS Shell',
      'Terminal: BrowserOS Terminal',
      `Screen:   ${window.innerWidth}x${window.innerHeight}`,
      'Theme:    Default',
    ],
  },

  history: {
    usage: 'history',
    description: 'Explain command history',
    run: async () => [
      'Use ↑ and ↓ to navigate previous commands.',
    ],
  },

  random: {
    usage: 'random [max]',
    description: 'Generate a random number',
    run: async (args) => {
      const max = Number(args[0] ?? 100);

      if (!Number.isFinite(max) || max <= 0) {
        throw new Error('random: max must be greater than 0');
      }

      return [String(Math.floor(Math.random() * max) + 1)];
    },
  },

  coin: {
    usage: 'coin',
    description: 'Flip a coin',
    run: async () => [Math.random() < 0.5 ? 'Heads!' : 'Tails!'],
  },

  dice: {
    usage: 'dice',
    description: 'Roll a six-sided dice',
    run: async () => [`🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`],
  },

  fortune: {
    usage: 'fortune',
    description: 'Get a random fortune',
    run: async () => {
      const fortunes = [
        'The bug you are looking for is hiding in plain sight.',
        'Today is a good day to ship.',
        'Your next command will probably work.',
        'Have you tried turning it off and on again?',
        'A great project starts with a small commit.',
        'The terminal believes in you.',
        '404: Fortune not found.',
        'Your code is cleaner than you think.',
      ];

      return [fortunes[Math.floor(Math.random() * fortunes.length)]];
    },
  },

  matrix: {
    usage: 'matrix',
    description: 'Enter the Matrix',
    run: async () => [
      'Wake up, BrowserOS...',
      '',
      '01001010 01100001 01110110 01100001',
      '01110011 01100011 01110010 01101001',
      '01110000 01110100',
      '',
      'There is no spoon.',
    ],
  },

  sudo: {
    usage: 'sudo <command>',
    description: 'Attempt to run as administrator',
    run: async () => [
      'guest is not in the sudoers file.',
      'This incident will be remembered forever. 😈',
    ],
  },

  hack: {
    usage: 'hack',
    description: 'Definitely not real hacking',
    run: async () => [
      'Initializing elite hacking tools...',
      '[████████████████████] 100%',
      'Bypassing mainframe...',
      'Accessing satellite...',
      'Downloading RAM...',
      '',
      'ERROR: You are still in a browser.',
      'Nice try. 😎',
    ],
  },

  coffee: {
    usage: 'coffee',
    description: 'Brew virtual coffee',
    run: async () => [
      '      ( (',
      '       ) )',
      '    ........',
      '    |      |]',
      '    \\      /',
      '     `----`',
      '',
      '☕ Coffee.exe started successfully.',
    ],
  },

  hello: {
    usage: 'hello',
    description: 'Say hello to BrowserOS',
    run: async () => ['Hello, human! 👋', 'Welcome to BrowserOS.'],
  },

  weather: {
    usage: 'weather',
    description: 'Show simulated weather',
    run: async () => [
      'BrowserOS Weather',
      '─────────────────',
      '☀️  Sunny',
      'Temperature: 27°C',
      'Humidity: 42%',
      'Wind: 8 km/h',
    ],
  },

  ping: {
    usage: 'ping <host>',
    description: 'Simulate a network ping',
    run: async (args) => {
      const host = args[0] || 'browseros';
      return [
        `PING ${host}`,
        '64 bytes: time=12ms',
        '64 bytes: time=10ms',
        '64 bytes: time=11ms',
        '',
        '--- ping statistics ---',
        '3 packets transmitted, 3 received, 0% packet loss',
      ];
    },
  },

  sleep: {
    usage: 'sleep <ms>',
    description: 'Pause for a short time',
    run: async (args) => {
      const ms = Number(args[0] ?? 500);
      if (!Number.isFinite(ms) || ms < 0) {
        throw new Error('sleep: invalid duration');
      }

      const duration = Math.min(ms, 5000);
      await new Promise((resolve) => setTimeout(resolve, duration));
      return [`Slept for ${duration}ms.`];
    },
  },

  cal: {
    usage: 'cal',
    description: 'Show a simple calendar',
    run: async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const days = new Date(year, month + 1, 0).getDate();
      const monthName = now.toLocaleString(undefined, { month: 'long' });

      const rows = [`     ${monthName} ${year}`, 'Su Mo Tu We Th Fr Sa'];
      let row = '   '.repeat(firstDay);

      for (let day = 1; day <= days; day += 1) {
        row += `${String(day).padStart(2, ' ')} `;
        if ((firstDay + day) % 7 === 0 || day === days) {
          rows.push(row.trimEnd());
          row = '';
        }
      }

      return rows;
    },
  },
};
