import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)] text-xs text-white">AI</span>
            The AI Office
          </div>
          <p className="text-sm text-[var(--color-muted)]">Discover, compare, and bookmark the best AI tools on the internet.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium">Browse</h4>
          <ul className="space-y-2 text-sm text-[var(--color-muted)]">
            <li><Link href="/browse/tools/all" className="hover:text-[var(--color-foreground)]">All Tools</Link></li>
            <li><Link href="/browse/compare" className="hover:text-[var(--color-foreground)]">Compare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium">Company</h4>
          <ul className="space-y-2 text-sm text-[var(--color-muted)]">
            <li><Link href="/about" className="hover:text-[var(--color-foreground)]">About</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--color-foreground)]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium">Legal</h4>
          <ul className="space-y-2 text-sm text-[var(--color-muted)]">
            <li><Link href="/privacy" className="hover:text-[var(--color-foreground)]">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--color-foreground)]">Terms</Link></li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-[var(--color-muted-2)]">© {new Date().getFullYear()} The AI Office. All rights reserved.</p>
    </footer>
  );
}
