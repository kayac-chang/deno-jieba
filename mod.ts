import { assertEquals } from "https://deno.land/std@0.142.0/testing/asserts.ts";
import * as Lib from "./bindings/bindings.ts";

type Fn<A, B> = (x: A) => B;

const List = {
  map:
    <A, B>(fn: Fn<A, B>) =>
    (list: A[]) =>
      list.map(fn),
};

const String = {
  split: (separator: string) => (text: string) => text.split(separator),
};

const Split = {
  Row: String.split(Lib.get_row_separator()),
  Col: String.split(Lib.get_col_separator()),
};

type Algorithm =
  | typeof Lib.extract_tags_by_tfidf
  | typeof Lib.extract_tags_by_textrank;
const extractTags =
  (fn: Algorithm) =>
  (sentence: string, top_k = 20, allowed_pos = []): Promise<string[][]> =>
    fn(sentence, top_k, allowed_pos.join(Lib.get_col_separator()))
      .then(Split.Row)
      .then(List.map(Split.Col));

const Tag = ([word, tag]: string[]): Tag => ({ word, tag: tag as TagType });

const Token = ([word, start, end]: string[]): Token => ({
  word,
  start: Number(start),
  end: Number(end),
});

// ================================================================

/**
 * Mode for switch word cutting algorithm
 */
export enum CutMode {
  /** default */
  Default = 0,
  /** Hidden Markov Model */
  HMM = 1,
  /** all */
  All = 2,
}

/**
 * Mode for switch tokenize algorithm
 */
export enum TokenizeMode {
  /** default */
  Default = 0,
  /** search */
  Search = 1,
}

/**
 * Reset word dictionary
 *
 * ## Examples
 *
 * ```ts
 * import { reset } from './mod';
 * reset();
 * ```
 */
export const reset = Lib.reset;
Deno.test("Test reset", async () => {
  assertEquals(suggestFreq("中出"), 348);

  await loadDict(new TextEncoder().encode("中出 10000"));
  assertEquals(suggestFreq("中出"), 10001);

  reset();
  assertEquals(suggestFreq("中出"), 348);
});

/**
 * add word in dictionary
 *
 * ## Examples
 *
 * ```ts
 * import { addWord } from './mod';
 * addWord("中出", 10000, "v");
 * ```
 */
export const addWord = (word: string, freg = -1, tag: TagType | "" = "") =>
  Lib.add_word(word, freg, tag);

Deno.test("Test addWord", () => {
  assertEquals(suggestFreq("中出"), 348);

  addWord("中出", 10000, "v");
  assertEquals(suggestFreq("中出"), 10001);

  reset();
  assertEquals(suggestFreq("中出"), 348);
});

/**
 * Load extra dictionary
 * @param {Uint8Array | string | URL} source
 * @returns {Promise<string>}
 *
 * ## Examples
 *
 * ```ts
 * import { loadDict } from './mod';
 * await loadDict('my-dictionary-path');
 * ```
 */
export const loadDict = (source: Uint8Array | string | URL): Promise<string> =>
  typeof source === "string" || source instanceof URL
    ? Deno.readFile(source).then(Lib.load_dict)
    : Lib.load_dict(source);

Deno.test("Test loadDict", async () => {
  assertEquals(
    await tokenize("我们中出了一个叛徒", TokenizeMode.Default, CutMode.Default),
    [
      {
        word: "我们",
        start: 0,
        end: 2,
      },
      {
        word: "中",
        start: 2,
        end: 3,
      },
      {
        word: "出",
        start: 3,
        end: 4,
      },
      {
        word: "了",
        start: 4,
        end: 5,
      },
      {
        word: "一个",
        start: 5,
        end: 7,
      },
      {
        word: "叛徒",
        start: 7,
        end: 9,
      },
    ]
  );

  await loadDict(new TextEncoder().encode("中出 10000"));
  assertEquals(
    await tokenize("我们中出了一个叛徒", TokenizeMode.Default, CutMode.Default),
    [
      {
        word: "我们",
        start: 0,
        end: 2,
      },
      {
        word: "中出",
        start: 2,
        end: 4,
      },
      {
        word: "了",
        start: 4,
        end: 5,
      },
      {
        word: "一个",
        start: 5,
        end: 7,
      },
      {
        word: "叛徒",
        start: 7,
        end: 9,
      },
    ]
  );

  reset();
});

/**
 * Suggest word frequency to force the characters in a word to be joined or splitted
 * @param {string} word
 * @returns {number}
 *
 * ```ts
 * import { suggestFreq } from './mod.ts';
 * suggestFreq("中出");
 * ```
 */
