const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function pdfBlocks(paragraphs,mode='markdown_headings'){
 if(!['plain','markdown_headings'].includes(mode))throw Error('PDF文字格式需為plain或markdown_headings。');
 if(mode==='plain')return paragraphs.map(text=>({type:'paragraph',text}));
 const out=[];let fence=null;
 for(const paragraph of paragraphs){let body=[];const flush=()=>{if(body.length)out.push({type:'paragraph',text:body.join('\n')});body=[];};
  for(const line of paragraph.split(/\r?\n/)){const f=/^ {0,3}(`{3,}|~{3,})/.exec(line);if(f){if(!fence)fence=f[1][0];else if(f[1][0]===fence)fence=null;body.push(line);continue;}
   const h=!fence&&/^ {0,3}(#{1,6})[\t ]+(.+?)\s*$/.exec(line);
   if(h){flush();out.push({type:'heading',level:h[1].length,text:h[2].replace(/[\t ]+#+[\t ]*$/,'')});}else body.push(line);
  }flush();
 }return out;
}
export function pdfHTML({title,paragraphs,rows,text_format='markdown_headings'}){
 const body=pdfBlocks(paragraphs,text_format).map(b=>b.type==='heading'?`<h${b.level}>${esc(b.text)}</h${b.level}>`:'<p>'+esc(b.text)+'</p>').join('');
 return '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'">'+
 '<style>body{font:16px sans-serif;line-height:1.6;overflow-wrap:anywhere}h1,h2,h3,h4,h5,h6{break-after:avoid-page;page-break-after:avoid;break-inside:avoid-page;page-break-inside:avoid;line-height:1.3;margin:1.1em 0 .45em}h1{font-size:26px}h2{font-size:22px}h3{font-size:19px}h4,h5,h6{font-size:17px}.document-title{font-size:28px;margin-top:0}p{white-space:pre-wrap;orphans:3;widows:3}td{border:1px solid #aaa;padding:6px;white-space:pre-wrap}table{border-collapse:collapse}tr{break-inside:avoid-page}</style>'+
 '<h1 class="document-title">'+esc(title)+'</h1>'+body+(rows.length?'<table>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</table>':'');
}
