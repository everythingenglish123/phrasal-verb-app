// node dump_section.js index.html NOTE_X outdir
// Dumps English source + reference-lang translations (ru,pl,uk,cs,es) for translators.
const fs=require('fs');const {findSection}=require('./lib_extract.js');
const REF=['ru','pl','uk','cs','es'];
const idx=process.argv[2], name=process.argv[3], outdir=process.argv[4]||'_i18n_work';
const src=fs.readFileSync(idx,'utf8');
const loc=findSection(src,name);
if(!loc){console.error('NOT FOUND',name);process.exit(2);}
const o=eval('('+src.slice(loc.objStart,loc.objEnd)+')');
function refOf(obj){const r={};if(obj)REF.forEach(k=>{if(obj[k]!==undefined)r[k]=obj[k];});return r;}
const verbs=(o.verbs||[]).map(v=>({
  verb:v.verb, defn:v.defn,
  flashExample:v.flashExample, flashExample_ref:refOf(v.flashExampleTranslations),
  newsSnippet:v.newsSnippet, newsSnippet_ref:refOf(v.newsSnippetTranslations),
  dialogue:v.dialogue, dialogue_ref:refOf(v.dialogueTranslations),
  newsWords:(v.newsWords||[]).map(w=>({
    w:w.w, d:w.d,
    top_ref:refOf(w),
    dT_ref:refOf(w.dTranslations),
    tr_ref:refOf(w.translations)
  }))
}));
const out={section:name, id:o.id, title:o.title, verbs};
const p=outdir+'/dump_'+name+'.json';
fs.writeFileSync(p,JSON.stringify(out));
console.log('wrote '+p+' verbs='+verbs.length+' bytes='+fs.statSync(p).size);
