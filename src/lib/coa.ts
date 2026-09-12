// Certificate of Analysis (COA) lookup, backed by Shopify Files.
//
// Certificates are stored as PDF files in Shopify (admin → Content → Files),
// named by their product lot/batch number, e.g. "Nexg24060117.pdf". A single
// lot often covers several doses of the same product, in which case each
// certificate carries the dose as a suffix: "12345-10mg.pdf", "12345-20mg.pdf".
//
// Customers look up certificates from the public COA page by entering the lot
// number printed on their product label; we search Shopify Files for matching
// names (or alt text) and return every certificate published under that lot.
//
// Requires the Admin app to have the `read_files` access scope.

import { shopifyAdminRequest } from './shopify/admin';

export interface CoaRecord {
  /** Lot / batch number printed on the product label. */
  lotNumber: string;
  /** Public Shopify CDN URL of the certificate PDF. */
  pdfUrl: string;
  /** Original filename of the PDF in Shopify Files. */
  fileName: string;
  /**
   * What distinguishes this certificate from others under the same lot —
   * normally the dose, e.g. "10 mg". Empty when the lot has a single
   * certificate whose filename is just the lot number.
   */
  variantLabel: string;
}

interface FilesQueryResult {
  files: {
    nodes: Array<{
      __typename: string;
      id?: string;
      url?: string;
      alt?: string | null;
      mimeType?: string | null;
    }>;
  };
}

const COA_FILES_QUERY = `
  query CoaFiles($query: String!) {
    files(first: 50, query: $query) {
      nodes {
        __typename
        ... on GenericFile {
          id
          url
          alt
          mimeType
        }
      }
    }
  }
`;

/** Reduce a value to its alphanumeric characters, upper-cased, for matching. */
function normalizeLot(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Extract the (decoded) filename from a Shopify CDN URL, without extension. */
function fileBaseName(url: string): string {
  try {
    const last = new URL(url).pathname.split('/').pop() ?? '';
    return decodeURIComponent(last).replace(/\.[^.]+$/, '');
  } catch {
    return '';
  }
}

/** "12345-10mg" → ["12345", "10mg"] */
function splitSegments(value: string): string[] {
  return value.split(/[^a-zA-Z0-9]+/).filter(Boolean);
}

/** "20mg", "1000mg", "0.5ml", "100mcg" — the only suffix a lot may carry. */
const DOSE_SEGMENT = /^\d+(?:\.\d+)?(mcg|mg|ml|iu|kg|g)$/i;

/**
 * Decide whether `name` is a certificate for `target` (an already-normalized
 * lot), and if so return the trailing part that distinguishes it.
 *
 * Two rules keep this precise, which matters because handing someone the
 * certificate for a different batch or strength is a real-world safety problem:
 *
 * 1. Segments are consumed from the left and compared as a whole, never as a
 *    plain string prefix — so "12345" cannot pick up "123456-10mg". Lots that
 *    contain separators still resolve: "2602-TIR-002" finds "2602TIR002".
 * 2. Whatever follows the lot must be a dose. Real lots share leading
 *    segments ("2602-TIR-002", "2602-GHK-003", "2602-BPC-005"), so without
 *    this a partial entry of "2602" would return a dozen unrelated products'
 *    certificates as if they were all one lot.
 *
 * Returns the suffix ("20mg"), an empty string when the whole name is the lot,
 * or null when the name is not this lot.
 */
function matchLotName(name: string, target: string): string | null {
  const parts = splitSegments(name);

  for (let take = 1; take <= parts.length; take += 1) {
    if (normalizeLot(parts.slice(0, take).join('')) !== target) continue;

    const rest = parts.slice(take);
    if (rest.length === 0) return '';
    if (DOSE_SEGMENT.test(rest[0])) return rest.join(' ');

    // Lot matched but the remainder is more lot, not a dose.
    return null;
  }

  return null;
}

/** "10mg" → "10 mg"; anything that isn't a plain dose is left as authored. */
function formatVariantLabel(raw: string): string {
  const dose = raw.trim().match(/^(\d+(?:\.\d+)?)\s*(mcg|mg|ml|iu|kg|g)$/i);
  return dose ? `${dose[1]} ${dose[2].toLowerCase()}` : raw.trim();
}

/**
 * Find every certificate PDF in Shopify Files published under the given lot
 * number. Matching ignores case and separators, so "ngp-2406-0117",
 * "NGP2406 0117" and "ngp24060117" all resolve to the same lot.
 *
 * A lot that covers several doses returns one record per dose, ordered by
 * dose. Returns an empty array when nothing is published for the lot.
 */
export async function findCoasByLot(lot: string): Promise<CoaRecord[]> {
  const target = normalizeLot(lot);
  if (!target) return [];

  // Shopify tokenizes filename search on separators, so searching the lot's
  // alphanumeric tokens also surfaces "12345-10mg" when the query is "12345".
  // The candidates it returns are then matched precisely below. Restrict to
  // generic files (PDFs) so images/videos are never returned, and confirm the
  // PDF type on each candidate.
  const searchTerms = lot.trim().replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  const query = `media_type:GENERIC_FILE ${searchTerms}`;

  const data = await shopifyAdminRequest<FilesQueryResult>(COA_FILES_QUERY, {
    query,
  });

  const seen = new Set<string>();
  const records: CoaRecord[] = [];

  for (const node of data.files.nodes) {
    if (node.__typename !== 'GenericFile' || !node.url) continue;

    // Only PDF certificates — ignore any other file type with a matching name.
    const isPdf =
      node.mimeType === 'application/pdf' || /\.pdf(?:$|\?)/i.test(node.url);
    if (!isPdf) continue;

    const baseName = fileBaseName(node.url);
    const suffix = matchLotName(baseName, target) ?? (node.alt ? matchLotName(node.alt, target) : null);
    if (suffix === null) continue;

    if (seen.has(node.url)) continue;
    seen.add(node.url);

    records.push({
      lotNumber: lot.trim(),
      pdfUrl: node.url,
      fileName: baseName || lot.trim(),
      variantLabel: formatVariantLabel(suffix),
    });
  }

  // Dose order: 10 mg before 20 mg before 100 mg. A certificate with no
  // suffix sorts first, since it covers the lot as a whole.
  return records.sort((first, second) => {
    if (!first.variantLabel) return -1;
    if (!second.variantLabel) return 1;
    return first.variantLabel.localeCompare(second.variantLabel, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}
