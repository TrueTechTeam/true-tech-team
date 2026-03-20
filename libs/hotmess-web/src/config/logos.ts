/**
 * City logo configuration.
 * To use real logo files, replace these paths with actual SVG/PNG asset paths.
 */

export const cityLogos: Record<string, string> = {
  nashville: '/assets/logos/cities/nashville.svg',
  'st-pete': '/assets/logos/cities/st-pete.svg',
  'st-louis': '/assets/logos/cities/st-louis.svg',
  okc: '/assets/logos/cities/okc.svg',
  birmingham: '/assets/logos/cities/birmingham.svg',
  sarasota: '/assets/logos/cities/sarasota.svg',
  cincinnati: '/assets/logos/cities/cincinnati.svg',
};

export function getCityLogo(slug: string): string | null {
  return cityLogos[slug] || null;
}
