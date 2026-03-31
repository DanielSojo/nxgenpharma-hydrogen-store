'use client';

import { useRouter } from 'next/navigation';

interface CollectionOption {
  id: string;
  handle: string;
  title: string;
}

interface CollectionFilterProps {
  collections: CollectionOption[];
  activeHandle: string;
}

export default function CollectionFilter({
  collections,
  activeHandle,
}: CollectionFilterProps) {
  const router = useRouter();

  return (
    <div className="mb-10 rounded-2xl border border-brand-line bg-brand-mist p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
            Filter By Collection
          </p>
          <p className="mt-1 text-sm text-brand-ink/65">
            Switch between the full catalog and individual collections.
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          <label htmlFor="collection-filter" className="sr-only">
            Select a collection
          </label>
          <select
            id="collection-filter"
            value={activeHandle}
            onChange={(event) => {
              const nextHandle = event.target.value;
              const nextPath =
                nextHandle === 'all' ? '/collections/all' : `/collections/${nextHandle}`;

              router.push(nextPath);
            }}
            className="w-full appearance-none rounded-xl border border-brand-line bg-white px-4 py-3 text-sm text-brand-ink outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
          >
            <option value="all">All products</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.handle}>
                {collection.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
