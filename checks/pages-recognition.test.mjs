import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const out=await mkdtemp(join(tmpdir(),'pinyin-pages-test-'));
execFileSync(process.execPath,['scripts/build-pages.mjs',out]);
const script=await readFile(join(out,'pages-recognition.js'),'utf8');
const html=await readFile(join(out,'index.html'),'utf8');
const key='sk-dummy-pages-test-1234567890';
function client(fetch){const context={window:{pinyinPro:require('./dictionary.cjs')},fetch,atob,AbortSignal};vm.runInNewContext(script,context);return context.window.PinyinPagesRecognition;}
test('Pages bundle loads its direct client and explains where data goes',()=>{assert(html.indexOf('pages-recognition.js')<html.indexOf('src="app.js'));assert(html.includes('浏览器直接'));assert(!html.includes('识别时仅经本站后端'));});
test('Pages calls official provider with user key and preserves dictionary checks',async()=>{let count=0;const call=client(async(url,opts)=>{count++;assert.equal(url,'https://api.deepseek.com/chat/completions');assert.equal(opts.headers.Authorization,'Bearer '+key);assert(!opts.body.includes(key));const payload=JSON.parse(opts.body);assert.equal(payload.model,'deepseek-flash');assert.equal(payload.messages[1].content[1].type,'image_url');return Response.json({choices:[{message:{content:JSON.stringify({items:[{pinyin:'shu4 zhi1',hanzi:'树枝'}]})}}]});});const result=await call(['data:image/jpeg;base64,/9j/2Q=='],key);assert.equal(result.items[0].pinyin,'shù zhī');assert.equal(count,1);assert(!JSON.stringify(result).includes(key));});
test('Pages provider failure never exposes upstream raw details',async()=>{const call=client(async()=>new Response('private provider details',{status:401}));await assert.rejects(call(['data:image/jpeg;base64,/9j/2Q=='],key),e=>e.code==='invalid_api_key'&&!e.message.includes('private provider details'));});
process.on('exit',()=>{void rm(out,{recursive:true,force:true});});
