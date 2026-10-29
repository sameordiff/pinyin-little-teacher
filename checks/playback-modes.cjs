const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('public/app.js','utf8');
const elements=new Map(),calls=[];
const element=id=>{if(!elements.has(id))elements.set(id,{hidden:true,textContent:'',replaceChildren(){},classList:{add(){},remove(){},toggle(){}}});return elements.get(id);};
const surface={marker:'grid',querySelector:()=>null},card={classList:{add(){},remove(){}},querySelector:()=>surface};
const context={inlinePlayback:null,checkMode:false,findGridCard:()=>card,refreshGridStates(){},$:element,document:{getElementById:element},playing:false,playToken:0,quickMode:true,seen:new Set(['old']),characterHeard:{old:[0]},manualMarks:{old:'read'},reviews:{old:{passed:true,score:100}},clearedColors:new Set(),persist(){},render(){},syncMarkButtons(){},items:()=>['shù zhī','zhé zhǐ'],openLearn:(i,continuing)=>calls.push(['open',i,continuing]),playLesson:async (p,token,target)=>{calls.push(target?['inline',p,target.marker]:['lesson',p]);return true;},stopSpeech(){context.playToken++;context.playing=false;},syncModeControls(){},toast(){},setTimeout:fn=>{fn();return 1;}};
element('learn').open=false;
vm.createContext(context);
vm.runInContext(src.slice(src.indexOf('function resetPracticeColors('),src.indexOf("$('resetColors').onclick"))+src.slice(src.indexOf('async function quickReadCard('),src.indexOf('function hidePictureRewards('))+src.slice(src.indexOf('async function playAllLessons('),src.indexOf("$('playAll').onclick="))+';globalThis.engine={resetPracticeColors,playAllLessons,quickReadCard};',context);
(async()=>{
const e=context.engine;
e.resetPracticeColors();assert.equal(context.seen.size,0);assert.deepEqual(JSON.parse(JSON.stringify(context.characterHeard)),{});assert.deepEqual(JSON.parse(JSON.stringify(context.manualMarks)),{});assert(context.clearedColors.has('old'));assert.equal(context.reviews.old.score,100,'color reset keeps parent assessment');
await e.playAllLessons();assert.deepEqual(calls,[['open',0,true],['lesson','shù zhī'],['open',1,true],['lesson','zhé zhǐ']]);assert.equal(context.playing,false);assert.equal(element('batchBar').hidden,true);
calls.length=0;await e.quickReadCard('zhé zhǐ');assert.deepEqual(calls,[['inline','zhé zhǐ','grid']],'quick card plays on the grid without opening a modal');assert.equal(context.inlinePlayback,null);
calls.length=0;context.playLesson=async p=>{calls.push(['lesson',p]);context.playToken++;return true;};await e.playAllLessons();assert.deepEqual(calls,[['open',0,true],['lesson','shù zhī']],'cancelled batch never opens or speaks next item');
console.log('PASS: full batch uses inner lesson playback even in quick mode, cancels before next card, and clearing colors preserves parent assessments.');
})().catch(e=>{console.error(e);process.exitCode=1;});
