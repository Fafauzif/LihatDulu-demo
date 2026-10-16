// Pure discovery helpers. UI code owns presentation, navigation and persistence.
const ARRAY_KEYS = ["categories", "conditions", "materials", "locations"];
const LIMIT_KEYS = ["min", "max", "width", "depth", "height"];
const SORTS = ["relevance", "newest", "price-asc", "price-desc"];
const MISSING = "Belum dicantumkan";
const text = (value) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim()
    : "";
const normalize = (value) =>
  text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID");
const active = (listing) =>
  listing && typeof listing.id === "string" && listing.available === true;
const list = (value) => (Array.isArray(value) ? value : []);

function selections(values, key) {
  const seen = new Set();
  return list(values)
    .map(text)
    .filter((value) => {
      const normalized = normalize(value);
      if (
        !value ||
        seen.has(normalized) ||
        (key === "categories" && ["semua", "all"].includes(normalized))
      )
        return false;
      seen.add(normalized);
      return true;
    });
}

function limit(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (
    typeof value === "string" &&
    !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())
  )
    return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function canonicalFilter(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const filter = {
    q: text(source.q),
    categories: [],
    conditions: [],
    materials: [],
    locations: [],
    min: null,
    max: null,
    width: null,
    depth: null,
    height: null,
    model: source.model === true,
    sort: SORTS.includes(source.sort) ? source.sort : "relevance",
  };
  for (const key of ARRAY_KEYS) filter[key] = selections(source[key], key);
  for (const key of LIMIT_KEYS) filter[key] = limit(source[key]);
  return filter;
}

export function parseFilters(params) {
  if (!(params instanceof URLSearchParams)) return canonicalFilter();
  const input = {
    q: params.get("q"),
    model: ["1", "true"].includes(params.get("model")),
    sort: params.get("sort"),
  };
  for (const key of ARRAY_KEYS)
    input[key] = params.getAll(key).flatMap((value) => value.split(","));
  // Modern categories take precedence; legacy links remain useful.
  if (!selections(input.categories, "categories").length)
    input.categories = params
      .getAll("category")
      .flatMap((value) => value.split(","));
  for (const key of LIMIT_KEYS) input[key] = params.get(key);
  const filter = canonicalFilter(input);
  // Shared URLs cannot present an impossible range as a valid empty search.
  if (filter.min !== null && !Number.isInteger(filter.min)) filter.min = null;
  if (filter.max !== null && !Number.isInteger(filter.max)) filter.max = null;
  if (filter.min !== null && filter.max !== null && filter.min > filter.max)
    filter.min = filter.max = null;
  return filter;
}

export function serializeFilters(input) {
  const filter = canonicalFilter(input);
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  for (const key of ARRAY_KEYS)
    if (filter[key].length) params.set(key, filter[key].join(","));
  for (const key of LIMIT_KEYS)
    if (filter[key] !== null) params.set(key, String(filter[key]));
  if (filter.model) params.set("model", "1");
  if (filter.sort !== "relevance") params.set("sort", filter.sort);
  return params;
}

function conditionGroup(listing) {
  if (text(listing.conditionGroup)) return text(listing.conditionGroup);
  const condition = text(listing.condition),
    value = normalize(condition);
  if (!condition) return "";
  if (value.includes("terawat")) return "Terawat";
  if (value.includes("ringan")) return "Pemakaian ringan";
  if (value.includes("bekas") && condition.includes("·"))
    return "Detail pemakaian";
  return condition;
}

function materialGroup(listing) {
  if (text(listing.materialGroup)) return text(listing.materialGroup);
  const material = text(listing.material),
    value = normalize(material);
  if (!material) return "";
  if (value.includes("panel")) return "Panel kayu";
  if (value.includes("rotan")) return "Rotan";
  if (
    value.includes("kayu") ||
    value.includes("walnut") ||
    value.includes("jati")
  )
    return "Kayu";
  if (value.includes("kain")) return "Kain";
  if (
    value.includes("logam") ||
    value.includes("baja") ||
    value.includes("besi")
  )
    return "Logam";
  return material;
}

