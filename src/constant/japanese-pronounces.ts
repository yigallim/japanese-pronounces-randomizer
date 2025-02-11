export type Kana = {
  h: string; // Hiragana
  k: string; // Katakana
};

export type PronounceKey = keyof typeof JAPANESE_PRONOUNCES;

const JAPANESE_PRONOUNCES: Record<string, Kana> = {
  a: { h: "あ", k: "ア" },
  i: { h: "い", k: "イ" },
  u: { h: "う", k: "ウ" },
  e: { h: "え", k: "エ" },
  o: { h: "お", k: "オ" },
  ka: { h: "か", k: "カ" },
  ki: { h: "き", k: "キ" },
  ku: { h: "く", k: "ク" },
  ke: { h: "け", k: "ケ" },
  ko: { h: "こ", k: "コ" },
  sa: { h: "さ", k: "サ" },
  shi: { h: "し", k: "シ" },
  su: { h: "す", k: "ス" },
  se: { h: "せ", k: "セ" },
  so: { h: "そ", k: "ソ" },
  ta: { h: "た", k: "タ" },
  chi: { h: "ち", k: "チ" },
  tsu: { h: "つ", k: "ツ" },
  te: { h: "て", k: "テ" },
  to: { h: "と", k: "ト" },
  na: { h: "な", k: "ナ" },
  ni: { h: "に", k: "ニ" },
  nu: { h: "ぬ", k: "ヌ" },
  ne: { h: "ね", k: "ネ" },
  no: { h: "の", k: "ノ" },
  ha: { h: "は", k: "ハ" },
  hi: { h: "ひ", k: "ヒ" },
  fu: { h: "ふ", k: "フ" },
  he: { h: "へ", k: "ヘ" },
  ho: { h: "ほ", k: "ホ" },
  ma: { h: "ま", k: "マ" },
  mi: { h: "み", k: "ミ" },
  mu: { h: "む", k: "ム" },
  me: { h: "め", k: "メ" },
  mo: { h: "も", k: "モ" },
  ya: { h: "や", k: "ヤ" },
  yu: { h: "ゆ", k: "ユ" },
  yo: { h: "よ", k: "ヨ" },
  ra: { h: "ら", k: "ラ" },
  ri: { h: "り", k: "リ" },
  ru: { h: "る", k: "ル" },
  re: { h: "れ", k: "レ" },
  ro: { h: "ろ", k: "ロ" },
  wa: { h: "わ", k: "ワ" },
  wo: { h: "を", k: "ヲ" },
  n: { h: "ん", k: "ン" },
};

export default JAPANESE_PRONOUNCES;
