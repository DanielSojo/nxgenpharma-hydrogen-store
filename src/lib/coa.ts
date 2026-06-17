// Certificate of Analysis (COA) lookup, backed by Shopify Files.
//
// Certificates are stored as PDF files in Shopify (admin → Content → Files),
// named by their product lot/batch number, e.g. "Nexg24060117.pdf". Customers
// look up a certificate from the public COA page by entering the lot number
// printed on their product label; we search Shopify Files for a matching name
// (or alt text) and return its CDN URL.
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
    files(first: 25, query: $query) {
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

/**
 * Find a certificate PDF in Shopify Files whose filename (or alt text) matches
 * the given lot number. Matching ignores case and separators (e.g. hyphens),
 * so "ngp-2406-0117", "NGP2406 0117", etc. all resolve to the same file.
 * Returns `null` when no certificate is published.
 */
export async function findCoaByLot(lot: string): Promise<CoaRecord | null> {
  const target = normalizeLot(lot);
  if (!target) return null;

  // Shopify tokenizes filename search on separators, so search using the lot's
  // alphanumeric tokens, then match precisely against the returned candidates.
  // Restrict the search to generic files (PDFs) so images/videos are never
  // returned, then confirm the PDF type on each candidate below.
  const searchTerms = lot.trim().replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  const query = `media_type:GENERIC_FILE ${searchTerms}`;

  const data = await shopifyAdminRequest<FilesQueryResult>(COA_FILES_QUERY, {
    query,
  });

  const match = data.files.nodes.find((node) => {
    if (node.__typename !== 'GenericFile' || !node.url) return false;
    // Only PDF certificates — ignore any other file type with a matching name.
    const isPdf =
      node.mimeType === 'application/pdf' || /\.pdf(?:$|\?)/i.test(node.url);
    if (!isPdf) return false;
    const byName = normalizeLot(fileBaseName(node.url)) === target;
    const byAlt = node.alt ? normalizeLot(node.alt) === target : false;
    return byName || byAlt;
  });

  if (!match?.url) return null;

  return {
    lotNumber: lot.trim(),
    pdfUrl: match.url,
    fileName: fileBaseName(match.url) || lot.trim(),
  };
}
