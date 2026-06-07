'use client';

import { ArrowUpRight, FileText, UserRound } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useFetch } from '@/hooks/useFetch';
import { buildDeepLink, getLink } from '@/lib/api';
import Button from '@/components/Button';
import StatusState from '@/components/StatusState';

interface PaymentGatewayProps {
  linkId: string;
}

/**
 * Screens 2 & 3 — Host Gateway + Transaction Success (ABRAHAM).
 *
 * Hydrates link metadata, renders the payment summary with a Pay Now CTA that
 * deep-links back into SwiftyExBot, and handles expired / already-paid /
 * settled edge cases.
 */
export function PaymentGateway({ linkId }: PaymentGatewayProps) {
  const { webApp } = useTelegram();
  const { data, loading, error } = useFetch(() => getLink(linkId), [linkId]);

  const deepLink = buildDeepLink(linkId);

  function handlePayNow() {
    // Prefer the in-client navigation if running inside Telegram; otherwise
    // fall back to a normal browser redirect into the bot.
    if (typeof window !== 'undefined' && webApp) {
      window.location.href = deepLink;
    } else if (typeof window !== 'undefined') {
      window.open(deepLink, '_blank', 'noopener,noreferrer');
    }
  }

  // ---- Loading ----
  if (loading) {
    return <StatusState tone="loading" title="Loading payment…" />;
  }

  // ---- Invalid link (network / 404) ----
  if (error || !data) {
    return (
      <StatusState
        tone="danger"
        title="Link not found"
        description="This payment link is invalid or no longer available."
      />
    );
  }

  // ---- Edge case: expired (48h TTL) ----
  if (data.status === 'expired') {
    return (
      <StatusState
        tone="warning"
        title="Link expired"
        description="Payment links are valid for 48 hours. Ask the requester to generate a new one."
      />
    );
  }

  // ---- Screen 3: already settled / success ----
  if (data.status === 'paid') {
    return (
      <StatusState
        tone="success"
        title="Payment complete"
        description={`${data.amount} ${data.coin} to @${data.requesterUsername} has been cleared.`}
      >
        <div className="sp-card flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted">Amount cleared</span>
          <span className="text-lg font-bold text-foreground">
            {data.amount} {data.coin}
          </span>
        </div>
      </StatusState>
    );
  }

  // ---- Screen 2: pending — host gateway interface ----
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-muted">Payment request</p>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold tracking-tight">{data.amount}</span>
          <span className="text-xl font-semibold text-accent">{data.coin}</span>
        </div>
      </div>

      <section className="sp-card flex flex-col gap-4 p-5">
        <Row
          icon={<UserRound className="h-5 w-5 text-accent" aria-hidden />}
          label="Requested by"
          value={`@${data.requesterUsername}`}
        />
        {data.note && (
          <Row
            icon={<FileText className="h-5 w-5 text-accent" aria-hidden />}
            label="Note"
            value={data.note}
          />
        )}
      </section>

      <div className="mt-6">
        <Button onClick={handlePayNow}>
          Pay Now
          <ArrowUpRight className="h-5 w-5" aria-hidden />
        </Button>
        <p className="mt-3 text-center text-xs text-muted/70">
          You&apos;ll be routed to SwiftyExBot to authorize securely.
        </p>
      </div>

      <footer className="mt-auto pt-8 text-center text-xs text-muted/70">
        Secured by SwiftyEx
      </footer>
    </main>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="break-words text-base font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export default PaymentGateway;
