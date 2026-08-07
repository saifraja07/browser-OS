import { resolvePath, basename, dirname } from '../../core/filesystem/pathUtils.js';

/**
 * ctx shape (built fresh per command execution by TerminalApp):
 * {
 *   cwd: string,
 *   fs: virtualFS instance,
 *   setCwd(path),
 *   openApp(appId),
 *   listApps(): manifest[],
 *   clear(),
 *   theme: { cycle(), current(): id },
 * }
 */

function fmtBytes(bytes) {
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
        .map(([name, cmd]) => `  ${name.padEnd(10)} ${cmd.description}`),
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
      const target = resolvePath(ctx.cwd, args[0]);
      const entries = await ctx.fs.readDir(target);
      if (entries.length === 0) return ['(empty)'];
      return entries.map((e) =>
        e.type === 'folder' ? `  ${e.name}/` : `  ${e.name.padEnd(24)} ${fmtBytes(e.size)}`
      );
    },
  },

  cd: {
    usage: 'cd <path>',
    description: 'Change directory',
    run: async (args, ctx) => {
      const target = resolvePath(ctx.cwd, args[0] ?? '/');
      const stat = await ctx.fs.stat(target).catch(() => null);
      if (!stat) throw new Error(`cd: no such directory: ${args[0]}`);
      if (stat.type !== 'folder') throw new Error(`cd: not a directory: ${args[0]}`);
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
      const content = await ctx.fs.readFile(target).catch((e) => {
        throw new Error(`cat: ${e.message}`);
      });
      return content.split('\n');
    },
  },

  mkdir: {
    usage: 'mkdir <path>',
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
      const pathArg = args.find((a) => a !== '-r');
      if (!pathArg) throw new Error('rm: missing operand');
      const target = resolvePath(ctx.cwd, pathArg);
      await ctx.fs.delete(target, { recursive }).catch((e) => {
        throw new Error(`rm: ${e.message}${e.code === 'ENOTEMPTY' ? ' (use -r)' : ''}`);
      });
      return [];
    },
  },

  mv: {
    usage: 'mv <src> <dest>',
    description: 'Move or rename a file/directory',
    run: async (args, ctx) => {
      if (!args[0] || !args[1]) throw new Error('mv: missing operand');
      const src = resolvePath(ctx.cwd, args[0]);
      let dest = resolvePath(ctx.cwd, args[1]);
      // mv into an existing directory keeps the source's basename.
      const destStat = await ctx.fs.stat(dest).catch(() => null);
      if (destStat?.type === 'folder') dest = `${dest}/${basename(src)}`;
      await ctx.fs.move(src, dest).catch((e) => {
        throw new Error(`mv: ${e.message}`);
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
    run: async (args, ctx) => ctx.listApps().map((a) => `  ${a.id.padEnd(12)} ${a.title}`),
  },

  open: {
    usage: 'open <appId>',
    description: 'Launch an app by id',
    run: async (args, ctx) => {
      if (!args[0]) throw new Error('open: missing app id (try "apps" to list them)');
      const app = ctx.listApps().find((a) => a.id === args[0]);
      if (!app) throw new Error(`open: no app named "${args[0]}"`);
      ctx.openApp(args[0]);
      return [`Opening ${app.title}…`];
    },
  },

  theme: {
    usage: 'theme [next]',
    description: 'Show or cycle the OS theme',
    run: async (args, ctx) => {
      if (args[0] === 'next') {
        ctx.theme.cycle();
        return [`Theme: ${ctx.theme.current()}`];
      }
      return [`Current theme: ${ctx.theme.current()}`, 'Run "theme next" to cycle.'];
    },
  },

  whoami: {
    usage: 'whoami',
    description: 'Print the current user',
    run: async () => ['guest@browseros'],
  },

  date: {
    usage: 'date',
    description: 'Print the current date and time',
    run: async () => [new Date().toString()],
  },
};
