import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../public/deepseek-key.js',import.meta.url),'utf8');
const key='sk-dummy-local-test-1234567890',other='sk-dummy-replacement-1234567890';
function setup(storage=new Map(),blocked=false){const window={};vm.runInNewContext(source,{window,localStorage:{getItem:k=>{if(blocked)throw Error();return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error();storage.set(k,v);},removeItem:k=>{if(blocked)throw Error();storage.delete(k);}}});return window.DeepSeekKeyStore;}
test('remembered key loads on reopen and can be replaced or deleted',()=>{const storage=new Map();let api=setup(storage);assert.equal(api.get(),'');assert(api.save(key,true));api=setup(storage);assert.equal(api.get(),key);api.save(other,true);assert.equal(setup(storage).get(),other);api.clear();assert.equal(api.get(),'');assert.equal(setup(storage).get(),'');});
test('session-only choice deletes older saved key and does not survive reopen',()=>{const storage=new Map();const api=setup(storage);api.save(key,true);assert.equal(api.save(other,false),false);assert.equal(api.get(),other);assert.equal(api.hasSaved(),false);assert.equal(setup(storage).get(),'');});
test('invalid keys are rejected and blocked storage falls back to memory',()=>{const api=setup(new Map(),true);assert.throws(()=>api.save('invalid',true));assert.equal(api.save(key,true),false);assert.equal(api.get(),key);api.clear();assert.equal(api.get(),'');});
