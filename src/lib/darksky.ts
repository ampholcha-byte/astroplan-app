export interface DarkSkySpot {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  note: string;
}

/**
 * Curated dark-sky shooting spots (Bortle 1-3 class sites).
 * Coordinates point at the general area — users should scout exact viewpoints.
 */
export const DARK_SKY_SPOTS: DarkSkySpot[] = [
  // Thailand — northern highlands
  { id: 'doi-inthanon', name: 'Doi Inthanon', region: 'Chiang Mai, Thailand', lat: 18.58, lng: 98.48, note: 'จุดสูงสุดของไทย ท้องฟ้ามืดมาก เหมาะถ่าย MW หน้าฝน' },
  { id: 'doi-chiangdao', name: 'Doi Chiang Dao', region: 'Chiang Mai, Thailand', lat: 19.40, lng: 98.87, note: 'หินปูนสวยเป็น foreground ท้องฟ้า Bortle 2' },
  { id: 'mo-hon-khao', name: 'Mo Hon Khao (มอหินขาว)', region: 'Chiang Mai, Thailand', lat: 19.07, lng: 98.35, note: 'พื้นที่มืดสุดแถบเชียงใหม่ Bortle 2' },
  { id: 'doi-pha-hom-pok', name: 'Doi Pha Hom Pok', region: 'Chiang Mai, Thailand', lat: 18.79, lng: 98.98, note: 'ยอดดอยฟ้าเชียงดาว มุมกว้างเห็นทางช้างเผือกเต็มตัว' },
  { id: 'chiang-rai-rural', name: 'Chiang Rai backcountry', region: 'Chiang Rai, Thailand', lat: 19.91, lng: 99.83, note: 'ชนบทเชียงราย ท้องฟ้ามืดคุ้มค่าเดินทาง' },
  // Thailand — mid / south
  { id: 'khao-yai', name: 'Khao Yai', region: 'Nakhon Ratchasima, Thailand', lat: 14.44, lng: 101.37, note: 'ใกล้กรุงเทพฯ ที่สุดในลิสต์ Bortle 3-4' },
  { id: 'koh-chang', name: 'Koh Chang', region: 'Trat, Thailand', lat: 12.62, lng: 102.12, note: 'เกาะทางตะวันออก ทะเลเป็น foreground' },
  { id: 'khao-sok', name: 'Khao Sok', region: 'Surat Thani, Thailand', lat: 8.92, lng: 98.53, note: 'ป่าดิบเขาสู่ทางใต้ ช่วงหน้าแล้งฟ้าโปร่ง' },
  // Global icons
  { id: 'atacama', name: 'Atacama Desert', region: 'Chile', lat: -22.9, lng: -67.8, note: 'หนึ่งในท้องฟ้ามืดสุดในโลก Bortle 1' },
  { id: 'death-valley', name: 'Death Valley', region: 'California, USA', lat: 36.5, lng: -118.6, note: 'Dark sky park ของสหรัฐ' },
  { id: 'yosemite', name: 'Yosemite', region: 'California, USA', lat: 37.7, lng: -119.5, note: 'หุบเขากับทางช้างเผือกเหนือหัว' },
  { id: 'la-palma', name: 'La Palma', region: 'Canary Islands, Spain', lat: 28.76, lng: -17.89, note: 'เกาะหอดูดาว ท้องฟ้าไร้มลภิษแสงเกือบสนิท' },
  { id: 'uluru', name: 'Uluru', region: 'Northern Territory, Australia', lat: -25.3, lng: 131.0, note: 'MW core สูงเด่นมากในซีกใต้' },
  { id: 'himalaya', name: 'Himalayas (Namche)', region: 'Nepal', lat: 28.0, lng: 86.9, note: 'ที่ราบสูงอากาศแห้ง ดาวชัดเป็นพิเศษ' },
  { id: 'iceland-interior', name: 'Iceland Highlands', region: 'Iceland', lat: 64.2, lng: -15.2, note: 'ฤดูหนาวดู aurora ฤดูร้อนถ่ายดาวตอนกลางคืนสั้น' },
];

/** Great-circle distance in km (haversine). */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

/** Spots sorted by distance from the user's coordinates. */
export function nearestSpots(lat: number, lng: number, limit = 8): DarkSkySpot[] {
  return [...DARK_SKY_SPOTS]
    .sort((a, b) => distanceKm(lat, lng, a.lat, a.lng) - distanceKm(lat, lng, b.lat, b.lng))
    .slice(0, limit);
}

/** Bortle scale → hex color (mirrors calendar location bar). */
export function bortleColor(scale: number): string {
  const colors: Record<number, string> = {
    1: '#9ca3af', 2: '#93c5fd', 3: '#67e8f9', 4: '#86efac',
    5: '#fde047', 6: '#fdba74', 7: '#fb923c', 8: '#f87171', 9: '#ef4444',
  };
  return colors[scale] ?? '#64748b';
}
