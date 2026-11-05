const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('public/app.js','utf8'),dict=require('./dictionary.cjs'),events=[];
const context={window:{pinyinPro:dict},pinyinPro:dict,document:{getElementById:()=>({value:'0.8'})},setTimeout,clearTimeout,playToken:1,seen:new Set(),persist(){},render(){},pendingRecognition:null,toast:message=>events.push('error:'+message)};
vm.createContext(context);vm.runInContext(fs.readFileSync('public/audio-index.js','utf8'),context);
vm.runInContext(src.split('function readStorage')[0]+src.slice(src.indexOf('async function readPinyin('),src.indexOf('function releaseRecording('))+src.slice(src.indexOf('function parseLearningDraft('),src.indexOf("$('saveDraft').onclick="))+';globalThis.e={parseLearningDraft,isFinalPractice,finalAudioKey,finalBase,details,assessmentCriteria,readPinyin,displayedHanzi,FINAL_BASES};',context);
vm.runInContext("playSound=async(key,start)=>{start();events.push(key)};",Object.assign(context,{events}));
const e=context.e;
const parsed=e.parseLearningDraft('a ai ang üe\nü\nu\nǚ\nu:4\nv2\nóng');
assert.deepEqual(Array.from(parsed.keys),['a','ai','ang','üe','ü','u','ǚ','ǜ','ǘ','óng']);
context.characters=parsed.characters;vm.runInContext('recognizedWords=characters;',context);
for(const p of parsed.keys){assert(e.isFinalPractice(p));assert.equal(e.displayedHanzi(p),'');assert(!e.details(p).split.includes('→'));}
assert.equal(e.finalBase('ǚ'),'ü');assert.equal(e.finalBase('ǜ'),'ü');assert.notEqual(e.finalBase('ü'),e.finalBase('u'));
assert.equal(e.assessmentCriteria('ai')[0].id,'final');
for(const b of e.FINAL_BASES)if(b!=='ong')for(let tone=1;tone<=4;tone++){const p=e.parseLearningDraft(b+tone).keys[0];assert(fs.existsSync('public/audio/'+e.finalAudioKey(p)+'.mp3'),p);}
context.characters=e.parseLearningDraft('ài | 爱').characters;vm.runInContext('recognizedWords=characters;',context);assert(!e.isFinalPractice('ài'));assert.equal(e.displayedHanzi('ài'),'爱');
context.characters={};vm.runInContext('recognizedWords=characters;',context);
(async()=>{for(const [p,key]of [['a','a1'],['ai','ai1'],['ang','ang1'],['üe','yue1'],['ǚ','yu3'],['u','wu1'],['ong','ong-reference']]){events.length=0;assert(await e.readPinyin(p,1));assert.deepEqual(events,[key]);}events.length=0;assert.equal(await e.readPinyin('óng',1),false);assert(events[0].includes('暂缺'));console.log('PASS: independent finals, tone/umlaut preservation, manual groups, no forced hanzi, neutral distinction, 92 recordings, online ong reference, and honest unavailable toned ong.');})().catch(e=>{console.error(e);process.exitCode=1;});
