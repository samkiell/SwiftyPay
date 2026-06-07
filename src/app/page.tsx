'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Wallet } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import {
  createLink,
  type Coin,
  type CreateLinkResponse,
} from '@/lib/api';
import { validateAmount } from '@/lib/amount';
import AmountInput from '@/components/AmountInput';
import CoinSelector from '@/components/CoinSelector';
import NoteInput from '@/components/NoteInput';
import AiSuggestionBadge from '@/components/AiSuggestionBadge';
import CopyLinkButton from '@/components/CopyLinkButton';
import Button from '@/components/Button';

/**
 * Screen 1 — Request & Link Terminal (SAMKIEL).
 *
 * Extracts the Telegram user on load, collects amount/coin/note, surfaces an
 * AI asset recommendation, and generates a shareable payment link.
 */
export default function RequestTerminalPage() {
  const { user, username, userId, initData, isReady, isTelegram, haptic } =
    useTelegram();

  const [amount, setAmount] = useState('');
  const [coin, setCoin] = useState<Coin>('USDT');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAmountError, setShowAmountError] = useState(false);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);

  const amountCheck = validateAmount(amount);

  /** Map a raw API error to a friendly, user-facing message. */
  function friendlyError(message: string): string {
    if (/\b429\b/.test(message)) {
      return "You've hit the limit of 10 links per day. Try again tomorrow.";
    }
    if (/\b401\b|\b403\b/.test(message)) {
      return 'Could not verify your Telegram session. Reopen the app from the bot.';
    }
    if (/Failed to fetch|NetworkError/i.test(message)) {
      return 'Network error. Check your connection and try again.';
    }
    return 'Could not create your link. Please try again.';
  }

  async function handleGenerate() {
    setError(null);
    setShowAmountError(true);

    if (!amountCheck.valid || amountCheck.value === null) {
      haptic(undefined, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createLink(
        {
          amount: amountCheck.value,
          coin,
          note: note.trim() || undefined,
          telegramUserId: userId ? String(userId) : '',
          telegramUsername: username ?? '',
        },
        initData,
      );
      haptic(undefined, 'success');
      setResult(res);
    } catch (e) {
      haptic(undefined, 'error');
      setError(friendlyError(e instanceof Error ? e.message : ''));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-8">
      {/* Header */}
      <header className="mb-7 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15">
          <Wallet className="h-6 w-6 text-accent" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">SwiftyPay</h1>
          <p className="text-sm text-muted">
            {isReady && user
              ? `Hi ${user.first_name} — request crypto with a link`
              : 'Request crypto with a shareable link'}
          </p>
        </div>
      </header>

      {/* Heads-up when opened outside Telegram (e.g. plain browser preview). */}
      {isReady && !isTelegram && (
        <p className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          Open this from SwiftyExBot inside Telegram to attach your identity to
          the link.
        </p>
      )}

      {result ? (
        /* ---------- Success: shareable link generated ---------- */
        <section className="sp-card flex flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold">Your payment link is ready</h2>
              <p className="mt-1 text-sm text-muted">
                Share it anywhere. It expires{' '}
                {new Date(result.expiresAt).toLocaleString()}.
              </p>
            </div>
          </div>
          <CopyLinkButton
            url={result.url}
            shareText={`Pay me ${amountCheck.value ?? amount} ${coin} via SwiftyPay`}
          />
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              setAmount('');
              setNote('');
              setShowAmountError(false);
            }}
          >
            Create another
          </Button>
        </section>
      ) : (
        /* ---------- Request form ---------- */
        <section className="flex flex-col gap-5">
          <div className="sp-card flex flex-col gap-5 p-5">
            <AmountInput
              value={amount}
              onChange={(v) => setAmount(v)}
              coin={coin}
              error={showAmountError ? amountCheck.error : null}
            />
            <CoinSelector value={coin} onChange={setCoin} />
            <NoteInput value={note} onChange={setNote} />
          </div>

          <AiSuggestionBadge selected={coin} onApply={setCoin} />

          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            onClick={handleGenerate}
            loading={submitting}
            disabled={!amountCheck.valid}
          >
            Generate payment link
            {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
          </Button>
        </section>
      )}

      <footer className="mt-auto pt-8 text-center text-xs text-muted/70">
        Secured by SwiftyEx · Links expire after 48 hours
      </footer>
    </main>
  );
}
