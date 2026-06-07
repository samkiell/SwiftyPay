'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface CopyLinkButtonProps {
  url: string;
  /** Optional message to prefill when sharing via Telegram. */
  shareText?: string;
}

/** Copy to clipboard with a fallback for insecure / older contexts. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Generated payment link with a single-tap copy-to-clipboard control plus a
 * native Telegram share action.
 */
export function CopyLinkButton({ url, shareText }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const { haptic, openLink } = useTelegram();

  async function handleCopy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      haptic(undefined, 'success');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  function handleShare() {
    haptic('light');
    const text = encodeURIComponent(shareText ?? 'Pay me with SwiftyPay');
    // Telegram's native share sheet: ?url= is the link, ?text= the caption.
    openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated p-2 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
          {url}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy payment link"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-contrast transition-transform active:scale-95"
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

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
      >
        <Share2 className="h-4 w-4 text-accent" aria-hidden />
        Share on Telegram
      </button>
    </div>
  );
}

export default CopyLinkButton;