function matches(values, ...candidates) {
  if (!values.length) return true;
  const available = candidates.map(normalize);
  return values.some((value) => available.includes(normalize(value)));
}

export function filterCatalogue(listings, input) {
  const filter = canonicalFilter(input),
    terms = normalize(filter.q).split(/\s+/).filter(Boolean);
  const results = list(listings).filter((listing) => {
    if (!active(listing)) return false;
    if (!matches(filter.categories, listing.category)) return false;
    if (!matches(filter.conditions, conditionGroup(listing), listing.condition))
      return false;
    if (!matches(filter.materials, materialGroup(listing), listing.material))
      return false;
    if (!matches(filter.locations, listing.location)) return false;
    if (filter.model && listing.model !== true) return false;
    const price =
      typeof listing.price === "number" && Number.isFinite(listing.price)
        ? listing.price
        : null;
    if (filter.min !== null && (price === null || price < filter.min))
      return false;
    if (filter.max !== null && (price === null || price > filter.max))
      return false;
    for (const key of ["width", "depth", "height"]) {
      if (filter[key] === null) continue;
      const size = listing.dimensions?.[key];
      if (
        typeof size !== "number" ||
        !Number.isFinite(size) ||
        size < 0 ||
        size > filter[key]
      )
        return false;
    }
    const searchable = normalize(
      [
        listing.title,
        listing.category,
        listing.material,
        listing.location,
        listing.description,
        listing.condition,
        listing.seller?.name,
        ...list(listing.features),
      ]
        .filter((value) => typeof value === "string")
        .join(" "),
    );
    return terms.every((term) => searchable.includes(term));
  });
  const price = (listing, fallback) =>
    typeof listing.price === "number" && Number.isFinite(listing.price)
      ? listing.price
      : fallback;
  const byId = (a, b) => a.id.localeCompare(b.id, "id-ID");
  if (filter.sort === "price-asc")
    results.sort(
      (a, b) => price(a, Infinity) - price(b, Infinity) || byId(a, b),
    );
  if (filter.sort === "price-desc")
    results.sort(
      (a, b) => price(b, -Infinity) - price(a, -Infinity) || byId(a, b),
    );
  if (filter.sort === "newest")
    results.sort(
      (a, b) =>
        (Date.parse(b.created) || 0) - (Date.parse(a.created) || 0) ||
        byId(a, b),
    );
  return results;
}

// A refinement reset is deliberately narrower than starting a new search.
export function resetRefinements(input) {
  const current = canonicalFilter(input);
  return canonicalFilter({ q: current.q, sort: current.sort });
}

// Badge policy: category, price, dimensions, city, material, condition, 3D.
// A group's multiple values count once. Search and ordering do not count.
export function activeGroupCount(input) {
  const f = canonicalFilter(input);
  return (
    Number(Boolean(f.categories.length)) +
    Number(f.min !== null || f.max !== null) +
    Number(["width", "depth", "height"].some((key) => f[key] !== null)) +
    Number(Boolean(f.locations.length)) +
    Number(Boolean(f.materials.length)) +
    Number(Boolean(f.conditions.length)) +
    Number(f.model)
  );
}

export function filtersEqual(a, b) {
  const normalizeArrays = (value) => {
    const f = canonicalFilter(value);
    for (const key of ARRAY_KEYS)
      f[key].sort((x, y) => x.localeCompare(y, "id-ID"));
    return f;
  };
  return (
    serializeFilters(normalizeArrays(a)).toString() ===
    serializeFilters(normalizeArrays(b)).toString()
  );
}

// Whole IDR accepts plain digits or consistently grouped thousands. A decimal
// such as 2.20 is an error, never silently reinterpreted as another amount.
export function parseWholeRupiah(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return { value: null, error: "" };
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+|\d{1,3}(?:,\d{3})+)$/.test(raw))
    return {
      value: null,
      error: "Gunakan rupiah bulat, misalnya 1500000 atau 1.500.000.",
    };
  const amount = Number(raw.replace(/[.,]/g, ""));
  if (!Number.isSafeInteger(amount) || amount < 0)
    return { value: null, error: "Masukkan nominal rupiah bulat yang valid." };
  return { value: amount, error: "" };
}

