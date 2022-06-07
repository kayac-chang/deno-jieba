# Deno Jieba

## API Reference

load(dict?: LoadOptions): void;
cutHMM(sentence: string): string[];
cutAll(sentence: string): string[];
cutForSearch(sentence: string, strict?: boolean): string[];
tag(sentence: string): TagResult[];
extract(sentence: string, threshold: number): ExtractResult[];
textRankExtract(sentence: string, threshold: number): ExtractResult[];
insertWord(sentence: string): boolean;
cutSmall(sentence: string, small: number): string[];

#### cut

Split the input text

| Parameter  | Type      | Description              |
| :--------- | :-------- | :----------------------- |
| `sentence` | `string`  | **Required**. input text |
| `hmm`      | `boolean` | enable HMM mode          |

#### cutAll

Split the input text, return all possible words

| Parameter  | Type     | Description              |
| :--------- | :------- | :----------------------- |
| `sentence` | `string` | **Required**. input text |

#### cutForSearch

Split the input text in search mode

| Parameter  | Type      | Description              |
| :--------- | :-------- | :----------------------- |
| `sentence` | `string`  | **Required**. input text |
| `hmm`      | `boolean` | enable HMM mode          |

#### tokenize

Tokenize

| Parameter  | Type      | Description              |
| :--------- | :-------- | :----------------------- |
| `sentence` | `string`  | **Required**. input text |
| `mode`     | `boolean` | tokenize mode            |
| `hmm`      | `boolean` | enable HMM mode          |
