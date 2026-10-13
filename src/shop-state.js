export function safeDelivery(value) { return value === 'delivery' ? 'delivery' : 'pickup'; }
export function checkoutTotals(price, selection) {
  if(!Number.isFinite(price) || price < 0 || price > 1000000000) throw new RangeError('Harga tidak valid');
  const subtotal = Math.round(price), delivery = safeDelivery(selection) === 'delivery' ? 150000 : 0;
  return {subtotal, delivery, total:subtotal + delivery};
}
export function normalizeSaved(value, allowed) {
  return Array.isArray(value) ? [...new Set(value.filter(id=>typeof id==='string' && allowed.includes(id)))].slice(0,100) : [];
}
