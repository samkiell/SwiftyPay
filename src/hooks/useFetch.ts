'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  /** Manually re-run the fetcher. */
  refetch: () => void;
}

/**
 * Generic async data hook for client components.
 *
 * Pass any async function (typically one of the helpers from `@/lib/api`).
 * Re-runs whenever a value in `deps` changes. Stale results from an
 * outdated invocation are discarded so the latest call always wins.
 *
 * @param fetcher async function producing the data
 * @param deps   dependency list; the fetcher re-runs when these change
 * @param immediate whether to run on mount (default true)
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  immediate = true,
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);

  // Keep the latest fetcher in a ref so `run` stays referentially stable
  // (the caller usually passes a fresh closure each render). Updated in an
  // effect rather than during render to respect the rules of refs.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Track the latest run so out-of-order responses can't clobber state.
  const runId = useRef(0);

  const run = useCallback(() => {
    const id = ++runId.current;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (id === runId.current) setData(result);
      })
      .catch((err: unknown) => {
        if (id === runId.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (id === runId.current) setLoading(false);
      });
  }, []);

  // Re-run when the serialised dependency list changes. Serialising keeps the
  // effect's dependency array a stable literal while still reacting to changes.
  const depsKey = JSON.stringify(deps);
  useEffect(() => {
    // Kicking off the request (which flips `loading`) on mount / dep change is
    // the intended way to synchronise with an external system (the network).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (immediate) run();
  }, [depsKey, immediate, run]);

  return { data, error, loading, refetch: run };
}

export default useFetch;
