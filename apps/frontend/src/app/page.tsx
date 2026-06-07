'use client';

import { useState } from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import {
  createLink,
  type Coin,
  type CreateLinkResponse,
} from '@/lib/api';
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
  const { user, username, userId, initData, isReady } = useTelegram();

  const [amount, setAmount] = useState('');
  const [coin, setCoin] = useState<Coin>('USDT');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);

  const amountValid = Number(amount) > 0;

  async function handleGenerate() {
    setError(null);

    if (!amountValid) {
      setError('Enter an amount greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createLink(
        {
          amount: Number(amount),
          coin,
          note: note.trim() || undefined,
          telegramUserId: userId ? String(userId) : '',
          telegramUsername: username ?? '',
        },
        initData,
      );
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create link.');
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

      {result ? (
        /* ---------- Success: shareable link generated ---------- */
        <section className="sp-card flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Your payment link is ready</h2>
            <p className="mt-1 text-sm text-muted">
              Share it anywhere. It expires{' '}
              {new Date(result.expiresAt).toLocaleString()}.
            </p>
          </div>
          <CopyLinkButton url={result.url} />
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              setAmount('');
              setNote('');
            }}
          >
            Create another
          </Button>
        </section>
      ) : (
        /* ---------- Request form ---------- */
        <section className="flex flex-col gap-5">
          <div className="sp-card flex flex-col gap-5 p-5">
            <AmountInput value={amount} onChange={setAmount} coin={coin} />
            <CoinSelector value={coin} onChange={setCoin} />
            <NoteInput value={note} onChange={setNote} />
          </div>

          <AiSuggestionBadge onApply={setCoin} />

          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            onClick={handleGenerate}
            loading={submitting}
            disabled={!amountValid}
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
