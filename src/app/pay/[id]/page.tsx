import PaymentGateway from '@/components/PaymentGateway';

/**
 * Route: /pay/[id]
 * Screens 2 & 3 — Gateway & Success (ABRAHAM).
 *
 * In Next.js 16 the `params` prop is a Promise, so it's awaited here in the
 * server component and the resolved id is handed to the client gateway.
 */
export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentGateway linkId={id} />;
}
