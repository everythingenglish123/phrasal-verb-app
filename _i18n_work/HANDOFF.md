# Handoff — add 5 languages: bg, sr (Cyrillic), hr, bs, sq

## Goal
Add Bulgarian (`bg`, Cyrillic), Serbian (`sr`, **Cyrillic, ekavian**), Croatian (`hr`, Latin, ijekavian),
Bosnian (`bs`, Latin, ijekavian), Albanian (`sq`, Latin) to EVERY translation object across all
69 `NOTE_` sections in `../index.html` (~62MB). Then add the 5 to `TRANSLATE_LANGS` (the toggle).

sr/hr/bs are ~85% the same language (BCS continuum) — have ONE translator do all 5 langs per chunk;
Croatian & Bosnian are near-identical Latin (ijekavian); Serbian is Cyrillic (ekavian); Bulgarian is
distinct Cyrillic; Albanian is distinct Latin (not Slavic).

## Already DONE in prior work (do not redo)
- Languages he/fi/ms/bn/ur fully translated across all 69 sections + verified clean.
- Toggle (`TRANSLATE_LANGS`) relabeled to ENGLISH names, alphabetical, `{code:'off'}` pinned first, flags kept.
- Folder cleaned. User's own backup `index.html.bak_v33_2243` kept (it's the PRE-translation state).

## Data model (per section)
`const NOTE_X = { id, title, verbs:[ {verb, flashExample, flashExampleTranslations{lang:...},
dialogue (lines "A:"/"B:" joined by \n), dialogueTranslations{lang}, newsSnippet (has [[ ]] around the
phrasal verb), newsSnippetTranslations{lang}, newsWords:[ {w, d, <lang>:contextualTopTranslation,
dTranslations{lang}, translations{lang:[...]}} ]} ] }`
Reference langs already COMPLETE in the file (use as translator aids): **ru, pl, uk, cs, es**. English is source.

## TRANSLATE_LANGS (the toggle)
Flat array near the JS section; rendering is `flag + label` in array ORDER (no grouping used).
After translating, add 5 entries and re-sort alphabetically by English label, keeping off first:
`{code:'sq',flag:'🇦🇱',label:'Albanian'}`, `{code:'bs',flag:'🇧🇦',label:'Bosnian'}`,
`{code:'bg',flag:'🇧🇬',label:'Bulgarian'}`, `{code:'hr',flag:'🇭🇷',label:'Croatian'}`,
`{code:'sr',flag:'🇷🇸',label:'Serbian'}`.

## Tooling status in `_i18n_work/`
- DONE: `lib_extract.js` (findSection), `dump_section.js` (dumps en + refs ru/pl/uk/cs/es → dump_NOTE_X.json).
- STILL TO BUILD:
  - `chunk_dump.js` — split dump into `.chunkK.json`, ~10 verbs each.
  - `apply_via_eval.js` — **the safe applier**: eval section → set langs on objects (positional match for
    duplicate-named words) → JSON.stringify section back → splice into file. Set `NEW=['bg','sr','hr','bs','sq']`.
    MUST accept MULTIPLE patch paths and write the 62MB file ONCE per run.
  - `audit_full.js` — detect: empty fields; **bg/sr placeholder = pure-ASCII** (must be Cyrillic);
    **hr/bs/sq placeholder = equals English** (watch for legit loanwords). Report per section.

## Proven workflow (per the just-completed he/fi/ms/bn/ur run)
1. `dump_section.js index.html NOTE_X _i18n_work` for all 69, then `chunk_dump.js` each.
2. Dispatch 1 translator sub-agent per chunk file (waves of ~8). Each reads its dump chunk, writes
   `patch_NOTE_X.chunkK.json`. Patch shape:
   `{section,chunk,verbs:[{verb, flashExampleTranslations_add{5}, newsSnippetTranslations_add{5},
   dialogueTranslations_add{5}, newsWords_add:[{w, top_add{5}, dT_add{5}, tr_add{5 as arrays}}]}]}`.
   Rules to tell agents: keep exactly ONE non-empty [[ ]] in newsSnippet; keep A:/B: + \n in dialogue;
   top_add = word as used in context; dT_add = translate def `d`; tr_add = 1-3 lemma alternatives;
   include ALL verbs+words incl duplicate-named (separate entry per occurrence, in order); output ONLY the 5 langs.
3. `node _i18n_work/apply_via_eval.js index.html <patch1> <patch2> ...` (batch many, one write).
4. `node _i18n_work/audit_full.js index.html` — target: 0 empty, 0 Cyrillic-placeholder; latEqEng = loanwords only.
5. After each wave: confirm all 69 sections eval/parse.

## CRITICAL gotchas (learned the hard way)
- NEVER apply patches in a shell loop that rewrites the 62MB file per patch — it TIMES OUT mid-write and
  TRUNCATES index.html. Batch in one node process, write once. Back up index.html before each wave.
- Use `apply_via_eval.js` (object rebuild), NOT string-regex insertion — the latter created duplicate
  lang keys on duplicate-named words (eval then keeps the wrong one).
- Translator sub-agents frequently hit transient socket errors and periodic session usage limits.
  Just retry; patches persist on disk (often written even when the agent reports an error), so progress
  is durable. Verify each patch file parses + verb count matches its dump before applying.
- `verify`-by-empty is insufficient; ALWAYS audit for placeholder English (that bug is what made the
  previous group balloon). For Latin langs, distinguish real loanwords from placeholders by spot-check.

## Scope
69 sections. 18-verb sections → 2 chunks; 8-9 verb → 1 chunk; `NOTE_50VERBS1` & `NOTE_50VERBS2` → 5 chunks each.
~110+ chunks total × 5 langs. Expect several waves; bank progress to disk between them.
