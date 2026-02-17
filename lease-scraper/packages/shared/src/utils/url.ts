const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  'source',
  'mc_cid',
  'mc_eid',
  '_ga',
  '_gl',
]);

/**
 * Canonicalize a URL:
 * - Force https
 * - Strip tracking query params
 * - Trim trailing slashes (except root path)
 * - Lowercase hostname
 */
export function canonicalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);

    // Force https
    url.protocol = 'https:';

    // Lowercase hostname
    url.hostname = url.hostname.toLowerCase();

    // Strip tracking params
    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param);
    }

    // Sort remaining params for consistency
    url.searchParams.sort();

    // Trim trailing slash from pathname (except root)
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return raw;
  }
}

/**
 * Extract a file extension from a URL, ignoring query params.
 */
export function extensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const lastDot = pathname.lastIndexOf('.');
    if (lastDot === -1) return '';
    return pathname.slice(lastDot + 1).toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Determine file extension from MIME type.
 */
export function extensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
  };
  return map[mime.toLowerCase()] || 'jpg';
}
