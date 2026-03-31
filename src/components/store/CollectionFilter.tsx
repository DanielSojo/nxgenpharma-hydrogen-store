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
    <div className="mb-10 rounded-2xl border border-[#e8e1d8] bg-[#faf9f7] p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff]">
            Filter By Collection
          </p>
          <p className="mt-1 text-sm text-[#666]">
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
            className="w-full appearance-none rounded-xl border border-[#e0dbd2] bg-white px-4 py-3 text-sm text-[#222] outline-none transition-all focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10"
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