export const suggestFreq = Lib.suggest_freq;

Deno.test("Test suggestFreq", () => {
  assertEquals(suggestFreq("中出"), 348);
  assertEquals(suggestFreq("出了"), 1263);
});

/**
 * divide strings into lists of substrings
 *
 * @param {string} sentence - source string
 * @param {CutMode} mode - {@link CutMode}
 * @returns {Promise<string[]>}
 *
 * ## Examples
 *
 * - cut in default mode
 * ```ts
 * import { cut } from './mod.ts';
 * await cut("我来到北京清华大学");
 * // ["我", "来到", "北京", "清华大学"],
 * ```
 *
 * - cut in HMM mode
 * ```ts
 * import { cut, CutMode } from './mod.ts';
 * await cut("我来到北京清华大学", CutMode.HMM);
 * // ["我", "来到", "北京", "清华大学"],
 * ```
 *
 * - cut in All mode
 * ```ts
 * import { cut, CutMode } from './mod.ts';
 * await cut("我来到北京清华大学", CutMode.All);
 * // [ "我", "来", "来到", "到", "北", "北京", "京", "清", "清华", "清华大学", "华", "华大", "大", "大学", "学" ]
 * ```
 */
export const cut = (
  sentence: string,
  mode: CutMode = CutMode.Default
): Promise<string[]> => {
  if (mode === CutMode.All) {
    return Lib.cut_all(sentence).then(Split.Row);
  }

  return Lib.cut(sentence, mode).then(Split.Row);
};

Deno.test("Test cut", async () => {
  assertEquals(await cut("我来到北京清华大学"), [
    "我",
    "来到",
    "北京",
    "清华大学",
  ]);
});

Deno.test("Test cut with HMM", async () => {
  assertEquals(await cut("我来到北京清华大学", CutMode.HMM), [
    "我",
    "来到",
    "北京",
    "清华大学",
  ]);
});

Deno.test("Test cut with All", async () => {
  assertEquals(await cut("我来到北京清华大学", CutMode.All), [
    "我",
    "来",
    "来到",
    "到",
    "北",
    "北京",
    "京",
    "清",
    "清华",
    "清华大学",
    "华",
    "华大",
    "大",
    "大学",
    "学",
  ]);
});

/**
 * divide strings into lists of substrings, for search engine
 *
 * @param {string} sentence - source string
 * @param {CutMode.Default | CutMode.HMM} mode - {@link CutMode}
 *
 * ## Examples
 *
 * ```ts
 * import { cutForSearch } from './main';
 * await cutForSearch("小明硕士毕业于中国科学院计算所，后在日本京都大学深造", CutMode.HMM);
 * // [ "小明", "硕士", "毕业", "于", "中国", "科学", "学院", "科学院", "中国科学院", "计算", "计算所", "，", "后", "在", "日本", "京都", "大学", "日本京都大学", "深造" ]
 * ```
 */
export const cutForSearch = (
  sentence: string,
  mode: CutMode.Default | CutMode.HMM = CutMode.Default
): Promise<string[]> => Lib.cut_for_search(sentence, mode).then(Split.Row);

Deno.test("Test cutForSearch with HMM", async () => {
  assertEquals(
    await cutForSearch(
      "小明硕士毕业于中国科学院计算所，后在日本京都大学深造",
      CutMode.HMM
    ),
    [
      "小明",
      "硕士",
      "毕业",
      "于",
      "中国",
      "科学",
      "学院",
      "科学院",
      "中国科学院",
      "计算",
      "计算所",
      "，",
      "后",
      "在",
      "日本",
      "京都",
      "大学",
      "日本京都大学",
      "深造",
    ]
  );
});

export type TagType =
  | "n" // 普通名词
  | "f" // 方位名词
  | "s" // 处所名词
  | "t" // 时间
  | "nr" // 人名
  | "ns" // 地名
  | "nt" // 机构名
  | "nw" // 作品名
  | "nz" // 其他专名
  | "v" // 普通动词
  | "vd" // 动副词
  | "vn" // 名动词
  | "a" // 形容词
  | "ad" // 副形词
  | "an" // 名形词
  | "d" // 副词
  | "m" // 数量词
  | "q" // 量词
  | "r" // 代词
  | "p" // 介词
  | "c" // 连词
  | "u" // 助词
  | "xc" // 其他虚词
  | "w" // 标点符号
  | "PER" // 人名
  | "LOC" // 地名
  | "ORG" // 机构名
  | "TIME"; // 时间

/** Tagged word */
export interface Tag {
  /** word token */
  word: string;
  /** word type */
  tag: TagType;
}

