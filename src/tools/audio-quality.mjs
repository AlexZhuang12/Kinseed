// Deterministic signal measurements, never a speech recognizer or answer editor.
export function measurePcmWav(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE'||bytes.readUInt32LE(4)+8!==bytes.length)throw Error('聲音檢查需要完整PCM WAV。');
 let format,data;for(let at=12;at+8<=bytes.length;){const tag=bytes.toString('ascii',at,at+4),size=bytes.readUInt32LE(at+4),end=at+8+size;if(end>bytes.length)throw Error('PCM WAV區塊不完整。');if(tag==='fmt '){if(format||size<16)throw Error('PCM WAV格式不符。');format={codec:bytes.readUInt16LE(at+8),channels:bytes.readUInt16LE(at+10),rate:bytes.readUInt32LE(at+12),byteRate:bytes.readUInt32LE(at+16),align:bytes.readUInt16LE(at+20),bits:bytes.readUInt16LE(at+22)};}if(tag==='data'){if(data)throw Error('PCM WAV資料區重複。');data=bytes.subarray(at+8,end);}at=end+(size%2);}
 if(!format||format.codec!==1||format.channels!==1||format.rate!==16000||format.bits!==16||format.align!==2||format.byteRate!==32000||!data?.length||data.length%2)throw Error('聲音檢查只接受16kHz單聲道16bit PCM。');
 let sum=0,peak=0,nonzero=0;for(let i=0;i<data.length;i+=2){const n=data.readInt16LE(i),v=n/32768;sum+=v*v;peak=Math.max(peak,Math.abs(v));if(n!==0)nonzero++;}const rms=Math.sqrt(sum/(data.length/2)),db=x=>x?20*Math.log10(x):null;
 return {method:'pcm16_signal_v1',sample_count:data.length/2,duration_ms:data.length/32,nonzero_samples:nonzero,digital_silence:nonzero===0,rms_dbfs:db(rms),peak_dbfs:db(peak),low_level:nonzero>0&&db(rms)<-50&&db(peak)<-35,speech_presence_verified:false};
}
export function suspiciousRepetition(text){
 const normal=text.normalize('NFKC').replace(/[\p{P}\p{Z}\s]/gu,'');
 return /(.{4,40})\1\1/u.test(normal);
}
export function assessAudioQuality(clips,result){
 const signals=clips.map(c=>({clip:c.label,...measurePcmWav(c.bytes)})),flags=[];
 for(const c of signals)if(c.low_level)flags.push({code:'low_level',clip:c.clip});
 const text=result.report.transcript.map(x=>x.text).join('\n');
 if(!text.trim())flags.push({code:'empty_transcript'});
 if(suspiciousRepetition(text))flags.push({code:'suspicious_repetition'});
 if(result.timestamp_precision==='whole_clip_only'&&text.trim())flags.push({code:'unverified_transcription'});
 return {signals,flags,review_required:flags.length>0,original_transcript_preserved:true,content_correctness_verified:false,speech_presence_verified:false};
}
export function silentPrecheck(clips){
 const signals=clips.map(c=>({clip:c.label,...measurePcmWav(c.bytes)}));if(!signals.every(x=>x.digital_silence))return null;
 return {report:{transcript:[],observations:[],comparison:null,uncertain:true},provenance:'local_pcm_precheck_no_model_call',model:null,timestamp_precision:'none',actual_model_identity_verified:false,audio_input_delivered:false,semantic_understanding_verified:false,usage_cost:'no model call',semantic_listening_claim:false,raw_transcript_text:null,quality:{signals,flags:[{code:'digital_silence_not_sent'}],review_required:false,original_transcript_preserved:true,content_correctness_verified:false,speech_presence_verified:false}};
}
