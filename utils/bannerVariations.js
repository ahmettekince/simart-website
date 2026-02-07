/**
 * variation_texts format: [{ title: "btn-text", content: "..." }, { title: "btn-position", content: "top-center" }, ...]
 * Parses variation_texts array into structured overlay config (btn, text1, text2, ...)
 */
export function parseVariationTexts(variationTexts = []) {
  const map = {};

  if (Array.isArray(variationTexts) && variationTexts.length > 0) {
    for (const item of variationTexts) {
      const o = item && typeof item === "object" ? item : {};
      const title = o.title ?? o.name ?? o.key;
      const content = o.content ?? o.value ?? o.text ?? "";
      if (!title) continue;
      const match = String(title).match(/^(\w+)[-_](.+)$/);
      if (match) {
        const [, prefix, key] = match;
        if (!map[prefix]) map[prefix] = {};
        map[prefix][key] = content;
      }
    }
  } else if (variationTexts && typeof variationTexts === "object" && !Array.isArray(variationTexts)) {
    for (const [title, content] of Object.entries(variationTexts)) {
      const match = String(title).match(/^(\w+)[-_](.+)$/);
      if (match && content != null) {
        const [, prefix, key] = match;
        if (!map[prefix]) map[prefix] = {};
        map[prefix][key] = content;
      }
    }
  }

  const btn = map.btn && (map.btn.text || map.btn.link) ? map.btn : null;
  const ROW_ALIGN_MAP = { left: "LEFT", center: "CENTER", right: "RIGHT" };
  const texts = [];
  let i = 1;
  while (map[`text${i}`]) {
    const t = map[`text${i}`];
    if ("text" in t || t.text) {
      const align = ROW_ALIGN_MAP[String(t.align || "").toLowerCase()] || (i === 1 ? "LEFT" : "CENTER");
      texts.push({ text: t.text ?? "", position: t.position, style: t.style, class: t.class, align, key: `text${i}` });
    }
    i++;
  }

  return { btn, texts };
}

/**
 * 9-part grid positions (3x3) - banner 9 eş parçaya bölünmüş gibi
 * sol/sağ pozisyonlarda kenara çok yapışmasın diye left/right offset artırıldı (28%)
 */
const POSITION_STYLES = {
  "top-left": { top: "16.67%", left: "25%", transform: "translate(-50%, -50%)" },
  "top-center": { top: "16.67%", left: "50%", transform: "translate(-50%, -50%)" },
  "top-right": { top: "16.67%", right: "25%", left: "auto", transform: "translate(50%, -50%)" },
  "mid-left": { top: "50%", left: "25%", transform: "translate(-50%, -50%)" },
  "mid-center": { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "mid-right": { top: "50%", right: "25%", left: "auto", transform: "translate(50%, -50%)" },
  "bot-left": { bottom: "16.67%", left: "25%", transform: "translate(-50%, 50%)" },
  "bot-center": { bottom: "16.67%", left: "50%", transform: "translate(-50%, 50%)" },
  "bot-right": { bottom: "16.67%", right: "25%", left: "auto", transform: "translate(50%, 50%)" },
};

const POSITION_ALIASES = {
  "middle-left": "mid-left", "center": "mid-center", "middle-center": "mid-center",
  "middle-right": "mid-right", "bottom": "bot-center", "bottom-left": "bot-left",
  "bottom-center": "bot-center", "bottom-right": "bot-right",
};

/** 3 dilim/column modu: text1 sol, text2 orta, buton sağ - sağa sola yaslanabilir */
export const ROW_TOP_LEFT = { top: "16.67%", left: "12%", transform: "translate(0, -50%)", textAlign: "left" };
export const ROW_TOP_CENTER = { top: "16.67%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" };
export const ROW_TOP_RIGHT = { top: "16.67%", right: "12%", left: "auto", transform: "translate(0, -50%)", textAlign: "right" };
export const ROW_MID_LEFT = { top: "50%", left: "12%", transform: "translate(0, -50%)", textAlign: "left" };
export const ROW_MID_CENTER = { top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" };
export const ROW_MID_RIGHT = { top: "50%", right: "12%", left: "auto", transform: "translate(0, -50%)", textAlign: "right" };
export const ROW_BOT_LEFT = { bottom: "16.67%", left: "12%", transform: "translate(0, 50%)", textAlign: "left" };
export const ROW_BOT_CENTER = { bottom: "16.67%", left: "50%", transform: "translate(-50%, 50%)", textAlign: "center" };
export const ROW_BOT_RIGHT = { bottom: "16.67%", right: "12%", left: "auto", transform: "translate(0, 50%)", textAlign: "right" };

export function getPositionStyle(position = "") {
  const key = String(position || "").toLowerCase().trim().replace(/\s+/g, "-");
  const normalized = POSITION_ALIASES[key] || key;
  return POSITION_STYLES[normalized] || POSITION_STYLES["mid-center"];
}

/** Text varsa: buton sadece alttaki 3 columnda (left, center, right). bottom = orta altta */
export function getButtonPositionWhenTextsExist(btn) {
  const pos = String(btn?.position || "").toLowerCase().trim().replace(/\s+/g, "-");
  if (pos === "bottom-left" || pos === "bot-left") return ROW_BOT_LEFT;
  if (pos === "bottom-right" || pos === "bot-right") return ROW_BOT_RIGHT;
  if (pos === "bottom" || pos === "bottom-center" || pos === "bot-center" || pos === "center") return ROW_BOT_CENTER;
  const align = btn?.align?.toLowerCase();
  if (align === "left") return ROW_BOT_LEFT;
  if (align === "right") return ROW_BOT_RIGHT;
  return ROW_BOT_CENTER;
}

/** Literal \n (backslash+n) string'i gerçek satır sonuna çevirir */
export function normalizeLineBreaks(str = "") {
  if (typeof str !== "string") return "";
  return str.replace(/\\n/g, "\n");
}

/**
 * CSS string'i React style objesine çevirir.
 * "color: green !important; font-size: 16px" -> { color: "green", fontSize: "16px" }
 */
export function parseCssToStyle(cssString = "") {
  if (!cssString || typeof cssString !== "string") return {};
  const style = {};
  const decls = String(cssString).split(";").filter(Boolean);
  for (const decl of decls) {
    const colon = decl.indexOf(":");
    if (colon < 0) continue;
    const prop = decl.slice(0, colon).trim().replace(/\s+/g, " ");
    let value = decl.slice(colon + 1).trim().replace(/\s*!important\s*$/i, "").trim();
    if (!prop || value === "") continue;
    const camel = prop.replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
    style[camel] = value;
  }
  return style;
}
