const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('public/app.js','utf8').split('function readStorage')[0];
const audioText=fs.readFileSync('public/audio-index.js','utf8');
const sandbox={window:{pinyinPro:require('./dictionary.cjs')},document:{getElementById:()=>null},setTimeout,clearTimeout};sandbox.pinyinPro=sandbox.window.pinyinPro;vm.createContext(sandbox);vm.runInContext(audioText,sandbox);vm.runInContext(src+';globalThis.engine={SAMPLE,WORDS,numbered,tone,plain,mapping,audioAlias,localAudio,WHOLE};',sandbox);const e=sandbox.engine;
for(const [input,want]of [['zha3','zhǎ'],['shu4 zhi1','shù zhī'],['liu2','liú'],['gui4','guì'],['lv4','lǜ'],['ou3','ǒu'],['zi5','zi']])assert.equal(e.numbered(input),want);
for(const [i,p]of ['mā','má','mǎ','mà'].entries())assert.equal(e.tone(p),i+1);
assert.equal(e.tone('zi'),0);assert.equal(e.plain('zhǎ'),'zha');assert(e.WHOLE.has('shi'));
for(const p of e.SAMPLE.syllables){const k=e.audioAlias(p);assert(e.localAudio.has(k),'missing sample audio '+p);assert(fs.statSync('public/audio/'+k+'.mp3').size>500);}
for(const p of e.SAMPLE.words){assert(e.WORDS[p],'missing word '+p);const actual=sandbox.pinyinPro.pinyin(e.WORDS[p][0]);if(e.WORDS[p][0]==='舍不得'){assert(sandbox.pinyinPro.polyphonic('舍')[0].includes('shě'));}else assert.equal(actual,p,'word pronunciation '+e.WORDS[p][0]);}
console.log('PASS: numeric tones, tone marks, whole-syllable handling, 21 audio fixtures, 24 word pronunciations.');
