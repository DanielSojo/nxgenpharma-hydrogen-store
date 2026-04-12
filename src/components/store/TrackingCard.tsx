import { Truck } from "lucide-react";

export function TrackingCard({ fulfillments }: { fulfillments: any[] }) {
  const tracked = fulfillments?.filter((f) => f.trackingInfo?.length > 0);

  if (!tracked?.length) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Truck size={15} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-brand-navy">Tracking</h3>
        </div>
        <p className="text-sm text-brand-ink/55">
          No tracking information yet. Check back once your order ships.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Truck size={15} className="text-brand-blue" />
        <h3 className="text-sm font-semibold text-brand-navy">Tracking</h3>
      </div>
      <div className="flex flex-col gap-4">
        {tracked.map((fulfillment, i) => (
          <div key={i} className="flex flex-col gap-2">
            {fulfillment.trackingCompany && (
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink/50">
                {fulfillment.trackingCompany}
              </p>
            )}
            {fulfillment.trackingInfo.map((info: any, j: number) => (
              <div
                key={j}
                className="flex items-center justify-between rounded-xl bg-brand-mist px-4 py-3"
              >
                <span className="font-mono text-xs text-brand-navy">
                  {info.number}
                </span>
                {info.url && (
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand-blue hover:underline"
                  >
                    Track →
                  </a>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
