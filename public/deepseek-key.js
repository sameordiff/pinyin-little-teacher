// User-owned credentials stay in this browser; request-time use only on the server.
(()=>{
 const storageKey='pinyinDeepSeekApiKey';
 const valid=value=>typeof value==='string'&&/^sk-[A-Za-z0-9_-]{16,200}$/.test(value);
 let current='',persisted=false;
 try{const stored=localStorage.getItem(storageKey);if(valid(stored)){current=stored;persisted=true;}}catch{}
 window.DeepSeekKeyStore={
  isValid:valid,
  get:()=>current,
  hasSaved(){try{return !!current&&localStorage.getItem(storageKey)===current;}catch{return false;}},
  save(value,remember){const key=value.trim();if(!valid(key))throw new Error('请填写完整的 sk- 开头的 DeepSeek API 密钥。');
   // Delete any previous persisted key even when switching to session-only use.
   try{localStorage.removeItem(storageKey);}catch{if(persisted)throw new Error('浏览器无法删除原有密钥，请先在浏览器设置中清除本站数据。');}persisted=false;
   current=key;if(remember){try{localStorage.setItem(storageKey,key);persisted=true;return true;}catch{return false;}}return false;
  },
  clear(){try{localStorage.removeItem(storageKey);}catch{if(persisted)throw new Error('浏览器未能删除保存的密钥，请在浏览器设置中清除本站数据。');}current='';persisted=false;}
 };
})();
