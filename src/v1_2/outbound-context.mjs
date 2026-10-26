// Cross-individual context is private prose, not a bag of eight-byte URL fragments.
// Owner messages/materials retain their stricter existing matcher elsewhere.
const compact=s=>String(s).replace(/\s+/gu,'');
const urlPattern=/https?:\/\/[^\s<>"'\x60，。；、（）【】()\[\]]+/giu;
const urls=s=>(s.match(urlPattern)??[]).map(s=>s.replace(/[.,;!?]+$/u,''));
export function privateContextMatch(original,representations,min=8){
 const candidates=representations.map(compact),contains=s=>{const c=compact(s);return c.length>=min&&candidates.some(v=>v.includes(c));};
 for(const url of urls(original)){
  if(contains(url))return true;
  // Keep values that can identify a private resource even if its URL is split.
  try{const u=new URL(url);for(const value of u.searchParams.values())if(contains(value))return true;for(const part of u.pathname.split('/')){let s=part;try{s=decodeURIComponent(s);}catch{}if((/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(s)||/[\d_]/u.test(s))&&contains(s))return true;}}catch{}
 }
 const prose=original.replace(urlPattern,'\n'),plain=compact(prose);
 // Preserve the existing short-fragment protection for CJK prose.
 for(let i=0;i<=plain.length-min;i++){const piece=plain.slice(i,i+min);if(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(piece)&&contains(piece))return true;}
 // Protect complete identifiers and contact addresses, not prefixes of common words.
 for(const value of prose.match(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}|[\p{L}\p{N}_-]+/gu)??[])if((/[\d_@]/u.test(value)||compact(prose)===value)&&contains(value))return true;
 // A complete private entry remains protected. In a longer Latin entry, require
 // three whole words (at least 16 non-space characters), not a common topic pair.
 if(contains(prose))return true;
 const word=/[\p{L}\p{N}_-]+/gu,tokens=[...prose.matchAll(word)];
 for(let i=0;i<tokens.length-2;i++){const a=tokens[i],b=tokens[i+1],c=tokens[i+2],between=prose.slice(a.index+a[0].length,b.index),last=prose.slice(b.index+b[0].length,c.index),piece=prose.slice(a.index,c.index+c[0].length);if([a,b,c].some(t=>t[0].length<2)||!/^[\s,;:—–-]+$/u.test(between)||!/^[\s,;:—–-]+$/u.test(last)||compact(piece).length<16)continue;if(contains(piece))return true;}
 return false;
}
