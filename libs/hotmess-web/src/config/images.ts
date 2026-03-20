/**
 * Image configuration for sport and city cards.
 * Sport images are high-quality action photos from Unsplash.
 * City images are skyline photos from Unsplash.
 */

export const sportImages: Record<string, string> = {
  kickball:
    'https://images.unsplash.com/photo-1618438763526-8349557505a4?q=80&w=2274&auto=format&fit=crop',
  dodgeball:
    'https://images.unsplash.com/photo-1593786930307-3f51636b75c6?q=80&w=2670&auto=format&fit=crop',
  bowling:
    'https://images.unsplash.com/photo-1545056453-f0359c3df6db?q=80&w=2670&auto=format&fit=crop', // Man playing bowling
  'indoor-volleyball':
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop',
  'sand-volleyball':
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop', // Men playing beach volleyball
  'grass-volleyball':
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop', // People playing volleyball
  cornhole:
    'https://images.unsplash.com/photo-1636483022717-3eeaa9ff1a4f?w=700&auto=format&fit=crop', // Men playing cornhole
  pickleball:
    'https://images.unsplash.com/photo-1659318006095-4d44845f3a1b?w=700&auto=format&fit=crop', // Man plays pickleball
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
  'flag-football':
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=700&auto=format&fit=crop', // Football game during daytime
  tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
  'beer-pong':
    'https://images.unsplash.com/photo-1616428317393-acd93938b4fa?q=80&w=1287&auto=format&fit=crop',
};

export const cityImages: Record<string, string> = {
  nashville:
    'https://images.unsplash.com/photo-1715014258786-998a463ad77c?w=700&auto=format&fit=crop',
  'st.-pete':
    'https://images.unsplash.com/photo-1614541626842-841a45abb069?w=700&auto=format&fit=crop',
  'st.-louis':
    'https://images.unsplash.com/photo-1675906798386-a9ed241c7ed2?w=700&auto=format&fit=crop',
  okc: 'https://images.unsplash.com/photo-1519876217051-4449feb0b589?w=700&auto=format&fit=crop',
  birmingham:
    'https://images.unsplash.com/photo-1440582096070-fa5961d9d682?w=700&auto=format&fit=crop',
  sarasota:
    'https://images.unsplash.com/photo-1745423276512-8dd4d9b3140f?w=700&auto=format&fit=crop',
  cincinnati:
    'https://images.unsplash.com/photo-1584247740248-d728497a6f8c?w=700&auto=format&fit=crop',
  albuquerque:
    'https://images.unsplash.com/photo-1520050984229-709501d9c1ff?w=700&auto=format&fit=crop',
  charleston:
    'https://images.unsplash.com/photo-1623608103487-3953899aff0b?w=700&auto=format&fit=crop',
  'colorado-springs':
    'https://images.unsplash.com/photo-1547077053-560662bfd989?w=700&auto=format&fit=crop',
  dayton: 'https://images.unsplash.com/photo-1601236800570-27204bcbebf2?w=700&auto=format&fit=crop',
  knoxville:
    'https://images.unsplash.com/photo-1627918563419-121d60046176?w=700&auto=format&fit=crop',
  lexington:
    'https://images.unsplash.com/photo-1607829578885-88a1039657dc?w=700&auto=format&fit=crop',
  'little-rock':
    'https://images.unsplash.com/photo-1605212297995-dd77a9f4d509?w=700&auto=format&fit=crop',
  louisville:
    'https://images.unsplash.com/photo-1615825742158-5aac7849e4a4?w=700&auto=format&fit=crop',
  miami: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=700&auto=format&fit=crop',
  milwaukee:
    'https://images.unsplash.com/photo-1572854385804-33937a570b24?w=700&auto=format&fit=crop',
  tulsa: 'https://images.unsplash.com/photo-1504847859802-50699996783c?w=700&auto=format&fit=crop',
};

/** HotMess city-specific logo/banner images from sportngin CDN */
export const cityLogos: Record<string, string> = {
  nashville:
    'https://cdn1.sportngin.com/attachments/photo/f8c4-202628004/Hotmess_Nashville_large.png',
  cincinnati:
    'https://cdn1.sportngin.com/attachments/photo/d094-202627983/Hotmess_Cincinnati_large.png',
  albuquerque: 'https://cdn3.sportngin.com/attachments/photo/7884-215968343/Albuquerque_large.jpg',
};

/** Tournament banner images from sportngin CDN */
export const tournamentImages: Record<string, string> = {
  'hm-winter-classic-2026':
    'https://cdn3.sportngin.com/attachments/photo/7584-215103145/HotMess_Classic_Website_Banner_-_St_Pete_Volleyball_2026__1_.jpg',
  'hm-classic-kickball-2025':
    'https://cdn1.sportngin.com/attachments/photo/e1b5-214932819/HotMess_Classic_Website_Banner_-_Nashville_Kickball_2025.jpg',
};

export function getSportImage(sportSlug: string): string {
  return sportImages[sportSlug] || sportImages['kickball'];
}

export function getCityImage(citySlug: string): string {
  return cityImages[citySlug] || cityImages['nashville'];
}

export function getCityLogo(citySlug: string): string | undefined {
  return cityLogos[citySlug];
}
