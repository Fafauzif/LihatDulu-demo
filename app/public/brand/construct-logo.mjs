// Reproducible source for the selected LihatDulu mark geometry.
// The SVG files remain the delivery source so designers can edit them directly.
const open = 0.18;
const inner = 0.64;
const shelf = 0.14;
export const apertureMark = ({size = 96, reverse = false} = {}) => {
  const bg = reverse ? '#f5f4ee' : '#222923';
  const field = reverse ? '#3d5a40' : '#f5f4ee';
  const shelfColour = reverse ? '#f5f4ee' : '#3d5a40';
  const r = Math.round(size * 0.18);
  const innerR = Math.round(size * 0.08);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/><rect x="${size * open}" y="${size * open}" width="${size * inner}" height="${size * inner}" rx="${innerR}" fill="${field}"/><rect x="${size * .28}" y="${size * .28}" width="${size * .44}" height="${size * .27}" rx="${size * .04}" fill="${bg}"/><rect x="${size * .28}" y="${size * .61}" width="${size * .44}" height="${size * shelf}" rx="${size * .02}" fill="${shelfColour}"/></svg>`;
};
