import fs from "fs";
import path from "path";

const ROOT = path.resolve("public/scss");

function countBraces(line) {
  let open = 0;
  let close = 0;
  for (const ch of line) {
    if (ch === "{") open++;
    if (ch === "}") close++;
  }
  return { open, close };
}

function normalizeSelector(selector) {
  const first = selector.split(",")[0].trim();
  if (first.startsWith("#")) return first;
  return first.replace(/^\.+/, "");
}

function stripTopLevelBlocks(inputLines, shouldRemove) {
  const out = [];
  let i = 0;
  while (i < inputLines.length) {
    const line = inputLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed === "") {
      out.push(line);
      i++;
      continue;
    }

    if (!trimmed.includes("{")) {
      // Multi-line selector: accumulate until opening brace
      let selectorLines = [line];
      let j = i + 1;
      while (j < inputLines.length && !inputLines[j].includes("{")) {
        selectorLines.push(inputLines[j]);
        j++;
      }
      if (j < inputLines.length) {
        const selector = selectorLines.join(" ").trim();
        const selectorPart = selector.split("{")[0].trim();
        if (shouldRemove(selectorPart, selector)) {
          let depth = 0;
          let started = false;
          let k = j;
          while (k < inputLines.length) {
            const l = inputLines[k];
            const { open, close } = countBraces(l);
            depth += open - close;
            if (open > 0) started = true;
            k++;
            if (started && depth <= 0) break;
          }
          i = k;
          continue;
        }
      }
      out.push(line);
      i++;
      continue;
    }

    const selectorPart = trimmed.split("{")[0].trim();
    if (shouldRemove(selectorPart, trimmed)) {
      let depth = 0;
      let started = false;
      while (i < inputLines.length) {
        const l = inputLines[i];
        const { open, close } = countBraces(l);
        depth += open - close;
        if (open > 0) started = true;
        i++;
        if (started && depth <= 0) break;
      }
      continue;
    }

    out.push(line);
    i++;
  }
  return out;
}

function matchesAny(selector, patterns) {
  const normalized = normalizeSelector(selector);
  const raw = selector.trim();
  return patterns.some((p) => {
    if (typeof p === "string") {
      const bare = p.replace(/^\.+/, "").replace(/^#/, "");
      const idBare = p.startsWith("#") ? p : null;
      return (
        normalized === bare ||
        (idBare && (normalized === idBare || raw.startsWith(idBare))) ||
        normalized.startsWith(`${bare} `) ||
        normalized.startsWith(`${bare}.`) ||
        raw === p ||
        raw.startsWith(`${p} `) ||
        raw.startsWith(`${p},`)
      );
    }
    return p.test(normalized) || p.test(raw);
  });
}
const sectionRemove = [
  "flat-title-v2",
  "flat-bg-collection",
  "tf-sw-brand",
  "brand-item-v2",
  /^brand-item$/,
  "hover-img-brand",
  "row-brand",
  "gallery-item",
  /^masonry-layout/,
  "grid-3-layout-md",
  "tf-gallery-image",
  /^tf-img-with-text/,
  "img-text-3",
  "tf-img-video-text",
  /^tf-content-wrap/,
  /^count-down$/,
  "flat-wrap-countdown",
  "tf-image-wrap",
  "wrap-sw-over",
  "widget-card-store",
  "flat-testimonial-v2",
  /^wrapper-thumbs-testimonial/,
  "flat-thumbs-testimonial-v2",
  "flat-iconbox-v2",
  "flat-iconbox-v3",
  "wrap-spacing-iconbox",
  "tf-icon-box-v2",
  "tf-icon-box-v3",
  "flat-wrap-iconbox-v2",
  "flat-wrap-iconbox",
  "flat-location",
  "scroll-process",
  "scroll-snap",
  /^fullwidth$/,
  /^icv__/,
  "flat-wrap-giftcard",
  "tf-brands-filter",
  "tf-brands-source-linklist",
  /^tf-compare-table/,
  /^tf-compare-row/,
  /^tf-compare-col/,
  /^tf-compare-item/,
  /^tf-compare-field/,
  /^tf-compare-value/,
  /^tf-compare-stock/,
  "tf-page-delivery",
  "tf-terms-conditions",
  "images-group-item",
  "flat-alert",
  "tf-flash-sale",
  "section-full-1",
  "section-cls-personalized-pod",
  "widget-video",
  "feature-electric-bike",
  /^sib-form/,
  "#sib-container",
  "#sib-form",
  "#error-message",
  "#success-message",
  ".sib-optin",
  ".sib-form-block",
  ".sib-form-message-panel",
  ".flat-subscrite-wrap",
  "loadmore-item2",
  "loadmore-item3",
  "btn-sidebar-account",
  "btn-sidebar-style2",
  "tf-main-area-page",
  "tf-filter-item",
  "tf-ourstore-img",
  "tf-store-item",
  "tf-ani-tada",
];

const productRemove = [
  "tf-product-info-liveview",
  "tf-pickup-availability",
  "tf-pickup-availability-list",
  "tf-product-delivery",
  "tf-product-order",
  "tf-product-info-trust-seal",
  "tf-product-fbt-wrap",
  "tf-product-inventory",
  "tf-progress-bar",
  "tf-product-notify-stock",
  "tf-product-des-demo",
  "card-product",
  "list-color-product",
  "bg-multiple-color",
  "green-black",
  "yellow-black",
  "blue-black",
  "blue-white",
  "red-black",
  "white-striped",
  "size-list",
  "list-product-btn",
  "tf-page-privacy-policy",
  "stagger-wrap",
];

const collectionRemove = [
  "collection-item-v3",
  "collection-item-v5",
  "collection-item-v6",
  "collection-item-circle",
  "collection-item-centered",
];

const tabsRemove = ["widget-tab-2", "widget-tab-3", "widget-tab-4", "widget-tab-5"];

const popupRemove = ["canvas-compare", "tf-compare-list"];

const resetRemove = [
  "flat-spacing-3",
  "flat-spacing-4",
  "flat-spacing-6",
  "flat-spacing-9",
  "flat-spacing-12",
  "flat-spacing-13",
  "flat-spacing-15",
  "flat-spacing-16",
  "flat-spacing-17",
  "flat-spacing-18",
  "flat-spacing-20",
  "flat-spacing-23",
  "flat-spacing-24",
  "flat-spacing-25",
  "flat-spacing-26",
  "flat-spacing-27",
  "flat-spacing-28",
  "flat-spacing-29",
  "flat-spacing-30",
  "flat-spacing-31",
  "flat-spacing-32",
];

const customRemove = ["home-pckaleball-page"];

const jobs = [
  ["_sections.scss", sectionRemove],
  ["component/_product.scss", productRemove],
  ["component/_collection.scss", collectionRemove],
  ["component/_tabs.scss", tabsRemove],
  ["component/_pop-up.scss", popupRemove],
  ["_reset.scss", resetRemove],
  ["custom.scss", customRemove],
];

for (const [rel, patterns] of jobs) {
  const filePath = path.join(ROOT, rel);
  const before = fs.readFileSync(filePath, "utf8");
  const beforeLines = before.split("\n").length;
  let lines = before.split("\n");
  lines = stripTopLevelBlocks(lines, (selector) => matchesAny(selector, patterns));
  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(filePath, text);
  const afterLines = text.split("\n").length;
  console.log(`${rel}: ${beforeLines} -> ${afterLines} lines (-${beforeLines - afterLines})`);
}
