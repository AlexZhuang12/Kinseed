import JSZip from 'jszip';import {extractText} from 'unpdf';
let raw='';try{
 for await(const chunk of process.stdin){raw+=chunk;if(raw.length>11000000)throw Error('DOCUMENT_INPUT_LIMIT');}
 const {data,ext}=JSON.parse(raw),bytes=Buffer.from(data,'base64');let text,mime;
 if(ext==='pdf'){mime='application/pdf';text=(await extractText(new Uint8Array(bytes),{mergePages:true})).text;}
 else if(['docx','xlsx'].includes(ext)){
  const zip=await JSZip.loadAsync(bytes),entries=Object.values(zip.files);
  if(entries.length>1000||entries.some(f=>f._data?.uncompressedSize>4000000)||entries.reduce((sum,f)=>sum+(f._data?.uncompressedSize??0),0)>16000000)throw Error('文件展開內容過大，未解析。');
  const names=ext==='docx'?['word/document.xml']:Object.keys(zip.files).filter(n=>/^xl\/(?:sharedStrings|worksheets\/sheet\d+)\.xml$/.test(n));
  text=(await Promise.all(names.map(async n=>(await zip.file(n)?.async('string'))??''))).join('\n').replace(/<[^>]+>/g,' ').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
  mime=ext==='docx'?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
 }else throw Error('文件格式尚未支援。');
 if(text.length>1000000)throw Error('解析文字超過100萬字元，請分批。');
 process.stdout.write(JSON.stringify({text,mime}));
}catch(e){process.stderr.write(String(e.message).slice(0,1500));process.exitCode=2;}
