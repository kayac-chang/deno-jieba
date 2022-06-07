use deno_bindgen::deno_bindgen;
use jieba_rs::{Jieba, KeywordExtract, TextRank, TokenizeMode, TFIDF};
use lazy_static::lazy_static;
use std::io::BufReader;
use std::sync::Mutex;

const MUTEXERROR: &str = "MutexError";
const SEPARATOR_ROW: &str = " ";
const SEPARATOR_COL: &str = ",";

lazy_static! {
    static ref JIEBA: Mutex<Jieba> = Mutex::new(Jieba::new());
}

// =======================================================

#[deno_bindgen]
fn get_row_separator() -> String {
    SEPARATOR_ROW.into()
}

#[deno_bindgen]
fn get_col_separator() -> String {
    SEPARATOR_COL.into()
}

// =======================================================

#[deno_bindgen(non_blocking)]
fn load_dict(buf: &[u8]) -> String {
    JIEBA
        .lock()
        .unwrap()
        .load_dict(&mut BufReader::new(buf))
        .map(|_| "Ok")
        .unwrap()
        .into()
}

#[deno_bindgen]
fn add_word(word: &str, freq: i32, tag: &str) -> usize {
    JIEBA.lock().unwrap().add_word(
        word,
        if freq < 0 { None } else { Some(freq as usize) },
        if tag == "" { None } else { Some(tag) },
    )
}

#[deno_bindgen]
fn suggest_freq(segment: &str) -> usize {
    JIEBA.lock().unwrap().suggest_freq(segment)
}

#[deno_bindgen]
fn reset() {
    *JIEBA.lock().unwrap() = Jieba::new();
}

// =======================================================

#[deno_bindgen(non_blocking)]
fn cut(sentence: &str, hmm: u8) -> String {
    JIEBA
        .lock()
        .unwrap()
        .cut(sentence, hmm == 1)
        .join(SEPARATOR_ROW)
}

#[deno_bindgen(non_blocking)]
fn cut_all(sentence: &str) -> String {
    JIEBA.lock().unwrap().cut_all(sentence).join(SEPARATOR_ROW)
}

#[deno_bindgen(non_blocking)]
fn cut_for_search(sentence: &str, hmm: u8) -> String {
    JIEBA
        .lock()
        .unwrap()
        .cut_for_search(sentence, hmm == 1)
        .join(SEPARATOR_ROW)
}

// =======================================================

#[deno_bindgen(non_blocking)]
fn tag(sentence: &str, hmm: u8) -> String {
    JIEBA
        .lock()
        .unwrap()
        .tag(sentence, hmm == 1)
        .iter()
        .map(|item| format!("{}{}{}", item.word, SEPARATOR_COL, item.tag))
        .collect::<Vec<_>>()
        .join(SEPARATOR_ROW)
}

#[deno_bindgen(non_blocking)]
fn tokenize(sentence: &str, mode: u8, hmm: u8) -> String {
    JIEBA
        .lock()
        .unwrap()
        .tokenize(
            sentence,
            match mode {
                1 => TokenizeMode::Search,
                _ => TokenizeMode::Default,
            },
            hmm == 1,
        )
        .iter()
        .map(|item| {
            format!(
                "{}{}{}{}{}",
                item.word, SEPARATOR_COL, item.start, SEPARATOR_COL, item.end
            )
        })
        .collect::<Vec<_>>()
        .join(SEPARATOR_ROW)
}

// =======================================================

// #[deno_bindgen(non_blocking)]
// fn load_idf(buf: &[u8]) -> String {
//     todo!()
// }

// #[deno_bindgen]
// fn add_stop_word(word: &str) -> u8 {
//     todo!()
// }

// #[deno_bindgen]
// fn remove_stop_word(word: &str) -> u8 {
//     todo!()
// }

// #[deno_bindgen]
// fn set_stop_words(stop_words: &str) -> u8 {
//     todo!()
// }

fn extract_tags<T: KeywordExtract>(
    extractor: T,
    sentence: &str,
    top_k: usize,
    allowed_pos: &str,
) -> String {
    extractor
        .extract_tags(
            sentence,
            top_k,
            allowed_pos
                .split(SEPARATOR_COL)
                .map(String::from)
                .filter(|token| !String::is_empty(token))
                .collect::<Vec<_>>(),
        )
        .iter()
        .map(|keyword| format!("{}{}{}", keyword.keyword, SEPARATOR_COL, keyword.weight))
        .collect::<Vec<_>>()
        .join(SEPARATOR_ROW)
}

#[deno_bindgen(non_blocking)]
fn extract_tags_by_tfidf(sentence: &str, top_k: usize, allowed_pos: &str) -> String {
    extract_tags(
        TFIDF::new_with_jieba(&JIEBA.lock().expect(MUTEXERROR)),
        sentence,
        top_k,
        allowed_pos,
    )
}

#[deno_bindgen(non_blocking)]
fn extract_tags_by_textrank(sentence: &str, top_k: usize, allowed_pos: &str) -> String {
    extract_tags(
        TextRank::new_with_jieba(&JIEBA.lock().expect(MUTEXERROR)),
        sentence,
        top_k,
        allowed_pos,
    )
}
