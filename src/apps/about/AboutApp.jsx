export default function AboutApp() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5 font-body text-sm text-os-ink">
      <div>
        <h2 className="font-display text-base text-os-ink">
          BrowserOS
        </h2>

        <p className="text-xs text-os-ink-soft">
          Version 1.0
        </p>
      </div>

      <div className="border-y-2 border-os-border py-3 text-xs leading-relaxed text-os-ink-soft">
        <p>Welcome to BrowserOS!</p>

        <p className="mt-3">
          Your little desktop, right inside your browser.
        </p>

        <p className="mt-3">
          Inspired by the classic computers of the 1990s —
          when computers were beige, pixels were chunky,
          and every click felt important.
        </p>

        <p className="mt-3">
          BrowserOS is a small place to explore, experiment,
          and just wander around for a while.
        </p>
      </div>

      <div className="text-xs leading-relaxed text-os-ink-soft">
        <p>Feel free to explore.</p>

        <p className="mt-2">
          Open some apps, look through your files,
          try the terminal, move some windows around,
          and see what you can discover.
        </p>

        <p className="mt-3">
          Some things are obvious.
          <br />
          Some things are not.
        </p>

        <p className="mt-3">
          Tip:
          <br />
          Curiosity usually reveals more than instructions ever could.
        </p>
      </div>

      <div className="mt-auto border-t-2 border-os-border pt-3 text-xs text-os-ink-soft">
        <p>Running entirely in your web browser.</p>

        <p className="mt-2">
          © 2026 BrowserOS
        </p>

        <p className="mt-1">
          Created by Haadi
        </p>
      </div>
    </div>
  );
}