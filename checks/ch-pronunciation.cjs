const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const dictionary=require('./dictionary.cjs');
const ctx={window:{pinyinPro:dictionary},pinyinPro:dictionary,document:{getElementById:()=>null},setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/audio-index.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('public/app.js','utf8').split('function readStorage')[0]+';globalThis.engine={mapping,CH_READING_EXAMPLES,SAMPLE,WORDS,audioAlias,localAudio};',ctx);
const e=ctx.engine;
assert.equal(e.mapping['chī'],'吃');assert.equal(e.audioAlias('chī'),'chi1-reference');assert(e.localAudio.has('ch-callout-reference'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync('public/audio/'+file)).digest('hex');
assert.equal(hash('ch-callout-reference.mp3'),hash('chi1-reference.mp3'),'callout and full chi keep the same intact reference pronunciation');
const entries=Object.entries(e.mapping).filter(([p])=>/^ch/.test(p)&&/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]/.test(p)).map(([pinyin,hanzi])=>{
 const readings=dictionary.polyphonic(hanzi)[0];assert(readings.includes(pinyin),pinyin+' does not match '+hanzi);
 return{pinyin,hanzi,audio:e.localAudio.has(e.audioAlias(pinyin))?e.audioAlias(pinyin)+'.mp3':null,curated:!!e.CH_READING_EXAMPLES[pinyin],defaultReading:dictionary.pinyin(hanzi),needsContext:dictionary.pinyin(hanzi)!==pinyin};
});
const originalRecordings=fs.readdirSync('public/audio').filter(name=>/^ch[a-z]+[1-4]\.mp3$/.test(name)).map(file=>{
 const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:format_tags','-of','json','public/audio/'+file],{encoding:'utf8'})).format;
 const label=metadata.tags?.SWAC_TEXT;if(label)assert.equal(label,file.slice(0,-4),'upstream file/label mismatch '+file);return{file,label:label||null,durationSeconds:Number(metadata.duration)};
});
const lesson=[...e.SAMPLE.syllables,...e.SAMPLE.words].filter(p=>p.split(' ').some(x=>/^ch/.test(x))).map(pinyin=>({pinyin,hanzi:e.WORDS[pinyin]?.[0]||e.mapping[pinyin]}));
assert(entries.every(x=>x.audio),'every ch tone syllable must have a complete recording');
const report={method:'Dictionary polyphonic reading validation, source recording metadata and shared audio identity checks. This is not a teacher listening audit or automatic speech-quality certification.',reference:'ch-reference.json',entries,originalRecordings,lesson};
fs.writeFileSync('public/audio/ch-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:true,toneMarkedMappings:entries.length,curated:Object.keys(e.CH_READING_EXAMPLES).length,originalRecordings:originalRecordings.length,currentLessonItems:lesson.length,contextSensitive:entries.filter(x=>x.needsContext).map(x=>x.pinyin+' '+x.hanzi)}));