/**
 * extract tags from source string
 *
 * @param {string} sentence - source string
 * @param {CutMode.Default | CutMode.HMM} mode - {@link CutMode}
 * @returns {Promise<Tag[]>}
 *
 * ## Examples
 *
 * ```ts
 * import { tag } from './mod.ts';
 * await tag("我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。", CutMode.HMM);
 * ```
 */
export const tag = (
  sentence: string,
  mode: CutMode.Default | CutMode.HMM = CutMode.Default
): Promise<Tag[]> =>
  Lib.tag(sentence, mode)
    .then(Split.Row)
    .then(List.map(Split.Col))
    .then(List.map(Tag));

Deno.test("Test tag", async () => {
  assertEquals(
    await tag(
      "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。",
      CutMode.HMM
    ),
    [
      { word: "我", tag: "r" },
      { word: "是", tag: "v" },
      {
        word: "拖拉机",
        tag: "n",
      },
      {
        word: "学院",
        tag: "n",
      },
      {
        word: "手扶拖拉机",
        tag: "n",
      },
      {
        word: "专业",
        tag: "n",
      },
      { word: "的", tag: "uj" },
      { word: "。", tag: "x" },
      {
        word: "不用",
        tag: "v",
      },
      {
        word: "多久",
        tag: "m",
      },
      { word: "，", tag: "x" },
      { word: "我", tag: "r" },
      { word: "就", tag: "d" },
      { word: "会", tag: "v" },
      {
        word: "升职",
        tag: "v",
      },
      {
        word: "加薪",
        tag: "nr",
      },
      { word: "，", tag: "x" },
      {
        word: "当上",
        tag: "t",
      },
      {
        word: "CEO",
        tag: "eng",
      },
      { word: "，", tag: "x" },
      {
        word: "走上",
        tag: "v",
      },
      {
        word: "人生",
        tag: "n",
      },
      {
        word: "巅峰",
        tag: "n",
      },
      { word: "。", tag: "x" },
    ]
  );
});

/**
 * Token group with word token and spans
 */
export interface Token {
  /** token */
  word: string;
  /** start position of the source string */
  start: number;
  /** end position of the source string */
  end: number;
}

/**
 * string tokenization
 *
 * @param {string} sentence - source string
 * @param {TokenizeMode} tokenize_mode - {@link TokenizeMode}
 * @param {CutMode.Default | CutMode.HMM} cut_mode - {@link CutMode}
 *
 * ## Examples
 *
 * ```ts
 * import { tokenize } from './mod.ts';
 * await tokenize("南京市长江大桥");
 * ```
 */
export const tokenize = (
  sentence: string,
  tokenize_mode: TokenizeMode = TokenizeMode.Default,
  cut_mode: CutMode.Default | CutMode.HMM = CutMode.Default
): Promise<Token[]> =>
  Lib.tokenize(sentence, tokenize_mode, cut_mode)
    .then(Split.Row)
    .then(List.map(Split.Col))
    .then(List.map(Token));

Deno.test("Test tokenize default", async () => {
  assertEquals(await tokenize("南京市长江大桥"), [
    {
      word: "南京市",
      start: 0,
      end: 3,
    },
    {
      word: "长江大桥",
      start: 3,
      end: 7,
    },
  ]);
});

Deno.test("Test tokenize with Search Mode", async () => {
  assertEquals(await tokenize("南京市长江大桥", TokenizeMode.Search), [
    {
      word: "南京",
      start: 0,
      end: 2,
    },
    {
      word: "京市",
      start: 1,
      end: 3,
    },
    {
      word: "南京市",
      start: 0,
      end: 3,
    },
    {
      word: "长江",
      start: 3,
      end: 5,
    },
    {
      word: "大桥",
      start: 5,
      end: 7,
    },
    {
      word: "长江大桥",
      start: 3,
      end: 7,
    },
  ]);
});

Deno.test("Test tokenize default with HMM", async () => {
  assertEquals(
    await tokenize("我们中出了一个叛徒", TokenizeMode.Default, CutMode.HMM),
    [
      {
        word: "我们",
        start: 0,
        end: 2,
      },
      {
        word: "中出",
        start: 2,
        end: 4,
      },
      {
        word: "了",
        start: 4,
        end: 5,
      },
      {
        word: "一个",
        start: 5,
        end: 7,
      },
      {
        word: "叛徒",
        start: 7,
        end: 9,
      },
    ]
  );
});

export const TFIDF = {
  extractTags: extractTags(Lib.extract_tags_by_tfidf),
};
export const TextRank = {
  extractTags: extractTags(Lib.extract_tags_by_textrank),
};
