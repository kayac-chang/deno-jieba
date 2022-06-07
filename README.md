# Deno Jieba

“结巴”中文分词

"Jieba" (Chinese for "to stutter") Chinese text segmentation

## API Reference

#### cut

divide strings into lists of substrings

- default mode

```ts
import { cut } from "./mod.ts";
await cut("我来到北京清华大学");
// ["我", "来到", "北京", "清华大学"],
```

- HMM mode

```ts
import { cut, CutMode } from "./mod.ts";
await cut("我来到北京清华大学", CutMode.HMM);
// ["我", "来到", "北京", "清华大学"],
```

- All mode
  Split the input text, return all possible words

```ts
import { cut, CutMode } from "./mod.ts";
await cut("我来到北京清华大学", CutMode.All);
// [ "我", "来", "来到", "到", "北", "北京", "京", "清", "清华", "清华大学", "华", "华大", "大", "大学", "学" ]
```

| Parameter  | Type      | Description                 |
| :--------- | :-------- | :-------------------------- |
| `sentence` | `string`  | **Required**. source string |
| `mode`     | `CutMode` | see [CutMode](#CutMode)     |

#### cutForSearch

divide strings into lists of substrings, for search engine

```ts
import { cutForSearch } from "./main";
await cutForSearch(
  "小明硕士毕业于中国科学院计算所，后在日本京都大学深造",
  CutMode.HMM
);
// [ "小明", "硕士", "毕业", "于", "中国", "科学", "学院", "科学院", "中国科学院", "计算", "计算所", "，", "后", "在", "日本", "京都", "大学", "日本京都大学", "深造" ]
```

| Parameter  | Type      | Description                 |
| :--------- | :-------- | :-------------------------- |
| `sentence` | `string`  | **Required**. source string |
| `mode`     | `CutMode` | see [CutMode](#CutMode)     |

#### tokenize

string tokenization

```ts
import { tokenize } from "./mod.ts";
await tokenize("南京市长江大桥");
```

| Parameter       | Type           | Description                       |
| :-------------- | :------------- | :-------------------------------- |
| `sentence`      | `string`       | **Required**. source string       |
| `tokenize_mode` | `TokenizeMode` | see [TokenizeMode](#TokenizeMode) |
| `cut_mode`      | `CutMode`      | see [CutMode](#CutMode)           |

#### tag

extract tags from source string

```ts
import { tag } from "./mod.ts";
await tag(
  "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。",
  CutMode.HMM
);
```

| Parameter  | Type      | Description                 |
| :--------- | :-------- | :-------------------------- |
| `sentence` | `string`  | **Required**. source string |
| `cut_mode` | `CutMode` | see [CutMode](#CutMode)     |

#### reset

Reset word dictionary

```ts
import { reset } from "./mod";
reset();
```

#### addWord

add word in dictionary

```ts
import { addWord } from "./mod";
addWord("中出", 10000, "v");
```

#### loadDict

Load extra dictionary

```ts
import { loadDict } from "./mod";
await loadDict("my-dictionary-path");
```

#### suggestFreq

Suggest word frequency to force the characters in a word to be joined or splitted

```ts
import { suggestFreq } from "./mod.ts";
suggestFreq("中出");
```

### CutMode

Mode for switch word cutting algorithm

| Key       | Value | Description         |
| :-------- | :---- | :------------------ |
| `Default` | 0     | default mode        |
| `HMM`     | 1     | Hidden Markov Model |
| `All`     | 2     | All                 |

### TokenizeMode

Mode for switch tokenize algorithm

| Key       | Value | Description  |
| :-------- | :---- | :----------- |
| `Default` | 0     | default mode |
| `Search`  | 1     | Search       |

### Tag

| 标签 | 含义     | 标签 | 含义     | 标签 | 含义     | 标签 | 含义     |
| ---- | -------- | ---- | -------- | ---- | -------- | ---- | -------- |
| n    | 普通名词 | f    | 方位名词 | s    | 处所名词 | t    | 时间     |
| nr   | 人名     | ns   | 地名     | nt   | 机构名   | nw   | 作品名   |
| nz   | 其他专名 | v    | 普通动词 | vd   | 动副词   | vn   | 名动词   |
| a    | 形容词   | ad   | 副形词   | an   | 名形词   | d    | 副词     |
| m    | 数量词   | q    | 量词     | r    | 代词     | p    | 介词     |
| c    | 连词     | u    | 助词     | xc   | 其他虚词 | w    | 标点符号 |
| PER  | 人名     | LOC  | 地名     | ORG  | 机构名   | TIME | 时间     |
