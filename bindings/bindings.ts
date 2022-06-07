// Auto-generated with deno_bindgen
import { CachePolicy, prepare } from "../plug/plug.ts"
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v
  return new TextEncoder().encode(v)
}
function decode(v: Uint8Array): string {
  return new TextDecoder().decode(v)
}
function readPointer(v: any): Uint8Array {
  const ptr = new Deno.UnsafePointerView(v as Deno.UnsafePointer)
  const lengthBe = new Uint8Array(4)
  const view = new DataView(lengthBe.buffer)
  ptr.copyInto(lengthBe, 0)
  const buf = new Uint8Array(view.getUint32(0))
  ptr.copyInto(buf, 4)
  return buf
}
const opts = {
  name: "deno_jieba",
  url: (new URL("../target/debug", import.meta.url)).toString(),
  policy: CachePolicy.NONE,
}
const _lib = await prepare(opts, {
  add_word: {
    parameters: ["pointer", "usize", "i32", "pointer", "usize"],
    result: "usize",
    nonblocking: false,
  },
  cut: {
    parameters: ["pointer", "usize", "u8"],
    result: "pointer",
    nonblocking: true,
  },
  cut_all: {
    parameters: ["pointer", "usize"],
    result: "pointer",
    nonblocking: true,
  },
  cut_for_search: {
    parameters: ["pointer", "usize", "u8"],
    result: "pointer",
    nonblocking: true,
  },
  extract_tags_by_textrank: {
    parameters: ["pointer", "usize", "usize", "pointer", "usize"],
    result: "pointer",
    nonblocking: true,
  },
  extract_tags_by_tfidf: {
    parameters: ["pointer", "usize", "usize", "pointer", "usize"],
    result: "pointer",
    nonblocking: true,
  },
  get_col_separator: { parameters: [], result: "pointer", nonblocking: false },
  get_row_separator: { parameters: [], result: "pointer", nonblocking: false },
  load_dict: {
    parameters: ["pointer", "usize"],
    result: "pointer",
    nonblocking: true,
  },
  reset: { parameters: [], result: "void", nonblocking: false },
  suggest_freq: {
    parameters: ["pointer", "usize"],
    result: "usize",
    nonblocking: false,
  },
  tag: {
    parameters: ["pointer", "usize", "u8"],
    result: "pointer",
    nonblocking: true,
  },
  tokenize: {
    parameters: ["pointer", "usize", "u8", "u8"],
    result: "pointer",
    nonblocking: true,
  },
})

export function add_word(a0: string, a1: number, a2: string) {
  const a0_buf = encode(a0)
  const a2_buf = encode(a2)
  let rawResult = _lib.symbols.add_word(
    a0_buf,
    a0_buf.byteLength,
    a1,
    a2_buf,
    a2_buf.byteLength,
  )
  const result = rawResult
  return result
}
export function cut(a0: string, a1: number) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.cut(a0_buf, a0_buf.byteLength, a1)
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function cut_all(a0: string) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.cut_all(a0_buf, a0_buf.byteLength)
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function cut_for_search(a0: string, a1: number) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.cut_for_search(a0_buf, a0_buf.byteLength, a1)
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function extract_tags_by_textrank(a0: string, a1: number, a2: string) {
  const a0_buf = encode(a0)
  const a2_buf = encode(a2)
  let rawResult = _lib.symbols.extract_tags_by_textrank(
    a0_buf,
    a0_buf.byteLength,
    a1,
    a2_buf,
    a2_buf.byteLength,
  )
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function extract_tags_by_tfidf(a0: string, a1: number, a2: string) {
  const a0_buf = encode(a0)
  const a2_buf = encode(a2)
  let rawResult = _lib.symbols.extract_tags_by_tfidf(
    a0_buf,
    a0_buf.byteLength,
    a1,
    a2_buf,
    a2_buf.byteLength,
  )
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function get_col_separator() {
  let rawResult = _lib.symbols.get_col_separator()
  const result = readPointer(rawResult)
  return decode(result)
}
export function get_row_separator() {
  let rawResult = _lib.symbols.get_row_separator()
  const result = readPointer(rawResult)
  return decode(result)
}
export function load_dict(a0: Uint8Array) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.load_dict(a0_buf, a0_buf.byteLength)
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function reset() {
  let rawResult = _lib.symbols.reset()
  const result = rawResult
  return result
}
export function suggest_freq(a0: string) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.suggest_freq(a0_buf, a0_buf.byteLength)
  const result = rawResult
  return result
}
export function tag(a0: string, a1: number) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.tag(a0_buf, a0_buf.byteLength, a1)
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
export function tokenize(a0: string, a1: number, a2: number) {
  const a0_buf = encode(a0)
  let rawResult = _lib.symbols.tokenize(a0_buf, a0_buf.byteLength, a1, a2)
  const result = rawResult.then(readPointer)
  return result.then(decode)
}
