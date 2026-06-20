export function locationOptions(shops) {
  const provinces = [...new Set(shops.map((shop) => shop.province).filter(Boolean))].sort();
  const cities = [...new Set(shops.map((shop) => shop.city).filter(Boolean))].sort();
  return { provinces, cities };
}
