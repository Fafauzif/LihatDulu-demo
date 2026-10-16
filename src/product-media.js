// Browsing covers are edited display assets. Gallery and condition evidence always
// retain their explicit source; no filename-wide substitution is permitted.
const COVER_IDS = new Set([
  "sora",
  "arca",
  "batu",
  "rimba",
  "awan",
  "tala",
  "loka",
  "nusa",
  "senja",
  "ruji",
]);
export const mediaSrc = (src) => src;
export function productCover(item) {
  const first = item?.photos?.[0] || {
    src: item?.image || "",
    alt: item?.title || "Furnitur",
  };
  return COVER_IDS.has(item?.id)
    ? {
        ...first,
        src: `/images/cutouts/${item.id}.webp`,
        width: 800,
        height: 800,
        kind: "cover",
        sourceType: "edited-cover",
        caption: "Gambar sampul katalog contoh",
      }
    : { ...first };
}
export const WEAR_NOTES = Object.freeze([
  {
    id: "scratch",
    title: "Goresan pintu kiri",
    where: "Permukaan depan",
    size: "Panjang 11 cm",
    note: "Goresan tipis pada pintu kiri. Serat dan finishing di sekitarnya masih terlihat.",
    image: "/images/wear-scratch.webp",
    width: 1200,
    height: 1000,
    modelAnchor: "scratch",
  },
  {
    id: "chip",
    title: "Sudut terkelupas",
    where: "Sudut kanan atas",
    size: "8 × 5 mm",
    note: "Lapisan pada sudut kanan atas terkelupas. Periksa tepi dan ukurannya pada gambar detail.",
    image: "/images/wear-chip.webp",
    width: 1200,
    height: 1000,
    modelAnchor: "chip",
  },
  {
    id: "mark",
    title: "Bekas pada permukaan",
    where: "Bagian atas",
    size: "Diameter 5,5 cm",
    note: "Bekas berbentuk lingkaran tampak samar pada permukaan atas.",
    image: "/images/wear-mark.webp",
    width: 1200,
    height: 1000,
    modelAnchor: "mark",
  },
]);
export function conditionNotes(item) {
  return item?.id === "sora" ? WEAR_NOTES : [];
}
export function galleryMedia(item) {
  return (item?.photos || []).map((entry, index) => {
    const condition = conditionNotes(item).find(
      (note) => note.image === entry.src,
    );
    const kind = condition ? "condition" : item.model ? "render" : "photo";
    return {
      ...entry,
      id: entry.id || `${item.id}-image-${index + 1}`,
      kind,
      sourceType: condition
        ? "prepared-condition"
        : item.model
          ? "retained-model"
          : "supplied-example-photo",
      caption: condition
        ? `${condition.title} · ${condition.size}`
        : item.model
          ? `Render ${entry.caption.toLocaleLowerCase("id-ID")}`
          : entry.caption,
      width:
        entry.width || (condition ? condition.width : item.model ? 800 : 1000),
      height:
        entry.height ||
        (condition ? condition.height : item.model ? 800 : 1000),
      ...(condition
        ? { conditionId: condition.id, modelAnchor: condition.modelAnchor }
        : {}),
    };
  });
}
export function mediaCounts(item, sellerEvidence = []) {
  return {
    gallery: galleryMedia(item).length,
    condition: conditionNotes(item).length,
    sellerGroups:
      item?.id === "sora"
        ? new Set(
            sellerEvidence.filter((id) =>
              [
                "front",
                "right",
                "rear",
                "interior",
                "drawer",
                "scratch",
              ].includes(id),
            ),
          ).size
        : 0,
    model: Boolean(item?.model),
  };
}