export const PARENT_CATEGORIES = Object.freeze([
  Object.freeze({
    id: "seating",
    label: "Tempat duduk",
    categories: Object.freeze(["Kursi", "Sofa", "Lounge", "Bangku"]),
    coverId: "tala",
  }),
  Object.freeze({
    id: "tables",
    label: "Meja",
    categories: Object.freeze(["Meja"]),
    coverId: "batu",
  }),
  Object.freeze({
    id: "storage",
    label: "Penyimpanan",
    categories: Object.freeze(["Lemari", "Penyimpanan"]),
    coverId: "sora",
  }),
]);

export function collectionSelections(id) {
  const parent = PARENT_CATEGORIES.find((group) => group.id === id);
  if (parent) return canonicalFilter({ categories: parent.categories });
  if (id === "3d") return canonicalFilter({ model: true });
  if (id === "affordable") return canonicalFilter({ max: 1500000 });
  return canonicalFilter();
}

export function parentCollections(listings) {
  return [
    ...PARENT_CATEGORIES,
    { id: "3d", label: "3D tersedia", coverId: "arca" },
    { id: "affordable", label: "Hingga Rp1.500.000", coverId: "ruji" },
  ].map((collection) => {
    const filter = collectionSelections(collection.id),
      members = filterCatalogue(listings, filter),
      params = serializeFilters(filter).toString();
    return {
      ...collection,
      categories: [...filter.categories],
      count: members.length,
      ids: members.map((item) => item.id),
      href: `/beli${params ? "?" + params : ""}`,
    };
  });
}

export function furnitureGroup(listing) {
  return (
    PARENT_CATEGORIES.find((group) =>
      group.categories.includes(listing?.category),
    ) ?? null
  );
}

export function relatedListings(listings, item, maximum = 4) {
  if (!item) return [];
  const parent = furnitureGroup(item);
  return list(listings)
    .filter(
      (candidate) =>
        active(candidate) &&
        candidate.id !== item.id &&
        (candidate.category === item.category ||
          (parent && furnitureGroup(candidate)?.id === parent.id)),
    )
    .sort(
      (a, b) =>
        Number(b.category === item.category) -
          Number(a.category === item.category) ||
        Math.abs(a.price - item.price) - Math.abs(b.price - item.price) ||
        a.id.localeCompare(b.id, "id-ID"),
    )
    .slice(0, Math.max(0, Math.min(4, maximum)));
}

const PREPARED_IDS = Object.freeze({
  arca: Object.freeze(["arca", "tala", "senja"]),
  tala: Object.freeze(["tala", "arca", "senja"]),
});
export function parsePreparedReference(params) {
  const p = params instanceof URLSearchParams ? params : new URLSearchParams();
  const source = Object.hasOwn(PREPARED_IDS, p.get("source"))
    ? p.get("source")
    : "arca";
  const width = limit(p.get("width"));
  return {
    source,
    width: width !== null && width >= 1 && width <= 500 ? width : null,
  };
}

export function preparedReferencePath(input, { resetWidth = false } = {}) {
  const state = parsePreparedReference(
    new URLSearchParams({
      source: input?.source ?? "",
      ...(input?.width !== null && input?.width !== undefined
        ? { width: String(input.width) }
        : {}),
    }),
  );
  const p = new URLSearchParams({ source: state.source });
  if (!resetWidth && state.width !== null) p.set("width", String(state.width));
  return `/cari-dari-foto?${p}#camera-results`;
}

export function preparedCandidates(listings, input) {
  const state = parsePreparedReference(
    new URLSearchParams({
      source: input?.source ?? "",
      ...(input?.width !== null && input?.width !== undefined
        ? { width: String(input.width) }
        : {}),
    }),
  );
  return PREPARED_IDS[state.source]
    .map((id) => list(listings).find((item) => item.id === id && active(item)))
    .filter(
      (item) =>
        item && (state.width === null || item.dimensions?.width <= state.width),
    );
}

