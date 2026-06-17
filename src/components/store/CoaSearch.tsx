'use client';

import { useState } from 'react';
import { Search, Loader2, FileCheck2, FileX2, Download } from 'lucide-react';
import type { CoaRecord } from '@/lib/coa';

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; record: CoaRecord; lot: string }
  | { status: 'not-found'; lot: string }
  | { status: 'error'; message: string };

export default function CoaSearch() {
  const [lot, setLot] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = lot.trim();
    if (!query) return;

    setState({ status: 'loading' });
    try {
      const res = await fetch(`/api/coa?lot=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setState({ status: 'error', message: json.error ?? 'Something went wrong. Please try again.' });
        return;
      }
      const json = (await res.json()) as { result: CoaRecord | null };
      if (json.result) {
        setState({ status: 'found', record: json.result, lot: query });
      } else {
        setState({ status: 'not-found', lot: query });
      }
    } catch {
      setState({ status: 'error', message: 'Network error. Please try again.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Search form */}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-brand-line/70 bg-white p-6 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)] sm:p-7"
      >
        <label htmlFor="coa-lot" className="text-sm font-semibold text-brand-navy">
          Lot / Batch number
        </label>
        <p className="mt-1 text-[13px] leading-relaxed text-brand-ink/60">
          Enter the lot number exactly as printed on your product label or vial.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            <input
              id="coa-lot"
              type="text"
              value={lot}
              onChange={(e) => setLot(e.target.value)}
              placeholder="e.g. Nexg0123456789"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-brand-line bg-brand-surface py-3 pl-11 pr-4 text-sm text-brand-ink placeholder:text-brand-ink/40 transition-colors focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          <button
            type="submit"
            disabled={!lot.trim() || state.status === 'loading'}
            className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {state.status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Searching
              </>
            ) : (
              <>
                <Search size={16} /> Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result */}
      {state.status === 'found' && <CoaResult record={state.record} />}

      {state.status === 'not-found' && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <FileX2 size={22} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <h3 className="text-base font-bold text-brand-navy">No certificate found</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-brand-ink/72">
              We couldn&apos;t find a Certificate of Analysis for lot{' '}
              <span className="font-semibold text-brand-navy">{state.lot}</span>. Double-check the
              lot number on your label, or contact our team and we&apos;ll help you locate it.
            </p>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-[15px] text-red-600">
          {state.message}
        </div>
      )}
    </div>
  );
}

function CoaResult({ record }: { record: CoaRecord }) {
  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-brand-line/70 bg-white shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)]">
      <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue">
            <FileCheck2 size={22} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-ink/45">
              Certificate found
            </p>
            <h3 className="mt-1 text-lg font-bold text-brand-navy">Lot {record.lotNumber}</h3>
          </div>
        </div>

        <a
          href={record.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-ink hover:shadow-lg"
        >
          <Download size={16} /> Download certificate (PDF)
        </a>
      </div>
    </div>
  );
}
