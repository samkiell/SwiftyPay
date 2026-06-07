'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
}

/** Generated payment link with a single-tap copy-to-clipboard control. */
export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context) — no-op.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated p-2 pl-4">
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
        {url}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy payment link"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition-transform active:scale-95"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden /> Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden /> Copy
          </>
        )}
      </button>
    </div>
  );
}

export default CopyLinkButton;