function facet(listings, valueFor) {
  const counts = new Map();
  for (const listing of listings) {
    const value = text(valueFor(listing)),
      key = normalize(value);
    if (!value) continue;
    const entry = counts.get(key) || { value, label: value, count: 0 };
    entry.count++;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "id-ID"),
  );
}

function range(values) {
  const finite = values.filter(
    (value) =>
      typeof value === "number" && Number.isFinite(value) && value >= 0,
  );
  return {
    min: finite.length ? Math.min(...finite) : null,
    max: finite.length ? Math.max(...finite) : null,
  };
}

export function getFacets(listings) {
  const available = list(listings).filter(active);
  return {
    categories: facet(available, (listing) => listing.category),
    conditions: facet(available, conditionGroup),
    materials: facet(available, materialGroup),
    locations: facet(available, (listing) => listing.location),
    total: available.length,
    modelCount: available.filter((listing) => listing.model === true).length,
    priceRange: range(available.map((listing) => listing.price)),
    dimensionRanges: Object.fromEntries(
      ["width", "depth", "height"].map((key) => [
        key,
        range(available.map((listing) => listing.dimensions?.[key])),
      ]),
    ),
  };
}

export function toggleCompare(ids, id, listings) {
  const eligible = new Set(
    list(listings)
      .filter(active)
      .map((listing) => listing.id),
  );
  const selected = [
    ...new Set(
      list(ids).filter(
        (value) => typeof value === "string" && eligible.has(value),
      ),
    ),
  ].slice(0, 3);
  if (selected.includes(id)) return selected.filter((value) => value !== id);
  if (eligible.has(id) && selected.length < 3) selected.push(id);
  return selected;
}

const dimensionNumber = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 10,
});
const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const known = (value) => text(value) || MISSING;
function dimension(listing, key) {
  const value = listing.dimensions?.[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? `${dimensionNumber.format(value)} cm`
    : MISSING;
}
function media(listing) {
  const count = list(listing.photos).filter((photo) => text(photo?.src)).length;
  if (listing.model === true)
    return `3D interaktif${count ? ` · ${count} foto` : ""}`;
  return count ? `Foto · ${count} foto` : MISSING;
}
function wear(listing) {
  if (text(listing.wear)) return text(listing.wear);
  const parts = text(listing.condition).split("·");
  return parts.length > 1 ? known(parts.slice(1).join("·")) : MISSING;
}
function fulfilment(listing) {
  const value = listing.fulfilment;
  return Array.isArray(value)
    ? known(value.map(text).filter(Boolean).join(" · "))
    : known(value);
}

export function comparisonRows(items) {
  const seen = new Set();
  const available = list(items)
    .filter((item) => {
      if (!active(item) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 3);
  if (!available.length) return [];
  const rows = [
    ["category", "Kategori", (item) => known(item.category)],
    [
      "price",
      "Harga",
      (item) =>
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0
          ? currency.format(item.price).replace(/\u00a0/g, " ")
          : MISSING,
    ],
    ["width", "Lebar", (item) => dimension(item, "width")],
    ["depth", "Kedalaman", (item) => dimension(item, "depth")],
    ["height", "Tinggi", (item) => dimension(item, "height")],
    ["material", "Material", (item) => known(item.material)],
    ["condition", "Kondisi", (item) => known(item.condition)],
    ["wear", "Detail pemakaian", wear],
    ["media", "Media & bukti", media],
    ["location", "Lokasi", (item) => known(item.location)],
    ["fulfilment", "Pengambilan / pengiriman", fulfilment],
    ["seller", "Penjual", (item) => known(item.seller?.name)],
  ];
  return rows.map(([key, label, valueFor]) => {
    const values = available.map(valueFor);
    return { key, label, values, different: new Set(values).size > 1 };
  });
}
