// Extract a section object-literal text from index.html by name, via string-aware brace matching.
function findSection(src,name){
  const re=new RegExp('const '+name+'\\s*=\\s*\\{');
  const m=re.exec(src);
  if(!m) return null;
  const braceStart=src.indexOf('{',m.index);
  let i=braceStart, depth=0, inStr=false, q='', esc=false;
  for(;i<src.length;i++){
    const c=src[i];
    if(inStr){
      if(esc){esc=false;continue;}
      if(c==='\\'){esc=true;continue;}
      if(c===q){inStr=false;}
      continue;
    }
    if(c==='"'||c==="'"||c==='`'){inStr=true;q=c;continue;}
    if(c==='{')depth++;
    else if(c==='}'){depth--; if(depth===0){return {start:m.index, objStart:braceStart, objEnd:i+1};}}
  }
  return null;
}
module.exports={findSection};
